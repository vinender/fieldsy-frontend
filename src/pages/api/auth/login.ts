import { NextApiRequest, NextApiResponse } from 'next';
import { verifyPassword } from '@/lib/auth/password-utils';
import { generateTokens } from '@/lib/auth/jwt-utils';
import { setCookie } from 'cookies-next';

// Temporary in-memory storage (replace with database in production)
// This should be shared with register.ts in production
const users: any[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email (in production, query database)
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const tokens = await generateTokens({
      userId: user.id,
      email: user.email,
      name: user.name,
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

    // Return user data (without password)
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
      tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}