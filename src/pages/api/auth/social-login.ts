import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, image, provider, providerId, role: bodyRole } = req.body;
    
    // Use the role from the request body (will be passed from NextAuth callback)
    let role = bodyRole || 'DOG_OWNER';
    
    // Ensure role is valid
    if (role !== 'DOG_OWNER' && role !== 'FIELD_OWNER') {
      role = 'DOG_OWNER';
    }
    
    console.log('[Social Login] Using role:', {
      role,
      email,
      provider
    });

    // Validate input
    if (!email || !provider || !providerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Call backend API to handle social login
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
    const response = await fetch(`${backendUrl}/auth/social-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        image,
        provider,
        providerId,
        role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    
    // Return the backend response
    res.status(200).json({
      user: data.data.user,
      token: data.data.token,
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}