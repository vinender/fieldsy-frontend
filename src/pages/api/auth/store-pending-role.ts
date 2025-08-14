import { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory storage for pending roles
// In production, use Redis or a database
const pendingRoles = new Map<string, { role: string; timestamp: number }>();

// Clean up old entries (older than 10 minutes)
const cleanupOldEntries = () => {
  const now = Date.now();
  for (const [key, value] of pendingRoles.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) {
      pendingRoles.delete(key);
    }
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Store a pending role
    const { role } = req.body;
    
    if (!role || (role !== 'DOG_OWNER' && role !== 'FIELD_OWNER')) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Generate a unique session ID
    const sessionId = Math.random().toString(36).substring(7);
    
    // Store the role
    pendingRoles.set(sessionId, {
      role,
      timestamp: Date.now()
    });
    
    // Clean up old entries
    cleanupOldEntries();
    
    console.log('[Store Pending Role] Stored:', { 
      sessionId, 
      role,
      totalPending: pendingRoles.size,
      all: Array.from(pendingRoles.entries()).map(([k, v]) => ({ key: k, role: v.role }))
    });
    
    return res.status(200).json({ success: true, sessionId });
    
  } else if (req.method === 'GET') {
    // Retrieve a pending role by email (after OAuth)
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    // For simplicity, we'll use the most recent role stored
    // In production, you'd want to match this more precisely
    const entries = Array.from(pendingRoles.entries());
    const mostRecent = entries
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .find(([_, value]) => Date.now() - value.timestamp < 5 * 60 * 1000); // Within last 5 minutes
    
    if (mostRecent) {
      const [sessionId, data] = mostRecent;
      console.log('[Get Pending Role] Found:', { sessionId, role: data.role, email });
      
      // Delete after retrieval to prevent reuse
      pendingRoles.delete(sessionId);
      
      return res.status(200).json({ role: data.role });
    }
    
    console.log('[Get Pending Role] Not found for email:', email);
    return res.status(200).json({ role: null });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Export the storage for use in other endpoints
export { pendingRoles };