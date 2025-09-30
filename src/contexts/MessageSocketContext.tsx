import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'

interface MessageSocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinConversation: (conversationId: string) => void
  fetchMessages: (conversationId: string, page?: number, limit?: number) => void
  sendMessage: (conversationId: string, content: string, receiverId: string) => void
  markAsRead: (messageIds: string[]) => void
  emitTyping: (conversationId: string, isTyping: boolean) => void
  connect: () => void
  disconnect: () => void
}

const MessageSocketContext = createContext<MessageSocketContextType>({
  socket: null,
  isConnected: false,
  joinConversation: () => {},
  fetchMessages: () => {},
  sendMessage: () => {},
  markAsRead: () => {},
  emitTyping: () => {},
  connect: () => {},
  disconnect: () => {}
})

export const useMessageSocket = () => useContext(MessageSocketContext)

export const MessageSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  
  // Get auth token from session or localStorage
  const getAuthToken = useCallback(() => {
    const sessionToken = (session as any)?.accessToken
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    return sessionToken || localToken
  }, [session])

  // Connect to socket (called when messages page is opened)
  const connect = useCallback(() => {
    const token = getAuthToken()
    
    if (!token || socketRef.current?.connected) {
      return
    }

    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
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
      console.log('[MessageSocket] Connected')
      setIsConnected(true)
      newSocket.emit('join-conversations')
    })
    
    newSocket.on('connect_error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[MessageSocket] Connection error:', error.message)
      }
    })

    newSocket.on('disconnect', () => {
      console.log('[MessageSocket] Disconnected')
      setIsConnected(false)
    })

    socketRef.current = newSocket
    setSocket(newSocket)
  }, [getAuthToken])

  // Disconnect from socket (called when leaving messages page)
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[MessageSocket] Disconnecting...')
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [])

  // Join a conversation and get message history
  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      console.log(`[MessageSocket] Joining conversation ${conversationId}`)
      socketRef.current.emit('join-conversation', { conversationId })
    }
  }, [])

  // Fetch messages via socket event
  const fetchMessages = useCallback((conversationId: string, page: number = 1, limit: number = 50) => {
    if (socketRef.current?.connected) {
      console.log(`[MessageSocket] Fetching messages for conversation ${conversationId}`)
      socketRef.current.emit('fetch-messages', { conversationId, page, limit })
    }
  }, [])

  // Send a message via socket
  const sendMessage = useCallback((conversationId: string, content: string, receiverId: string) => {
    if (socketRef.current?.connected) {
      console.log(`[MessageSocket] Sending message to conversation ${conversationId}`)
      socketRef.current.emit('send-message', { conversationId, content, receiverId })
    }
  }, [])

  // Mark messages as read
  const markAsRead = useCallback((messageIds: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark-as-read', { messageIds })
    }
  }, [])

  // Emit typing indicator
  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { conversationId, isTyping })
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  return (
    <MessageSocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversation,
        fetchMessages,
        sendMessage,
        markAsRead,
        emitTyping,
        connect,
        disconnect
      }}
    >
      {children}
    </MessageSocketContext.Provider>
  )
}