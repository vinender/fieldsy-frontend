import { NextApiRequest, NextApiResponse } from 'next';
import { roleStore } from '@/lib/auth/role-store';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { role } = req.body;
    
    if (!role || (role !== 'DOG_OWNER' && role !== 'FIELD_OWNER')) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Generate a unique key for this role selection
    const roleKey = roleStore.generateKey();
    
    // Store the role in memory
    roleStore.setRole(roleKey, role);

    // Set the role key in cookies that can be read both client and server side
    res.setHeader('Set-Cookie', [
      `pendingUserRole=${role}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`, // 5 minutes
      `roleKey=${roleKey}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`, // Role key
      `clientUserRole=${role}; Path=/; SameSite=Lax; Max-Age=300`, // Client-readable version
    ]);

    res.status(200).json({ success: true, role, roleKey });
  } catch (error) {
    console.error('Set role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}