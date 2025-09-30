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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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

    // Handle response - check if it's JSON first
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      let error;
      if (isJson) {
        try {
          error = await response.json();
        } catch (e) {
          error = { error: 'Failed to parse error response' };
        }
      } else {
        // Response is not JSON (could be text like "Too many requests")
        const text = await response.text();
        console.error('[Social Login] Non-JSON error response:', text);
        error = { error: text || 'Authentication failed' };
      }

      // For duplicate account errors, return with specific error structure and set cookie
      const errorMessage = error.message || error.error || 'Authentication failed';
      if (errorMessage.includes('An account already exists with this email as a')) {
        // Set a cookie with the error message
        res.setHeader('Set-Cookie', `authErrorMessage=${encodeURIComponent(errorMessage)}; Path=/; Max-Age=60; HttpOnly=false; SameSite=Lax`);

        return res.status(409).json({
          error: 'DUPLICATE_ACCOUNT',
          message: errorMessage,
          details: errorMessage
        });
      }

      return res.status(response.status).json(error);
    }

    // Parse successful response
    let data;
    if (isJson) {
      try {
        data = await response.json();
      } catch (e) {
        console.error('[Social Login] Failed to parse success response:', e);
        return res.status(500).json({ error: 'Invalid response from server' });
      }
    } else {
      const text = await response.text();
      console.error('[Social Login] Non-JSON success response:', text);
      return res.status(500).json({ error: 'Invalid response format from server' });
    }
    
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