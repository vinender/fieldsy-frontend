import axios from 'axios';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  fields: Record<string, string>;
}

interface UploadFileOptions {
  file: File;
  onProgress?: (progress: UploadProgress) => void;
  folder?: string;
}

class S3Uploader {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Get presigned URL from backend
   */
  private async getPresignedUrl(
    fileName: string,
    fileType: string,
    folder: string = 'claim-documents'
  ): Promise<PresignedUrlResponse> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/upload/presigned-url`, {
        fileName,
        fileType,
        folder
      });
      return response.data;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      throw new Error('Failed to get upload URL');
    }
  }

  /**
   * Upload file directly to S3 using presigned URL
   */
  private async uploadToS3(
    file: File,
    presignedData: PresignedUrlResponse,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const formData = new FormData();
    
    // Add all fields from presigned post data
    if (presignedData.fields) {
      Object.entries(presignedData.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    // File must be added last
    formData.append('file', file);

    try {
      await axios.post(presignedData.uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
            };
            onProgress(progress);
          }
        }
      });

      return presignedData.fileUrl;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Main upload method
   */
  async uploadFile({ file, onProgress, folder = 'claim-documents' }: UploadFileOptions): Promise<string> {
    try {
      // Validate file
      this.validateFile(file);

      // Get presigned URL from backend
      const presignedData = await this.getPresignedUrl(
        file.name,
        file.type,
        folder
      );

      // Upload to S3
      const fileUrl = await this.uploadToS3(file, presignedData, onProgress);

      return fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
    folder?: string
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadFile({
        file,
        onProgress: (progress) => onProgress?.(index, progress),
        folder
      })
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Please upload JPG, PNG, PDF, or DOC files.');
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      await axios.delete(`${this.apiBaseUrl}/upload/delete`, {
        data: { fileUrl }
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }
}

export const s3Uploader = new S3Uploader();
export type { UploadProgress, UploadFileOptions };