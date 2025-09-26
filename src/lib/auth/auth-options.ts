import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/auth/password-utils';
import { generateTokens, verifyToken } from '@/lib/auth/jwt-utils';
import { findUserByEmail } from '@/lib/auth/user-store';
import { parse } from 'cookie';

interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN';
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
  
  // Reduce session polling
  refetchInterval: 5 * 60, // 5 minutes instead of default
  refetchOnWindowFocus: false, // Disable refetch on window focus
  
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
        try {
          // Try to get the pending role for this social login
          let role = 'DOG_OWNER'; // Default role
          
          try {
            const roleResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/store-pending-role?email=${encodeURIComponent(user.email || '')}`);
            if (roleResponse.ok) {
              const roleData = await roleResponse.json();
              if (roleData.role) {
                role = roleData.role;
                console.log('[NextAuth] Retrieved pending role:', role, 'for email:', user.email);
              }
            }
          } catch (error) {
            console.log('[NextAuth] Could not retrieve pending role:', error);
          }
          
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/social-login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
              role, // Pass the role from pending storage
            }),
          });
          
          if (!response.ok) {
            console.error('Social login failed:', await response.text());
            return false;
          }
          
          const data = await response.json();
          
          // Store the user data for use in JWT callback
          (user as any).id = data.user.id;
          (user as any).role = data.user.role;
          (user as any).provider = data.user.provider;
          (user as any).accessToken = data.token;
          
          return true; // Allow sign-in
        } catch (error) {
          console.error('Social sign-in error:', error);
          return false;
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

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

async function refreshAccessToken(token: JWT) {
  // For now, just return the token as-is
  // In production, implement proper token refresh
  return token;
}