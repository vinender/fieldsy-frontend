import React from 'react';
import { FileUploader, FileUploaderProps } from './file-uploader';
import { ImageUploader, ImageUploaderProps } from './image-uploader';

// For document uploads (like in claim field form)
export function DocumentUploader(props: Partial<FileUploaderProps>) {
  return (
    <FileUploader
      multiple={true}
      maxFiles={5}
      maxSize={10}
      acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']}
      uploadText="Upload Documents"
      dropzoneText="Drag and drop here or"
      supportedFormatsText="Supported format: png, jpg, pdf (Max 10MB)"
      returnUrls={true}
      showFileList={true}
      {...props}
    />
  );
}

// For field image uploads with grid preview
export function FieldImageUploader(props: Partial<ImageUploaderProps>) {
  return (
    <ImageUploader
      multiple={true}
      maxFiles={10}
      maxSize={10}
      acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
      folder="field-images"
      showPreview={true}
      gridCols={4}
      returnFullObject={false}
      autoUpload={true}
      label=""
      description=""
      placeholder={
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#E8F5E1] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#3A6B22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-dark-green mb-2">Upload Field Images</p>
          <p className="text-sm text-[#6B737D]">
            Drag and drop here or <span className="text-[#3A6B22] font-semibold">click to browse</span>
          </p>
          <p className="text-xs text-[#9CA3AF] mt-2">
            Supported formats: JPG, PNG, WEBP (Max 10MB per image)
          </p>
        </div>
      }
      {...props}
    />
  );
}