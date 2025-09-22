import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ArrowLeft } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useSession } from 'next-auth/react';
import { getUserImage, getUserInitials } from '@/utils/getUserImage';
import { toast } from 'sonner';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  fieldName?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participants: any[];
  messages: Message[];
}

export default function ChatModal({
  isOpen,
  onClose,
  userId,
  userName,
  userAvatar,
  fieldName
}: ChatModalProps) {
  const { data: session } = useSession();
  const { socket, sendMessage, markAsRead, emitTyping, isConnected } = useSocket();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Get current user ID
  const getCurrentUserId = () => {
    if (session?.user?.id) return session.user.id;
    
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

  // Create or get conversation
  useEffect(() => {
    if (isOpen && userId && currentUserId) {
      loadOrCreateConversation();
    }
  }, [isOpen, userId, currentUserId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !conversation) return;

    const handleNewMessage = (message: Message) => {
      if (message.senderId === userId || message.receiverId === userId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        
        // Mark as read if from other user
        if (message.senderId === userId) {
          markAsRead([message.id]);
        }
      }
    };

    const handleTyping = ({ userId: typingUserId, isTyping }: any) => {
      if (typingUserId === userId) {
        setOtherUserTyping(isTyping);
      }
    };

    const handleMessageRead = ({ messageIds }: any) => {
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );
    };

    socket.on('new-message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('messages-read', handleMessageRead);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('messages-read', handleMessageRead);
    };
  }, [socket, conversation, userId]);

  const loadOrCreateConversation = async () => {
    setIsLoading(true);
    try {
      const token = (session as any)?.accessToken || localStorage.getItem('authToken');
      
      // Check if conversation exists or create new one
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api'}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ participantId: userId })
      });

      if (response.ok) {
        const data = await response.json();
        const conv = data.data || data.conversation;
        setConversation(conv);
        
        // Load messages for this conversation
        await loadMessages(conv.id);
        
        // Join conversation room
        if (socket) {
          socket.emit('join-conversation', conv.id);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const token = (session as any)?.accessToken || localStorage.getItem('authToken');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api'}/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || data.messages || []);
        scrollToBottom();
        
        // Mark unread messages as read
        const unreadMessageIds = (data.data || data.messages || [])
          .filter((msg: Message) => msg.senderId === userId && !msg.isRead)
          .map((msg: Message) => msg.id);
        
        if (unreadMessageIds.length > 0) {
          markAsRead(unreadMessageIds);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !conversation || isSending) return;
    
    const messageContent = messageInput.trim();
    setMessageInput('');
    setIsSending(true);
    
    try {
      const newMessage = await sendMessage(conversation.id, messageContent, userId);
      
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      setMessageInput(messageContent); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (!isTyping && conversation) {
      setIsTyping(true);
      emitTyping(conversation.id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (conversation) {
        setIsTyping(false);
        emitTyping(conversation.id, false);
      }
    }, 1000);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const shouldShowDateSeparator = (currentMsg: Message, prevMsg: Message | null) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    
    return currentDate !== prevDate;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              {userAvatar ? (
                <img 
                  src={getUserImage(userAvatar)}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 font-semibold">
                    {getUserInitials(userName)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{userName}</h3>
                {fieldName && (
                  <p className="text-xs text-gray-500">About: {fieldName}</p>
                )}
                {!isConnected && (
                  <p className="text-xs text-orange-500">Connecting...</p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">Start a conversation about {fieldName || 'the booking'}</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isOwn = message.senderId === currentUserId;
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const showDate = shouldShowDateSeparator(message, prevMessage);

                return (
                  <React.Fragment key={message.id}>
                    {showDate && (
                      <div className="flex justify-center my-2">
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                        <div className={`rounded-2xl px-4 py-2 ${
                          isOwn 
                            ? 'bg-green-600 text-white' 
                            : 'bg-white text-gray-900 border'
                        }`}>
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                          <span className="text-xs text-gray-400">
                            {formatTime(message.createdAt)}
                          </span>
                          {isOwn && message.isRead && (
                            <span className="text-xs text-green-600">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={!isConnected || isSending}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || !isConnected || isSending}
              className={`p-2 rounded-full transition-colors ${
                messageInput.trim() && isConnected && !isSending
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}