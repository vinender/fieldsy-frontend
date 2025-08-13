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
    role?: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN';
    provider?: string;
  };
}

export const authOptions: NextAuthOptions = {
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'}/auth/me`, {
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'}/auth/login`, {
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

    async signIn({ user, account, profile }) {
      // Handle social login with role
      if (account?.provider === 'google' || account?.provider === 'apple') {
        // Try to get the role from session storage (set by the modal)
        // This is a client-side value, so we'll need to handle it differently
        
        // For now, we'll create/update the user with a default role
        // In production, you would:
        // 1. Check if user exists in database
        // 2. If new user, use the role passed from the client
        // 3. If existing user, use their stored role
        
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/social-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account.provider,
            providerId: account.providerAccountId,
            role: 'DOG_OWNER', // Default role, should be passed from client
          }),
        });
        
        if (!response.ok) {
          return false;
        }
        
        return true; // Allow sign-in
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