import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/auth/password-utils';
import { generateTokens, verifyToken } from '@/lib/auth/jwt-utils';
import { findUserByEmail } from '@/lib/auth/user-store';


interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  user: {
    id: string;
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
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? [
        AppleProvider({
          clientId: process.env.APPLE_CLIENT_ID,
          clientSecret: process.env.APPLE_CLIENT_SECRET,
        }),
      ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        // If token is provided (from registration/login), use it directly
        if (credentials?.token && credentials?.email) {
          try {
            // Verify the token with our backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${credentials.token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              return {
                id: data.data.id,
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
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
          id: token.sub!,
          role: (token.user as any)?.role,
          provider: token.provider as string,
        }
      } as ExtendedSession;
    },

    async signIn({ user, account, profile, credentials }) {
      // Handle social login with role
      if (account?.provider === 'google' || account?.provider === 'apple') {
        console.log('==================== APPLE/GOOGLE SIGN-IN START ====================');
        console.log('[NextAuth] Provider:', account.provider);
        console.log('[NextAuth] User Email:', user.email);
        console.log('[NextAuth] User Name:', user.name);
        console.log('[NextAuth] User Image:', user.image);
        console.log('[NextAuth] Provider Account ID:', account.providerAccountId);
        console.log('[NextAuth] Account Object:', JSON.stringify(account, null, 2));
        console.log('================================================================');

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
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    state: {
      name: 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
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
  // Disable debug mode to prevent excessive logging that can cause issues
  debug: false,
};

async function refreshAccessToken(token: JWT) {
  // For now, just return the token as-is
  // In production, implement proper token refresh
  return token;
}