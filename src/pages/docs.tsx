import { useState } from 'react'
import { Copy, Check, Smartphone, Wifi, Bell, MessageCircle, Code } from 'lucide-react'

// Code snippets as constants to avoid JSX escaping issues
const CODE_SNIPPETS = {
  socketServiceClass: `import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  async connect() {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      this.socket = io('https://api.fieldsy.com', {
        auth: { token: token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket?.id);
        this.socket?.emit('join-conversations');
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
      });

    } catch (error) {
      console.error('Failed to connect socket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      this.socket?.off(event, callback as any);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();`,

  appInitialization: `// In your App.tsx or main entry point
import SocketService from './services/SocketService';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const initSocket = async () => {
      await SocketService.connect();
    };

    initSocket();

    return () => {
      SocketService.disconnect();
    };
  }, []);

  return (
    // Your app components
  );
}`,

  fetchNotifications: `// GET /api/notification?page=1&limit=20
const token = await AsyncStorage.getItem('token');
const response = await axios.get('https://api.fieldsy.com/api/notification', {
  params: { page: 1, limit: 20 },
  headers: { Authorization: 'Bearer ' + token }
});`,

  notificationResponse: `{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "type": "booking",
        "title": "New Booking",
        "message": "You have a new booking for Green Field",
        "data": {
          "bookingId": "507f1f77bcf86cd799439013",
          "fieldId": "507f1f77bcf86cd799439014"
        },
        "read": false,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalNotifications": 100,
      "hasMore": true
    }
  }
}`,

  receiveNotification: `useEffect(() => {
  SocketService.on('notification', (notification) => {
    console.log('📬 New notification:', notification);
    setNotifications(prev => [notification, ...prev]);
  });

  return () => {
    SocketService.off('notification');
  };
}, []);`,

  markAsRead: `// Mark single notification as read
const token = await AsyncStorage.getItem('token');
const response = await axios.patch(
  'https://api.fieldsy.com/api/notification/' + notificationId + '/read',
  {},
  { headers: { Authorization: 'Bearer ' + token } }
);`,

  markAllAsRead: `// Mark all notifications as read
const token = await AsyncStorage.getItem('token');
const response = await axios.patch(
  'https://api.fieldsy.com/api/notification/read-all',
  {},
  { headers: { Authorization: 'Bearer ' + token } }
);`,

  fetchMessages: `// GET /api/chat/:conversationId/messages?page=1&limit=50
const token = await AsyncStorage.getItem('token');
const response = await axios.get(
  'https://api.fieldsy.com/api/chat/' + conversationId + '/messages',
  {
    params: { page: 1, limit: 50 },
    headers: { Authorization: 'Bearer ' + token }
  }
);`,

  messagesResponse: `{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "conversationId": "507f1f77bcf86cd799439016",
      "sender": "507f1f77bcf86cd799439017",
      "content": "Hello! Is the field available tomorrow?",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "read": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalMessages": 150,
    "hasMore": true
  }
}`,

  sendMessage: `// POST /api/chat/send
const token = await AsyncStorage.getItem('token');
const response = await axios.post(
  'https://api.fieldsy.com/api/chat/send',
  {
    conversationId: 'conversationId',
    receiverId: 'receiverId',
    content: 'Your message here'
  },
  { headers: { Authorization: 'Bearer ' + token } }
);`,

  receiveMessage: `useEffect(() => {
  SocketService.on('new-message', (message) => {
    console.log('💬 New message:', message);
    if (message.conversationId === currentConversationId) {
      setMessages(prev => [...prev, message]);
    }
  });

  return () => {
    SocketService.off('new-message');
  };
}, [currentConversationId]);`,

  typingIndicators: `// Emit typing started
SocketService.emit('typing', {
  conversationId: 'conversationId',
  receiverId: 'receiverId'
});

// Listen for typing
SocketService.on('user-typing', (data) => {
  console.log('User ' + data.senderId + ' is typing...');
  setIsTyping(true);
});

// Emit typing stopped
SocketService.emit('stop-typing', {
  conversationId: 'conversationId',
  receiverId: 'receiverId'
});

// Listen for typing stopped
SocketService.on('user-stopped-typing', (data) => {
  setIsTyping(false);
});`,

  readReceipts: `// Listen for read receipts
SocketService.on('message-read', (data) => {
  console.log('✓✓ Message ' + data.messageId + ' was read');
  setMessages(prev =>
    prev.map(msg =>
      msg._id === data.messageId
        ? { ...msg, read: true }
        : msg
    )
  );
});`,

  chatScreenExample: `import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, Button, Text } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SocketService from './services/SocketService';

export default function ChatScreen({ route }) {
  const { conversationId, receiverId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchMessages();

    SocketService.on('new-message', handleNewMessage);
    SocketService.on('user-typing', handleTyping);
    SocketService.on('user-stopped-typing', handleStopTyping);
    SocketService.on('message-read', handleMessageRead);

    return () => {
      SocketService.off('new-message', handleNewMessage);
      SocketService.off('user-typing', handleTyping);
      SocketService.off('user-stopped-typing', handleStopTyping);
      SocketService.off('message-read', handleMessageRead);
    };
  }, []);

  const fetchMessages = async () => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(
      'https://api.fieldsy.com/api/chat/' + conversationId + '/messages',
      {
        params: { page: 1, limit: 50 },
        headers: { Authorization: 'Bearer ' + token }
      }
    );
    setMessages(response.data.messages.reverse());
  };

  const handleNewMessage = (message) => {
    if (message.conversationId === conversationId) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleTyping = (data) => {
    if (data.conversationId === conversationId) {
      setIsTyping(true);
    }
  };

  const handleStopTyping = (data) => {
    if (data.conversationId === conversationId) {
      setIsTyping(false);
    }
  };

  const handleMessageRead = (data) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === data.messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const token = await AsyncStorage.getItem('token');
    await axios.post(
      'https://api.fieldsy.com/api/chat/send',
      {
        conversationId,
        receiverId,
        content: inputText
      },
      { headers: { Authorization: 'Bearer ' + token } }
    );

    setInputText('');
    SocketService.emit('stop-typing', { conversationId, receiverId });
  };

  const handleTextChange = (text) => {
    setInputText(text);
    if (text.length > 0) {
      SocketService.emit('typing', { conversationId, receiverId });
    } else {
      SocketService.emit('stop-typing', { conversationId, receiverId });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.content}</Text>
            {item.read && <Text>✓✓</Text>}
          </View>
        )}
      />
      {isTyping && <Text>User is typing...</Text>}
      <TextInput
        value={inputText}
        onChangeText={handleTextChange}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}`
};

