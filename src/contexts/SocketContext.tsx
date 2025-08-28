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
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const sendMessageMutation = useSendMessage()

  useEffect(() => {
    // Get token from session or localStorage
    const token = (session as any)?.accessToken || (typeof window !== 'undefined' && localStorage.getItem('authToken'));
    
    if (token) {
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001', {
        auth: {
          token: token
        }
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
        setIsConnected(true)
        newSocket.emit('join-conversations')
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [session])

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