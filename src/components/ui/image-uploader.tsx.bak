"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Upload, AlertCircle, Check, Loader2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDirectUpload } from '@/hooks/mutations/useUploadMutations'
import { toast } from 'sonner'

export interface UploadedImage {
  id: string | number
  name: string
  size: number | string
  preview: string
  url?: string
  file?: File
  uploaded: boolean
  progress?: number
  error?: string
}

export interface ImageUploaderProps {
  // Core props
  value?: string | string[] | UploadedImage[]
  onChange?: (images: string[] | UploadedImage[]) => void
  
  // Configuration
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  folder?: string
  disabled?: boolean
  
  // UI customization
  className?: string
  label?: string
  description?: string
  placeholder?: React.ReactNode
  showPreview?: boolean
  previewClassName?: string
  gridCols?: 2 | 3 | 4
  
  // Callbacks
  onUploadStart?: (file: File) => void
  onUploadProgress?: (progress: number, file: File) => void
  onUploadComplete?: (url: string, file: File) => void
  onUploadError?: (error: string, file: File) => void
  onRemove?: (image: UploadedImage) => void
  
  // Advanced
  returnFullObject?: boolean // Return UploadedImage[] instead of string[]
  autoUpload?: boolean
}

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const DEFAULT_MAX_SIZE = 10 // MB

// Convert image file to WebP format
const convertToWebP = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with .webp extension
            const webpFileName = file.name.replace(/\.[^/.]+$/, '.webp')
            const webpFile = new File([blob], webpFileName, { type: 'image/webp' })
            resolve(webpFile)
          } else {
            reject(new Error('Failed to convert image to WebP'))
          }
        },
        'image/webp',
        0.85 // Quality: 85%
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