export default function SocketDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, id, language = 'typescript' }: { code: string; id: string; language?: string }) => (
    <div className="bg-gray-900 rounded-xl p-4 relative group">
      <pre className="text-sm overflow-x-auto"><code className="text-gray-300">{code}</code></pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 hover:bg-gray-700 p-2 rounded-lg"
      >
        {copiedCode === id ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-light-cream to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green/10 rounded-xl flex items-center justify-center">
              <Wifi className="w-6 h-6 text-green" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">WebSocket Documentation</h1>
              <p className="text-gray-600 mt-1">Real-time Messaging & Notifications for Fieldsy Mobile App</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a href="#overview" className="flex items-center gap-3 p-4 rounded-xl bg-green/5 hover:bg-green/10 transition-colors border border-green/20">
              <Code className="w-5 h-5 text-green" />
              <span className="font-medium text-gray-900">Overview</span>
            </a>
            <a href="#authentication" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Authentication</span>
            </a>
            <a href="#notifications" className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200">
              <Bell className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Notifications</span>
            </a>
            <a href="#messaging" className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-200">
              <MessageCircle className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Messaging</span>
            </a>
          </div>
        </div>

        {/* Overview Section */}
        <section id="overview" className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green to-dark-green p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Wifi className="w-7 h-7" />
                Overview
              </h2>
              <p className="mt-2 opacity-90">Fieldsy uses Socket.IO for real-time bidirectional communication</p>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Fieldsy implements WebSocket connections using <strong>Socket.IO</strong> for real-time features including:
                </p>
                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <MessageCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Real-time Messaging</h4>
                      <p className="text-sm text-gray-600">Instant chat between dog owners and field owners</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <Bell className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Live Notifications</h4>
                      <p className="text-sm text-gray-600">Booking updates, messages, and system alerts</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">Important Note</h4>
                      <p className="text-amber-800 text-sm">All WebSocket connections require JWT authentication. Make sure users are logged in before attempting to connect.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Connection Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">URL:</span>
                      <code className="bg-gray-900 text-green-400 px-2 py-1 rounded">https://api.fieldsy.com</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">Library:</span>
                      <code className="bg-gray-900 text-blue-400 px-2 py-1 rounded">socket.io-client</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">Auth:</span>
                      <code className="bg-gray-900 text-purple-400 px-2 py-1 rounded">JWT Token</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Section */}
        <section id="authentication" className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Smartphone className="w-7 h-7" />
                Authentication Setup
              </h2>
              <p className="mt-2 opacity-90">Connect to WebSocket with JWT authentication</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 1: Install Socket.IO Client</h3>
                  <CodeBlock
                    code="npm install socket.io-client @react-native-async-storage/async-storage"
                    id="install"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 2: Create Socket Service</h3>
                  <p className="text-gray-600 mb-3 text-sm">Create a singleton service to manage socket connections</p>
                  <CodeBlock
                    code={CODE_SNIPPETS.socketServiceClass}
                    id="socket-service"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 3: Initialize in App</h3>
                  <p className="text-gray-600 mb-3 text-sm">Initialize the socket connection when your app starts</p>
                  <CodeBlock
                    code={CODE_SNIPPETS.appInitialization}
                    id="app-init"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section id="notifications" className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Bell className="w-7 h-7" />
                Notifications System
              </h2>
              <p className="mt-2 opacity-90">Fetch and receive real-time notifications</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Fetch Notifications (REST API)</h3>
                  <p className="text-gray-600 mb-3 text-sm">Get paginated notification history</p>
                  <CodeBlock
                    code={CODE_SNIPPETS.fetchNotifications}
                    id="fetch-notifications"
                  />
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Response:</p>
                    <CodeBlock
                      code={CODE_SNIPPETS.notificationResponse}
                      id="notification-response"
                      language="json"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Receive Real-time Notifications (Socket)</h3>
                  <p className="text-gray-600 mb-3 text-sm">Listen for new notifications via WebSocket</p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-medium">AUTO</span>
                      <span className="text-sm font-medium text-gray-900">Server automatically sends notifications</span>
                    </div>
                  </div>
                  <CodeBlock
                    code={CODE_SNIPPETS.receiveNotification}
                    id="receive-notification"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Mark as Read</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Single notification:</p>
                      <CodeBlock
                        code={CODE_SNIPPETS.markAsRead}
                        id="mark-read"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">All notifications:</p>
                      <CodeBlock
                        code={CODE_SNIPPETS.markAllAsRead}
                        id="mark-all-read"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Messaging Section */}
        <section id="messaging" className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <MessageCircle className="w-7 h-7" />
                Chat & Messaging
              </h2>
              <p className="mt-2 opacity-90">Real-time chat with typing indicators and read receipts</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Fetch Message History (REST API)</h3>
                  <CodeBlock
                    code={CODE_SNIPPETS.fetchMessages}
                    id="fetch-messages"
                  />
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Response:</p>
                    <CodeBlock
                      code={CODE_SNIPPETS.messagesResponse}
                      id="messages-response"
                      language="json"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Send Message (REST API)</h3>
                  <CodeBlock
                    code={CODE_SNIPPETS.sendMessage}
                    id="send-message"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Receive Real-time Messages (Socket)</h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded font-medium">AUTO</span>
                      <span className="text-sm font-medium text-gray-900">Server sends messages to conversation participants</span>
                    </div>
                  </div>
                  <CodeBlock
                    code={CODE_SNIPPETS.receiveMessage}
                    id="receive-message"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Typing Indicators</h3>
                  <CodeBlock
                    code={CODE_SNIPPETS.typingIndicators}
                    id="typing-indicators"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Read Receipts</h3>
                  <CodeBlock
                    code={CODE_SNIPPETS.readReceipts}
                    id="read-receipts"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Complete Chat Screen Example</h3>
                  <CodeBlock
                    code={CODE_SNIPPETS.chatScreenExample}
                    id="chat-screen"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events Reference */}
        <section id="events" className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Code className="w-7 h-7" />
                Events Reference
              </h2>
              <p className="mt-2 opacity-90">Complete list of socket events</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Event</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 px-4"><code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">connect</code></td>
                      <td className="py-3 px-4"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">listen</span></td>
                      <td className="py-3 px-4">Socket connected successfully</td>
                      <td className="py-3 px-4">-</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">disconnect</code></td>
                      <td className="py-3 px-4"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">listen</span></td>
                      <td className="py-3 px-4">Socket disconnected</td>
                      <td className="py-3 px-4">reason: string</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">notification</code></td>
                      <td className="py-3 px-4"><span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">auto</span></td>
                      <td className="py-3 px-4">New notification received</td>
                      <td className="py-3 px-4">Notification object</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">new-message</code></td>
                      <td className="py-3 px-4"><span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">auto</span></td>
                      <td className="py-3 px-4">New message in conversation</td>
                      <td className="py-3 px-4">Message object</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">typing</code></td>
                      <td className="py-3 px-4"><span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">emit</span></td>
                      <td className="py-3 px-4">User started typing</td>
                      <td className="py-3 px-4">conversationId, receiverId</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">user-typing</code></td>
                      <td className="py-3 px-4"><span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">auto</span></td>
                      <td className="py-3 px-4">Other user is typing</td>
                      <td className="py-3 px-4">conversationId, senderId</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">stop-typing</code></td>
                      <td className="py-3 px-4"><span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">emit</span></td>
                      <td className="py-3 px-4">User stopped typing</td>
                      <td className="py-3 px-4">conversationId, receiverId</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">user-stopped-typing</code></td>
                      <td className="py-3 px-4"><span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">auto</span></td>
                      <td className="py-3 px-4">Other user stopped typing</td>
                      <td className="py-3 px-4">conversationId, senderId</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">message-read</code></td>
                      <td className="py-3 px-4"><span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">auto</span></td>
                      <td className="py-3 px-4">Message was read</td>
                      <td className="py-3 px-4">messageId, conversationId</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">join-conversations</code></td>
                      <td className="py-3 px-4"><span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">emit</span></td>
                      <td className="py-3 px-4">Join user's conversation rooms</td>
                      <td className="py-3 px-4">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Badge Legend</h4>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium">emit</span>
                    <span className="text-gray-600">You send this event</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">listen</span>
                    <span className="text-gray-600">You listen for this event</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-medium">auto</span>
                    <span className="text-gray-600">Server automatically sends this</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <h2 className="text-2xl font-bold">Troubleshooting</h2>
              <p className="mt-2 opacity-90">Common issues and solutions</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Connection Failed</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Verify JWT token is valid and not expired</li>
                    <li>Check network connectivity</li>
                    <li>Ensure backend URL is correct</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Not Receiving Events</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Ensure socket is connected before listening</li>
                    <li>Check event names match exactly (case-sensitive)</li>
                    <li>Verify you called join-conversations after connecting</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Best Practices</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Always clean up listeners in useEffect return function</li>
                    <li>Handle reconnection logic gracefully</li>
                    <li>Store socket instance in a singleton service</li>
                    <li>Use AsyncStorage for persistent token storage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">
            Fieldsy WebSocket Documentation • For questions, contact the development team
          </p>
        </div>
      </footer>
    </div>
  )
}
