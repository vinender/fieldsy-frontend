import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/router';

interface ChatContextType {
  unreadMessagesCount: number;
  setUnreadMessagesCount: (count: number) => void;
  playMessageSound: () => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: (count?: number) => void;
  resetUnreadCount: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const { socket } = useSocket();
  const { user } = useAuth();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('/sounds/message-notification.mp3');
    audioRef.current.volume = 0.5; // Set volume to 50%
    
    // Load unread count from localStorage on mount
    const savedCount = localStorage.getItem('unreadMessagesCount');
    if (savedCount) {
      setUnreadMessagesCount(parseInt(savedCount, 10));
    }

    // Fetch initial unread count from API
    fetchUnreadCount();
  }, []);

  // Save unread count to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('unreadMessagesCount', unreadMessagesCount.toString());
  }, [unreadMessagesCount]);

  // Fetch unread count from API
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !user) return;

      const response = await fetch('/api/chat/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadMessagesCount(data.count || 0);
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
        // Increment unread count
        incrementUnreadCount();
        
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
  };

  return (
    <ChatContext.Provider 
      value={{
        unreadMessagesCount,
        setUnreadMessagesCount,
        playMessageSound,
        incrementUnreadCount,
        decrementUnreadCount,
        resetUnreadCount
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