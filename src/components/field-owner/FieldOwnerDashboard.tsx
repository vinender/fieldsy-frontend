import React, { useState, useEffect } from 'react';
import { CustomSelect } from '@/components/ui/custom-select';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { Input } from '@/components/ui/input';
import { Upload, X, CheckCircle, Image } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useOwnerField, useSaveFieldProgress, useDirectUpload } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';

// Sidebar Navigation Component - Keep original design with hardcoded completion status
function Sidebar({ activeSection, onSectionChange }: { activeSection: string; onSectionChange: (sectionId: string) => void }) {
  const sections = [
    { id: 'field-details', label: 'Field Details', completed: true },
    { id: 'upload-images', label: 'Upload Images', completed: false },
    { id: 'pricing-availability', label: 'Pricing & Availability', completed: false },
    { id: 'booking-rules', label: 'Booking Rules & Policies', completed: false }
  ];

  return (
    <div className="w-[432px] bg-white rounded-2xl p-8 h-fit">
      <h2 className="text-xl font-semibold mb-2 text-dark-green font-sans">
        Add your field by following these quick steps.
      </h2>
      
      <div className="mt-8 space-y-4">
        {sections.map((section, index) => (
          <div key={section.id}>
            <button
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                activeSection === section.id ? 'bg-gray-50' : 'hover:bg-gray-50'
              }`}
            >
              <span 
                className={`font-medium font-sans ${
                  activeSection === section.id ? 'text-dark-green' : 'text-gray-text'
                }`}
              >
                {section.label}
              </span>
              {section.completed && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="currentColor" className="fill-green"/>
                  <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            {index < sections.length - 1 && <div className="h-px bg-gray-200 mt-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// Field Details Component
function FieldDetails({ formData, setFormData }: { formData: any; setFormData: (updater: any) => void }) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev: any) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2 text-dark-green font-sans">
          Tell us about your field
        </h1>
        <p className="text-base text-gray-text font-sans">
          Share key details like size, fencing, amenities, and what makes your space perfect for safe, off-lead adventures.
        </p>
      </div>

      {/* Basic Info Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Basic Info
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Field Name
            </label>
            <Input
              type="text"
              name="fieldName"
              value={formData.fieldName}
              onChange={handleInputChange}
              placeholder="Enter field name"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Field Size
              </label>
              <CustomSelect
                name="fieldSize"
                value={formData.fieldSize}
                onChange={(value) => handleInputChange({ target: { name: 'fieldSize', value } } as any)}
                placeholder="Select size"
                options={[
                  { value: 'small', label: 'Small (1 acre or less)' },
                  { value: 'medium', label: 'Medium (1-3 acres)' },
                  { value: 'large', label: 'Large (3+ acres)' }
                ]}
              />
            </div>

            <div className=''>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Terrain Type
              </label>

              <CustomSelect
                name="terrainType"
                value={formData.terrainType}
                onChange={(value) => handleInputChange({ target: { name: 'terrainType', value } } as any)}
                placeholder="Select terrain type"
                options={[
                  { value: 'soft-grass', label: 'Soft Grass' },
                  { value: 'walking-path', label: 'Walking Path' },
                  { value: 'wood-chips', label: 'Wood Chips' },
                  { value: 'artificial-grass', label: 'Artificial Grass' },
                  { value: 'mixed-terrain', label: 'Mixed Terrain' },
                ]}
              />
            </div>

            <div className='w-full'>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Fence Type
              </label>
              <CustomSelect
                name="fenceType"
                value={formData.fenceType}
                onChange={(value) => handleInputChange({ target: { name: 'fenceType', value } } as any)}
                placeholder="Select fence type"
                options={[
                  { value: 'post-and-wire', label: 'Post and Wire' },
                  { value: 'wooden-panel', label: 'Wooden Panel' },
                  { value: 'fully-enclosed-field-fencing', label: 'Fully Enclosed Field Fencing' },
                  { value: 'metal-rail', label: 'Metal Rail' },
                  { value: 'mixed-multiple-types', label: 'Mixed/Multiple Types' },
                  { value: 'no-fence', label: 'No Fence' }
                  
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Fence Size
              </label>
              <CustomSelect
                name="fenceSize"
                value={formData.fenceSize}
                onChange={(value) => handleInputChange({ target: { name: 'fenceSize', value } } as any)}
                placeholder="Select fence size"
                options={[
                    {value:'under-1-metre',label: 'Under 1 metre (3 ft)'},
                    {value:'1-2-metres',   label: '1-2 metres (3-6 ft)'},
                    {value:'2-3-metres',   label: '2-3 metres (6-9 ft)'},
                    {value:'3-4-metres',   label: '3-4 metres (9-12 ft)'},
                    {value:'4-5-metres',   label: '4-5 metres (12-15 ft)'},
                    {value:'5-6-metres',   label: '5-6 metres (15-18 ft)'},
                    {value:'6-7-metres',label: '6-7 metres (18-21 ft)'},
                    {value:'7-8-metres',label: '7-8 metres (21-24 ft)'},
                    {value:'8-9-metres',label: '8-9 metres (24-27 ft)'},
                    {value:'9-10-metres',label: '9-10 metres (27-30 ft)'},
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Surface Type
              </label>
              <CustomSelect
                name="surfaceType"
                value={formData.surfaceType}
                onChange={(value) => handleInputChange({ target: { name: 'surfaceType', value } } as any)}
                placeholder="Select surface type"
                options={[
                  { value: 'grass', label: 'Grass' },
                  { value: 'gravel', label: 'Gravel' },
                  { value: 'mixed-terrain', label: 'Mixed Terrain' },
                  { value: 'meadow', label: 'Meadow' },
                  { value: 'paved-path', label: 'Paved Path' },
                  { value: 'flat-with-gentle-slopes', label: 'Flat with Gentle Slopes' },
                  { value: 'muddy', label: 'Muddy' },
                  { value: 'other', label: 'Other' }
                
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Max Number of Dogs Allowed
              </label>
              <Input
                type="text"
                name="maxDogs"
                value={formData.maxDogs}
                onChange={handleInputChange}
                placeholder="Enter max number of dogs allowed"
                className="py-3 appearance-none border-gray-border focus:border-green font-sans"
              />
            </div>
            
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Description
        </h2>
        <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
          Write a description of your field
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Write a description here..."
          rows={5}
          className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-border focus:outline-none focus:border-green resize-none font-sans text-gray-input placeholder:text-gray-400"
        />
      </div>

      {/* Opening Days & Hours */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Opening Days & Hours
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Opening Days
            </label>
            <CustomSelect
              name="openingDays"
              value={formData.openingDays}
              onChange={(value) => handleInputChange({ target: { name: 'openingDays', value } } as any)}
              placeholder="Select opening days"
              options={[
                { value: 'everyday', label: 'Every day' },
                { value: 'weekdays', label: 'Weekdays only' },
                { value: 'weekends', label: 'Weekends only' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Start Time
              </label>
              <div className="relative">
                <Input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="py-3 pr-12 border-gray-border focus:border-green font-sans"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <img 
                    src="/add-field/clock.svg" 
                    alt="Clock" 
                    className="w-5 h-5 "
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                End Time
              </label>
              <div className="relative">
                <Input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="py-3 pr-12 border-gray-border focus:border-green font-sans"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <img 
                    src="/add-field/clock.svg" 
                    alt="Clock" 
                    className="w-5 h-5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className=''>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Choose Amenities
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {Object.entries({
            secureFencing: { icon: '/field-details/fence.svg', label: 'Secure Fencing' },
            waterAccess: { icon: '/add-field/water.svg', label: 'Water Access' },
            parking: { icon: '/payment/card.svg', label: 'Parking Available' },
            toilet: { icon: '/field-details/home.svg', label: 'Toilet Facilities' },
            shelter: { icon: '/add-field/shelter.svg', label: 'Shelter' },
            wasteDisposal: { icon: '/field-details/bin.svg', label: 'Waste Disposal' },
            dogAgility: { icon: '/add-field/dog-agility.svg', label: 'Dog Agility' },
            swimming: { icon: '/add-field/swimming.svg', label: 'Swimming Area' },
            playArea: { icon: '/add-field/dog-play.svg', label: 'Play Area' },
            cctv: { icon: '/add-field/cctv.svg', label: 'CCTV Security' },
            shadeAreas: { icon: '/add-field/tree.svg', label: 'Shade Areas' },
            lighting: { icon: '/add-field/clock.svg', label: 'Night Lighting' }
          }).map(([key, { icon, label }]) => (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => handleAmenityToggle(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAmenityToggle(key);
                }
              }}
              className={`px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                formData.amenities[key] 
                  ? 'bg-cream border-green' 
                  : 'bg-white border-gray-200 hover:border-green/50'
              }`}
              aria-pressed={!!formData.amenities[key]}
            >
              <CustomCheckbox
                checked={formData.amenities[key] || false}
                onChange={() => handleAmenityToggle(key)}
              />
              <div className="flex items-center gap-2">
                <img 
                  src={icon} 
                  alt={label} 
                  className="w-5 h-5 object-contain"
                />
                <span className="font-sans text-sm text-dark-green">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Address
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Street Address
            </label>
            <Input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              placeholder="42 Meadowcroft Lane"
              className="py-3 border-gray-border text-gray-input focus:border-green font-sans"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Apartment/Suite
            </label>
            <Input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleInputChange}
              placeholder="Flat 5B"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              City
            </label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Guildford"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              County/State
            </label>
            <Input
              type="text"
              name="county"
              value={formData.county}
              onChange={handleInputChange}
              placeholder="Surrey"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Postal Code
            </label>
            <Input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="GU1 1AA"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Country
            </label>
            <Input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="United Kingdom"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Upload Images Component
function UploadImages({ formData, setFormData }: any) {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const uploadMutation = useDirectUpload();
  console.log('images', uploadedImages);
  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
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
      id: Date.now() + index,
      name: file.name,
      size: formatFileSize(file.size),
      file: file,
      preview: URL.createObjectURL(file),
      uploaded: false,
      progress: undefined, // Start with undefined to show 0 initially
      url: undefined as string | undefined,
      error: undefined as string | undefined,
    }));

    setUploadedImages(prev => [...prev, ...newImages]);

    // Start real uploads with progress updates
    newImages.forEach(async (image, index) => {
      // Stagger uploads for better UX
      await new Promise(resolve => setTimeout(resolve, index * 150 + 50));
      
      // Initialize progress at 0
      setUploadedImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, progress: 0 } : img
      ));
      
      // Small delay to ensure UI updates with 0% first
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create simulated progress for better UX
      let simulatedProgress = 0;
      let progressInterval: ReturnType<typeof setInterval> | null = null;
      
      // Start simulated progress animation
      const startSimulatedProgress = () => {
        progressInterval = setInterval(() => {
          const increment = simulatedProgress < 30 
            ? Math.random() * 8 + 3  // 3-11% at start
            : simulatedProgress < 60 
            ? Math.random() * 5 + 2  // 2-7% in middle
            : Math.random() * 3 + 1; // 1-4% near end
          
          simulatedProgress = Math.min(simulatedProgress + increment, 85);
          
          setUploadedImages(prev => prev.map(img => 
            img.id === image.id 
              ? { ...img, progress: Math.round(simulatedProgress) } 
              : img
          ));
        }, 400); // Update every 400ms
      };
      
      try {
        startSimulatedProgress();
        
        const fileUrl = await uploadMutation.mutateAsync({
          file: image.file,
          folder: 'field-images',
          onProgress: (progress) => {
            // Use actual progress if higher than simulated
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
        
        // Clear interval
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        
        // Set to 100%
        setUploadedImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, progress: 100 } : img
        ));
        
        // Small delay to show 100%
        await new Promise(resolve => setTimeout(resolve, 300));

        setUploadedImages(prev => prev.map(img => {
          if (img.id === image.id) {
            return { ...img, uploaded: true, progress: 100, url: fileUrl };
          }
          return img;
        }));

        // Persist uploaded URL to form data
        setFormData((prev: any) => ({
          ...prev,
          images: Array.isArray(prev.images) ? [...prev.images, fileUrl] : [fileUrl],
        }));
      } catch (err) {
        // Clear interval on error
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

  const removeImage = (id: number) => {
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
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

      {/* Image Count Info */}
      {/* {uploadedImages.length > 0 && (
        <div className="bg-cream rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green rounded-full flex items-center justify-center">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-green">
                {uploadedImages.length} {uploadedImages.length === 1 ? 'image' : 'images'} uploaded
              </p>
              <p className="text-xs text-gray-text">
                {uploadedImages.filter(img => img.uploaded).length} successfully uploaded
              </p>
            </div>
          </div>
          <button
            onClick={() => setUploadedImages([])}
            className="text-sm text-green font-medium hover:underline"
          >
            Clear all
          </button>
        </div>
      )} */}
    </div>
  );
}

function PricingAvailability({ formData, setFormData }: any) {
  const [pricePerHour, setPricePerHour] = useState(formData.pricePerHour || '');
  const [bookingDuration, setBookingDuration] = useState(formData.bookingDuration || '30min');

  // Update formData when local state changes
  React.useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      pricePerHour,
      bookingDuration
    }));
  }, [pricePerHour, bookingDuration, setFormData]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-semibold text-dark-green font-sans">
          Set Pricing & Availability
        </h1>
        <p className="text-base text-gray-text font-sans">
          We require essential information to help you set competitive pricing for your field
        </p>
      </div>

      {/* Pricing Section */}
      <div className="space-y-8">
        {/* Price Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
            How much do you want to charge per dog, per hour?
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-input font-sans">
              $
            </span>
            <Input
              type="number"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              placeholder="0.00"
              className="pl-8 pr-32 py-3 border-gray-border focus:border-green font-sans"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="h-6 w-px bg-gray-text" />
              <span className="text-sm font-medium whitespace-nowrap text-dark-green font-sans">
                Per dog per hour
              </span>
            </div>
          </div>
        </div>

        {/* Booking Duration */}
        <div>
          <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
            Choose your preferred booking slot duration
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setBookingDuration('30min')}
              className={`flex-1 py-3 px-4 rounded-full font-medium font-sans transition-all ${
                bookingDuration === '30min'
                  ? 'bg-light-green text-white'
                  : 'bg-white border border-gray-border text-gray-text hover:border-light-green'
              }`}
            >
              30 Minutes
            </button>
            <button
              type="button"
              onClick={() => setBookingDuration('1hour')}
              className={`flex-1 py-3 px-4 rounded-full font-medium font-sans transition-all ${
                bookingDuration === '1hour'
                  ? 'bg-light-green text-white'
                  : 'bg-white border border-gray-border text-gray-text hover:border-light-green'
              }`}
            >
              1 Hour
            </button>
          </div>
        </div>

        {/* Additional Pricing Options */}
        <div>
          <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
            Weekend Pricing (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-input font-sans">
              $
            </span>
            <Input
              type="number"
              value={formData.weekendPrice || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, weekendPrice: e.target.value }))}
              placeholder="0.00"
              className="pl-8 pr-32 py-3 border-gray-border focus:border-green font-sans"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="h-6 w-px bg-gray-text" />
              <span className="text-sm font-medium whitespace-nowrap text-dark-green font-sans">
                Weekend rate
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-text mt-1 font-sans">
            Leave blank to use the same rate for weekends
          </p>
        </div>

        {/* Cancellation Policy Section */}
        <div className="mt-10 pt-10 border-t border-gray-200">
          <div className="space-y-6">
            <div className="bg- rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red mb-3 font-sans">
                Cancellation & Refund Policy:
              </h3>
              <p className="text-base leading-relaxed text-dark-green font-sans">
                Users can cancel or reschedule their booking up to{' '}
                <span className="font-bold">24 hours</span>
                {' '}in advance for a{' '}
                <span className="font-bold">full refund</span>
                {' '}by default.
              </p>
              
              <p className="text-base leading-relaxed mt-3 text-dark-green font-sans">
                You may set your own cancellation terms when listing your field. Cancellations made{' '}
                <span className="font-bold">within 24 hours of the booking time</span>
                {' '}are{' '}
                <span className="font-bold">non-refundable</span>
                {' '}unless you choose to offer flexibility.
              </p>
            </div>

            <div className=" rounded-2xl p-6">
              <p className="text-base leading-relaxed font-sans">
                <span className="font-bold text-green">
                  Note:
                </span>
                <span className="text-dark-green">
                  {' '}Clearly communicating your policy in your listing helps reduce disputes and builds trust with users.
                </span>
              </p>
            </div>

           
         
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingRules({ formData, setFormData }: any) {
  const [rules, setRules] = useState(formData.rules || '');
  const [policies, setPolicies] = useState(formData.policies || '');
  const [errors, setErrors] = useState({ rules: '', policies: '' });

  // Update formData when local state changes
  React.useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      rules,
      policies
    }));
  }, [rules, policies, setFormData]);

  const validateForm = () => {
    const newErrors = { rules: '', policies: '' };
    
    if (!rules.trim()) {
      newErrors.rules = 'Please write your rules before proceeding.';
    }
    
    if (!policies.trim()) {
      newErrors.policies = 'Please write your booking policies before proceeding.';
    }
    
    setErrors(newErrors);
    return !newErrors.rules && !newErrors.policies;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-semibold text-dark-green font-sans">
          Set Booking Rules & Policies
        </h1>
        <p className="text-base text-gray-text font-sans">
          Set clear guidelines to ensure a smooth, safe, and respectful experience for all visitors.
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-8">
        {/* Rules Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-dark-green font-sans">
            Rules
          </h2>
          <div className="space-y-2">
            <label 
              htmlFor="rules" 
              className="block text-sm font-medium text-dark-green font-sans"
            >
              Write about your rules
            </label>
            <div className="relative">
              <textarea
                id="rules"
                value={rules}
                onChange={(e) => {
                  setRules(e.target.value);
                  if (errors.rules) {
                    setErrors({ ...errors, rules: '' });
                  }
                }}
                placeholder="Write your rules here..."
                className={`w-full min-h-[160px] rounded-2xl border bg-white p-4 text-gray-input placeholder:text-gray-400 font-sans focus:border-green focus:outline-none focus:ring-1 focus:ring-green resize-y ${
                  errors.rules ? 'border-red' : 'border-gray-border'
                }`}
                rows={5}
              />
              {errors.rules && (
                <p className="mt-1 text-sm text-red font-sans">
                  {errors.rules}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-text font-sans">
              Example: No aggressive dogs, must clean up after your pet, respect other users' time slots
            </p>
          </div>
        </div>

        {/* Booking Policies Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-dark-green font-sans">
            Booking Policies
          </h2>
          <div className="space-y-2">
            <label 
              htmlFor="policies" 
              className="block text-sm font-medium text-dark-green font-sans"
            >
              Write about your policies
            </label>
            <div className="relative">
              <textarea
                id="policies"
                value={policies}
                onChange={(e) => {
                  setPolicies(e.target.value);
                  if (errors.policies) {
                    setErrors({ ...errors, policies: '' });
                  }
                }}
                placeholder="Write your policies here..."
                className={`w-full min-h-[160px] rounded-2xl border bg-white p-4 text-gray-input placeholder:text-gray-400 font-sans focus:border-green focus:outline-none focus:ring-1 focus:ring-green resize-y ${
                  errors.policies ? 'border-red' : 'border-gray-border'
                }`}
                rows={5}
              />
              {errors.policies && (
                <p className="mt-1 text-sm text-red font-sans">
                  {errors.policies}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-text font-sans">
              Example: 24-hour cancellation policy, maximum 2 dogs per booking, arrival and departure times
            </p>
          </div>
        </div>

     

        {/* Preview Section */}
        {(rules || policies) && (
          <div className="bg-green-lighter rounded-2xl p-6">
            <h3 className="text-base font-semibold text-dark-green mb-3 font-sans">
              Preview
            </h3>
            {rules && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-dark-green mb-1 font-sans">Rules:</h4>
                <p className="text-sm text-gray-input font-sans whitespace-pre-wrap">{rules}</p>
              </div>
            )}
            {policies && (
              <div>
                <h4 className="text-sm font-medium text-dark-green mb-1 font-sans">Policies:</h4>
                <p className="text-sm text-gray-input font-sans whitespace-pre-wrap">{policies}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Component
export default function AddYourField() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('field-details');
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldSize: '',
    terrainType: '',
    fenceType: '',
    fenceSize: '',
    surfaceType: '',
    maxDogs: '',
    description: '',
    openingDays: '',
    startTime: '',
    endTime: '',
    amenities: {},
    streetAddress: '',
    apartment: '',
    city: '',
    county: '',
    postalCode: '',
    country: '',
    // Pricing fields
    pricePerHour: '',
    bookingDuration: '30min',
    weekendPrice: '',
    instantBooking: false,
    requireDeposit: false,
    // Booking rules and policies
    rules: '',
    policies: ''
  });

  // Fetch existing field data using custom hook
  const { 
    data: fieldData, 
    isLoading: fetchingField,
    refetch
  } = useOwnerField({
    enabled: !!user && user.role === 'FIELD_OWNER',
  });

  // Load field data when fetched
  useEffect(() => {
    if (fieldData) {
      setFieldId(fieldData.id);
      
      // Pre-populate form data
      setFormData(prev => ({
        ...prev,
        fieldName: fieldData.name || '',
        fieldSize: fieldData.size || '',
        terrainType: fieldData.terrainType || '',
        fenceType: fieldData.fenceType || '',
        fenceSize: fieldData.fenceSize || '',
        surfaceType: fieldData.surfaceType || '',
        maxDogs: fieldData.maxDogs?.toString() || '',
        description: fieldData.description || '',
        openingDays: fieldData.operatingDays?.[0] || '',
        startTime: fieldData.openingTime || '',
        endTime: fieldData.closingTime || '',
        amenities: fieldData.amenities?.reduce((acc: any, amenity: string) => {
          acc[amenity] = true;
          return acc;
        }, {}) || {},
        streetAddress: fieldData.address || '',
        apartment: fieldData.apartment || '',
        city: fieldData.city || '',
        county: fieldData.state || '',
        postalCode: fieldData.zipCode || '',
        country: fieldData.country || '',
        pricePerHour: fieldData.pricePerHour?.toString() || '',
        bookingDuration: fieldData.bookingDuration || '30min',
        weekendPrice: fieldData.pricePerDay?.toString() || '',
        instantBooking: fieldData.instantBooking || false,
        requireDeposit: false,
        rules: fieldData.rules?.[0] || '',
        policies: fieldData.cancellationPolicy || ''
      }));
    }
  }, [fieldData]);

  // Remove auto-save - only save on button click

  // Use custom save progress mutation hook
  const saveProgressMutation = useSaveFieldProgress({
    onSuccess: (result) => {
      if (result.fieldId && !fieldId) {
        setFieldId(result.fieldId);
      }
      // Refetch field data after saving
      refetch();
      handleNext();
    }
  });

  const handleSaveProgress = async () => {
    setIsLoading(true);
    try {
      await saveProgressMutation.mutateAsync({
        step: activeSection,
        data: formData,
        fieldId
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const sections = ['field-details', 'upload-images', 'pricing-availability', 'booking-rules'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const sections = ['field-details', 'upload-images', 'pricing-availability', 'booking-rules'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1]);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'field-details':
        return <FieldDetails formData={formData} setFormData={setFormData} />;
      case 'upload-images':
        return <UploadImages formData={formData} setFormData={setFormData} />;
      case 'pricing-availability':
        return <PricingAvailability formData={formData} setFormData={setFormData} />;
      case 'booking-rules':
        return <BookingRules formData={formData} setFormData={setFormData} />;
      default:
        return <FieldDetails formData={formData} setFormData={setFormData} />;
    }
  };

  // Check if user is authenticated and is a field owner
  if (!user || user.role !== 'FIELD_OWNER') {
    // Redirect to login if not authenticated or not a field owner
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  if (fetchingField) {
    return <div className="min-h-screen bg-light py-8 mt-32 flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-light py-8 mt-32">
      <div className="container mx-auto px-20">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <button className="w-12 h-12 bg-cream rounded-full flex items-center justify-center hover:bg-cream/80 transition-colors">
           <img src='/back.svg' alt='arrow-left' className='w-6 h-6' />
          </button>
          <h1 className="text-3xl font-semibold text-dark-green font-sans">
            Add Your Field
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

          {/* Form Content */}
          <div className="flex-1 bg-white rounded-2xl p-10">
            {renderSection()}

            {/* Action Buttons - Keep original design */}
            <div className="flex gap-4 mt-10">
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-full border-2 border-green text-green font-semibold font-sans transition-colors hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSaveProgress}
                disabled={isLoading}
                className="flex-1 py-3 rounded-full bg-green text-white font-semibold font-sans transition-opacity hover:opacity-90"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Save & Next'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}