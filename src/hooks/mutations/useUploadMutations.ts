import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

// Types for mutations
export interface PresignedUrlData {
  fileName: string;
  fileType: string;
  folder?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
}

export interface DeleteFileData {
  fileUrl: string;
}

export interface DirectUploadData {
  file: File;
  folder?: string;
  onProgress?: (progress: number) => void;
}

// Hook to get presigned URL for S3 upload
export function useGetPresignedUrl(
  options?: Omit<UseMutationOptions<PresignedUrlResponse, Error, PresignedUrlData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async (data: PresignedUrlData) => {
      const response = await axios.post('/api/upload/presigned-url', data);
      return response.data as PresignedUrlResponse;
    },
    onError: (error: any, variables) => {
      console.error('Get presigned URL error:', error);
      toast.error(error.response?.data?.message || 'Failed to get upload URL. Please try again.');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook to delete file from S3
export function useDeleteFile(
  options?: Omit<UseMutationOptions<any, Error, DeleteFileData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async (data: DeleteFileData) => {
      const response = await axios.delete('/api/upload/delete', { data });
      return response.data;
    },
    onSuccess: (result, variables) => {
      toast.success('File deleted successfully!');
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Delete file error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete file. Please try again.');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook for direct file upload to S3
export function useDirectUpload(
  options?: Omit<UseMutationOptions<string, Error, DirectUploadData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async ({ file, folder, onProgress }: DirectUploadData) => {
      return new Promise<string>((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        if (folder) formData.append('folder', folder);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.fileUrl);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', '/api/upload/direct');
        xhr.send(formData);
      });
    },
    onSuccess: (result, variables) => {
      toast.success('File uploaded successfully!');
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Direct upload error:', error);
      toast.error('Failed to upload file. Please try again.');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}