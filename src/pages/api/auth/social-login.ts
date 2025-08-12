import { NextApiRequest, NextApiResponse } from 'next';
import { generateTokens } from '@/lib/auth/jwt-utils';
import { setCookie } from 'cookies-next';

// Temporary in-memory storage (replace with database in production)
const users: any[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, image, provider, providerId } = req.body;

    // Validate input
    if (!email || !provider || !providerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    let user = users.find(u => u.email === email);
    
    if (!user) {
      // Create new user from social login
      user = {
        id: `user_${Date.now()}`,
        email,
        name: name || email.split('@')[0],
        image,
        provider,
        providerId,
        createdAt: new Date().toISOString(),
        emailVerified: true, // Social logins are pre-verified
      };
      
      users.push(user);
    } else {
      // Update existing user with social login info
      user.provider = provider;
      user.providerId = providerId;
      if (image) user.image = image;
      if (name) user.name = name;
      user.emailVerified = true;
    }

    // Generate tokens
    const tokens = await generateTokens({
      userId: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
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
        image: user.image,
        provider: user.provider,
        emailVerified: user.emailVerified,
      },
      tokens,
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}