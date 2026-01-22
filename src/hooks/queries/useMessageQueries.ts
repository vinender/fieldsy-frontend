import { useQuery, UseQueryOptions, useInfiniteQuery, UseInfiniteQueryOptions, InfiniteData } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const messageQueryKeys = {
  conversations: () => ['conversations'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  unreadCount: () => ['messages', 'unread-count'] as const,
  unreadConversationsCount: () => ['messages', 'unread-conversations-count'] as const,
};

// Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  }[];
  fieldId?: string;
  field?: {
    id: string;
    name: string;
    images: string[];
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  messages: Message[];
  otherUser?: {
    id: string;
    name: string;
    image?: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Hook to fetch conversations
export function useConversations(
  page: number = 1,
  limit: number = 20,
  options?: Omit<UseQueryOptions<ConversationsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...messageQueryKeys.conversations(), page],
    queryFn: async () => {
      const response = await axiosClient.get(`/chat/conversations`, {
        params: { page, limit }
      });
      return response.data as ConversationsResponse;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    ...options,
  });
}

// Hook to fetch a single conversation
export function useConversation(
  conversationId: string,
  options?: Omit<UseQueryOptions<Conversation, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: messageQueryKeys.conversation(conversationId),
    queryFn: async () => {
      const response = await axiosClient.get(`/chat/conversations/${conversationId}`);
      return response.data as Conversation;
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    ...options,
  });
}

// Hook to fetch messages in a conversation
export function useMessages(
  conversationId: string,
  page: number = 1,
  limit: number = 50,
  options?: Omit<UseQueryOptions<MessagesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...messageQueryKeys.messages(conversationId), page],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/chat/conversations/${conversationId}/messages`,
        { params: { page, limit } }
      );
      return response.data as MessagesResponse;
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    ...options,
  });
}

// Hook for infinite scrolling messages
export function useInfiniteMessages(
  conversationId: string,
  limit: number = 50,
  options?: any
) {
  return useInfiniteQuery({
    queryKey: messageQueryKeys.messages(conversationId),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosClient.get(
        `/chat/conversations/${conversationId}/messages`,
        { params: { page: pageParam, limit } }
      );
      return response.data as MessagesResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination) {
        const { page, totalPages } = lastPage.pagination;
        return page < totalPages ? page + 1 : undefined;
      }
      return undefined;
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    ...options,
  });
}

// Hook to fetch unread messages count
export function useUnreadMessagesCount(
  options?: Omit<UseQueryOptions<{ unreadCount: number }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: messageQueryKeys.unreadCount(),
    queryFn: async () => {
      const response = await axiosClient.get('/chat/unread-count');
      return response.data;
    },
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    ...options,
  });
}

// Hook to fetch unread conversations count (conversations with at least one unread message)
export function useUnreadConversationsCount(
  options?: Omit<UseQueryOptions<{ success: boolean; unreadConversationsCount: number }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: messageQueryKeys.unreadConversationsCount(),
    queryFn: async () => {
      const response = await axiosClient.get('/chat/unread-conversations-count');
      return response.data;
    },
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    ...options,
  });
}