import React, { useState } from 'react';
import { s3Uploader, UploadProgress } from '@/utils/s3Upload';

export default function TestS3Upload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadedUrl(null);
    setUploadProgress(0);

    try {
      const url = await s3Uploader.uploadFile({
        file,
        folder: 'test-uploads',
        onProgress: (progress: UploadProgress) => {
          setUploadProgress(progress.percentage);
        }
      });

      setUploadedUrl(url);
      console.log('Upload successful! URL:', url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-cream pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-dark-green mb-8">Test S3 Upload</h1>
        
        <div className="bg-white rounded-2xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-dark-green mb-2">
              Select an image to upload
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green file:text-white
                hover:file:bg-green/90
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {uploading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red/10 border border-red rounded-lg">
              <p className="text-red font-medium">Upload Error:</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          )}

          {uploadedUrl && (
            <div className="space-y-4">
              <div className="p-4 bg-green/10 border border-green rounded-lg">
                <p className="text-green font-medium mb-2">Upload Successful!</p>
                <p className="text-xs text-gray-600 break-all">{uploadedUrl}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-dark-green mb-2">Preview:</p>
                <img 
                  src={uploadedUrl} 
                  alt="Uploaded preview"
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">S3 Configuration Status:</h3>
            <ul className="text-xs space-y-1 text-gray-600">
              <li>✅ AWS_REGION: {process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}</li>
              <li>✅ AWS_S3_BUCKET: fieldsy</li>
              <li>✅ AWS Credentials: Configured in .env.local</li>
              <li>✅ Upload endpoint: /api/upload/presigned-url</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}