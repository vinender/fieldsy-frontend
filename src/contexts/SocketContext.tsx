import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'
import { useSendMessage } from '@/hooks/mutations/useMessageMutations'

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
  markAsRead: () => {},
  emitTyping: () => {}
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const sendMessageMutation = useSendMessage()

  useEffect(() => {
    // Don't attempt connection if session is still loading or unauthenticated
    if (status === 'loading' || status === 'unauthenticated') {
      return;
    }
    
    // Get token from session or localStorage directly
    const sessionToken = (session as any)?.accessToken;
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const token = sessionToken || localToken;
    
    if (!token) {
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
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
  }, [session, status]) // Depend on session and status changes

  const sendMessage = useCallback(async (conversationId: string, content: string, receiverId: string) => {
    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        content,
        receiverId
      })
      return result
    } catch (error: any) {
      console.error('Error sending message:', error)
      // Re-throw the error so the component can handle it
      throw error
    }
  }, [sendMessageMutation])

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