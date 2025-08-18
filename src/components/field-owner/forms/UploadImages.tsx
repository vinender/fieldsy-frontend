import React, { useState, useEffect } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import { useDirectUpload } from '@/hooks';

interface UploadImagesProps {
  formData: any;
  setFormData: (updater: any) => void;
}

export default function UploadImages({ formData, setFormData }: UploadImagesProps) {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const uploadMutation = useDirectUpload();

  // Load existing images from formData when component mounts or formData.images changes
  useEffect(() => {
    if (formData.images && formData.images.length > 0) {
      const currentUrls = uploadedImages
        .filter(img => img.url)
        .map(img => img.url)
        .sort();
      
      const newUrls = (formData.images || []).sort();
      
      // Generate unique IDs for existing images
      const existingImages = formData.images.map((url: string, index: number) => ({
        id: `existing-${index}-${Date.now()}`,
        name: `Image ${index + 1}`,
        size: 'Uploaded',
        file: null,
        preview: url,
        uploaded: true,
        progress: 100,
        url: url
      }));
      
      // Only update if URLs have changed
      if (JSON.stringify(currentUrls) !== JSON.stringify(newUrls)) {
        setUploadedImages(existingImages);
      }
    }
  }, [formData.images]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFiles = async (files: FileList) => {
    const imageFiles = Array.from(files).filter((file: File) => 
      file.type.startsWith('image/')
    );

    const newImages = imageFiles?.map((file: File, index: number) => ({
      id: Date.now() + index + Math.random(),
      name: file.name,
      size: formatFileSize(file.size),
      file: file,
      preview: URL.createObjectURL(file),
      uploaded: false,
      progress: undefined,
      url: undefined as string | undefined,
      error: undefined as string | undefined,
    }));

    setUploadedImages(prev => [...prev, ...newImages]);

    newImages.forEach(async (image, index) => {
      await new Promise(resolve => setTimeout(resolve, index * 150 + 50));
      
      setUploadedImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, progress: 0 } : img
      ));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let simulatedProgress = 0;
      let progressInterval: ReturnType<typeof setInterval> | null = null;
      
      const startSimulatedProgress = () => {
        progressInterval = setInterval(() => {
          const increment = simulatedProgress < 30 
            ? Math.random() * 8 + 3
            : simulatedProgress < 60 
            ? Math.random() * 5 + 2
            : Math.random() * 3 + 1;
          
          simulatedProgress = Math.min(simulatedProgress + increment, 85);
          
          setUploadedImages(prev => prev.map(img => 
            img.id === image.id 
              ? { ...img, progress: Math.round(simulatedProgress) } 
              : img
          ));
        }, 400);
      };
      
      try {
        startSimulatedProgress();
        
        const fileUrl = await uploadMutation.mutateAsync({
          file: image.file,
          folder: 'field-images',
          onProgress: (progress) => {
            if (progress > simulatedProgress) {
              simulatedProgress = progress;
              setUploadedImages(prev => prev.map(img => 
                img.id === image.id 
                  ? { ...img, progress: Math.min(progress, 95) } 
                  : img
              ));
            }
          }
        });
        
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        
        setUploadedImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, progress: 100 } : img
        ));
        
        await new Promise(resolve => setTimeout(resolve, 300));

        setUploadedImages(prev => prev.map(img => {
          if (img.id === image.id) {
            return { ...img, uploaded: true, progress: 100, url: fileUrl };
          }
          return img;
        }));

        setFormData((prev: any) => ({
          ...prev,
          images: Array.isArray(prev.images) ? [...prev.images, fileUrl] : [fileUrl],
        }));
      } catch (err) {
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        
        setUploadedImages(prev => prev.map(img => {
          if (img.id === image.id) {
            return { ...img, error: 'Failed to upload', progress: 0 };
          }
          return img;
        }));
      }
    });
  };

  const removeImage = (id: number | string) => {
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id);
      
      if (image?.preview && image.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image.preview);
      }
      
      if (image?.url) {
        setFormData((prevData: any) => ({
          ...prevData,
          images: prevData.images?.filter((url: string) => url !== image.url) || []
        }));
      }
      
      return prev.filter(img => img.id !== id);
    });
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

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          dragActive ? 'border-green bg-green-50' : 'border-gray-300 bg-gray-light'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-lighter rounded-full flex items-center justify-center">
            <Upload className="w-10 h-10 text-green" />
          </div>
          <p className="text-lg font-semibold text-dark-green mb-2">Upload Field Images</p>
          <p className="text-sm text-gray-text">
            Drag and drop here or <span className="text-green font-semibold">click to browse</span>
          </p>
          <p className="text-xs text-gray-text mt-2">
            Supported formats: JPG, PNG, WEBP (Max 10MB per image)
          </p>
        </label>
      </div>

      {/* In-Progress Uploads List */}
      {uploadedImages?.some((img) => !img.uploaded) && (
        <div className="mt-4 space-y-3">
          {uploadedImages?.filter((img) => !img.uploaded).map((img) => (
            <div key={img.id} className="bg-white border border-gray-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-dark-green font-medium truncate mr-3">{img.name}</p>
                <span className="text-xs text-gray-text">{img.progress !== undefined ? img.progress : 0}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green rounded-full transition-all duration-300 ease-out" style={{ width: `${img.progress !== undefined ? img.progress : 0}%` }} />
              </div>
              {img.error && (
                <p className="text-xs text-red mt-2">{img.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Success Overlay */}
                {image.uploaded && (
                  <div className="absolute top-2 right-2 bg-green rounded-full p-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              {/* Image Info */}
              <div className="mt-2">
                <p className="text-xs text-dark-green font-medium truncate">{image.name}</p>
                <p className="text-xs text-gray-text">{image.size}</p>
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 left-2 bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}