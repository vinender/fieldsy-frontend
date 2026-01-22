import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import io, { Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (conversationId: string, content: string, receiverId: string) => Promise<any>
  markAsRead: (messageIds: string[]) => void
  emitTyping: (conversationId: string, isTyping: boolean) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: async () => null,
  markAsRead: () => { },
  emitTyping: () => { }
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Check if we're on a public page where socket isn't needed
  const isPublicPage = router.pathname === '/' && status !== 'authenticated'
  const shouldConnect = status === 'authenticated' && !isPublicPage

  useEffect(() => {
    // Don't attempt connection if session is still loading, unauthenticated, or on public page
    if (status === 'loading' || !shouldConnect) {
      return;
    }

    // Get token from session or localStorage directly
    const sessionToken = (session as any)?.accessToken;
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const token = sessionToken || localToken;

    if (!token) {
      return;
    }

    let socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    // Force production URL if running on fieldsy.co.uk
    if (typeof window !== 'undefined' && window.location.hostname.includes('fieldsy.co.uk')) {
      socketUrl = 'https://api.fieldsy.co.uk';
      console.log('[SocketContext] Forcing production socket URL:', socketUrl);
    }

    console.log('[SocketContext] Raw socketUrl:', socketUrl);

    // Fix potential double protocol issue and other malformed URL patterns
    if (socketUrl && typeof socketUrl === 'string') {
      // Fix https://https:// typos
      if (socketUrl.startsWith('https://https://')) {
        socketUrl = socketUrl.replace('https://https://', 'https://');
      }

      // Fix the "https://https/" issue reported by user
      if (socketUrl === 'https' || socketUrl === 'https/' || socketUrl === 'https://https') {
        socketUrl = 'https://api.fieldsy.co.uk';
        console.log('[SocketContext] Malformed socketUrl detected, falling back to production:', socketUrl);
      }

      // Final fallback/validation
      if (!socketUrl.startsWith('http')) {
        console.warn('[SocketContext] Invalid socket URL protocol, falling back to localhost');
        socketUrl = 'http://localhost:5000';
      }
    }

    console.log('[SocketContext] Connecting to:', socketUrl);

    const newSocket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit('join-conversations')
    })

    newSocket.on('connect_error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Socket connection error:', error.message)
      }
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [session, status, shouldConnect]) // Depend on session, status and shouldConnect

  const sendMessage = useCallback(async (conversationId: string, content: string, receiverId: string) => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      // Generate a correlation ID for tracking this specific message
      const correlationId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // Set a timeout for the acknowledgment
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000); // 10 second timeout

      // Send message via socket with acknowledgment callback
      socket.emit('send-message', {
        conversationId,
        content,
        receiverId,
        correlationId
      }, (response: any) => {
        clearTimeout(timeout);

        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error || 'Failed to send message'));
        }
      });
    });
  }, [socket, isConnected])

  const markAsRead = useCallback((messageIds: string[]) => {
    if (socket) {
      socket.emit('mark-as-read', { messageIds })
    }
  }, [socket])

  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { conversationId, isTyping })
    }
  }, [socket])

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendMessage, markAsRead, emitTyping }}>
      {children}
    </SocketContext.Provider>
  )
}