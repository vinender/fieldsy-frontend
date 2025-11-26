import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/router';

interface ChatContextType {
  unreadMessagesCount: number;
  unreadConversationsCount: number;
  setUnreadMessagesCount: (count: number) => void;
  setUnreadConversationsCount: (count: number) => void;
  playMessageSound: () => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: (count?: number) => void;
  resetUnreadCount: () => void;
  markConversationAsRead: (conversationId: string) => void;
  markConversationAsUnread: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadConversationsCount, setUnreadConversationsCount] = useState(0);
  const [unreadConversationIds, setUnreadConversationIds] = useState<Set<string>>(new Set());
  const { socket } = useSocket();
  const { user } = useAuth();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Check if we're on a public page where chat isn't needed
  const isPublicPage = router.pathname === '/' && !user;
  const shouldLoadChat = !!user && !isPublicPage;

  // Initialize audio on mount
  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('/sounds/message-notification.wav');
    audioRef.current.volume = 0.5; // Set volume to 50%
    
    // Only load chat data if authenticated and not on public page
    if (shouldLoadChat) {
      // Load unread count from localStorage on mount
      const savedCount = localStorage.getItem('unreadMessagesCount');
      if (savedCount) {
        setUnreadMessagesCount(parseInt(savedCount, 10));
      }

      // Fetch initial unread count from API
      fetchUnreadCount();
    }
  }, [shouldLoadChat]);

  // Save unread count to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('unreadMessagesCount', unreadMessagesCount.toString());
  }, [unreadMessagesCount]);

  // Fetch unread count from API
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !user || !shouldLoadChat) return;

      // Fetch unread conversations count (number of chats with unread messages)
      const conversationsResponse = await fetch('/api/chat/unread-conversations-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        setUnreadConversationsCount(conversationsData.unreadConversationsCount || 0);
      }

      // Also fetch total unread messages count for backward compatibility
      const messagesResponse = await fetch('/api/chat/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setUnreadMessagesCount(messagesData.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Play notification sound
  const playMessageSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log('Failed to play notification sound:', error);
      });
    }
  };

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (message: any) => {
      // Only show notification if we're not on the messages page or not in that conversation
      const isOnMessagesPage = router.pathname === '/user/messages';
      const isInConversation = router.query.conversationId === message.conversationId;

      // Don't show notification if user is actively in the conversation
      if (isOnMessagesPage && isInConversation) {
        return;
      }

      // Only increment and notify for messages received (not sent)
      if (message.receiverId === user.id || message.receiverId === user._id) {
        // Increment unread message count
        incrementUnreadCount();

        // Mark conversation as having unread messages
        markConversationAsUnread(message.conversationId);

        // Play notification sound
        playMessageSound();
      }
    };

    const handleMessageRead = (data: { messageIds: string[], conversationId: string }) => {
      // Decrease unread count when messages are marked as read
      if (data.messageIds && data.messageIds.length > 0) {
        decrementUnreadCount(data.messageIds.length);
      }
    };

    const handleUnreadCountUpdate = (data: { count: number }) => {
      setUnreadMessagesCount(data.count);
    };

    // Subscribe to socket events
    socket.on('new-message', handleNewMessage);
    socket.on('messages-read', handleMessageRead);
    socket.on('unread-count-updated', handleUnreadCountUpdate);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('messages-read', handleMessageRead);
      socket.off('unread-count-updated', handleUnreadCountUpdate);
    };
  }, [socket, user, router]);

  const incrementUnreadCount = () => {
    setUnreadMessagesCount(prev => prev + 1);
  };

  const decrementUnreadCount = (count: number = 1) => {
    setUnreadMessagesCount(prev => Math.max(0, prev - count));
  };

  const resetUnreadCount = () => {
    setUnreadMessagesCount(0);
    setUnreadConversationsCount(0);
    setUnreadConversationIds(new Set());
  };

  const markConversationAsRead = (conversationId: string) => {
    setUnreadConversationIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
        setUnreadConversationsCount(newSet.size);
      }
      return newSet;
    });
  };

  const markConversationAsUnread = (conversationId: string) => {
    setUnreadConversationIds(prev => {
      const newSet = new Set(prev);
      if (!newSet.has(conversationId)) {
        newSet.add(conversationId);
        setUnreadConversationsCount(newSet.size);
      }
      return newSet;
    });
  };

  return (
    <ChatContext.Provider
      value={{
        unreadMessagesCount,
        unreadConversationsCount,
        setUnreadMessagesCount,
        setUnreadConversationsCount,
        playMessageSound,
        incrementUnreadCount,
        decrementUnreadCount,
        resetUnreadCount,
        markConversationAsRead,
        markConversationAsUnread
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}