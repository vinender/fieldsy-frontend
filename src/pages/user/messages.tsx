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

// MongoDB Document Structure for Messages
const messagesData = {
  conversations: [
    {
      _id: "conv_001",
      participants: ["user_001", "user_002"],
      lastMessage: {
        text: "Typing...",
        timestamp: new Date(),
        senderId: "user_002"
      },
      unreadCount: 1,
      isTyping: true,
      user: {
        _id: "user_002",
        name: "Howard Johnston",
        avatar: "https://i.pravatar.cc/150?img=12",
        isOnline: true,
        status: "Typing..."
      }
    },
    {
      _id: "conv_002", 
      participants: ["user_001", "user_003"],
      lastMessage: {
        text: "Thanks for getting back to me!",
        timestamp: new Date(Date.now() - 3600000),
        senderId: "user_003"
      },
      unreadCount: 0,
      user: {
        _id: "user_003",
        name: "Margaret Hall",
        avatar: "https://i.pravatar.cc/150?img=20",
        isOnline: false
      }
    },
    {
      _id: "conv_003",
      participants: ["user_001", "user_004"],
      lastMessage: {
        text: "Thank you so much for helping me.",
        timestamp: new Date(Date.now() - 7200000),
        senderId: "user_004",
        isRead: true
      },
      unreadCount: 0,
      user: {
        _id: "user_004",
        name: "Tomi Afumba",
        avatar: "https://i.pravatar.cc/150?img=25",
        isOnline: true,
        hasReadReceipt: true
      }
    },
    {
      _id: "conv_004",
      participants: ["user_001", "user_005"],
      lastMessage: {
        text: "Will it work for you?",
        timestamp: new Date(Date.now() - 21600000),
        senderId: "user_005"
      },
      unreadCount: 0,
      user: {
        _id: "user_005",
        name: "Shirely Johnson",
        avatar: "https://i.pravatar.cc/150?img=30",
        isOnline: false
      }
    },
    {
      _id: "conv_005",
      participants: ["user_001", "user_006"],
      lastMessage: {
        text: "Sure, I will join.",
        timestamp: new Date(Date.now() - 43200000),
        senderId: "user_006"
      },
      unreadCount: 0,
      user: {
        _id: "user_006",
        name: "Stephen Rodriquez",
        avatar: "https://i.pravatar.cc/150?img=33",
        isOnline: false
      }
    },
    {
      _id: "conv_007",
      participants: ["user_001", "user_007"],
      lastMessage: {
        text: "I'm looking for a completely private space.",
        timestamp: new Date(Date.now() - 64800000),
        senderId: "user_007"
      },
      unreadCount: 0,
      user: {
        _id: "user_007",
        name: "Aleksander Milevski",
        avatar: "https://i.pravatar.cc/150?img=35",
        isOnline: false
      }
    },
    {
      _id: "conv_008",
      participants: ["user_001", "user_008"],
      lastMessage: {
        text: "Your field is suitable for small dogs?",
        timestamp: new Date(Date.now() - 86400000),
        senderId: "user_008"
      },
      unreadCount: 0,
      user: {
        _id: "user_008",
        name: "Jesús López",
        avatar: "https://i.pravatar.cc/150?img=40",
        isOnline: false
      }
    },
    {
      _id: "conv_009",
      participants: ["user_001", "user_009"],
      lastMessage: {
        text: "Do you allow more than two dogs at once?",
        timestamp: new Date(Date.now() - 259200000),
        senderId: "user_009"
      },
      unreadCount: 0,
      user: {
        _id: "user_009",
        name: "David Wilson",
        avatar: "https://i.pravatar.cc/150?img=45",
        isOnline: false
      }
    },
    {
      _id: "conv_010",
      participants: ["user_001", "user_010"],
      lastMessage: {
        text: "Just wanted to say thanks!",
        timestamp: new Date(Date.now() - 691200000),
        senderId: "user_010",
        isRead: true
      },
      unreadCount: 0,
      user: {
        _id: "user_010",
        name: "Anna Nowak",
        avatar: "https://i.pravatar.cc/150?img=48",
        isOnline: false,
        hasReadReceipt: true
      }
    },
    {
      _id: "conv_011",
      participants: ["user_001", "user_011"],
      lastMessage: {
        text: "Sure, I will join.",
        timestamp: new Date(Date.now() - 864000000),
        senderId: "user_011"
      },
      unreadCount: 0,
      user: {
        _id: "user_011",
        name: "Valeria Sánchez",
        avatar: "https://i.pravatar.cc/150?img=50",
        isOnline: false
      }
    }
  ],
  activeConversation: {
    _id: "conv_001",
    messages: [
      {
        _id: "msg_001",
        text: "Hi there! I'm interested in booking your field for my two dogs this weekend. Is it available Saturday around 10 AM?",
        senderId: "user_001",
        timestamp: new Date(Date.now() - 1800000),
        isRead: true
      },
      {
        _id: "msg_002",
        text: "Hi John! Yes, the field is currently available at 10 AM on Saturday. You can go ahead and book that slot through the app or web !",
        senderId: "user_002",
        timestamp: new Date(Date.now() - 1680000),
        isRead: true
      },
      {
        _id: "msg_003",
        text: "Great, thank you! Just checking—are there any agility toys or water access at the field?",
        senderId: "user_001",
        timestamp: new Date(Date.now() - 1560000),
        isRead: true
      },
      {
        _id: "msg_004",
        text: "Yes! We have a small agility setup (hurdles, tunnels) and a clean water station for dogs. There's also shaded seating for owners.",
        senderId: "user_002",
        timestamp: new Date(Date.now() - 1440000),
        isRead: true
      },
      {
        _id: "msg_005",
        text: "Perfect, that's exactly what I was looking for. I'll book now. Thanks so much!",
        senderId: "user_001",
        timestamp: new Date(Date.now() - 1200000),
        isRead: false
      }
    ]
  }
};

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<any>(messagesData.activeConversation);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<string>('');
  const [userToReport, setUserToReport] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatMessageTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="h-screen flex flex-col bg-light pt-16 xl:pt-24">
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-10 xl:px-20 py-4 lg:py-6 xl:py-8 overflow-hidden">
        {/* Page Title */}
        <div className="flex items-center gap-4 mb-4 lg:mb-6">
          <button className="w-10 h-10 lg:w-12 lg:h-12 bg-cream rounded-full flex items-center justify-center hover:bg-cream-hover transition-colors">
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 text-dark-green" />
          </button>
          <h1 className="text-xl lg:text-2xl xl:text-[29px] font-semibold text-dark-green">Messages</h1>
        </div>

        {/* Messages Container - Takes remaining height */}
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
              {messagesData.conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                    selectedConversation._id === conversation._id ? 'bg-cream' : ''
                  }`}
                >
                  {/* Active indicator */}
                  {selectedConversation._id === conversation._id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green" />
                  )}

                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={conversation.user.avatar}
                      alt={conversation.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[16px] font-semibold text-dark-green truncate">
                        {conversation.user.name}
                      </h3>
                      <span className="text-[13px] text-gray-text">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-[14px] truncate ${
                        conversation.isTyping ? 'text-green' : 'text-gray-text'
                      }`}>
                        {conversation.lastMessage.text}
                      </p>
                      <div className="flex items-center gap-1">
                        {conversation.user.hasReadReceipt && (
                          <Check className="w-5 h-5 text-green" />
                        )}
                        {conversation.unreadCount > 0 && (
                          <Circle className="w-2 h-2 fill-green text-green" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="px-4 lg:px-6 py-4 lg:py-6 border-b border-gray-border bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={messagesData.conversations[0].user.avatar}
                    alt={messagesData.conversations[0].user.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-[18px] font-semibold text-dark-green">
                      {messagesData.conversations[0].user.name}
                    </h2>
                    <p className="text-[16px] text-green">
                      {messagesData.conversations[0].user.status}
                    </p>
                  </div>
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
                          const currentUser = messagesData.conversations.find(c => c._id === selectedConversation._id)?.user;
                          setUserToBlock(currentUser?.name || 'this user');
                          setShowBlockModal(true);
                          setShowOptions(false);
                        }}
                        className="block w-full text-left text-[14px] text-dark-green py-3 px-4 hover:bg-gray-50 transition-colors"
                      >
                        Block User
                      </button>
                      <button 
                        onClick={() => {
                          const currentUser = messagesData.conversations.find(c => c._id === selectedConversation._id)?.user;
                          setUserToReport(currentUser?.name || 'this user');
                          setShowReportModal(true);
                          setShowOptions(false);
                        }}
                        className="block w-full text-left text-[14px] text-dark-green py-3 px-4 hover:bg-gray-50 transition-colors"
                      >
                        Report User
                      </button>
                      <div className="my-1 border-t border-gray-200"></div>
                      <button 
                        onClick={() => {
                          console.log('Delete chat');
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
            <div className="flex-1 overflow-y-auto bg-gray-lighter p-4 lg:p-6 no-scrollbar">
              {/* Today Divider */}
              <div className="flex justify-center mb-6">
                <span className="bg-cream px-3 py-1 rounded-full text-[13px] font-semibold text-dark-green">
                  Today
                </span>
              </div>

              {/* Message List */}
              <div className="space-y-4">
                {messagesData.activeConversation.messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.senderId === 'user_001' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[528px] ${message.senderId === 'user_001' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                      <div
                        className={`px-6 py-4 ${
                          message.senderId === 'user_001'
                            ? 'bg-light-green text-white rounded-tl-[60px] rounded-bl-[60px] rounded-tr-[30px]'
                            : 'bg-cream text-dark-green rounded-tr-[60px] rounded-br-[60px] rounded-tl-[30px]'
                        }`}
                      >
                        <p className="text-[15px] leading-[22px]">{message.text}</p>
                      </div>
                      <span className={`text-[14px] text-gray-text ${
                        message.senderId === 'user_001' ? 'text-right' : 'text-left'
                      }`}>
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="px-4 lg:px-6 py-3 lg:py-4 bg-white border-t border-gray-border flex-shrink-0">
              <div className="flex items-center gap-4">
                <Input
                  type="text"
                  placeholder="Type your message here…"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 h-12 text-[16px] border-0 shadow-none px-0 focus:ring-0 rounded-none"
                />
                <button
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
            </div>

          </div>
        </div>
      </div>
      
      {/* Block User Modal */}
      <BlockUserModal 
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userName={userToBlock}
        onBlock={() => {
          console.log(`Blocked user: ${userToBlock}`);
          // Add your block user logic here
          // You might want to remove the conversation from the list
          // or update the user's blocked status
        }}
      />
      
      {/* Report User Modal */}
      <ReportUserModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userName={userToReport}
        onReport={(reason, details) => {
          console.log(`Reported user: ${userToReport}`, { reason, details });
          // Add your report user logic here
          // Send report to backend/admin
          alert(`Thank you for reporting ${userToReport}. We will review this report and take appropriate action.`);
        }}
      />
    </div>
  );
};

export default MessagesPage;