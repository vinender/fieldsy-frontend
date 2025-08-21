import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (conversationId: string, content: string, receiverId: string) => void
  markAsRead: (messageIds: string[]) => void
  emitTyping: (conversationId: string, isTyping: boolean) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
  markAsRead: () => {},
  emitTyping: () => {}
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Get token from session or localStorage
    const token = (session as any)?.accessToken || localStorage.getItem('authToken');
    
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

  const sendMessage = async (conversationId: string, content: string, receiverId: string) => {
    const token = (session as any)?.accessToken || localStorage.getItem('authToken');
    if (!token) return null

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId,
          content,
          receiverId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      const message = await response.json()
      return message
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }

  const markAsRead = (messageIds: string[]) => {
    if (socket) {
      socket.emit('mark-as-read', { messageIds })
    }
  }

  const emitTyping = (conversationId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { conversationId, isTyping })
    }
  }

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendMessage, markAsRead, emitTyping }}>
      {children}
    </SocketContext.Provider>
  )
}