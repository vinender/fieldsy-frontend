import React from 'react';
import { FileUploader, FileUploaderProps, UploadedFile } from './file-uploader';

export interface DocumentUploaderProps extends Omit<FileUploaderProps, 'acceptedTypes' | 'variant'> {
  // Make it specific for images
  acceptImages?: boolean;
  acceptPDFs?: boolean;
}

export function DocumentUploader({
  acceptImages = true,
  acceptPDFs = false,
  multiple = true,
  maxFiles = 10,
  maxSize = 10,
  label = "Upload Field Images",
  description = "Add high-quality photos of your field to attract more customers",
  uploadText = "Click to upload or drag and drop",
  dropzoneText = "Drag and drop images here or",
  supportedFormatsText = "Supported formats: JPG, PNG (Max 10MB per file)",
  ...props
}: DocumentUploaderProps) {
  // Build accepted types based on props
  const acceptedTypes: string[] = [];
  if (acceptImages) {
    acceptedTypes.push('image/jpeg', 'image/jpg', 'image/png', 'image/webp');
  }
  if (acceptPDFs) {
    acceptedTypes.push('application/pdf');
  }

  return (
    <FileUploader
      {...props}
      multiple={multiple}
      maxFiles={maxFiles}
      maxSize={maxSize}
      acceptedTypes={acceptedTypes}
      label={label}
      description={description}
      uploadText={uploadText}
      dropzoneText={dropzoneText}
      supportedFormatsText={supportedFormatsText}
      variant="default"
    />
  );
}

// Export types for convenience
export type { UploadedFile };