export function ImageUploader({
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  folder = 'images',
  disabled = false,
  className,
  label,
  description,
  placeholder,
  showPreview = true,
  previewClassName,
  gridCols = 3,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onRemove,
  returnFullObject = false,
  autoUpload = true,
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useDirectUpload()

  // Initialize images from value prop
  useEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          // Check if it's an array of strings (URLs)
          if (typeof value[0] === 'string') {
            const newImages = (value as string[]).map((url, index) => ({
              id: `existing-${index}-${Date.now()}`,
              name: `Image ${index + 1}`,
              size: 'Loaded',
              preview: url,
              url: url,
              uploaded: true,
            }))
            setImages(newImages)
          } 
          // Check if it's already UploadedImage format
          else if (typeof value[0] === 'object') {
            setImages(value as UploadedImage[])
          }
        }
      } else if (typeof value === 'string' && value) {
        // Single image URL
        setImages([{
          id: `existing-0-${Date.now()}`,
          name: 'Image 1',
          size: 'Loaded',
          preview: value,
          url: value,
          uploaded: true,
        }])
      }
    }
  }, [])

  // Notify parent of changes
  const notifyChange = useCallback((updatedImages: UploadedImage[]) => {
    if (onChange) {
      if (returnFullObject) {
        onChange(updatedImages)
      } else {
        // Return only URLs of uploaded images
        const urls = updatedImages
          .filter(img => img.uploaded && img.url)
          .map(img => img.url!)
        onChange(multiple ? urls : urls[0] || '')
      }
    }
  }, [onChange, returnFullObject, multiple])

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [disabled])

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
    }
    
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSize) {
      return `File size exceeds ${maxSize}MB limit`
    }
    
    return null
  }

  // Handle file selection
  const handleFiles = async (files: File[]) => {
    const currentCount = images.filter(img => img.uploaded).length
    const availableSlots = multiple ? maxFiles - currentCount : 1
    
    if (files.length > availableSlots) {
      toast.error(`You can only upload ${availableSlots} more image(s)`)
      return
    }

    // Show processing toast for multiple files
    if (files.length > 1) {
      toast.info(`Processing ${files.length} images...`)
    }

    const newImages: UploadedImage[] = []
    let processedCount = 0
    
    for (const file of files.slice(0, availableSlots)) {
      const error = validateFile(file)
      
      if (error) {
        toast.error(error)
        continue
      }

      try {
        // Convert to WebP format
        const webpFile = await convertToWebP(file)
        
        const reader = new FileReader()
        const imageId = `${Date.now()}-${Math.random()}`
        
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: imageId,
            name: webpFile.name,
            size: `${(webpFile.size / (1024 * 1024)).toFixed(2)}MB`,
            preview: e.target?.result as string,
            file: webpFile,
            uploaded: false,
            progress: undefined, // Start with undefined to ensure it shows 0 initially
          }
          
          newImages.push(newImage)
          processedCount++
          
          if (processedCount === files.slice(0, availableSlots).length) {
            const updatedImages = multiple ? [...images, ...newImages] : newImages
            setImages(updatedImages)
            
            if (autoUpload) {
              // Stagger uploads for better UX with slight delay
              newImages.forEach((img, index) => {
                setTimeout(() => uploadImage(img, updatedImages), index * 150 + 50)
              })
            }
          }
        }
        
        reader.readAsDataURL(webpFile)
      } catch (conversionError) {
        console.error(`Failed to convert ${file.name} to WebP:`, conversionError)
        toast.error(`Failed to process ${file.name}`)
        processedCount++
        
        // Check if we've processed all files even with errors
        if (processedCount === files.slice(0, availableSlots).length && newImages.length > 0) {
          const updatedImages = multiple ? [...images, ...newImages] : newImages
          setImages(updatedImages)
          
          if (autoUpload) {
            newImages.forEach((img, index) => {
              setTimeout(() => uploadImage(img, updatedImages), index * 150 + 50)
            })
          }
        }
      }
    }
  }

  // Upload single image
  const uploadImage = async (image: UploadedImage, allImages: UploadedImage[]) => {
    if (!image.file) return
    
    console.log('Starting upload for:', image.name)
    onUploadStart?.(image.file)
    
    // Initialize progress at 0
    setImages(prev => prev.map(img => 
      img.id === image.id ? { ...img, progress: 0, uploaded: false } : img
    ))
    
    // Small delay to ensure UI updates with 0% first
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Create a simulated progress tracker for better UX
    let simulatedProgress = 0
    let progressInterval: ReturnType<typeof setInterval> | null = null
    
    // Start simulated progress animation (slower, more realistic)
    const startSimulatedProgress = () => {
      progressInterval = setInterval(() => {
        // Slower, more realistic progress increments
        const increment = simulatedProgress < 30 
          ? Math.random() * 8 + 3  // 3-11% at start
          : simulatedProgress < 60  
          ? Math.random() * 5 + 2  // 2-7% in middle
          : Math.random() * 3 + 1  // 1-4% near end
        
        simulatedProgress = Math.min(simulatedProgress + increment, 85)
        console.log(`Simulated progress for ${image.name}: ${Math.round(simulatedProgress)}%`)
        
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, progress: Math.round(simulatedProgress), uploaded: false } 
            : img
        ))
      }, 400) // Update every 400ms for more realistic feel
    }
    
    try {
      startSimulatedProgress()
      
      const url = await uploadMutation.mutateAsync({
        file: image.file,
        folder,
        onProgress: (progress) => {
          // Use actual progress if it's higher than simulated
          if (progress > simulatedProgress) {
            simulatedProgress = progress
            setImages(prev => prev.map(img => 
              img.id === image.id 
                ? { ...img, progress: Math.min(progress, 95), uploaded: false } 
                : img
            ))
            onUploadProgress?.(progress, image.file!)
          }
        }
      })
      
      // Clear the interval
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      
      // Animate to 100%
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, progress: 100 } : img
      ))
      
      // Small delay to show 100% before switching to success state
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mark as uploaded with the URL
      const updatedImages = allImages.map(img => 
        img.id === image.id 
          ? { ...img, uploaded: true, progress: 100, url, error: undefined } 
          : img
      )
      
      setImages(updatedImages)
      notifyChange(updatedImages)
      onUploadComplete?.(url, image.file)
      toast.success(`${image.name} uploaded successfully!`)
      
    } catch (error: any) {
      // Clear the interval on error
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      
      const errorMessage = error.message || 'Upload failed'
      console.error(`Upload failed for ${image.name}:`, error)
      
      const updatedImages = allImages.map(img => 
        img.id === image.id 
          ? { ...img, error: errorMessage, progress: 0, uploaded: false } 
          : img
      )
      
      setImages(updatedImages)
      onUploadError?.(errorMessage, image.file)
      toast.error(`Failed to upload ${image.name}: ${errorMessage}`)
    }
  }

  // Remove image
  const removeImage = (imageToRemove: UploadedImage) => {
    const updatedImages = images.filter(img => img.id !== imageToRemove.id)
    setImages(updatedImages)
    notifyChange(updatedImages)
    onRemove?.(imageToRemove)
  }

  // Open file selector
  const openFileSelector = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[gridCols]

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-gray-600 mb-3">
          {description}
        </p>
      )}

      {/* Drop Zone */}
      <div
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all",
          dragActive ? "border-green bg-green/5" : "border-gray-300 bg-white",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-green/50",
          images.length === 0 ? "p-8" : "p-4"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files))
            }
          }}
          disabled={disabled}
          className="hidden"
        />

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            {placeholder || (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-dark-green mb-1">
                  Drop your images here, or browse
                </p>
                <p className="text-sm text-gray-600">
                  Supports: JPG, PNG, GIF, WebP (Max {maxSize}MB)
                </p>
                {multiple && (
                  <p className="text-xs text-gray-500 mt-2">
                    You can upload up to {maxFiles} images
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div 
            className="text-center py-3 border border-gray-200 rounded-lg bg-gray-50"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-gray-600">
              Click here or drag to add more images
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {showPreview && images.length > 0 && (
        <div className={cn("grid gap-4 mt-4", gridColsClass, previewClassName)}>
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className={cn(
                "aspect-square rounded-lg overflow-hidden bg-gray-100 transition-all duration-300",
                image.uploaded && "ring-2 ring-green/20",
                image.error && "ring-2 ring-red-500/30"
              )}>
                {image.preview ? (
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* Upload Progress Overlay */}
                {!image.uploaded && !image.error && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                    <div className="relative mb-3">
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                      {image.progress !== undefined && image.progress > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{Math.round(image.progress)}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-full max-w-[85%]">
                      <div className="flex justify-between text-white text-xs mb-1.5 font-medium">
                        <span className="animate-pulse">Uploading to S3...</span>
                        <span>{image.progress !== undefined ? image.progress : 0}%</span>
                      </div>
                      <div className="w-full bg-white/25 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                          style={{ 
                            width: `${image.progress !== undefined ? image.progress : 0}%`,
                            transition: 'width 0.3s ease-out'
                          }}
                        >
                          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                        </div>
                      </div>
                      <p className="text-white/80 text-[10px] mt-1.5 text-center truncate">
                        {image.name}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Error Overlay */}
                {image.error && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center p-2">
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-red-600 text-xs">
                        {image.error}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Success Overlay */}
                {image.uploaded && (
                  <div className="absolute top-2 right-2 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="bg-gradient-to-br from-green to-green-hover rounded-full p-2 shadow-lg transform transition-transform hover:scale-110">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Remove Button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(image)
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                           opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* Image Info */}
              <div className="mt-2">
                <p className="text-xs text-gray-700 truncate">{image.name}</p>
                <p className="text-xs text-gray-500">{image.size}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* File Count */}
      {multiple && images.length > 0 && (
        <p className="text-sm text-gray-600 mt-3">
          {images.filter(img => img.uploaded).length} of {images.length} uploaded
          {maxFiles && ` (${maxFiles - images.filter(img => img.uploaded).length} slots remaining)`}
        </p>
      )}
    </div>
  )
}