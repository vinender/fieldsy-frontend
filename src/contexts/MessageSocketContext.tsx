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

    // Prevent multiple connection attempts
    if (!token) {
      console.log('[MessageSocket] No auth token, skipping connection')
      return
    }

    if (socketRef.current?.connected) {
      console.log('[MessageSocket] Already connected, skipping')
      return
    }

    // If socket exists but is disconnected, reconnect it instead of creating new one
    if (socketRef.current && !socketRef.current.connected) {
      console.log('[MessageSocket] Reconnecting existing socket')
      socketRef.current.connect()
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
      reconnectionAttempts: 5,  // More attempts for production stability
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000, // Cap max delay
      timeout: 15000,  // Longer timeout for production
      path: '/socket.io/', // Explicit path
      withCredentials: true, // Always enable credentials for auth
      autoConnect: true, // Ensure auto-connection
      forceNew: false, // Reuse existing connection if available
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

    newSocket.on('disconnect', (reason) => {
      console.log('[MessageSocket] Disconnected:', reason)
      setIsConnected(false)

      // Auto-reconnect if disconnected by server or transport close
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect manually
        console.log('[MessageSocket] Server disconnected, reconnecting...')
        newSocket.connect()
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('[MessageSocket] Reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
    })

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[MessageSocket] Reconnection attempt', attemptNumber)
    })

    newSocket.on('reconnect_error', (error) => {
      console.log('[MessageSocket] Reconnection error:', error.message)
    })

    newSocket.on('reconnect_failed', () => {
      console.log('[MessageSocket] Reconnection failed after all attempts')
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