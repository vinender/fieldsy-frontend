import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { role } = req.body;
    
    if (!role || (role !== 'DOG_OWNER' && role !== 'FIELD_OWNER')) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Update the user's role in the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
    const response = await fetch(`${backendUrl}/auth/update-role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        role: role,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update role');
    }

    res.status(200).json({ success: true, role });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}