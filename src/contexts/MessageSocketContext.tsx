import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'

interface MessageSocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinConversation: (conversationId: string) => void
  fetchMessages: (conversationId: string, page?: number, limit?: number) => void
  sendMessage: (conversationId: string, content: string, receiverId: string, correlationId: string, callback?: (response: any) => void) => void
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
  const connect = useCallback(async () => {
    const token = getAuthToken()

    if (!token || socketRef.current?.connected) {
      return
    }

    // Simple backend check - if this fails, don't attempt WebSocket
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    try {
      // Use Promise.race for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch(`${backendUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      }).catch(() => null)

      clearTimeout(timeoutId)

      if (!response) {
        console.log('[MessageSocket] Backend not reachable, skipping WebSocket connection')
        return
      }
    } catch (error) {
      console.log('[MessageSocket] Backend check failed, skipping WebSocket connection')
      return
    }

    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

    // Determine if we're in production
    const isProduction = socketUrl.includes('indiitserver.in') || process.env.NODE_ENV === 'production'

    const newSocket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['polling', 'websocket'], // Polling first for better compatibility
      reconnection: true,
      reconnectionAttempts: 3,  // Reduced from 5 to fail faster
      reconnectionDelay: 1000,
      timeout: 10000,  // Increased timeout for production
      path: '/socket.io/', // Explicit path
      withCredentials: isProduction, // Only enable credentials in production
    })

    newSocket.on('connect', () => {
      console.log('[MessageSocket] Connected')
      setIsConnected(true)
      newSocket.emit('join-conversations')
    })
    
    newSocket.on('connect_error', (error) => {
      // Only log in development, and make it clear this is often expected
      if (process.env.NODE_ENV === 'development') {
        // Suppress the error if it's a connection refused (backend not running)
        if (error.message.includes('xhr poll error') || error.message.includes('websocket error')) {
          // These are expected when backend is not running, don't log
        } else {
          console.log('[MessageSocket] Connection issue:', error.message)
        }
      }
      setIsConnected(false)
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

  // Send a message via socket with ACK callback
  const sendMessage = useCallback((conversationId: string, content: string, receiverId: string, correlationId: string, callback?: (response: any) => void) => {
    if (socketRef.current?.connected) {
      console.log(`[MessageSocket] === SENDING MESSAGE ===`)
      console.log(`[MessageSocket] Socket ID:`, socketRef.current.id)
      console.log(`[MessageSocket] Conversation ID:`, conversationId)
      console.log(`[MessageSocket] Content:`, content)
      console.log(`[MessageSocket] Receiver ID:`, receiverId)
      console.log(`[MessageSocket] Correlation ID:`, correlationId)
      console.log(`[MessageSocket] Emitting 'send-message' event...`)

      // Set timeout for ACK (5 seconds)
      const ackTimeout = setTimeout(() => {
        console.error('[MessageSocket] ACK timeout - server did not respond in 5 seconds')
        if (callback) {
          callback({ success: false, error: 'Server timeout', timeout: true })
        }
      }, 5000)

      socketRef.current.emit('send-message', { conversationId, content, receiverId, correlationId }, (response: any) => {
        clearTimeout(ackTimeout)
        console.log(`[MessageSocket] ACK received:`, response)
        if (callback) {
          callback(response)
        }
      })
      console.log(`[MessageSocket] Event emitted, waiting for ACK...`)
    } else {
      console.error('[MessageSocket] Socket not connected! Cannot send message')
      console.error('[MessageSocket] Socket state:', socketRef.current)
      if (callback) {
        callback({ success: false, error: 'Socket not connected' })
      }
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