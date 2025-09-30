import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { messageQueryKeys } from '../queries/useMessageQueries';
import { toast } from 'sonner';

// Types
export interface SendMessageData {
  conversationId: string;
  receiverId: string;
  content: string;
}

export interface CreateConversationData {
  receiverId: string;
  fieldId?: string;
}

// Send message mutation (REST API fallback - prefer socket)
export function useSendMessage(
  options?: Omit<UseMutationOptions<any, Error, SendMessageData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessageData) => {
      const response = await axiosClient.post('/chat/messages', {
        conversationId: data.conversationId,
        content: data.content,
        receiverId: data.receiverId
      });
      return response.data;
    },
    onSuccess: (result, variables) => {
      // Invalidate messages and conversations
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.conversations() });
      queryClient.invalidateQueries({
        queryKey: messageQueryKeys.messages(variables.conversationId)
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to send message';
      toast.error(errorMessage);
    },
    ...options,
  });
}

// Create conversation mutation
export function useCreateConversation(
  options?: Omit<UseMutationOptions<any, Error, CreateConversationData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateConversationData) => {
      const response = await axiosClient.post('/chat/conversations', {
        receiverId: data.receiverId,
        fieldId: data.fieldId
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.conversations() });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to create conversation';
      toast.error(errorMessage);
    },
    ...options,
  });
}

// Mark messages as read mutation
export function useMarkMessagesAsRead(
  options?: Omit<UseMutationOptions<any, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await axiosClient.patch(
        `/chat/conversations/${conversationId}/read`
      );
      return response.data;
    },
    onSuccess: (result, conversationId) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.conversations() });
      queryClient.invalidateQueries({
        queryKey: messageQueryKeys.messages(conversationId)
      });
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.unreadCount() });
    },
    ...options,
  });
}

// Delete message mutation
export function useDeleteMessage(
  options?: Omit<UseMutationOptions<any, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await axiosClient.delete(`/chat/messages/${messageId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all message queries
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message deleted');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to delete message';
      toast.error(errorMessage);
    },
    ...options,
  });
}

// Delete conversation mutation
export function useDeleteConversation(
  options?: Omit<UseMutationOptions<any, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await axiosClient.delete(`/chat/conversations/${conversationId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate conversations
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.conversations() });
      toast.success('Conversation deleted');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to delete conversation';
      toast.error(errorMessage);
    },
    ...options,
  });
}