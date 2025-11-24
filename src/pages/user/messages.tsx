import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  ArrowLeft,
  Search,
  Send,
  MoreVertical,
  Circle,
  MessageCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import BlockUserModal from '@/components/modal/BlockUserModal';
import ReportUserModal from '@/components/modal/ReportUserModal';
import DeleteChatModal from '@/components/modal/DeleteChatModal';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/contexts/SocketContext';
import { useMessageSocket } from '@/contexts/MessageSocketContext';
import { useChat } from '@/contexts/ChatContext';
import { useRouter } from 'next/router';
import styles from '@/styles/messages.module.css';
import { toast } from 'sonner';
import { getUserImage, getUserInitials } from '@/utils/getUserImage';
import { ListSkeleton, ChatMessageSkeleton } from '@/components/skeletons/SkeletonComponents';
import Spinner from '@/components/ui/Spinner';

import { useConversations } from '@/hooks/queries/useMessageQueries';
import { useCreateConversation, useDeleteConversation, useSendMessage } from '@/hooks/mutations/useMessageMutations';
import { useBlockStatus, useUnblockUser } from '@/hooks/queries/useUserBlockQueries';
import { formatMessageTimestamp, formatChatListTime, formatChatDateHeader } from '@/utils/formatters';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
  sender?: User;
  receiver?: User;
}

