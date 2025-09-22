import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  // Get token from session or Authorization header
  let token = (session as any)?.accessToken || session?.user?.accessToken
  
  // If no token in session, check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${backendUrl}/api/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      return res.status(response.status).json(data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const response = await fetch(`${backendUrl}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(req.body)
      })

      const data = await response.json()
      return res.status(response.status).json(data)
    } catch (error) {
      console.error('Error creating conversation:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}