import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { s3Uploader, UploadProgress } from '@/utils/s3Upload';
import Spinner from '@/components/ui/Spinner';

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  url?: string;
  preview?: string; // Local preview URL for images
  uploaded: boolean;
  progress?: number;
  error?: string;
  file?: File;
}

export interface FileUploaderProps {
  // Core props
  value?: UploadedFile[] | string[];
  onChange?: (files: UploadedFile[] | string[]) => void;

  // Configuration
  multiple?: boolean;
  maxFiles?: number;
  minFiles?: number; // minimum files required
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
  
  // UI customization
  className?: string;
  label?: string;
  description?: string;
  uploadText?: string;
  dropzoneText?: string;
  supportedFormatsText?: string;
  
  // Display style
  variant?: 'default' | 'compact';
  showFileList?: boolean;
  
  // Return type
  returnUrls?: boolean; // If true, onChange returns string[], otherwise UploadedFile[]
  
  // Callbacks
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (progress: number, file: File) => void;
  onUploadComplete?: (url: string, file: File) => void;
  onUploadError?: (error: string, file: File) => void;
  onRemove?: (file: UploadedFile) => void;
}

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'];
const DEFAULT_MAX_SIZE = 10; // MB

// Convert image file to AVIF format (with WebP fallback)
// Only converts files larger than 20KB - smaller files kept as original PNG
const convertToAVIF = async (file: File): Promise<File> => {
  // Only convert image files, not PDFs or other documents
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Skip if already AVIF
  if (file.type === 'image/avif') {
    return file;
  }

  // Skip conversion for small files (< 20KB)
  // AVIF overhead makes tiny images larger, not smaller
  const SIZE_THRESHOLD = 20 * 1024; // 20KB
  if (file.size < SIZE_THRESHOLD) {
    console.log(`⏭️ Skipping AVIF conversion for small file (${(file.size / 1024).toFixed(2)}KB < 20KB):`, file.name);
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      // Try AVIF first (better compression, smaller files)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Check if AVIF conversion actually reduced size
            if (blob.size >= file.size) {
              console.log(`⏭️ AVIF (${(blob.size / 1024).toFixed(2)}KB) not smaller than original (${(file.size / 1024).toFixed(2)}KB), keeping original:`, file.name);
              resolve(file);
              return;
            }

            // Create new file with .avif extension
            const avifFileName = file.name.replace(/\.[^/.]+$/, '.avif')
            const avifFile = new File([blob], avifFileName, { type: 'image/avif' })
            const savings = ((1 - blob.size / file.size) * 100).toFixed(1);
            console.log(`✅ Converted to AVIF: ${avifFileName}, ${(file.size / 1024).toFixed(2)}KB → ${(blob.size / 1024).toFixed(2)}KB (${savings}% smaller)`);
            resolve(avifFile)
          } else {
            // Fallback to WebP if AVIF not supported by browser
            console.log('⚠️ AVIF not supported, falling back to WebP')
            canvas.toBlob(
              (webpBlob) => {
                if (webpBlob) {
                  const webpFileName = file.name.replace(/\.[^/.]+$/, '.webp')
                  const webpFile = new File([webpBlob], webpFileName, { type: 'image/webp' })
                  console.log('✅ Converted to WebP fallback:', webpFileName, `${(webpBlob.size / 1024).toFixed(2)}KB`)
                  resolve(webpFile)
                } else {
                  reject(new Error('Failed to convert image'))
                }
              },
              'image/webp',
              0.85 // Quality: 85% for WebP fallback
            )
          }
        },
        'image/avif',
        0.80 // Quality: 80% (AVIF is more efficient)
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))

    // Read the file as data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function FileUploader({
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  minFiles = 0,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
  className,
  label,
  description,
  uploadText = 'Upload ID Here',
  dropzoneText = 'Drag and drop here or',
  supportedFormatsText = 'Supported format : png, jpg, pdf',
  variant = 'default',
  showFileList = true,
  returnUrls = true,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onRemove,
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    // Initialize from value prop
    if (value) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          if (typeof value[0] === 'string') {
            // Convert URLs to UploadedFile format
            return (value as string[]).map((url, index) => ({
              id: `existing-${index}`,
              name: `Document ${index + 1}`,
              size: 'Loaded',
              url,
              uploaded: true,
            }));
          } else {
            return value as UploadedFile[];
          }
        }
      }
    }
    return [];
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track if we need to notify parent of changes
  const [shouldNotifyParent, setShouldNotifyParent] = useState(false);

  // Check if max files limit is reached
  const isMaxFilesReached = uploadedFiles.length >= maxFiles;

  // Use effect to notify parent component of changes - prevents setState during render
  useEffect(() => {
    if (shouldNotifyParent && onChange) {
      if (returnUrls) {
        const urls = uploadedFiles.filter(f => f.uploaded && f.url).map(f => f.url!);
        onChange(urls);
      } else {
        onChange(uploadedFiles);
      }
      setShouldNotifyParent(false);
    }
  }, [shouldNotifyParent, uploadedFiles, onChange, returnUrls]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileType = file.type || '';
    const isAccepted = acceptedTypes.some(type => {
      if (type.includes('*')) {
        // Handle wildcards like image/*
        const [category] = type.split('/');
        return fileType.startsWith(category);
      }
      return fileType === type;
    });
    
    if (!isAccepted) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }
    
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return `File size exceeds ${maxSize}MB limit`;
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    // Generate unique ID for this file upload
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Convert image files to AVIF format
      const fileToUpload = await convertToAVIF(file);

      // Generate preview URL for images
      let previewUrl: string | undefined;
      if (fileToUpload.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(fileToUpload);
      }

      const tempFile: UploadedFile = {
        id: fileId,
        name: fileToUpload.name,
        size: formatFileSize(fileToUpload.size),
        uploaded: false,
        progress: 0,
        file: fileToUpload,
        preview: previewUrl,
      };

      // Add file to list with initial state - use functional update to avoid stale state
      setUploadedFiles(prev => [...prev, tempFile]);

      setIsUploading(true);
      onUploadStart?.(fileToUpload);

      const fileUrl = await s3Uploader.uploadFile({
        file: fileToUpload,
        onProgress: (progress: UploadProgress) => {
          // Update progress by file ID, not index
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, progress: progress.percentage }
                : f
            )
          );
          onUploadProgress?.(progress.percentage, file);
        }
      });

      // Update file with success status using functional update
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, url: fileUrl, uploaded: true, progress: 100 }
            : f
        )
      );

      // Trigger parent notification via useEffect (prevents setState during render)
      setShouldNotifyParent(true);

      onUploadComplete?.(fileUrl, fileToUpload);
    } catch (error) {
      // Update file with error status using file ID
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, error: errorMessage, uploaded: false }
            : f
        )
      );

      onUploadError?.(errorMessage, file);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);

      // Calculate how many files can still be uploaded
      const currentCount = uploadedFiles.length;
      const availableSlots = maxFiles - currentCount;

      if (!multiple && currentCount >= 1) {
        alert('You can only upload one file');
        return;
      }

      if (multiple && availableSlots <= 0) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Limit files to available slots
      const filesToUpload = multiple ? files.slice(0, availableSlots) : [files[0]];

      if (files.length > filesToUpload.length) {
        alert(`Only ${availableSlots} more file(s) can be uploaded. First ${filesToUpload.length} file(s) will be uploaded.`);
      }

      // Validate all files first
      const validFiles: File[] = [];
      for (const file of filesToUpload) {
        const error = validateFile(file);
        if (error) {
          alert(`${file.name}: ${error}`);
          continue;
        }
        validFiles.push(file);
      }

      // Upload all valid files in parallel
      await Promise.all(validFiles.map(file => uploadFile(file)));
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);

      // Calculate how many files can still be uploaded
      const currentCount = uploadedFiles.length;
      const availableSlots = maxFiles - currentCount;

      if (!multiple && currentCount >= 1) {
        alert('You can only upload one file');
        return;
      }

      if (multiple && availableSlots <= 0) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Limit files to available slots
      const filesToUpload = multiple ? files.slice(0, availableSlots) : [files[0]];

      if (files.length > filesToUpload.length) {
        alert(`Only ${availableSlots} more file(s) can be uploaded. First ${filesToUpload.length} file(s) will be uploaded.`);
      }

      // Validate all files first
      const validFiles: File[] = [];
      for (const file of filesToUpload) {
        const error = validateFile(file);
        if (error) {
          alert(`${file.name}: ${error}`);
          continue;
        }
        validFiles.push(file);
      }

      // Upload all valid files (can be parallel or sequential)
      await Promise.all(validFiles.map(file => uploadFile(file)));
    }

    // Reset input value to allow selecting same files again
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeFile = async (index: number) => {
    const file = uploadedFiles[index];

    // Don't delete from S3 immediately - just remove from UI
    // The backend will handle deletion when save/next is clicked
    // by comparing old images with new images

    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);

    // Trigger parent notification via useEffect
    setShouldNotifyParent(true);

    onRemove?.(file);
  };

  const openFileSelector = () => {
    if (!disabled && !isMaxFilesReached) {
      fileInputRef.current?.click();
    }
  };

  const getStatusStyles = (file: UploadedFile) => {
    if (file.error) {
      return {
        bg: 'bg-red-50 border-red-200',
        icon: 'bg-red-100',
        iconColor: 'text-red-500',
      };
    }
    if (file.uploaded) {
      return {
        bg: 'bg-gray-50',
        icon: 'bg-green-100',
        iconColor: 'text-green',
      };
    }
    return {
      bg: 'bg-gray-50',
      icon: 'bg-[#F8F1D7]',
      iconColor: 'text-[#3A6B22]',
    };
  };

  const isCompact = variant === 'compact';
  const uploadAreaDisabled = disabled || isMaxFilesReached;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <h3 className="text-xl font-bold text-dark-green mb-2">{label}</h3>
      )}
      {description && (
        <p className="text-[#6B737D] text-sm mb-6">{description}</p>
      )}

      {/* File count indicator */}
      {multiple && maxFiles > 1 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {uploadedFiles.length} / {maxFiles} images uploaded
            {minFiles > 0 && uploadedFiles.length < minFiles && (
              <span className="text-red-500 ml-2">(Minimum {minFiles} required)</span>
            )}
          </p>
          {isMaxFilesReached && (
            <span className="text-sm text-green font-medium">Maximum limit reached</span>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl text-center transition-colors",
          dragActive && !uploadAreaDisabled ? "border-[#3A6B22] bg-green-50" : "border-gray-300 bg-light-green/20",
          uploadAreaDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          isCompact ? "p-4" : "p-8"
        )}
        onDragEnter={!uploadAreaDisabled ? handleDrag : undefined}
        onDragLeave={!uploadAreaDisabled ? handleDrag : undefined}
        onDragOver={!uploadAreaDisabled ? handleDrag : undefined}
        onDrop={!uploadAreaDisabled ? handleDrop : undefined}
        onClick={!uploadAreaDisabled ? openFileSelector : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          accept={acceptedTypes.join(',')}
          disabled={uploadAreaDisabled}
        />
        
        {!isCompact && (
          <div className="w-16 h-16 mx-auto mb-4 bg-[#E8F5E1] rounded-full flex items-center justify-center">
            {/* <Upload className="w-8 h-8 text-[#3A6B22]" /> */}
            <img src='/upload.svg'  className='w-16 h-16 '/>
          </div>
        )}


        <p className={cn(
          "font-semibold text-dark-green mb-2",
          isCompact ? "text-base" : "text-lg"
        )}>
          {uploadText}
        </p>
        
        <p className="text-sm text-[#6B737D]">
          {dropzoneText} <span className="text-[#3A6B22] font-semibold">click to upload</span>
        </p>
        
        <p className="text-xs text-[#9CA3AF] mt-2">
          {supportedFormatsText}
        </p>
      </div>

      {/* Uploaded Files */}
      {showFileList && uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploadedFiles.map((file, index) => {
            const styles = getStatusStyles(file);
            
            return (
              <div
                key={file.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-all",
                  styles.bg
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn("w-10 h-10 rounded overflow-hidden flex items-center justify-center", styles.icon)}>
                    {file.error ? (
                      <AlertCircle className={cn("w-5 h-5", styles.iconColor)} />
                    ) : (file.preview || file.url) ? (
                      <img
                        src={file.preview || file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : file.progress && file.progress > 0 ? (
                      <Spinner size="sm" inline />
                    ) : (
                      <span className="text-lg">📄</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark-green">{file.name}</p>
                    <div className="flex items-center gap-2">
                      {file.size && <p className="text-xs text-[#6B737D]">{file.size}</p>}
                      {file.error && (
                        <p className="text-xs text-red-600">{file.error}</p>
                      )}
                      {file.uploaded && !file.error && (
                        <p className="text-xs text-green">Uploaded successfully</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {file.uploaded || file.error ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    disabled={isUploading && !file.uploaded && !file.error}
                    type="button"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                ) : (
                  <div className="w-24">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3A6B22] transition-all duration-300"
                        style={{ width: `${file.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">{file.progress || 0}%</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* File count for multiple uploads */}
      {multiple && uploadedFiles.length > 0 && (
        <p className="text-sm text-gray-600 mt-3">
          {uploadedFiles.filter(f => f.uploaded).length} of {maxFiles} files uploaded
        </p>
      )}
    </div>
  );
}