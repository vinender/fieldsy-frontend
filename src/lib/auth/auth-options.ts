import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/auth/password-utils';
import { generateTokens, verifyToken } from '@/lib/auth/jwt-utils';

interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
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
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // TODO: Replace with actual database check
        // For demo purposes, accept any email/password
        // In production, verify against database
        
        // Mock user for testing
        if (credentials.email && credentials.password) {
          return {
            id: '1',
            email: credentials.email,
            name: credentials.email.split('@')[0],
            image: null
          };
        }
        
        return null;
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 60 * 60 * 1000,
          provider: account.provider,
          user: {
            id: user.id,
            email: user.email!,
            name: user.name,
            image: user.image,
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
          provider: token.provider as string,
        }
      } as ExtendedSession;
    },

    async signIn({ user, account, profile }) {
      // Allow all sign-ins for now
      // In production, you would save/update user in database here
      if (account?.provider === 'google' || account?.provider === 'apple') {
        console.log('Social login successful:', {
          provider: account.provider,
          email: user.email,
          name: user.name
        });
        
        // TODO: Save user to database
        // const response = await saveUserToDatabase({
        //   email: user.email,
        //   name: user.name,
        //   image: user.image,
        //   provider: account.provider,
        //   providerId: account.providerAccountId,
        // });
        
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