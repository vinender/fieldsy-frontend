import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword, validatePassword } from '@/lib/auth/password-utils';
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
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      emailVerified: false,
    };

    // Save user (in production, save to database)
    users.push(newUser);

    // Generate tokens
    const tokens = await generateTokens({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
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
    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        emailVerified: newUser.emailVerified,
      },
      tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}