import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';

interface CreateReportData {
  reportedUserId: string;
  reportOption: string;
  reason?: string;
}

interface ReportQueryParams {
  status?: string;
  reporterId?: string;
  reportedUserId?: string;
  page?: number;
  limit?: number;
}

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReportData) => {
      const response = await axiosClient.post('/user-reports/report', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'User reported successfully');
      queryClient.invalidateQueries({ queryKey: ['user-reports'] });
      queryClient.invalidateQueries({ queryKey: ['my-reports'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to report user';
      toast.error(message);
      throw error;
    }
  });
};

export const useUserReports = (params: ReportQueryParams = {}) => {
  return useQuery({
    queryKey: ['user-reports', params],
    queryFn: async () => {
      const response = await axiosClient.get('/user-reports/reports', { params });
      return response.data;
    },
    enabled: true
  });
};

export const useMyReportsMade = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['my-reports', page, limit],
    queryFn: async () => {
      const response = await axiosClient.get('/user-reports/reports/my-reports', {
        params: { page, limit }
      });
      return response.data;
    }
  });
};

export const useReportDetails = (reportId: string) => {
  return useQuery({
    queryKey: ['report-details', reportId],
    queryFn: async () => {
      const response = await axiosClient.get(`/user-reports/reports/${reportId}`);
      return response.data;
    },
    enabled: !!reportId
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, status, reviewNotes }: { 
      reportId: string; 
      status: string; 
      reviewNotes?: string 
    }) => {
      const response = await axiosClient.put(
        `/user-reports/reports/${reportId}/status`,
        { status, reviewNotes }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Report status updated');
      queryClient.invalidateQueries({ queryKey: ['user-reports'] });
      queryClient.invalidateQueries({ queryKey: ['report-details'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update report status';
      toast.error(message);
      throw error;
    }
  });
};