interface Conversation {
  id: string;
  participants: User[];
  field?: {
    id: string;
    name: string;
    images: string[];
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  messages: Message[];
}

// Message character limit
const MESSAGE_CHAR_LIMIT = 1000;

// Memoized message component to prevent re-renders
const MessageItem = memo(({
  message,
  isMyMessage,
  isNewMessage,
  formatMessageTime
}: {
  message: Message;
  isMyMessage: boolean;
  isNewMessage: boolean;
  formatMessageTime: (date: string) => string;
}) => {
  return (
    <div
      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} ${isNewMessage ? styles.newMessage : ''
        }`}
    >
      <div className={`max-w-[70%] sm:max-w-[528px] ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div
          className={`px-4 sm:px-6 py-3 sm:py-4 break-words ${styles.messageBubble} ${isMyMessage
              ? 'bg-light-green text-white rounded-tl-[30px] sm:rounded-tl-[60px] rounded-bl-[30px] sm:rounded-bl-[60px] rounded-tr-[15px] sm:rounded-tr-[30px] rounded-br-none'
              : 'bg-cream text-dark-green rounded-tr-[30px] sm:rounded-tr-[60px] rounded-tl-[15px] sm:rounded-tl-[30px] rounded-bl-[30px] sm:rounded-bl-[60px] rounded-br-none'
            } ${isNewMessage ? 'transition-all duration-300' : ''
            }`}
        >
          <p className="text-[14px] sm:text-[15px] leading-[20px] sm:leading-[22px] break-words whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className={`text-[12px] sm:text-[14px] text-gray-text ${isMyMessage ? 'text-right' : 'text-left'
          } ${isNewMessage ? 'opacity-0 animate-fadeIn' : ''}`}
          style={isNewMessage ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}
        >
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
});


const MessagesPage = () => {

  const { data: session, status } = useSession();
  const router = useRouter();
  const { socket, sendMessage } = useSocket();

  const {
    socket: messageSocket,
    isConnected: isMessageSocketConnected,
    joinConversation,
    fetchMessages: fetchMessagesViaSocket,
    sendMessage: sendMessageViaSocket,
    markAsRead,
    emitTyping,
    connect: connectMessageSocket,
    disconnect: disconnectMessageSocket
  } = useMessageSocket();


  const { decrementUnreadCount, markConversationAsRead } = useChat();


  // React Query hooks
  const { data: conversationsData, isLoading: isLoadingConversations, refetch: refetchConversations } = useConversations(1, 20);
  const createConversationMutation = useCreateConversation();
  const deleteConversationMutation = useDeleteConversation();
  const sendMessageMutation = useSendMessage();
  const unblockUserMutation = useUnblockUser();

  // Extract query params, accounting for router not being ready
  // These are optional - only used when navigating with specific conversation/user
  const queryConversationId = router.isReady ? router.query.conversationId as string : undefined;
  const queryUserId = router.isReady ? router.query.userId as string : undefined;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{ name: string; id: string } | null>(null);
  const [userToReport, setUserToReport] = useState<{ name: string; id: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<string>('');
  // Using isLoadingConversations from React Query instead
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [floatingDate, setFloatingDate] = useState<string>('');
  const [showFloatingDate, setShowFloatingDate] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdsSetRef = useRef<Set<string>>(new Set()); // Track all message IDs to prevent duplicates
  const processingMessagesRef = useRef<Set<string>>(new Set()); // Track messages being processed to prevent race conditions

  // Get current user ID from session or localStorage
  const getCurrentUserId = () => {
    if (session?.user?.id) return session.user.id;

    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          return user.id || user._id;
        } catch { }
      }
    }
    return null;
  };


  const currentUserId = getCurrentUserId();

  // Helper function to get other user
  const getOtherUser = (conversation: Conversation): User | undefined => {
    return conversation?.participants?.find(p => p.id !== currentUserId);
  };

  // Helper function to safely add/update messages with deduplication
  const safelyUpdateMessages = useCallback((
    updateFn: (prev: Message[]) => Message[]
  ) => {
    setMessages(prev => {
      const newMessages = updateFn(prev);

      // Fast path: if adding a single message to the end, skip expensive operations
      if (newMessages.length === prev.length + 1 && newMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1];
        // Update tracking set
        if (!lastMsg.id.startsWith('msg-')) {
          messageIdsSetRef.current.add(lastMsg.id);
        }
        return newMessages;
      }

      // Slow path: for bulk updates or complex operations
      // Create a map to track unique messages by ID
      const uniqueMessagesMap = new Map<string, Message>();

      // Process messages in order, keeping only the latest version of each
      newMessages.forEach(msg => {
        uniqueMessagesMap.set(msg.id, msg);
      });

      // Convert back to array - messages are already sorted from backend
      // Only sort if we detect out-of-order messages (rare)
      const uniqueMessages = Array.from(uniqueMessagesMap.values());
      const needsSort = uniqueMessages.some((msg, i) =>
        i > 0 && new Date(msg.createdAt).getTime() < new Date(uniqueMessages[i - 1].createdAt).getTime()
      );

      if (needsSort) {
        uniqueMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }

      // Update our tracking set (excluding correlation IDs - they'll be replaced)
      messageIdsSetRef.current = new Set(
        uniqueMessages.filter(m => !m.id.startsWith('msg-')).map(m => m.id)
      );

      return uniqueMessages;
    });
  }, []);

  // Get other user and block status
  const otherUserForBlock = selectedConversation ? getOtherUser(selectedConversation) : null;
  const { data: blockStatusData, refetch: refetchBlockStatus } = useBlockStatus(otherUserForBlock?.id);

  // Connect message socket only when we have authentication
  // IMPORTANT: connectMessageSocket/disconnectMessageSocket are intentionally NOT in dependencies
  // to prevent reconnection on every re-render when changing chats
  useEffect(() => {
    // Only connect if we have authentication
    const hasAuth = session || (typeof window !== 'undefined' && localStorage.getItem('authToken'));
    if (hasAuth && status !== 'loading') {
      connectMessageSocket();
    }

    return () => {
      disconnectMessageSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  // Monitor connection status and show indicator
  useEffect(() => {
    if (!isMessageSocketConnected) {
      // Show connection status after 2 seconds of being disconnected
      const timer = setTimeout(() => {
        setShowConnectionStatus(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // Hide connection status when connected
      setShowConnectionStatus(false);
    }
  }, [isMessageSocketConnected]);

  // Redirect if not logged in
  useEffect(() => {
    // Don't redirect while session is loading
    if (status === 'loading') return;

    // Check both session and localStorage for authentication
    const hasAuth = session || (typeof window !== 'undefined' && localStorage.getItem('authToken'));
    if (status === 'unauthenticated' && !hasAuth) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Load conversations
  useEffect(() => {
    // Don't load while session is still loading
    if (status === 'loading') return;

    // Check if we have any auth token available
    const hasAuth = session || (typeof window !== 'undefined' && localStorage.getItem('authToken'));
    if (hasAuth) {
      loadConversations();
    }
  }, [session, status]);

  // Auto-select conversation from query parameter
  useEffect(() => {
    if (router.isReady && queryConversationId && conversations.length > 0) {
      const targetConversation = conversations.find(
        conv => conv.id === queryConversationId
      );

      if (targetConversation) {
        handleSelectConversation(targetConversation);
        // Clear the query parameter after selecting
        router.replace('/user/messages', undefined, { shallow: true });
      }
    }
  }, [router.isReady, queryConversationId, conversations]);

  // Track if we've already processed the sessionStorage intent to prevent duplicate creation
  const processedSessionIntentRef = useRef<boolean>(false);

  // Check for saved messaging intent from sessionStorage
  useEffect(() => {
    if (router.isReady && !isLoadingConversations && !queryUserId && typeof window !== 'undefined' && !processedSessionIntentRef.current) {
      const savedUserId = sessionStorage.getItem('messageIntentUserId');
      const savedFieldId = sessionStorage.getItem('messageIntentFieldId');

      if (savedUserId) {
        // Mark as processed before doing anything
        processedSessionIntentRef.current = true;

        // Clear the saved intent
        sessionStorage.removeItem('messageIntentUserId');
        sessionStorage.removeItem('messageIntentFieldId');

        // Find conversation with this user
        const targetConversation = conversations.find(conv =>
          conv.participants.some(p => p.id === savedUserId)
        );

        if (targetConversation) {
          handleSelectConversation(targetConversation);
        } else {
          // If no existing conversation, create one with the field context
          createConversationWithUser(savedUserId, savedFieldId);
        }
      }
    }
  }, [router.isReady, conversations, isLoadingConversations, queryUserId]);

  // Track if we've already processed the queryUserId to prevent duplicate creation
  const processedQueryUserIdRef = useRef<string | null>(null);

  // Auto-open or create conversation with specific user from query param
  useEffect(() => {
    // Only process if router is ready, not loading and we have the userId
    // Also check if we haven't already processed this userId
    if (router.isReady && queryUserId && !isLoadingConversations && processedQueryUserIdRef.current !== queryUserId) {
      // Mark this userId as processed
      processedQueryUserIdRef.current = queryUserId;

      // Find conversation with this user
      const targetConversation = conversations.find(conv =>
        conv.participants.some(p => p.id === queryUserId)
      );

      if (targetConversation) {
        handleSelectConversation(targetConversation);
      } else {
        // If no existing conversation, create or initiate one
        createConversationWithUser(queryUserId);
      }

      // Clear the query parameter after processing
      router.replace('/user/messages', undefined, { shallow: true });
    }
  }, [router.isReady, queryUserId, conversations, isLoadingConversations]);

  // Socket event listeners - using useRef to maintain stable references
  const selectedConversationRef = useRef(selectedConversation);
  const messagesRef = useRef(messages);
  const markAsReadRef = useRef(markAsRead);
  const decrementUnreadCountRef = useRef(decrementUnreadCount);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);

  useEffect(() => {
    decrementUnreadCountRef.current = decrementUnreadCount;
  }, [decrementUnreadCount]);

  // Listen for message history when joining a conversation
  useEffect(() => {
    if (!messageSocket) return;

    const handleMessageHistory = (data: {
      conversationId: string;
      messages: Message[];
      total: number;
    }) => {
      if (selectedConversationRef.current && data.conversationId === selectedConversationRef.current.id) {
        // Don't replace if we have optimistic messages (correlation IDs) - merge instead
        const hasOptimisticMessages = messagesRef.current.some(m => m.id.startsWith('msg-'));

        if (hasOptimisticMessages) {
          // Keep optimistic messages and merge with new ones
          safelyUpdateMessages(prev => {
            const optimistic = prev.filter(m => m.id.startsWith('msg-'));
            const newMessages = data.messages || [];
            // Combine optimistic with new messages (avoiding duplicates)
            return [...newMessages, ...optimistic];
          });
        } else {
          // No optimistic messages, safe to replace
          messageIdsSetRef.current.clear();
          processingMessagesRef.current.clear();
          safelyUpdateMessages(() => data.messages || []);
        }
        setIsLoadingMessages(false);

        // Mark unread messages as read
        const unreadMessageIds = data.messages
          .filter((msg: Message) => msg.receiverId === currentUserId && !msg.isRead)
          .map((msg: Message) => msg.id);

        if (unreadMessageIds.length > 0) {
          markAsRead(unreadMessageIds);
          decrementUnreadCount(unreadMessageIds.length);
          // Mark the conversation as read (no more unread messages in this chat)
          markConversationAsRead(data.conversationId);
        }
      }
    };

    const handleMessagesFetched = (data: {
      conversationId: string;
      messages: Message[];
      pagination: any;
    }) => {
      if (selectedConversationRef.current && data.conversationId === selectedConversationRef.current.id) {
        // Don't replace if we have optimistic messages (correlation IDs) - merge instead
        const hasOptimisticMessages = messagesRef.current.some(m => m.id.startsWith('msg-'));

        if (hasOptimisticMessages) {
          // Keep optimistic messages and merge with new ones
          safelyUpdateMessages(prev => {
            const optimistic = prev.filter(m => m.id.startsWith('msg-'));
            const newMessages = data.messages || [];
            // Combine optimistic with new messages (avoiding duplicates)
            return [...newMessages, ...optimistic];
          });
        } else {
          // No optimistic messages, safe to replace
          messageIdsSetRef.current.clear();
          processingMessagesRef.current.clear();
          safelyUpdateMessages(() => data.messages || []);
        }
        setIsLoadingMessages(false);

        // Mark unread messages as read
        const unreadMessageIds = data.messages
          .filter((msg: Message) => msg.receiverId === currentUserId && !msg.isRead)
          .map((msg: Message) => msg.id);

        if (unreadMessageIds.length > 0) {
          markAsRead(unreadMessageIds);
          decrementUnreadCount(unreadMessageIds.length);
          // Mark the conversation as read (no more unread messages in this chat)
          markConversationAsRead(data.conversationId);
        }
      }
    };

    const handleMessagesError = (data: { error: string }) => {
      setIsLoadingMessages(false);
    };

    const handleConversationError = (data: { error: string }) => {
      setIsLoadingMessages(false);
    };

    const handleMessageError = (data: { error: string; blocked?: boolean }) => {
      if (data.blocked) {
        setIsBlocked(true);
        setBlockMessage(data.error || 'Cannot send messages. One or both users have blocked each other.');
      }
      toast.error(data.error || 'Failed to send message');
    };

    messageSocket.on('message-history', handleMessageHistory);
    messageSocket.on('messages-fetched', handleMessagesFetched);
    messageSocket.on('messages-error', handleMessagesError);
    messageSocket.on('conversation-error', handleConversationError);
    messageSocket.on('message-error', handleMessageError);

    return () => {
      messageSocket.off('message-history', handleMessageHistory);
      messageSocket.off('messages-fetched', handleMessagesFetched);
      messageSocket.off('messages-error', handleMessagesError);
      messageSocket.off('conversation-error', handleConversationError);
      messageSocket.off('message-error', handleMessageError);
    };
  }, [messageSocket, selectedConversation, currentUserId, markAsRead, decrementUnreadCount, safelyUpdateMessages]);

  // Listen for new messages and typing indicators
  useEffect(() => {
    if (!socket && !messageSocket) return;

    const activeSocket = messageSocket || socket;

    const handleNewMessage = (message: Message) => {
      // CRITICAL FIX: Skip ALL our own messages from new-message event
      // Our own messages are handled exclusively by the ACK callback
      const isOwnMessage = message.senderId === currentUserId;
      if (isOwnMessage) {
        return;
      }

      // Prevent processing duplicate messages
      if (messageIdsSetRef.current.has(message.id)) {
        return;
      }

      // Add to processing set to prevent race conditions
      processingMessagesRef.current.add(message.id);

      // Add message to current conversation if it belongs to it
      const belongsToCurrentConv = selectedConversationRef.current && message.conversationId === selectedConversationRef.current.id;

      if (belongsToCurrentConv) {

        safelyUpdateMessages(prev => {
          // Check if message already exists (double-check)
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }

          // Check for optimistic message to replace (using correlation ID format)
          // Note: Our own messages are handled by ACK, so this is mainly for received messages
          const optimisticIndex = prev.findIndex(m =>
            m.id.startsWith('msg-') &&
            m.content === message.content &&
            m.senderId === message.senderId
          );

          if (optimisticIndex !== -1) {
            // Replace optimistic message with real message
            const updated = [...prev];
            updated[optimisticIndex] = message;
            return updated;
          }

          // Add new message
          return [...prev, message];
        });

        // Use requestAnimationFrame for immediate, smooth scrolling
        requestAnimationFrame(() => {
          requestAnimationFrame(scrollToBottom);
        });

        // Track as new message for animation (only for received messages, not our own)
        if (message.senderId !== currentUserId) {
          setNewMessageIds(prev => new Set(prev).add(message.id));

          // Remove from new messages after animation (500ms for animation to complete)
          setTimeout(() => {
            setNewMessageIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(message.id);
              return newSet;
            });
          }, 500);
        }

        // Mark as read if we're the receiver - do this immediately
        if (message.receiverId === currentUserId) {
          markAsReadRef.current([message.id]);
          decrementUnreadCountRef.current(1);
        }

        // Clean up processing set immediately (no need to delay)
        processingMessagesRef.current.delete(message.id);
      } else {
        // Message is for a different conversation, update the conversation list
        loadConversations();
        // Clean up processing set
        processingMessagesRef.current.delete(message.id);
      }
    };

    const handleUserTyping = ({ userId, isTyping: typing }: { userId: string; isTyping: boolean }) => {
      if (selectedConversationRef.current && userId === getOtherUser(selectedConversationRef.current)?.id) {
        setOtherUserTyping(typing);
      }
    };

    // Listen for both new-message and new-message-notification events
    console.log('[Messages] ✅ Registering socket event listeners');
    console.log('[Messages] Socket ID:', activeSocket.id);
    console.log('[Messages] Socket connected?', activeSocket.connected);

    activeSocket.on('new-message', handleNewMessage);
    console.log('[Messages] ✅ Registered new-message listener');

    activeSocket.on('new-message-notification', (data: any) => {
      console.log('[Messages] new-message-notification received:', data);
      if (data.message) {
        handleNewMessage(data.message);
      }
    });
    console.log('[Messages] ✅ Registered new-message-notification listener');

    activeSocket.on('user-typing', handleUserTyping);
    console.log('[Messages] ✅ Registered user-typing listener');

    // Test: Log all events received
    const anyEventHandler = (eventName: string, ...args: any[]) => {
      console.log(`[Messages] 🔔 Socket event received: ${eventName}`, args);
    };
    activeSocket.onAny(anyEventHandler);

    return () => {
      console.log('[Messages] ❌ Unregistering socket event listeners');
      activeSocket.off('new-message', handleNewMessage);
      activeSocket.off('new-message-notification');
      activeSocket.off('user-typing', handleUserTyping);
      activeSocket.offAny(anyEventHandler);
    };
  }, [socket, messageSocket, currentUserId, safelyUpdateMessages]); // Added safelyUpdateMessages to deps

  // Scroll to bottom when new messages arrive - optimized with requestAnimationFrame
  useEffect(() => {
    // Use requestAnimationFrame for smoother, more efficient scrolling
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    });
  }, [messages]);

  const scrollToBottom = () => {
    // Only scroll the messages container, not the entire page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Update conversations from React Query data
  useEffect(() => {
    if (conversationsData?.conversations) {
      setConversations(conversationsData.conversations);
    }
  }, [conversationsData]);

  // Helper to refresh conversations
  const loadConversations = () => {
    refetchConversations();
  };

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);

    // Always fetch via socket - no REST fallback
    if (isMessageSocketConnected) {
      fetchMessagesViaSocket(conversationId, 1, 50);
    } else {
      // Wait for socket connection
      setTimeout(() => {
        if (isMessageSocketConnected) {
          fetchMessagesViaSocket(conversationId, 1, 50);
        } else {
          setIsLoadingMessages(false);
        }
      }, 500); // Wait 500ms for socket to connect
    }
  };

  // Update block status when data changes
  useEffect(() => {
    if (blockStatusData?.data) {
      setIsBlocked(!blockStatusData.data.canChat);
      if (!blockStatusData.data.canChat) {
        if (blockStatusData.data.isBlocked) {
          setBlockMessage('You have blocked this user. Unblock them to send messages.');
        } else if (blockStatusData.data.isBlockedBy) {
          setBlockMessage('This user has blocked you. You cannot send messages.');
        }
      } else {
        setIsBlocked(false);
        setBlockMessage('');
      }
    }
  }, [blockStatusData]);

  const handleSelectConversation = async (conversation: Conversation) => {
    console.log('[Messages] Selecting conversation:', conversation.id);

    // Check if this is the same conversation we're already viewing
    const isSameConversation = selectedConversation?.id === conversation.id;

    // Capture current message count BEFORE any state updates
    const currentMessageCount = messages.length;
    console.log('[Messages] Current message count:', currentMessageCount);

    setSelectedConversation(conversation);
    setIsLoadingMessages(true);

    // Only clear messages if switching to a DIFFERENT conversation
    if (!isSameConversation) {
      console.log('[Messages] Switching to new conversation, clearing messages');
      messageIdsSetRef.current.clear();
      processingMessagesRef.current.clear();
      setMessages([]); // Clear messages for new conversation
    } else {
      console.log('[Messages] Re-selecting same conversation, keeping messages');
    }

    // Show mobile chat view
    setShowMobileChat(true);

    // Reset block status
    setIsBlocked(false);
    setBlockMessage('');

    // Join conversation and load messages if:
    // 1. Switching to a different conversation, OR
    // 2. Same conversation but messages aren't loaded yet
    const needsToLoadMessages = !isSameConversation || currentMessageCount === 0;
    console.log('[Messages] needsToLoadMessages:', needsToLoadMessages, '(isSameConversation:', isSameConversation, ', messageCount:', currentMessageCount, ')');

    if (needsToLoadMessages) {
      if (isMessageSocketConnected && joinConversation) {
        console.log('[Messages] Joining conversation via socket');
        joinConversation(conversation.id);
      } else {
        console.log('[Messages] Socket not connected, will retry');
        // Retry joining after a short delay
        setTimeout(() => {
          if (isMessageSocketConnected && joinConversation) {
            joinConversation(conversation.id);
          } else {
            // Fallback to REST API if socket not connected
            loadMessages(conversation.id);
          }
        }, 500);
      }
    } else {
      console.log('[Messages] Same conversation with messages already loaded, skipping join');
      setIsLoadingMessages(false); // Not loading since we kept messages
      // Scroll immediately for same conversation
      requestAnimationFrame(scrollToBottom);
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    // Optionally clear selected conversation on mobile
    // setSelectedConversation(null);
  };

  const pendingConversationCreationsRef = useRef<Set<string>>(new Set());

  const createConversationWithUser = async (userId: string, fieldId?: string | null) => {
    if (!userId) return;

    const creationKey = fieldId ? `${userId}-${fieldId}` : userId;

    if (pendingConversationCreationsRef.current.has(creationKey)) {
      return;
    }

    pendingConversationCreationsRef.current.add(creationKey);

    createConversationMutation.mutate(
      { receiverId: userId, fieldId: fieldId || undefined },
      {
        onSuccess: (data) => {
          if (data) {
            setConversations(prev => {
              const exists = prev.some(c => c.id === data.id);
              if (!exists) {
                return [data, ...prev];
              }
              return prev;
            });
            handleSelectConversation(data);
            setShowMobileChat(true);
          }
        },
        onError: () => {
          toast.error('Failed to create conversation');
        },
        onSettled: () => {
          pendingConversationCreationsRef.current.delete(creationKey);
        }
      }
    );
  };

  const handleDeleteConversation = () => {
    if (!selectedConversation) return;

    setIsDeleting(true);
    deleteConversationMutation.mutate(selectedConversation.id, {
      onSuccess: () => {
        // Remove conversation from list
        setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));

        // Clear selected conversation
        setSelectedConversation(null);
        setMessages([]);

        // Go back to list on mobile
        setShowMobileChat(false);

        // Close modal
        setShowDeleteModal(false);
        setIsDeleting(false);
      },
      onError: () => {
        setIsDeleting(false);
      }
    });
  };

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    // Check if blocked first
    if (isBlocked) {
      return;
    }

    const otherUser = getOtherUser(selectedConversation);
    if (!otherUser) return;

    const content = messageInput.trim();
    setMessageInput('');

    // Keep keyboard open on mobile by refocusing input after a short delay
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 50);

    // Stop typing indicator
    emitTyping(selectedConversation.id, false);

    // Generate correlation ID to track this message through the system
    const correlationId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create optimistic message to show immediately
    const optimisticMessage: Message = {
      id: correlationId, // Use correlationId as temp ID for easy matching
      conversationId: selectedConversation.id,
      content,
      senderId: currentUserId!,
      receiverId: otherUser.id,
      createdAt: new Date().toISOString(),
      isRead: false,
      sender: {
        id: currentUserId!,
        name: session?.user?.name || 'You',
        email: session?.user?.email || '',
        image: session?.user?.image,
        role: (session?.user as any)?.role || 'DOG_OWNER'
      },
      receiver: otherUser // Add receiver info as well
    };

    // Add optimistic message to UI immediately - direct state update for optimistic messages
    setMessages(prev => {
      // Don't add if somehow it already exists
      if (prev.some(m => m.id === optimisticMessage.id)) {
        return prev;
      }
      return [...prev, optimisticMessage];
    });
    setNewMessageIds(prev => new Set(prev).add(optimisticMessage.id));

    // Scroll to bottom immediately with requestAnimationFrame
    requestAnimationFrame(scrollToBottom);

    // Always send via socket only - no REST API fallback
    if (isMessageSocketConnected && sendMessageViaSocket) {
      console.log('[Messages] Sending message via socket with correlation ID:', correlationId);

      // Send message with ACK callback
      sendMessageViaSocket(selectedConversation.id, content, otherUser.id, correlationId, (response: any) => {
        console.log('[Messages] Received ACK for message:', correlationId, response);

        if (response.success && response.message) {
          // Replace optimistic message with real message from server
          console.log('[Messages] Replacing optimistic message with real message:', response.message.id);
          console.log('[Messages] Looking for correlation ID:', correlationId);

          setMessages(prev => {
            console.log('[Messages] Current messages count:', prev.length);
            console.log('[Messages] Message IDs:', prev.map(m => m.id));

            const found = prev.find(m => m.id === correlationId);
            console.log('[Messages] Found optimistic message?', !!found);

            if (!found) {
              console.log('[Messages] Optimistic message not found, adding new message');
              return [...prev, response.message];
            }

            return prev.map(msg =>
              msg.id === correlationId ? response.message : msg
            );
          });

          // Update messageIdsSet to track the real message ID
          messageIdsSetRef.current.add(response.message.id);
          messageIdsSetRef.current.delete(correlationId);

        } else {
          // Message send failed - remove optimistic message
          console.error('[Messages] Message send failed:', response.error);
          safelyUpdateMessages(prev => prev.filter(m => m.id !== correlationId));
          setNewMessageIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(correlationId);
            return newSet;
          });

          // Show appropriate error message
          if (response.blocked) {
            setIsBlocked(true);
            setBlockMessage(response.error || 'Cannot send messages to this user.');
          } else if (response.timeout) {
            toast.error('Message send timeout. Please check your connection and try again.');
          } else {
            toast.error(response.error || 'Failed to send message. Please try again.');
          }

          // Restore the message input so user doesn't lose their message
          setMessageInput(content);
        }
      });

      // Update conversation's last message optimistically
      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: content, lastMessageAt: new Date().toISOString() }
          : conv
      ));
    } else {
      // Socket not connected - remove optimistic message and show error
      safelyUpdateMessages(prev => prev.filter(m => m.id !== correlationId));
      setNewMessageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(correlationId);
        return newSet;
      });
      toast.error('Connection lost. Please wait a moment and try again.');

      // Restore the message input so user doesn't lose their message
      setMessageInput(content);
    }
  }, [messageInput, selectedConversation, isBlocked, currentUserId, session, isMessageSocketConnected, sendMessageViaSocket, emitTyping, safelyUpdateMessages]);

  const handleTyping = useCallback(() => {
    if (!selectedConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      emitTyping(selectedConversation.id, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTyping(selectedConversation.id, false);
    }, 1000);
  }, [selectedConversation, isTyping, emitTyping]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Using utility functions for consistent WhatsApp-style formatting
  const formatTime = useCallback((timestamp: string | Date) => {
    return formatChatListTime(timestamp);
  }, []);

  const formatMessageTime = useCallback((timestamp: string | Date) => {
    return formatMessageTimestamp(timestamp);
  }, []);

  // Group messages by date
  const groupMessagesByDate = useCallback((messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach(message => {
      const dateKey = new Date(message.createdAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  }, []);

  // Handle scroll to update sticky date header
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const containerTop = container.getBoundingClientRect().top;

    // Find all date sections
    const dateSections = container.querySelectorAll('[data-date-section]');
    let currentDate = '';

    // Find which date section is currently visible at the top of the viewport
    dateSections.forEach((section) => {
      const sectionRect = section.getBoundingClientRect();
      const sectionTop = sectionRect.top - containerTop;
      const sectionBottom = sectionRect.bottom - containerTop;

      // Check if this section is visible in the viewport
      // A section is "current" if its top is at or above the sticky header position
      // and its bottom is below the sticky header position
      if (sectionTop <= 50 && sectionBottom > 50) {
        currentDate = (section as HTMLElement).dataset.dateSection || '';
      }
    });

    // Always show the sticky date when scrolling
    if (currentDate) {
      setFloatingDate(currentDate);
      setShowFloatingDate(true);
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Initial call to set the date
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, messages]); // Re-run when messages change

  // Don't render anything if not authenticated after loading
  if (status === 'unauthenticated' && !(typeof window !== 'undefined' && localStorage.getItem('authToken'))) {
    return null;
  }

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-light">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Determine if we are waiting for a conversation to be selected automatically
  const isPendingAutoSelection = (router.isReady && (!!queryUserId || !!queryConversationId) && !selectedConversation) || createConversationMutation.isPending;

  return (
    <div className="h-screen flex flex-col bg-light pt-16 xl:pt-24">
      {/* Connection Status Indicator */}
      {showConnectionStatus && !isMessageSocketConnected && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm">
          <Circle className="inline-block w-2 h-2 mr-2 animate-pulse" fill="currentColor" />
          Connecting to message server...
        </div>
      )}

      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-10 xl:px-20 py-4 lg:py-6 xl:py-8 overflow-hidden">
        {/* Page Title - Only show on desktop or when chat list is visible on mobile */}
        <div className={`flex items-center gap-4 mb-4 lg:mb-6 ${showMobileChat ? 'hidden sm:flex' : 'flex'}`}>
          <button
            onClick={() => router.back()}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-cream rounded-full flex items-center justify-center hover:bg-cream-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 text-dark-green" />
          </button>
          <h1 className="text-xl lg:text-2xl xl:text-[29px] font-semibold text-dark-green">Messages</h1>
        </div>

        {/* Messages Container */}
        <div className="flex-1 flex gap-0 bg-white rounded-[22px] border border-gray-border overflow-hidden min-h-0">
          {/* Conversations List - Hidden on mobile when chat is open */}
          <div className={`${showMobileChat ? 'hidden' : 'flex'} sm:flex sm:w-[280px] md:w-[320px] lg:w-[350px] xl:w-[432px] border-r border-gray-border flex-col w-full`}>
            {/* Search Bar */}
            <div className="p-4 lg:p-6 border-b border-gray-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-text" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-12 border-black/10 text-[16px] focus:border-green"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {isLoadingConversations ? (
                <div className="px-4 py-2">
                  <ListSkeleton items={4} />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-600">Start a conversation</p>
                </div>
              ) : (
                conversations
                  .filter(conv => {
                    if (!searchQuery) return true;
                    const otherUser = getOtherUser(conv);
                    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    if (!otherUser) return null;

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${selectedConversation?.id === conversation.id ? 'bg-cream' : ''
                          }`}
                      >
                        {/* Active indicator */}
                        {selectedConversation?.id === conversation.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green" />
                        )}

                        {/* Avatar */}
                        <div className="relative">
                          <img
                            src={getUserImage(otherUser)}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${getUserInitials(otherUser)}&background=3A6B22&color=fff&size=200`;
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-[16px] font-semibold text-dark-green truncate">
                              {otherUser.name}
                            </h3>
                            <span className="text-[13px] text-gray-text">
                              {conversation.lastMessageAt ? formatTime(conversation.lastMessageAt) : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[14px] text-gray-text truncate">
                              {conversation.lastMessage || 'No messages yet'}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Circle className="w-2 h-2 fill-green text-green" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Chat Area - Full width on mobile when open */}
          <div className={`${showMobileChat ? 'flex' : 'hidden'} sm:flex flex-1 flex-col min-w-0`}>
            {isPendingAutoSelection ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-gray-600">Loading conversation...</p>
                </div>
              </div>
            ) : selectedConversation ? (
              <>
                {/* Chat Header with Back Button on Mobile */}
                <div className="px-4 lg:px-6 py-4 lg:py-6 border-b border-gray-border bg-white flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                      {/* Mobile Back Button */}
                      <button
                        onClick={handleBackToList}
                        className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-dark-green" />
                      </button>

                      {(() => {
                        const otherUser = getOtherUser(selectedConversation);
                        return otherUser ? (
                          <>
                            <img
                              src={getUserImage(otherUser)}
                              alt={otherUser.name}
                              className="w-10 sm:w-14 h-10 sm:h-14 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${getUserInitials(otherUser)}&background=3A6B22&color=fff&size=200`;
                              }}
                            />
                            <div>
                              <h2 className="text-[16px] sm:text-[18px] font-semibold text-dark-green">
                                {otherUser.name}
                              </h2>
                              {otherUserTyping && (
                                <p className="text-[14px] sm:text-[16px] text-green">Typing...</p>
                              )}
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-6 h-6 text-dark-green" />
                      </button>

                      {/* Options Dropdown */}
                      {showOptions && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[180px] z-50">
                          <button
                            onClick={() => {
                              if (blockStatusData?.data?.isBlocked) {
                                return; // Do nothing if already blocked
                              }
                              const otherUser = getOtherUser(selectedConversation);
                              if (otherUser) {
                                setUserToBlock({ name: otherUser.name || 'this user', id: otherUser.id });
                                setShowBlockModal(true);
                              }
                              setShowOptions(false);
                            }}
                            disabled={blockStatusData?.data?.isBlocked}
                            className={`block w-full text-left text-[14px] py-3 px-4 transition-colors ${blockStatusData?.data?.isBlocked
                                ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                                : 'text-dark-green hover:bg-gray-50 cursor-pointer'
                              }`}
                          >
                            {blockStatusData?.data?.isBlocked ? 'User Already Blocked' : 'Block User'}
                          </button>
                          <button
                            onClick={() => {
                              const otherUser = getOtherUser(selectedConversation);
                              if (otherUser) {
                                setUserToReport({ name: otherUser.name || 'this user', id: otherUser.id });
                                setShowReportModal(true);
                              }
                              setShowOptions(false);
                            }}
                            className="block w-full text-left text-[14px] text-dark-green py-3 px-4 hover:bg-gray-50 transition-colors"
                          >
                            Report User
                          </button>
                          <div className="my-1 border-t border-gray-200"></div>
                          <button
                            onClick={() => {
                              const otherUser = getOtherUser(selectedConversation);
                              setUserToDelete(otherUser?.name || 'this user');
                              setShowDeleteModal(true);
                              setShowOptions(false);
                            }}
                            className="block w-full text-left text-[14px] text-red-600 py-3 px-4 hover:bg-red-50 transition-colors"
                          >
                            Delete Chat
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-gray-lighter no-scrollbar relative">
                  {/* Sticky Date Header - WhatsApp style - Always visible */}
                  {showFloatingDate && floatingDate && (
                    <div className="sticky top-0 z-20 flex justify-center pt-3 pb-2 bg-transparent pointer-events-none">
                      <span className="bg-cream/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold text-dark-green shadow-lg">
                        {floatingDate}
                      </span>
                    </div>
                  )}

                  <div className="p-4 lg:p-6">
                    {/* Message List with Date Sections */}
                    {isLoadingMessages ? (
                      <ChatMessageSkeleton />
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No messages yet. Start a conversation!
                      </div>
                    ) : (
                      <>
                        {Object.entries(groupMessagesByDate(messages)).map(([dateKey, dateMessages], index) => {
                          const sectionDate = formatChatDateHeader(dateMessages[0].createdAt);
                          // Hide inline date divider if sticky header is showing the same date
                          const hideInlineDate = showFloatingDate && floatingDate === sectionDate;

                          return (
                            <div
                              key={dateKey}
                              data-date-section={sectionDate}
                              className="date-section"
                            >
                              {/* Date Divider - Inline with messages - Hidden when sticky header shows same date */}
                              {!hideInlineDate && (
                                <div className="flex justify-center mb-4 mt-6 first:mt-0">
                                  <span className="bg-cream px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold text-dark-green shadow-sm">
                                    {sectionDate}
                                  </span>
                                </div>
                              )}

                              {/* Messages for this date */}
                              <div className="space-y-4">
                                {dateMessages.map((message) => (
                                  <MessageItem
                                    key={message.id}
                                    message={message}
                                    isMyMessage={message.senderId === currentUserId}
                                    isNewMessage={newMessageIds.has(message.id)}
                                    formatMessageTime={formatMessageTime}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}

                        {/* Typing Indicator */}
                        {otherUserTyping && (
                          <div className="flex justify-start mt-4">
                            <div className="bg-cream text-dark-green rounded-tr-[30px] sm:rounded-tr-[60px] rounded-tl-[15px] sm:rounded-tl-[30px] rounded-bl-[30px] sm:rounded-bl-[60px] rounded-br-none px-4 sm:px-6 py-3 sm:py-4">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="px-4 lg:px-6 py-3 lg:py-4 bg-white border-t border-gray-border flex-shrink-0">
                  {isBlocked ? (
                    <div className="py-2 px-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-[14px] font-medium text-center mb-2">
                        {blockMessage}
                      </p>
                      {blockMessage.includes('You have blocked') && (
                        <div className="text-center">
                          <button
                            onClick={() => {
                              const otherUser = getOtherUser(selectedConversation);
                              if (otherUser) {
                                unblockUserMutation.mutate({ blockedUserId: otherUser.id }, {
                                  onSuccess: () => {
                                    setIsBlocked(false);
                                    setBlockMessage('');
                                    refetchBlockStatus();
                                  }
                                });
                              }
                            }}
                            className="text-[14px] text-blue-600 hover:text-blue-700 underline"
                          >
                            Unblock User
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <Input
                          ref={messageInputRef}
                          type="text"
                          placeholder="Type your message here…"
                          value={messageInput}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            if (newValue.length <= MESSAGE_CHAR_LIMIT) {
                              setMessageInput(newValue);
                              handleTyping();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          maxLength={MESSAGE_CHAR_LIMIT}
                          className="flex-1 h-12 text-[16px] border-0 shadow-none px-0 focus:border-none focus:outline-none focus:ring-0 rounded-none"
                        />
                        <button
                          onClick={handleSendMessage}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${messageInput.trim()
                              ? 'bg-green hover:bg-green-hover'
                              : 'bg-gray-text'
                            }`}
                          disabled={!messageInput.trim()}
                        >
                          <Send className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      {messageInput.length > 0 && (
                        <div className="flex justify-end">
                          <span className={`text-xs ${messageInput.length >= MESSAGE_CHAR_LIMIT
                              ? 'text-red-600 font-semibold'
                              : messageInput.length >= MESSAGE_CHAR_LIMIT * 0.9
                                ? 'text-orange-600'
                                : 'text-gray-500'
                            }`}>
                            {messageInput.length}/{MESSAGE_CHAR_LIMIT}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block User Modal */}
      <BlockUserModal
        isOpen={showBlockModal}
        onClose={() => {
          setShowBlockModal(false);
          setUserToBlock(null);
        }}
        userName={userToBlock?.name}
        userId={userToBlock?.id}
        onBlock={async () => {
          // Update block status immediately
          setIsBlocked(true);
          setBlockMessage('You have blocked this user. Unblock them to send messages.');
          // Refresh conversations after blocking
          loadConversations();
          // Refetch block status to ensure UI is updated
          await refetchBlockStatus();
        }}
      />

      {/* Report User Modal */}
      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setUserToReport(null);
        }}
        userName={userToReport?.name}
        userId={userToReport?.id}
        onReport={(reason, details) => {
          // The API call is handled inside the ReportUserModal
        }}
      />

      {/* Delete Chat Modal */}
      <DeleteChatModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userName={userToDelete}
        isLoading={isDeleting}
        onConfirm={handleDeleteConversation}
      />
    </div>
  );
};

export default MessagesPage;
// Force SSR for this authenticated page - prevents _next/data routing issues
export async function getServerSideProps() {
  return {
    props: {},
  };
}
