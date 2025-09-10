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
  console.log('🏁 SocketProvider rendering...')
  
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const sendMessageMutation = useSendMessage()
  
  // Log on every render
  console.log('🏁 SocketProvider - session:', !!session)
  console.log('🏁 SocketProvider - socket state:', !!socket)

  useEffect(() => {
    console.log('🔧 SocketContext main effect running...', new Date().toISOString());
    
    // Get token from session or localStorage directly
    const sessionToken = (session as any)?.accessToken;
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const token = sessionToken || localToken;
    
    console.log('🔍 SocketContext - Session token:', !!sessionToken, 'at', new Date().toISOString());
    console.log('🔍 SocketContext - LocalStorage token:', !!localToken);
    console.log('🔍 SocketContext - Final token:', !!token);
    
    if (!token) {
      console.log('⚠️ SocketContext - No token available, socket not created');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    console.log('🚀 SocketContext - Creating socket connection to:', socketUrl);
    
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
      console.log('🟢 Chat Socket connected - Socket ID:', newSocket.id)
      setIsConnected(true)
      newSocket.emit('join-conversations')
    })
    
    // Debug: Log all events
    newSocket.onAny((eventName, ...args) => {
      console.log('🔵 Chat Socket event received:', eventName, args)
    })
    
    newSocket.on('connect_error', (error) => {
      console.error('🔴 Chat Socket connection error:', error.message)
    })

    newSocket.on('disconnect', () => {
      console.log('🔴 Chat Socket disconnected')
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      console.log('🧹 Cleaning up chat socket connection')
      newSocket.close()
    }
  }, [session]) // Only depend on session changes

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