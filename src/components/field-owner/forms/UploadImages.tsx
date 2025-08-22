import React from 'react';
import { FieldImageUploader } from '@/components/ui/image-grid-uploader';

interface UploadImagesProps {
  formData: any;
  setFormData: (updater: any) => void;
}

export default function UploadImages({ formData, setFormData }: UploadImagesProps) {
  const handleImagesChange = (images: string[] | any[]) => {
    // Handle both string[] and UploadedImage[] formats
    const imageUrls = Array.isArray(images) ? images : [];
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

      <FieldImageUploader
        value={formData.images || []}
        onChange={handleImagesChange}
      />
    </div>
  );
}