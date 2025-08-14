interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadFileOptions {
  file: File;
  onProgress?: (progress: UploadProgress) => void;
  folder?: string;
}

class S3DirectUploader {
  /**
   * Upload file through Next.js API (avoids CORS issues)
   */
  async uploadFile({ file, onProgress, folder = 'field-images' }: UploadFileOptions): Promise<string> {
    try {
      // Validate file
      this.validateFile(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Use XMLHttpRequest for progress tracking
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
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success && response.fileUrl) {
                resolve(response.fileUrl);
              } else {
                reject(new Error('Upload failed: No file URL returned'));
              }
            } catch (error) {
              reject(new Error('Invalid response from server'));
            }
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

        xhr.open('POST', '/api/upload/direct');
        xhr.send(formData);
      });
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
    ];

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Please upload JPG, PNG, WEBP, or GIF files.');
    }
  }
}

export const s3DirectUploader = new S3DirectUploader();
export type { UploadProgress, UploadFileOptions };