import { NextApiRequest, NextApiResponse } from 'next';
import { generateTokens } from '@/lib/auth/jwt-utils';
import { setCookie } from 'cookies-next';
import { findUserByEmail, createUser, users } from '@/lib/auth/user-store';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, image, provider, providerId, role } = req.body;

    // Validate input
    if (!email || !provider || !providerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role if provided
    let userRole: 'DOG_OWNER' | 'FIELD_OWNER' = 'DOG_OWNER'; // Default to DOG_OWNER
    if (role) {
      const validRoles = ['DOG_OWNER', 'FIELD_OWNER'];
      if (validRoles.includes(role)) {
        userRole = role as 'DOG_OWNER' | 'FIELD_OWNER';
      }
    }

    // Check if user exists
    let user = findUserByEmail(email);
    
    if (!user) {
      // Create new user from social login
      user = createUser({
        email,
        name: name || email.split('@')[0],
        role: userRole,
        password: `social_${provider}_${providerId}`, // Placeholder password for social logins
        phone: '',
      });
    } else {
      // If user exists, just use their existing role
      // Don't update the role on subsequent logins
    }

    // Generate tokens
    const tokens = await generateTokens({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      provider,
    });

    // Set secure HTTP-only cookies
    setCookie('access_token', tokens.accessToken, {
      req,
      res,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    setCookie('refresh_token', tokens.refreshToken, {
      req,
      res,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Return user data
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        provider,
        emailVerified: user.emailVerified,
      },
      tokens,
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}