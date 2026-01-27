import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/auth/password-utils';
import { generateTokens, verifyToken } from '@/lib/auth/jwt-utils';
import { findUserByEmail } from '@/lib/auth/user-store';

// Log Apple configuration at startup
console.log('\n\n');
console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
console.log('║           🍎 APPLE SIGN IN CONFIGURATION CHECK AT STARTUP 🍎             ║');
console.log('╠═══════════════════════════════════════════════════════════════════════════╣');
console.log('║ APPLE_CLIENT_ID:');
if (process.env.APPLE_CLIENT_ID) {
  console.log('║   ✅ SET:', process.env.APPLE_CLIENT_ID);
} else {
  console.log('║   ❌ NOT SET - Apple Sign In will NOT work!');
}
console.log('║');
console.log('║ APPLE_CLIENT_SECRET:');
if (process.env.APPLE_CLIENT_SECRET) {
  console.log('║   ✅ SET (JWT length:', process.env.APPLE_CLIENT_SECRET.length, 'chars)');
  try {
    const parts = process.env.APPLE_CLIENT_SECRET.split('.');
    if (parts.length === 3) {
      // Decode header (contains key ID) and payload
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('║');
      console.log('║   JWT HEADER:');
      console.log('║     - alg (Algorithm):', header.alg);
      console.log('║     - kid (Key ID):', header.kid, '← MUST EXIST IN APPLE DEVELOPER CONSOLE');
      console.log('║');
      console.log('║   JWT PAYLOAD:');
      console.log('║     - iss (Apple Team ID):', payload.iss);
      console.log('║     - sub (Services ID/Client ID):', payload.sub);
      console.log('║     - aud:', payload.aud);
      console.log('║     - iat (Issued At):', new Date(payload.iat * 1000).toISOString());
      console.log('║     - exp (Expires At):', new Date(payload.exp * 1000).toISOString());
      const now = Math.floor(Date.now() / 1000);
      const isExpired = now > payload.exp;
      const daysUntilExpiry = Math.floor((payload.exp - now) / 86400);
      console.log('║');
      if (isExpired) {
        console.log('║   ⚠️⚠️⚠️ TOKEN IS EXPIRED! ⚠️⚠️⚠️');
        console.log('║   Run: cd backend && node generate-apple-client-secret.js');
      } else {
        console.log('║   ✅ Token is VALID - expires in', daysUntilExpiry, 'days');
      }
      // Verify sub matches APPLE_CLIENT_ID
      if (payload.sub !== process.env.APPLE_CLIENT_ID) {
        console.log('║');
        console.log('║   ⚠️ WARNING: JWT sub (', payload.sub, ') does NOT match APPLE_CLIENT_ID (', process.env.APPLE_CLIENT_ID, ')');
        console.log('║   This WILL cause invalid_client errors!');
      }
    } else {
      console.log('║   ⚠️ Invalid JWT format (expected 3 parts, got', parts.length, ')');
    }
  } catch (e) {
    console.log('║   ⚠️ Could not decode JWT:', e);
  }
} else {
  console.log('║   ❌ NOT SET - Apple Sign In will NOT work!');
}
console.log('║');
console.log('║ OTHER CONFIG:');
console.log('║   NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ NOT SET');
console.log('║   NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('║   NODE_ENV:', process.env.NODE_ENV);
console.log('║');
console.log('║ Expected Apple Callback URL:');
console.log('║   ', (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/api/auth/callback/apple');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
console.log('\n');

interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  user: {
    id: string; // Internal ObjectID
    userId: string; // Human-readable ID
    email: string;
    name?: string | null;
    image?: string | null;
    role: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN';
    provider?: string;
  };
}

export const authOptions: NextAuthOptions = {
  // Add session configuration to reduce polling
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },



  providers: [
    // Only add Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code",
            },
          },
          httpOptions: {
            timeout: 10000,
          },
        }),
      ]
      : []),
    // Only add Apple provider if credentials are available
    // Note: APPLE_CLIENT_SECRET should be a pre-generated JWT (use backend/generate-apple-client-secret.js)
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? (() => {
        console.log('[NextAuth] 🍎 Initializing Apple Provider with:');
        console.log('  - clientId:', process.env.APPLE_CLIENT_ID);
        console.log('  - clientSecret: JWT with', process.env.APPLE_CLIENT_SECRET?.length, 'chars');
        return [
          AppleProvider({
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
            authorization: {
              params: {
                scope: 'name email',
                response_mode: 'form_post',
              },
            },
            // Use 'state' instead of PKCE - Apple's form_post doesn't work well with PKCE cookies
            checks: ['state'],
          }),
        ];
      })()
      : (() => {
        console.log('[NextAuth] ⚠️ Apple Provider NOT initialized - missing credentials');
        console.log('  - APPLE_CLIENT_ID:', process.env.APPLE_CLIENT_ID ? '✅' : '❌ Missing');
        console.log('  - APPLE_CLIENT_SECRET:', process.env.APPLE_CLIENT_SECRET ? '✅' : '❌ Missing');
        return [];
      })()),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        // Use INTERNAL_API_URL for server-side calls (Docker), fallback to NEXT_PUBLIC_API_URL
        const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        // If token is provided (from registration/login), use it directly
        if (credentials?.token && credentials?.email) {
          try {
            // Verify the token with our backend
            const response = await fetch(`${apiUrl}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${credentials.token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              return {
                id: data.data.id,
                userId: data.data.userId,
                email: data.data.email,
                name: data.data.name,
                role: data.data.role,
                image: data.data.image,
                accessToken: credentials.token,
              } as any;
            }
          } catch (error) {
            console.error('Token verification failed:', error);
          }
        }

        // Regular login with email and password
        if (credentials?.email && credentials?.password) {
          try {
            const response = await fetch(`${apiUrl}/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              return {
                id: data.data.user.id,
                userId: data.data.user.userId,
                email: data.data.user.email,
                name: data.data.user.name,
                role: data.data.user.role,
                image: data.data.user.image,
                accessToken: data.data.token,
              } as any;
            }
          } catch (error) {
            console.error('Login failed:', error);
          }
        }

        throw new Error('Invalid credentials');
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          accessToken: (user as any).accessToken || account?.access_token,
          refreshToken: account?.refresh_token,
          accessTokenExpires: account?.expires_at ? account.expires_at * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          provider: account?.provider || 'credentials',
          user: {
            id: user.id,
            userId: (user as any).userId,
            email: user.email!,
            name: user.name,
            image: user.image,
            role: (user as any).role,
          }
        };
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        // Update the token with new session data
        return {
          ...token,
          user: {
            ...(token.user as any),
            role: session.user?.role || (token.user as any)?.role,
          }
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },

    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
        user: {
          ...session.user,
          id: (token.user as any)?.id || token.sub!,
          userId: (token.user as any)?.userId,
          role: (token.user as any)?.role,
          provider: token.provider as string,
        }
      } as ExtendedSession;
    },

    async signIn({ user, account, profile, credentials }) {
      // Handle social login with role
      if (account?.provider === 'google' || account?.provider === 'apple') {
        const timestamp = new Date().toISOString();
        console.log('\n');
        console.log('╔══════════════════════════════════════════════════════════════════╗');
        console.log(`║   NEXTAUTH ${account.provider.toUpperCase()} SIGN-IN - WEB FLOW                      ║`);
        console.log('╚══════════════════════════════════════════════════════════════════╝');
        console.log(`[${timestamp}] Sign-in callback triggered`);

        console.log('\n📋 USER OBJECT:');
        console.log('─────────────────────────────────────');
        console.log('   Email:', user.email);
        console.log('   Name:', user.name);
        console.log('   Image:', user.image);
        console.log('   ID:', user.id);

        console.log('\n📋 ACCOUNT OBJECT:');
        console.log('─────────────────────────────────────');
        console.log('   Provider:', account.provider);
        console.log('   Provider Account ID:', account.providerAccountId);
        console.log('   Type:', account.type);
        console.log('   Access Token present:', !!account.access_token);
        console.log('   ID Token present:', !!account.id_token);
        console.log('   Refresh Token present:', !!account.refresh_token);
        console.log('   Expires At:', account.expires_at);
        console.log('   Token Type:', account.token_type);
        console.log('   Scope:', account.scope);

        if (account.provider === 'apple') {
          console.log('\n🍎 APPLE-SPECIFIC DEBUG:');
          console.log('─────────────────────────────────────');
          console.log('   ID Token (first 100 chars):', account.id_token?.substring(0, 100));
          console.log('   ID Token (last 50 chars):', account.id_token?.substring(account.id_token.length - 50));
          console.log('   ID Token length:', account.id_token?.length || 0);

          // Decode the Apple ID token to inspect (without verification)
          if (account.id_token) {
            try {
              const base64Payload = account.id_token.split('.')[1];
              const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
              console.log('   Decoded Token Payload:');
              console.log('      - Issuer (iss):', payload.iss);
              console.log('      - Subject (sub):', payload.sub);
              console.log('      - Audience (aud):', payload.aud);
              console.log('      - Email:', payload.email);
              console.log('      - Email Verified:', payload.email_verified);
              console.log('      - Is Private Email:', payload.is_private_email);
              console.log('      - Issued At:', payload.iat, `(${new Date(payload.iat * 1000).toISOString()})`);
              console.log('      - Expires At:', payload.exp, `(${new Date(payload.exp * 1000).toISOString()})`);
              const now = Math.floor(Date.now() / 1000);
              const isExpired = now > payload.exp;
              console.log('      - Current Time:', now);
              console.log('      - Token Expired:', isExpired ? '⚠️ YES' : '✅ NO');
            } catch (e) {
              console.log('   ⚠️ Could not decode ID token:', e);
            }
          } else {
            console.log('   ⚠️ NO ID TOKEN RECEIVED FROM APPLE!');
            console.log('   This is required for server-side verification.');
          }
        }

        console.log('\n📋 PROFILE OBJECT:');
        console.log('─────────────────────────────────────');
        console.log(JSON.stringify(profile, null, 2));
        console.log('═══════════════════════════════════════════════════════════════');

        try {
          // Try to get the pending role for this social login
          let role = 'DOG_OWNER'; // Default role

          try {
            const roleResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/store-pending-role?email=${encodeURIComponent(user.email || '')}`);
            console.log('[NextAuth] Role fetch response status:', roleResponse.status);
            if (roleResponse.ok) {
              const roleData = await roleResponse.json();
              if (roleData.role) {
                role = roleData.role;
                console.log('[NextAuth] ✅ Retrieved pending role:', role, 'for email:', user.email);
              } else {
                console.log('[NextAuth] ⚠️ No role found in response, using default:', role);
              }
            } else {
              console.log('[NextAuth] ⚠️ Role fetch failed with status:', roleResponse.status);
            }
          } catch (error) {
            console.log('[NextAuth] ❌ Could not retrieve pending role:', error);
          }

          console.log('[NextAuth] Calling social-login API with payload:');
          const payload = {
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account.provider,
            providerId: account.providerAccountId,
            role,
            // Pass the ID token for server-side verification (security)
            idToken: account.id_token,
          };
          console.log(JSON.stringify(payload, null, 2));

          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/social-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          console.log('[NextAuth] Social-login API response status:', response.status);

          if (!response.ok) {
            console.log('[NextAuth] ❌ Social-login API failed with status:', response.status);
            // Try to get error message
            let errorMessage = 'Social login failed';
            let errorDetails = '';
            const contentType = response.headers.get('content-type');
            console.log('[NextAuth] Error response content-type:', contentType);

            if (contentType && contentType.includes('application/json')) {
              try {
                const errorData = await response.json();
                console.log('[NextAuth] Error response data:', JSON.stringify(errorData, null, 2));
                errorMessage = errorData.message || errorData.error || errorMessage;
                errorDetails = errorData.details || errorData.message || '';

                // Check for role mismatch error
                if (errorData.error === 'ROLE_MISMATCH' || errorDetails.includes('This email is already registered as a')) {
                  console.error('[NextAuth] ❌ Role mismatch error:', errorDetails);
                  // Throw error with the specific message to trigger redirect to error page
                  throw new Error(`AccessDenied:${errorDetails}`);
                }

                // Check for duplicate account error
                if (errorData.error === 'DUPLICATE_ACCOUNT' || errorDetails.includes('An account already exists with this email as a')) {
                  console.error('[NextAuth] ❌ Duplicate account error:', errorDetails);
                  // Store the error message in sessionStorage for the error page to retrieve
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('authError', errorDetails);
                  }
                  // Throw error to trigger redirect to error page
                  throw new Error('DUPLICATE_ACCOUNT');
                }
              } catch (e) {
                if (e instanceof Error && e.message === 'DUPLICATE_ACCOUNT') {
                  throw e; // Re-throw our custom error
                }
                console.log('[NextAuth] ❌ Failed to parse error as JSON, getting text');
                errorMessage = await response.text();
                console.log('[NextAuth] Error message text:', errorMessage);
              }
            } else {
              errorMessage = await response.text();
              console.log('[NextAuth] ❌ Non-JSON error:', errorMessage);
            }
            console.error('[NextAuth] ❌ Social login failed with message:', errorMessage);
            console.log('==================== APPLE/GOOGLE SIGN-IN FAILED ====================');

            // Throw AccessDenied error with the message
            throw new Error(`AccessDenied:${errorMessage}`);
          }

          console.log('[NextAuth] ✅ Social-login API successful, parsing response...');
          const data = await response.json();
          console.log('[NextAuth] Response data:', JSON.stringify(data, null, 2));

          // Check if OTP verification is required
          if (data.requiresVerification) {
            console.log('[NextAuth] Social login requires OTP verification, redirecting...');
            // Throw error with details to trigger redirect to OTP verification page
            // Format: AccessDenied:REQUIRES_OTP_VERIFICATION|email|role
            throw new Error(`AccessDenied:REQUIRES_OTP_VERIFICATION|${data.email}|${data.role}`);
          }

          // Store the user data for use in JWT callback
          (user as any).id = data.user.id;
          (user as any).role = data.user.role;
          (user as any).provider = data.user.provider;
          (user as any).accessToken = data.token;

          return true; // Allow sign-in
        } catch (error) {
          console.error('Social sign-in error:', error);
          // Re-throw the error so NextAuth can handle it properly
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Social login failed. Please try again.');
        }
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-email',
  },



  // Cookie configuration for production
  // IMPORTANT: Apple OAuth requires specific cookie settings for cross-site redirects
  cookies: {
    pkceCodeVerifier: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.pkce.code_verifier'
        : 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.state'
        : 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
      },
    },
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug mode for Apple Sign In troubleshooting
  debug: true,

  // Add event handlers for debugging
  events: {
    async signIn(message) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('[NextAuth EVENT] signIn triggered');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('User:', message.user?.email);
      console.log('Account provider:', message.account?.provider);
      console.log('Is new user:', message.isNewUser);
    },
    async signOut(message) {
      console.log('[NextAuth EVENT] signOut');
    },
    async createUser(message) {
      console.log('[NextAuth EVENT] createUser:', message.user?.email);
    },
    async linkAccount(message) {
      console.log('[NextAuth EVENT] linkAccount:', message.account?.provider);
    },
  },

  // Add logger for detailed NextAuth debugging
  logger: {
    error(code, metadata) {
      console.error('\n');
      console.error('╔═══════════════════════════════════════════════════════════════════════════╗');
      console.error('║                    ❌ NEXTAUTH ERROR ❌                                   ║');
      console.error('╠═══════════════════════════════════════════════════════════════════════════╣');
      console.error('║ Error Code:', code);

      if (metadata instanceof Error) {
        console.error('║ Error Message:', metadata.message);
        console.error('║ Error Stack:', metadata.stack);
      } else {
        const metaObj = metadata as any;
        console.error('║ Provider:', metaObj?.providerId || 'unknown');
        console.error('║ Error Details:', JSON.stringify(metadata, null, 2));
      }

      // If it's an Apple OAuth error, show the current config being used
      const metaObj = metadata as any;
      if (metaObj?.providerId === 'apple' || code === 'OAUTH_CALLBACK_ERROR') {
        console.error('║');
        console.error('║ 🍎 APPLE CONFIG AT ERROR TIME:');
        console.error('║   APPLE_CLIENT_ID:', process.env.APPLE_CLIENT_ID || '❌ NOT SET');
        console.error('║   APPLE_CLIENT_SECRET:', process.env.APPLE_CLIENT_SECRET ? `✅ SET (${process.env.APPLE_CLIENT_SECRET.length} chars)` : '❌ NOT SET');

        if (process.env.APPLE_CLIENT_SECRET) {
          try {
            const parts = process.env.APPLE_CLIENT_SECRET.split('.');
            if (parts.length === 3) {
              // Decode header (contains key ID)
              const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
              const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
              const now = Math.floor(Date.now() / 1000);
              const isExpired = now > payload.exp;

              console.error('║   JWT Header:');
              console.error('║     - alg (Algorithm):', header.alg);
              console.error('║     - kid (Key ID):', header.kid, '← CHECK THIS IN APPLE DEVELOPER CONSOLE');
              console.error('║   JWT Payload:');
              console.error('║     - iss (Team ID):', payload.iss);
              console.error('║     - sub (Client ID):', payload.sub);
              console.error('║     - aud:', payload.aud);
              console.error('║     - Expires:', new Date(payload.exp * 1000).toISOString());
              console.error('║     - Expired:', isExpired ? '⚠️ YES' : '✅ No');

              if (payload.sub !== process.env.APPLE_CLIENT_ID) {
                console.error('║');
                console.error('║   ⚠️ MISMATCH: JWT sub does not match APPLE_CLIENT_ID!');
                console.error('║   JWT sub:', payload.sub);
                console.error('║   APPLE_CLIENT_ID:', process.env.APPLE_CLIENT_ID);
              }

              if (metaObj?.error?.message === 'invalid_client') {
                console.error('║');
                console.error('║ 🔧 FIX for "invalid_client":');
                console.error('║   Since JWT is NOT expired, the issue is likely:');
                console.error('║');
                console.error('║   1. Key ID (kid):', header.kid, 'may be REVOKED or DELETED');
                console.error('║      → Go to Apple Developer Console > Certificates, Identifiers & Profiles > Keys');
                console.error('║      → Verify this Key ID exists and is active');
                console.error('║');
                console.error('║   2. The private key (.p8 file) may not match the Key ID');
                console.error('║      → Download a fresh .p8 file from Apple if needed');
                console.error('║');
                console.error('║   3. Services ID (com.fieldsy.web) may not be configured for Sign in with Apple');
                console.error('║      → Go to Identifiers > Services IDs > com.fieldsy.web');
                console.error('║      → Ensure "Sign In with Apple" is enabled');
                console.error('║      → Check Return URLs include: https://fieldsy.co.uk/api/auth/callback/apple');
                console.error('║');
                console.error('║ To regenerate with a new key: cd backend && node generate-apple-client-secret.js');
              }
            }
          } catch (e) {
            console.error('║   Could not decode JWT:', e);
          }
        }
      }
      console.error('╚═══════════════════════════════════════════════════════════════════════════╝');
      console.error('\n');
    },
    warn(code) {
      console.warn('[NextAuth WARN]', code);
    },
    debug(code, metadata) {
      // Log debug messages for Apple-related operations
      if (code.toLowerCase().includes('apple') || code.toLowerCase().includes('oauth')) {
        console.log('[NextAuth DEBUG]', code);
        if (metadata) {
          console.log('Debug metadata:', JSON.stringify(metadata, null, 2));
        }
      }
    },
  },
};

async function refreshAccessToken(token: JWT) {
  // For now, just return the token as-is
  // In production, implement proper token refresh
  return token;
}