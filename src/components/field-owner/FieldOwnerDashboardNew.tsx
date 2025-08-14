import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { CustomSelect } from '@/components/ui/custom-select';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { Input } from '@/components/ui/input';
import { Upload, X, CheckCircle, Image, ArrowLeft } from 'lucide-react';
import { s3DirectUploader, UploadProgress } from '@/utils/s3UploadDirect';
import { toast } from 'sonner';
import FieldPreview from './FieldPreview';
import ThankYouModal from '@/components/modal/ThankYouModal';
import axiosClient from '@/lib/api/axios-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAutoSaveField } from '@/hooks/useAutoSaveField';

// Sidebar Navigation Component
function Sidebar({ activeSection, onSectionChange, stepStatus }: { 
  activeSection: string; 
  onSectionChange: (sectionId: string) => void;
  stepStatus: { [key: string]: boolean };
}) {
  const sections = [
    { id: 'field-details', label: 'Field Details', completed: stepStatus['fieldDetails'] },
    { id: 'upload-images', label: 'Upload Images', completed: stepStatus['uploadImages'] },
    { id: 'pricing-availability', label: 'Pricing & Availability', completed: stepStatus['pricingAvailability'] },
    { id: 'booking-rules', label: 'Booking Rules & Policies', completed: stepStatus['bookingRules'] }
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
              {section.completed ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="currentColor" className="fill-green"/>
                  <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" className="stroke-gray-300" strokeWidth="2"/>
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
                  { value: 'Small', label: 'Small (1 acre or less)' },
                  { value: 'Medium', label: 'Medium (1-3 acres)' },
                  { value: 'Large', label: 'Large (3+ acres)' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Terrain Type
              </label>
              <CustomSelect
                name="terrainType"
                value={formData.terrainType}
                onChange={(value) => handleInputChange({ target: { name: 'terrainType', value } } as any)}
                placeholder="Select terrain type"
                options={[
                  { value: 'Grass', label: 'Soft Grass' },
                  { value: 'Path', label: 'Walking Path' },
                  { value: 'Chips', label: 'Wood Chips' },
                  { value: 'Artificial', label: 'Artificial Grass' },
                  { value: 'Mixed', label: 'Mixed Terrain' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Maximum Dogs Allowed
            </label>
            <Input
              type="number"
              name="maxDogs"
              value={formData.maxDogs}
              onChange={handleInputChange}
              placeholder="e.g., 10"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your field..."
              className="w-full min-h-[120px] rounded-2xl border border-gray-border bg-white p-4 text-gray-input placeholder:text-gray-400 font-sans focus:border-green focus:outline-none focus:ring-1 focus:ring-green resize-y"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Availability
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Opening Days
            </label>
            <CustomSelect
              name="openingDays"
              value={formData.openingDays}
              onChange={(value) => handleInputChange({ target: { name: 'openingDays', value } } as any)}
              placeholder="Select days"
              options={[
                { value: 'everyday', label: 'Every Day' },
                { value: 'weekdays', label: 'Weekdays Only' },
                { value: 'weekends', label: 'Weekends Only' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Start Time
            </label>
            <Input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              End Time
            </label>
            <Input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>
        </div>
      </div>

      {/* Amenities Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Amenities
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            'Water bowls',
            'Agility equipment',
            'Shade areas',
            'Parking',
            'Toilets',
            'Secure fencing',
            'Lighting',
            'Seating'
          ].map((amenity) => (
            <CustomCheckbox
              key={amenity}
              label={amenity}
              checked={formData.amenities[amenity] || false}
              onChange={() => handleAmenityToggle(amenity)}
            />
          ))}
        </div>
      </div>

      {/* Location Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Location
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Street Address
            </label>
            <Input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              placeholder="123 Main Street"
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
              placeholder="London"
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
              placeholder="Greater London"
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
              placeholder="SW1A 1AA"
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
  const [uploadedImages, setUploadedImages] = useState<any[]>(formData.images || []);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      images: uploadedImages.filter(img => img.uploaded).map(img => img.url)
    }));
  }, [uploadedImages, setFormData]);

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

    const newImages = imageFiles.map((file: File, index: number) => ({
      id: Date.now() + index,
      name: file.name,
      size: formatFileSize(file.size),
      file: file,
      preview: URL.createObjectURL(file),
      uploaded: false,
      progress: 0,
      url: undefined as string | undefined,
      error: undefined as string | undefined,
    }));

    setUploadedImages(prev => [...prev, ...newImages]);

    // Start real uploads with progress updates
    newImages.forEach(async (image) => {
      try {
        const fileUrl = await s3DirectUploader.uploadFile({
          file: image.file,
          onProgress: (progress: UploadProgress) => {
            setUploadedImages(prev => prev.map(img => {
              if (img.id === image.id) {
                return { ...img, progress: progress.percentage };
              }
              return img;
            }));
          },
          folder: 'field-images',
        });

        setUploadedImages(prev => prev.map(img => {
          if (img.id === image.id) {
            return { ...img, uploaded: true, progress: 100, url: fileUrl };
          }
          return img;
        }));

      } catch (error) {
        console.error('Upload failed:', error);
        setUploadedImages(prev => prev.map(img => {
          if (img.id === image.id) {
            return { ...img, error: 'Upload failed', progress: 0 };
          }
          return img;
        }));
      }
    });
  };

  const removeImage = (id: number) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2 text-dark-green font-sans">
          Upload Images
        </h1>
        <p className="text-base text-gray-text font-sans">
          Add photos that showcase your field's best features
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          dragActive ? 'border-green bg-green/5' : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-dark-green mb-1">
            Drop your images here, or browse
          </p>
          <p className="text-sm text-gray-text">
            Supports: JPG, PNG, GIF (Max 10MB)
          </p>
        </label>
      </div>

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {uploadedImages.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {image.preview && (
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Progress Bar */}
              {!image.uploaded && !image.error && (
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green h-2 rounded-full transition-all"
                      style={{ width: `${image.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Success Badge */}
              {image.uploaded && (
                <div className="absolute top-2 right-2 bg-green text-white p-1 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
              
              {/* Error State */}
              {image.error && (
                <div className="absolute inset-0 bg-red/10 flex items-center justify-center">
                  <p className="text-red text-sm">{image.error}</p>
                </div>
              )}
              
              {/* Remove Button */}
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 left-2 bg-white/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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

// Pricing & Availability Component
function PricingAvailability({ formData, setFormData }: any) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2 text-dark-green font-sans">
          Set Your Pricing & Availability
        </h1>
        <p className="text-base text-gray-text font-sans">
          Choose your rates and booking preferences
        </p>
      </div>

      {/* Pricing Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Pricing
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Price per Hour (£)
            </label>
            <Input
              type="number"
              name="pricePerHour"
              value={formData.pricePerHour}
              onChange={handleInputChange}
              placeholder="e.g., 15"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Weekend Price (£) - Optional
            </label>
            <Input
              type="number"
              name="weekendPrice"
              value={formData.weekendPrice}
              onChange={handleInputChange}
              placeholder="e.g., 20"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>
        </div>
      </div>

      {/* Booking Preferences */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Booking Preferences
        </h2>
        
        <div className="space-y-4">
          <CustomCheckbox
            label="Enable instant booking (no approval required)"
            checked={formData.instantBooking}
            onChange={(checked) => setFormData((prev: any) => ({ ...prev, instantBooking: checked }))}
          />
          
          <CustomCheckbox
            label="Require deposit for bookings"
            checked={formData.requireDeposit}
            onChange={(checked) => setFormData((prev: any) => ({ ...prev, requireDeposit: checked }))}
          />
        </div>
      </div>
    </div>
  );
}

// Booking Rules Component
function BookingRules({ formData, setFormData }: any) {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2 text-dark-green font-sans">
          Set Your Rules & Policies
        </h1>
        <p className="text-base text-gray-text font-sans">
          Define clear guidelines for a smooth booking experience
        </p>
      </div>

      {/* Field Rules */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Field Rules
        </h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-green font-sans">
            Write your field rules
          </label>
          <textarea
            name="rules"
            value={formData.rules}
            onChange={handleInputChange}
            placeholder="e.g., No aggressive dogs, must clean up after your pet, respect other users' time slots..."
            className="w-full min-h-[160px] rounded-2xl border border-gray-border bg-white p-4 text-gray-input placeholder:text-gray-400 font-sans focus:border-green focus:outline-none focus:ring-1 focus:ring-green resize-y"
            rows={5}
          />
        </div>
      </div>

      {/* Booking Policies */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Booking Policies
        </h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-green font-sans">
            Write your booking policies
          </label>
          <textarea
            name="policies"
            value={formData.policies}
            onChange={handleInputChange}
            placeholder="e.g., 24-hour cancellation policy, maximum 2 dogs per booking, arrival and departure times..."
            className="w-full min-h-[160px] rounded-2xl border border-gray-border bg-white p-4 text-gray-input placeholder:text-gray-400 font-sans focus:border-green focus:outline-none focus:ring-1 focus:ring-green resize-y"
            rows={5}
          />
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function FieldOwnerDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('field-details');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [stepStatus, setStepStatus] = useState({
    fieldDetails: false,
    uploadImages: false,
    pricingAvailability: false,
    bookingRules: false
  });
  
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldSize: '',
    terrainType: '',
    maxDogs: '',
    description: '',
    openingDays: '',
    startTime: '',
    endTime: '',
    amenities: {},
    streetAddress: '',
    city: '',
    county: '',
    postalCode: '',
    country: '',
    images: [],
    pricePerHour: '',
    weekendPrice: '',
    instantBooking: false,
    requireDeposit: false,
    rules: '',
    policies: ''
  });

  // Fetch existing field data using React Query
  const { data: fieldData, isLoading: fetchingField } = useQuery({
    queryKey: ['owner-field'],
    queryFn: async () => {
      const response = await axiosClient.get('/fields/owner/field');
      return response.data;
    },
    enabled: status === 'authenticated' && session?.user?.role === 'FIELD_OWNER',
    staleTime: 5 * 60 * 1000,
  });

  // Load field data when fetched
  useEffect(() => {
    if (fieldData?.field) {
      setFieldId(fieldData.field.id);
      setStepStatus(fieldData.field.stepStatus || {
        fieldDetails: false,
        uploadImages: false,
        pricingAvailability: false,
        bookingRules: false
      });
      
      // Pre-populate form data
      setFormData({
        fieldName: fieldData.field.name || '',
        fieldSize: fieldData.field.size || '',
        terrainType: fieldData.field.type || '',
        maxDogs: fieldData.field.maxDogs?.toString() || '',
        description: fieldData.field.description || '',
        openingDays: fieldData.field.operatingDays?.[0] || '',
        startTime: fieldData.field.openingTime || '',
        endTime: fieldData.field.closingTime || '',
        amenities: fieldData.field.amenities?.reduce((acc: any, amenity: string) => {
          acc[amenity] = true;
          return acc;
        }, {}) || {},
        streetAddress: fieldData.field.address || '',
        city: fieldData.field.city || '',
        county: fieldData.field.state || '',
        postalCode: fieldData.field.zipCode || '',
        country: fieldData.field.country || '',
        images: fieldData.field.images || [],
        pricePerHour: fieldData.field.pricePerHour?.toString() || '',
        weekendPrice: fieldData.field.pricePerDay?.toString() || '',
        instantBooking: fieldData.field.instantBooking || false,
        requireDeposit: false,
        rules: fieldData.field.rules?.[0] || '',
        policies: fieldData.field.cancellationPolicy || ''
      });
    }
  }, [fieldData]);

  // Auto-save hook
  const { isSaving: autoSaving } = useAutoSaveField({
    fieldId,
    activeSection,
    formData,
    onFieldCreated: (newFieldId) => {
      setFieldId(newFieldId);
    },
    onStepCompleted: (step) => {
      const stepMap: { [key: string]: string } = {
        'field-details': 'fieldDetails',
        'upload-images': 'uploadImages',
        'pricing-availability': 'pricingAvailability',
        'booking-rules': 'bookingRules'
      };
      setStepStatus(prev => ({
        ...prev,
        [stepMap[step]]: true
      }));
    }
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async ({ step, data }: { step: string; data: any }) => {
      const response = await axiosClient.post('/fields/save-progress', {
        step,
        data,
        fieldId
      });
      return response.data;
    },
    onSuccess: (result) => {
      // Update field ID if returned
      if (result.fieldId && !fieldId) {
        setFieldId(result.fieldId);
      }
      
      // Update step status
      const stepMap: { [key: string]: string } = {
        'field-details': 'fieldDetails',
        'upload-images': 'uploadImages',
        'pricing-availability': 'pricingAvailability',
        'booking-rules': 'bookingRules'
      };
      
      setStepStatus(prev => ({
        ...prev,
        [stepMap[activeSection]]: true
      }));

      toast.success('Progress saved successfully!');
      
      // Invalidate query to refetch field data
      queryClient.invalidateQueries({ queryKey: ['owner-field'] });
      
      // Check if all steps completed
      if (result.allStepsCompleted && activeSection === 'booking-rules') {
        setShowPreview(true);
      } else {
        handleNext();
      }
    },
    onError: (error: any) => {
      console.error('Error saving progress:', error);
      toast.error(error.response?.data?.message || 'Failed to save progress. Please try again.');
    }
  });

  const handleSaveProgress = async () => {
    setIsLoading(true);
    try {
      await saveProgressMutation.mutateAsync({
        step: activeSection,
        data: formData
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit field mutation
  const submitFieldMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.post('/fields/submit-for-review', {
        fieldId
      });
      return response.data;
    },
    onSuccess: () => {
      setShowThankYouModal(true);
      setTimeout(() => {
        router.push('/field-owner');
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Error submitting field:', error);
      toast.error(error.response?.data?.message || 'Failed to submit field. Please try again.');
    }
  });

  const handleSubmitField = async () => {
    setIsLoading(true);
    try {
      await submitFieldMutation.mutateAsync();
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
    if (showPreview) {
      return (
        <FieldPreview 
          formData={formData}
          onEdit={() => {
            setShowPreview(false);
            setActiveSection('field-details');
          }}
          onSubmit={handleSubmitField}
          isLoading={isLoading}
        />
      );
    }

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

  // Check if current step has data
  const hasStepData = () => {
    const stepMap: { [key: string]: string } = {
      'field-details': 'fieldDetails',
      'upload-images': 'uploadImages',
      'pricing-availability': 'pricingAvailability',
      'booking-rules': 'bookingRules'
    };
    
    return stepStatus[stepMap[activeSection] as keyof typeof stepStatus];
  };

  if (status === 'loading' || fetchingField) {
    return <div className="min-h-screen bg-light py-8 mt-32 flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'FIELD_OWNER') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-light py-8 mt-32">
      <div className="container mx-auto px-20">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 bg-cream rounded-full flex items-center justify-center hover:bg-cream/80 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-semibold text-dark-green font-sans">
            Add Your Field
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            stepStatus={stepStatus}
          />

          {/* Form Content */}
          <div className="flex-1 bg-white rounded-2xl p-10 relative">
            {/* Auto-save indicator */}
            {autoSaving && (
              <div className="absolute top-4 right-4 flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {renderSection()}

            {/* Action Buttons */}
            {!showPreview && (
              <div className="flex gap-4 mt-10">
                <button
                  onClick={handleBack}
                  disabled={activeSection === 'field-details'}
                  className="flex-1 py-3 rounded-full border-2 border-green text-green font-semibold font-sans transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveProgress}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-full bg-green text-white font-semibold font-sans transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    hasStepData() ? 'Update & Next' : 'Save & Next'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      <ThankYouModal 
        isOpen={showThankYouModal}
        onClose={() => setShowThankYouModal(false)}
      />
    </div>
  );
}