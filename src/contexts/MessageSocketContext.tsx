import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'
import { getSocketUrl } from '@/lib/utils/socket-url'

interface PendingMessage {
  conversationId: string
  content: string
  receiverId: string
  correlationId: string
  timestamp: number
  timeoutId?: NodeJS.Timeout
  callback?: (response: any) => void
}

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
  hasPendingMessages: boolean
}

const MessageSocketContext = createContext<MessageSocketContextType>({
  socket: null,
  isConnected: false,
  joinConversation: () => { },
  fetchMessages: () => { },
  sendMessage: () => { },
  markAsRead: () => { },
  emitTyping: () => { },
  connect: () => { },
  disconnect: () => { },
  hasPendingMessages: false
})

export const useMessageSocket = () => useContext(MessageSocketContext)

export const MessageSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [hasPendingMessages, setHasPendingMessages] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const pendingMessagesRef = useRef<Map<string, PendingMessage>>(new Map())
  const isDisconnectingRef = useRef(false)

  // Get auth token from session or localStorage
  const getAuthToken = useCallback(() => {
    const sessionToken = (session as any)?.accessToken
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    return sessionToken || localToken
  }, [session])

  // Update pending messages state
  const updatePendingState = useCallback(() => {
    setHasPendingMessages(pendingMessagesRef.current.size > 0)
  }, [])

  // Clear all pending message timeouts without triggering callbacks
  const clearAllPendingTimeouts = useCallback(() => {
    pendingMessagesRef.current.forEach((pending) => {
      if (pending.timeoutId) {
        clearTimeout(pending.timeoutId)
      }
    })
  }, [])

  // Retry pending messages after reconnection
  const retryPendingMessages = useCallback(() => {
    if (!socketRef.current?.connected) return

    const pendingMessages = Array.from(pendingMessagesRef.current.values())
    console.log(`[MessageSocket] Retrying ${pendingMessages.length} pending messages`)

    pendingMessages.forEach((pending) => {
      // Clear existing timeout
      if (pending.timeoutId) {
        clearTimeout(pending.timeoutId)
      }

      // Set new timeout
      const newTimeoutId = setTimeout(() => {
        console.error(`[MessageSocket] Retry ACK timeout for ${pending.correlationId}`)
        pendingMessagesRef.current.delete(pending.correlationId)
        updatePendingState()
        if (pending.callback && !isDisconnectingRef.current) {
          pending.callback({ success: false, error: 'Server timeout after retry', timeout: true })
        }
      }, 10000) // Longer timeout for retries

      pending.timeoutId = newTimeoutId

      // Re-emit the message
      socketRef.current!.emit('send-message', {
        conversationId: pending.conversationId,
        content: pending.content,
        receiverId: pending.receiverId,
        correlationId: pending.correlationId
      }, (response: any) => {
        clearTimeout(newTimeoutId)
        pendingMessagesRef.current.delete(pending.correlationId)
        updatePendingState()
        console.log(`[MessageSocket] Retry ACK received for ${pending.correlationId}:`, response)
        if (pending.callback) {
          pending.callback(response)
        }
      })
    })
  }, [updatePendingState])

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

    // Get socket URL with automatic malformed URL fixing
    const socketUrl = getSocketUrl('[MessageSocket]');
    console.log('[MessageSocket] Connecting to:', socketUrl);

    // Determine if we're in production
    const isProduction = socketUrl.includes('indiitserver.in') || process.env.NODE_ENV === 'production' || socketUrl.includes('fieldsy.co.uk')

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
      isDisconnectingRef.current = false
      setIsConnected(true)
      newSocket.emit('join-conversations')

      // Retry any pending messages after reconnection
      if (pendingMessagesRef.current.size > 0) {
        console.log('[MessageSocket] Retrying pending messages after connect')
        setTimeout(() => retryPendingMessages(), 500) // Small delay to ensure connection is stable
      }
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
      isDisconnectingRef.current = false
      setIsConnected(true)

      // Retry any pending messages after reconnection
      if (pendingMessagesRef.current.size > 0) {
        console.log('[MessageSocket] Retrying pending messages after reconnect')
        setTimeout(() => retryPendingMessages(), 500)
      }
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
  }, [getAuthToken, retryPendingMessages])

  // Disconnect from socket (called when leaving messages page)
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[MessageSocket] Disconnecting...')

      // Mark that we're intentionally disconnecting to suppress error toasts
      isDisconnectingRef.current = true

      // Clear all pending message timeouts to prevent false error callbacks
      clearAllPendingTimeouts()

      // Don't clear the pending messages map - keep them for potential retry on reconnect
      // But do clear callbacks since the component will unmount
      pendingMessagesRef.current.forEach((pending) => {
        pending.callback = undefined
      })

      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [clearAllPendingTimeouts])

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

      // Set timeout for ACK (8 seconds - longer to account for network latency)
      const ackTimeout = setTimeout(() => {
        console.error('[MessageSocket] ACK timeout - server did not respond in 8 seconds')
        // Only trigger callback if we're not intentionally disconnecting
        if (!isDisconnectingRef.current) {
          pendingMessagesRef.current.delete(correlationId)
          updatePendingState()
          if (callback) {
            callback({ success: false, error: 'Server timeout', timeout: true })
          }
        }
      }, 8000)

      // Track this pending message
      const pendingMessage: PendingMessage = {
        conversationId,
        content,
        receiverId,
        correlationId,
        timestamp: Date.now(),
        timeoutId: ackTimeout,
        callback
      }
      pendingMessagesRef.current.set(correlationId, pendingMessage)
      updatePendingState()

      socketRef.current.emit('send-message', { conversationId, content, receiverId, correlationId }, (response: any) => {
        clearTimeout(ackTimeout)
        pendingMessagesRef.current.delete(correlationId)
        updatePendingState()
        console.log(`[MessageSocket] ACK received:`, response)
        if (callback) {
          callback(response)
        }
      })
      console.log(`[MessageSocket] Event emitted, waiting for ACK...`)
    } else {
      console.error('[MessageSocket] Socket not connected! Cannot send message')
      console.error('[MessageSocket] Socket state:', socketRef.current)

      // Queue the message for retry when connection is restored
      const pendingMessage: PendingMessage = {
        conversationId,
        content,
        receiverId,
        correlationId,
        timestamp: Date.now(),
        callback
      }
      pendingMessagesRef.current.set(correlationId, pendingMessage)
      updatePendingState()
      console.log(`[MessageSocket] Message queued for retry: ${correlationId}`)

      // Don't call error callback immediately - let it retry on reconnect
      // But set a longer timeout for offline scenario
      const offlineTimeout = setTimeout(() => {
        if (pendingMessagesRef.current.has(correlationId) && !isDisconnectingRef.current) {
          pendingMessagesRef.current.delete(correlationId)
          updatePendingState()
          if (callback) {
            callback({ success: false, error: 'Connection lost. Message queued for retry.', queued: true })
          }
        }
      }, 30000) // 30 second timeout for offline messages

      // Store the timeout ID
      pendingMessage.timeoutId = offlineTimeout
    }
  }, [updatePendingState])

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
      // Mark as disconnecting to suppress error toasts
      isDisconnectingRef.current = true

      // Clear all pending message timeouts
      clearAllPendingTimeouts()

      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [clearAllPendingTimeouts])

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
        disconnect,
        hasPendingMessages
      }}
    >
      {children}
    </MessageSocketContext.Provider>
  )
}