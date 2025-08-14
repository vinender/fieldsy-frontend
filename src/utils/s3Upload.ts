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
    // Upload API is on the frontend server, not backend
    this.apiBaseUrl = '/api';
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
      // Use XMLHttpRequest for better CORS handling with S3
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (onProgress && e.lengthComputable) {
            const progress: UploadProgress = {
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded * 100) / e.total)
            };
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(presignedData.fileUrl);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        xhr.open('POST', presignedData.uploadUrl);
        // Don't set Content-Type header, let browser set it with boundary
        xhr.send(formData);
      });
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
      'image/webp',
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