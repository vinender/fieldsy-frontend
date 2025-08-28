import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Send, 
  MoreVertical,
  Circle,
  Check,
  MessageCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import BlockUserModal from '@/components/modal/BlockUserModal';
import ReportUserModal from '@/components/modal/ReportUserModal';
import DeleteChatModal from '@/components/modal/DeleteChatModal';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/router';
import styles from '@/styles/messages.module.css';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface Message {
  id: string;
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

const MessagesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { conversationId: queryConversationId, userId: queryUserId } = router.query;
  const { socket, sendMessage, markAsRead, emitTyping } = useSocket();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{ name: string; id: string } | null>(null);
  const [userToReport, setUserToReport] = useState<{ name: string; id: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
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
        } catch {}
      }
    }
    return null;
  };
  
  const currentUserId = getCurrentUserId();

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
    } else {
      setIsLoading(false);
    }
  }, [session, status]);

  // Auto-select conversation from query parameter
  useEffect(() => {
    if (queryConversationId && conversations.length > 0) {
      const targetConversation = conversations.find(
        conv => conv.id === queryConversationId || conv.id === queryConversationId
      );
      
      if (targetConversation) {
        handleSelectConversation(targetConversation);
        // Clear the query parameter after selecting
        router.replace('/user/messages', undefined, { shallow: true });
      }
    }
  }, [queryConversationId, conversations]);

  // Auto-open or create conversation with specific user
  useEffect(() => {
    if (queryUserId && conversations.length > 0) {
      // Find conversation with this user
      const targetConversation = conversations.find(conv => 
        conv.participants.some(p => p.id === queryUserId)
      );
      
      if (targetConversation) {
        handleSelectConversation(targetConversation);
      } else {
        // If no existing conversation, create or initiate one
        // This would require an API endpoint to create a conversation
        createConversationWithUser(queryUserId as string);
      }
      
      // Clear the query parameter after processing
      router.replace('/user/messages', undefined, { shallow: true });
    }
  }, [queryUserId, conversations]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    const handleNewMessage = (message: Message) => {
      console.log('Received new message:', message);
      console.log('Current conversation:', selectedConversation?.id);
      console.log('Message conversation:', message.conversationId);
      
      // Add message to current conversation if it belongs to it
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        // Only add if it's not from us (to avoid duplicates)
        if (message.senderId !== currentUserId) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(m => m.id === message.id);
            if (exists) return prev;
            return [...prev, message];
          });
          
          // Track as new message for animation
          setNewMessageIds(prev => new Set(prev).add(message.id));
          
          // Remove from new messages after animation
          setTimeout(() => {
            setNewMessageIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(message.id);
              return newSet;
            });
          }, 500);
          
          // Mark as read if we're the receiver
          if (message.receiverId === currentUserId) {
            markAsRead([message.id]);
          }
        }
      }
      
      // Update conversation list to show latest message
      loadConversations();
    };

    const handleUserTyping = ({ userId, isTyping: typing }: { userId: string; isTyping: boolean }) => {
      if (userId === getOtherUser(selectedConversation)?.id) {
        setOtherUserTyping(typing);
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
    };
  }, [socket, selectedConversation, session]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    // Small delay to ensure DOM has updated
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  const scrollToBottom = () => {
    // Only scroll the messages container, not the entire page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const loadConversations = async () => {
    // Get token from session or localStorage
    const token = (session as any)?.accessToken || (typeof window !== 'undefined' && localStorage.getItem('authToken'));
    if (!token) {
      console.log('No auth token found for loading conversations');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded conversations:', data);
        // Backend returns { conversations: [...], pagination: {...} }
        setConversations(data.conversations || data || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    // Get token from session or localStorage
    const token = (session as any)?.accessToken || (typeof window !== 'undefined' && localStorage.getItem('authToken'));
    if (!token) {
      console.log('No auth token found for loading messages');
      return;
    }

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded messages:', data);
        // Backend returns { messages: [...], pagination: {...} }
        setMessages(data.messages || data || []);
        
        // Mark unread messages as read
        const unreadMessageIds = data.messages
          .filter((msg: Message) => msg.receiverId === currentUserId && !msg.isRead)
          .map((msg: Message) => msg.id);
        
        if (unreadMessageIds.length > 0) {
          markAsRead(unreadMessageIds);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const checkBlockStatus = async (otherUserId: string) => {
    const token = (session as any)?.accessToken || (typeof window !== 'undefined' && localStorage.getItem('authToken'));
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5001/api/user-blocks/status/${otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsBlocked(!data.data.canChat);
        if (!data.data.canChat) {
          if (data.data.isBlocked) {
            setBlockMessage('You have blocked this user. Unblock them to send messages.');
          } else if (data.data.isBlockedBy) {
            setBlockMessage('This user has blocked you. You cannot send messages.');
          }
        }
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    
    // Reset block status
    setIsBlocked(false);
    setBlockMessage('');
    
    // Check block status
    const otherUser = getOtherUser(conversation);
    if (otherUser) {
      await checkBlockStatus(otherUser.id);
    }
    
    // Join conversation room for real-time updates
    if (socket) {
      socket.emit('join-conversation', conversation.id);
    }
    
    // Scroll to bottom after loading messages
    setTimeout(scrollToBottom, 200);
  };

  const createConversationWithUser = async (userId: string) => {
    // Get token from session or localStorage
    const token = (session as any)?.accessToken || (typeof window !== 'undefined' && localStorage.getItem('authToken'));
    if (!token) {
      console.log('No auth token for creating conversation');
      return;
    }

    try {
      // Create or get existing conversation with this user
      const response = await fetch('/api/chat/conversations/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        // Reload conversations to include the new one
        await loadConversations();
        // Select the newly created conversation
        if (data.conversation) {
          handleSelectConversation(data.conversation);
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    
    setIsDeleting(true);
    try {
      const token = session?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/chat/conversations/${selectedConversation.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove conversation from list
        setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
        
        // Clear selected conversation
        setSelectedConversation(null);
        setMessages([]);
        
        // Close modal
        setShowDeleteModal(false);
      } else {
        const error = await response.json();
        console.error('Failed to delete conversation:', error);
        alert('Failed to delete conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('An error occurred while deleting the conversation.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    // Check if blocked first
    if (isBlocked) {
      return;
    }

    const otherUser = getOtherUser(selectedConversation);
    if (!otherUser) return;

    const content = messageInput.trim();
    setMessageInput('');
    
    // Stop typing indicator
    if (socket) {
      emitTyping(selectedConversation.id, false);
    }

    try {
      // Send message and get the created message back
      const newMessage = await sendMessage(selectedConversation.id, content, otherUser.id);
      
      // Add the message to the UI immediately with animation
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
        
        // Track this as a new message for animation
        setNewMessageIds(prev => new Set(prev).add(newMessage.id));
        
        // Remove from new messages after animation completes
        setTimeout(() => {
          setNewMessageIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(newMessage.id);
            return newSet;
          });
        }, 500);
        
        // Update the conversation's last message
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: content, lastMessageAt: new Date().toISOString() }
            : conv
        ));
      }
    } catch (error: any) {
      // Check if it's a block error
      if (error?.response?.data?.blocked) {
        setIsBlocked(true);
        setBlockMessage(error.response.data.error || 'Cannot send messages. One or both users have blocked each other.');
        // Check the actual block status to get more specific message
        await checkBlockStatus(otherUser.id);
      } else {
        console.error('Failed to send message:', error);
        // Put the message back in the input
        setMessageInput(content);
      }
    }
  };

  const handleTyping = () => {
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
  };

  const getOtherUser = (conversation: Conversation): User | undefined => {
    return conversation.participants.find(p => p.id !== currentUserId);
  };

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

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatMessageTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Don't render anything if not authenticated after loading
  if (status === 'unauthenticated' && !(typeof window !== 'undefined' && localStorage.getItem('authToken'))) {
    return null;
  }

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-light">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-light pt-16 xl:pt-24">
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-10 xl:px-20 py-4 lg:py-6 xl:py-8 overflow-hidden">
        {/* Page Title */}
        <div className="flex items-center gap-4 mb-4 lg:mb-6">
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
          {/* Conversations List */}
          <div className="hidden sm:flex sm:w-[280px] md:w-[320px] lg:w-[350px] xl:w-[432px] border-r border-gray-border flex-col">
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
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-600">Start a conversation with a field owner</p>
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
                        className={`flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                          selectedConversation?.id === conversation.id ? 'bg-cream' : ''
                        }`}
                      >
                        {/* Active indicator */}
                        {selectedConversation?.id === conversation.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green" />
                        )}

                        {/* Avatar */}
                        <div className="relative">
                          {otherUser.image ? (
                            <img
                              src={otherUser.image}
                              alt={otherUser.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-semibold">
                                {otherUser.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
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

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Header */}
              <div className="px-4 lg:px-6 py-4 lg:py-6 border-b border-gray-border bg-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {(() => {
                      const otherUser = getOtherUser(selectedConversation);
                      return otherUser ? (
                        <>
                          {otherUser.image ? (
                            <img
                              src={otherUser.image}
                              alt={otherUser.name}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-semibold text-xl">
                                {otherUser.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <h2 className="text-[18px] font-semibold text-dark-green">
                              {otherUser.name}
                            </h2>
                            {otherUserTyping && (
                              <p className="text-[16px] text-green">Typing...</p>
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
                            const otherUser = getOtherUser(selectedConversation);
                            if (otherUser) {
                              setUserToBlock({ name: otherUser.name || 'this user', id: otherUser.id });
                              setShowBlockModal(true);
                            }
                            setShowOptions(false);
                          }}
                          className="block w-full text-left text-[14px] text-dark-green py-3 px-4 hover:bg-gray-50 transition-colors"
                        >
                          Block User
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
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-gray-lighter p-4 lg:p-6 no-scrollbar">
                {/* Today Divider */}
                <div className="flex justify-center mb-6">
                  <span className="bg-cream px-3 py-1 rounded-full text-[13px] font-semibold text-dark-green">
                    Today
                  </span>
                </div>

                {/* Message List */}
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'} ${
                        newMessageIds.has(message.id) ? styles.newMessage : ''
                      }`}
                    >
                      <div className={`max-w-[528px] ${message.senderId === currentUserId ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                        <div
                          className={`px-6 py-4 ${styles.messageBubble} ${
                            message.senderId === currentUserId
                              ? 'bg-light-green text-white rounded-tl-[60px] rounded-bl-[60px] rounded-tr-[30px]'
                              : 'bg-cream text-dark-green rounded-tr-[60px] rounded-br-[60px] rounded-tl-[30px]'
                          } ${
                            newMessageIds.has(message.id) ? 'transition-all duration-300' : ''
                          }`}
                        >
                          <p className="text-[15px] leading-[22px]">{message.content}</p>
                        </div>
                        <span className={`text-[14px] text-gray-text ${
                          message.senderId === currentUserId ? 'text-right' : 'text-left'
                        } ${newMessageIds.has(message.id) ? 'opacity-0 animate-fadeIn' : ''}`}
                          style={newMessageIds.has(message.id) ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}
                        >
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {otherUserTyping && (
                    <div className="flex justify-start">
                      <div className="bg-cream text-dark-green rounded-tr-[60px] rounded-br-[60px] rounded-tl-[30px] px-6 py-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div ref={messagesEndRef} />
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
                          onClick={async () => {
                            const otherUser = getOtherUser(selectedConversation);
                            if (otherUser) {
                              try {
                                const token = (session as any)?.accessToken || localStorage.getItem('authToken');
                                const response = await fetch(`http://localhost:5001/api/user-blocks/unblock`, {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ blockedUserId: otherUser.id })
                                });
                                
                                if (response.ok) {
                                  setIsBlocked(false);
                                  setBlockMessage('');
                                  await checkBlockStatus(otherUser.id);
                                  toast.success('User unblocked successfully');
                                }
                              } catch (error) {
                                console.error('Failed to unblock user:', error);
                                toast.error('Failed to unblock user');
                              }
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
                  <div className="flex items-center gap-4">
                    <Input
                      type="text"
                      placeholder="Type your message here…"
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 h-12 text-[16px] border-0 shadow-none px-0 focus:ring-0 rounded-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        messageInput.trim() 
                          ? 'bg-green hover:bg-green-hover' 
                          : 'bg-gray-text'
                      }`}
                      disabled={!messageInput.trim()}
                    >
                      <Send className="w-6 h-6 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
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
          console.log(`Blocked user: ${userToBlock?.name}`);
          // Update block status immediately
          setIsBlocked(true);
          setBlockMessage('You have blocked this user. Unblock them to send messages.');
          // Refresh conversations after blocking
          loadConversations();
          // Check block status again to ensure UI is updated
          if (userToBlock?.id) {
            await checkBlockStatus(userToBlock.id);
          }
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
          console.log(`Reported user: ${userToReport?.name}`, { reason, details });
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