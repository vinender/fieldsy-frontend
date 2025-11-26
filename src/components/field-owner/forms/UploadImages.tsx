import React from 'react';
import { DocumentUploader, UploadedFile } from '@/components/ui/document-uploader';

interface UploadImagesProps {
  formData: any;
  setFormData: (updater: any) => void;
  validationErrors?: Record<string, string>;
}

export default function UploadImages({ formData, setFormData, validationErrors = {} }: UploadImagesProps) {
  const handleImagesChange = (files: string[] | UploadedFile[]) => {
    // Handle both string[] and UploadedFile[] formats
    let imageUrls: string[] = [];
    
    if (Array.isArray(files)) {
      if (files.length > 0) {
        if (typeof files[0] === 'string') {
          // Already string URLs
          imageUrls = files as string[];
        } else {
          // Extract URLs from UploadedFile objects
          imageUrls = (files as UploadedFile[])
            .filter(f => f.uploaded && f.url)
            .map(f => f.url as string);
        }
      }
    }
    
    setFormData((prev: any) => ({
      ...prev,
      images: imageUrls
    }));
  };

  const imageCount = formData.images?.length || 0;
  const remainingImages = Math.max(0, 4 - imageCount);
  const hasMinimumImages = imageCount >= 4;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-dark-green font-sans">
          Upload Images <span className="text-red-500">*</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-text font-sans">
          Upload photos of your field to showcase its features to potential customers. High-quality images help attract more bookings.
        </p>

        {/* Image count indicator */}
        <div className={`mt-4 p-4 rounded-lg border-2 ${hasMinimumImages ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
          <div className="flex items-center gap-2">
            {hasMinimumImages ? (
              <>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-semibold">
                  {imageCount} image{imageCount !== 1 ? 's' : ''} uploaded - You can proceed!
                </span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-yellow-700 font-semibold">
                  {imageCount} of 4 minimum images uploaded - Please upload {remainingImages} more image{remainingImages !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        </div>

        {validationErrors.images && (
          <p className="text-red-500 text-sm mt-2">{validationErrors.images}</p>
        )}
      </div>

      <DocumentUploader
        value={formData.images || []}
        onChange={handleImagesChange}
        multiple={true}
        maxFiles={10}
        minFiles={4}
        maxSize={10}
        returnUrls={true}
        acceptImages={true}
        acceptPDFs={false}
        label=""
        description=""
        uploadText="Click to upload field images"
        dropzoneText="Drag and drop your field images here or"
        supportedFormatsText="Supported: JPG, PNG (Max 10MB) - Large images (>20KB) auto-convert to AVIF"
      />
    </div>
  );
}