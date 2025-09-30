import { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory storage for error messages (keyed by timestamp)
const errorMessages = new Map<string, { message: string; timestamp: number }>();

// Clean up old messages (older than 1 minute)
function cleanupOldMessages() {
  const now = Date.now();
  for (const [key, value] of errorMessages.entries()) {
    if (now - value.timestamp > 60000) { // 1 minute
      errorMessages.delete(key);
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  cleanupOldMessages();

  if (req.method === 'POST') {
    // Store error message
    const { message } = req.body;
    const key = Date.now().toString();
    errorMessages.set(key, { message, timestamp: Date.now() });

    res.status(200).json({ key });
  } else if (req.method === 'GET') {
    // Retrieve error message
    const { key } = req.query;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'Missing key parameter' });
    }

    const errorData = errorMessages.get(key);
    if (errorData) {
      errorMessages.delete(key); // Delete after retrieval
      return res.status(200).json({ message: errorData.message });
    }

    res.status(404).json({ error: 'Message not found' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}