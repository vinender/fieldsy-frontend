import React from 'react';
import { DocumentUploader, UploadedFile } from '@/components/ui/document-uploader';

interface UploadImagesProps {
  formData: any;
  setFormData: (updater: any) => void;
}

export default function UploadImages({ formData, setFormData }: UploadImagesProps) {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-dark-green font-sans">
          Upload Images
        </h1>
        <p className="text-base text-gray-text font-sans">
          Upload photos of your field to showcase its features to potential customers. High-quality images help attract more bookings.
        </p>
      </div>

      <DocumentUploader
        value={formData.images || []}
        onChange={handleImagesChange}
        multiple={true}
        maxFiles={10}
        maxSize={10}
        returnUrls={true}
        acceptImages={true}
        acceptPDFs={false}
        label=""
        description=""
        uploadText="Click to upload field images"
        dropzoneText="Drag and drop your field images here or"
        supportedFormatsText="Supported formats: JPG, PNG, WEBP (Max 10MB per file)"
      />
    </div>
  );
}