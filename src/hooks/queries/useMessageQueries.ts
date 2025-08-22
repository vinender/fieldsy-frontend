import { useQuery, UseQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const messageQueryKeys = {
  conversations: () => ['conversations'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  unreadCount: () => ['messages', 'unread-count'] as const,
};

// Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  otherUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
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
      const response = await axiosClient.get(`/messages/conversations?page=${page}&limit=${limit}`);
      return response.data as ConversationsResponse;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
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
      const response = await axiosClient.get(`/messages/conversations/${conversationId}`);
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
        `/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
      );
      return response.data as MessagesResponse;
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for real-time updates
    ...options,
  });
}

// Hook for infinite scrolling messages
export function useInfiniteMessages(
  conversationId: string,
  limit: number = 50,
  options?: Omit<UseQueryOptions<MessagesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useInfiniteQuery({
    queryKey: messageQueryKeys.messages(conversationId),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosClient.get(
        `/messages/conversations/${conversationId}/messages?page=${pageParam}&limit=${limit}`
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
  options?: Omit<UseQueryOptions<{ count: number }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: messageQueryKeys.unreadCount(),
    queryFn: async () => {
      const response = await axiosClient.get('/messages/unread-count');
      return response.data;
    },
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    ...options,
  });
}