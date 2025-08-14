import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { CustomSelect } from '@/components/ui/custom-select';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { Input } from '@/components/ui/input';
import { Upload, X, CheckCircle, Image, ArrowLeft } from 'lucide-react';
import { s3DirectUploader, UploadProgress } from '@/utils/s3UploadDirect';
import { toast } from 'sonner';
import FieldPreview from './FieldPreview';
import ThankYouModal from '@/components/modal/ThankYouModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  useGetOwnerField,
  useSaveFieldBasicInfo,
  useSaveFieldFeatures,
  useSaveFieldImages,
  useSaveFieldAvailability,
  usePublishField,
  FieldData
} from '@/hooks/api/useFieldMutations';
import { useDebouncedCallback } from 'use-debounce';

// Sidebar Navigation Component
function Sidebar({ activeSection, onSectionChange, stepStatus }: { 
  activeSection: string; 
  onSectionChange: (sectionId: string) => void;
  stepStatus: { [key: string]: boolean };
}) {
  const sections = [
    { id: 'field-details', label: 'Field Details', completed: stepStatus['field-details'] },
    { id: 'upload-images', label: 'Upload Images', completed: stepStatus['upload-images'] },
    { id: 'pricing-availability', label: 'Pricing & Availability', completed: stepStatus['pricing-availability'] },
    { id: 'booking-rules', label: 'Booking Rules & Policies', completed: stepStatus['booking-rules'] }
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
function FieldDetails({ 
  formData, 
  setFormData, 
  onSave 
}: { 
  formData: any; 
  setFormData: (updater: any) => void;
  onSave: () => void;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    onSave(); // Auto-save on change
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev: any) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
    onSave(); // Auto-save on change
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
          Basic Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Name
            </label>
            <Input
              name="fieldName"
              value={formData.fieldName}
              onChange={handleInputChange}
              placeholder="Enter your field name"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Size
              </label>
              <CustomSelect
                value={formData.fieldSize}
                onValueChange={(value) => {
                  setFormData((prev: any) => ({ ...prev, fieldSize: value }));
                  onSave();
                }}
                placeholder="Select size"
                options={[
                  { value: 'small', label: 'Small (< 1 acre)' },
                  { value: 'medium', label: 'Medium (1-3 acres)' },
                  { value: 'large', label: 'Large (3-5 acres)' },
                  { value: 'extra-large', label: 'Extra Large (> 5 acres)' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terrain Type
              </label>
              <CustomSelect
                value={formData.terrainType}
                onValueChange={(value) => {
                  setFormData((prev: any) => ({ ...prev, terrainType: value }));
                  onSave();
                }}
                placeholder="Select terrain"
                options={[
                  { value: 'grass', label: 'Grass' },
                  { value: 'mixed', label: 'Mixed (Grass & Gravel)' },
                  { value: 'woodland', label: 'Woodland' },
                  { value: 'sand', label: 'Sand' }
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Dogs Allowed
            </label>
            <Input
              name="maxDogs"
              type="number"
              value={formData.maxDogs}
              onChange={handleInputChange}
              placeholder="Enter maximum number of dogs"
              className="w-full"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your field and what makes it special..."
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green"
            />
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Location Details
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <Input
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              placeholder="Enter street address"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                County/State
              </label>
              <Input
                name="county"
                value={formData.county}
                onChange={handleInputChange}
                placeholder="Enter county or state"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <Input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="Enter postal code"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <Input
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Enter country"
                className="w-full"
              />
            </div>
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
            'Water Bowls',
            'Shade/Shelter',
            'Seating',
            'Dog Toys',
            'Agility Equipment',
            'Secure Fencing',
            'Double Gates',
            'Parking',
            'Toilets',
            'Waste Bins'
          ].map((amenity) => (
            <CustomCheckbox
              key={amenity}
              checked={formData.amenities[amenity] || false}
              onCheckedChange={() => handleAmenityToggle(amenity)}
              label={amenity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Upload Images Component
function UploadImages({ 
  formData, 
  setFormData,
  onSave 
}: { 
  formData: any; 
  setFormData: (updater: any) => void;
  onSave: () => void;
}) {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: UploadProgress }>({});

  const handleImageUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      try {
        const uploadedUrl = await s3DirectUploader(
          file,
          (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          }
        );

        setFormData((prev: any) => ({
          ...prev,
          images: [...prev.images, uploadedUrl]
        }));
        
        // Remove progress after successful upload
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });

        onSave(); // Auto-save after upload
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }));
    onSave(); // Auto-save after removal
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2 text-dark-green font-sans">
          Upload Field Images
        </h1>
        <p className="text-base text-gray-text font-sans">
          Add photos to showcase your field. High-quality images help dog owners visualize the space.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">Click to upload images</p>
          <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
        </label>
      </div>

      {/* Upload Progress */}
      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{fileName}</span>
            <span className="text-sm text-gray-500">{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green h-2 rounded-full transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      ))}

      {/* Uploaded Images */}
      <div className="grid grid-cols-3 gap-4">
        {formData.images.map((image: string, index: number) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Field image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pricing & Availability Component
function PricingAvailability({ 
  formData, 
  setFormData,
  onSave 
}: { 
  formData: any; 
  setFormData: (updater: any) => void;
  onSave: () => void;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    onSave(); // Auto-save on change
  };

  const handleCheckboxChange = (name: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: !prev[name]
    }));
    onSave(); // Auto-save on change
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2 text-dark-green font-sans">
          Set Your Pricing & Availability
        </h1>
        <p className="text-base text-gray-text font-sans">
          Configure your field's pricing structure and availability schedule.
        </p>
      </div>

      {/* Pricing Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Pricing
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Hour (£)
            </label>
            <Input
              name="pricePerHour"
              type="number"
              value={formData.pricePerHour}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekend Price (£)
            </label>
            <Input
              name="weekendPrice"
              type="number"
              value={formData.weekendPrice}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Availability
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Days
            </label>
            <CustomSelect
              value={formData.openingDays}
              onValueChange={(value) => {
                setFormData((prev: any) => ({ ...prev, openingDays: value }));
                onSave();
              }}
              placeholder="Select opening days"
              options={[
                { value: 'weekdays', label: 'Weekdays Only' },
                { value: 'weekends', label: 'Weekends Only' },
                { value: 'everyday', label: 'Every Day' },
                { value: 'custom', label: 'Custom Schedule' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Time
              </label>
              <Input
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Time
              </label>
              <Input
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Options */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Booking Options
        </h2>
        
        <div className="space-y-4">
          <CustomCheckbox
            checked={formData.instantBooking}
            onCheckedChange={() => handleCheckboxChange('instantBooking')}
            label="Enable Instant Booking"
          />
          
          <CustomCheckbox
            checked={formData.requireDeposit}
            onCheckedChange={() => handleCheckboxChange('requireDeposit')}
            label="Require Deposit"
          />
        </div>
      </div>
    </div>
  );
}

// Booking Rules Component
function BookingRules({ 
  formData, 
  setFormData,
  onSave 
}: { 
  formData: any; 
  setFormData: (updater: any) => void;
  onSave: () => void;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    onSave(); // Auto-save on change
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2 text-dark-green font-sans">
          Set Your Rules & Policies
        </h1>
        <p className="text-base text-gray-text font-sans">
          Define the rules and policies for your field to ensure a safe and enjoyable experience.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Field Rules
        </label>
        <textarea
          name="rules"
          value={formData.rules}
          onChange={handleInputChange}
          placeholder="Enter your field rules (e.g., Dogs must be vaccinated, No aggressive dogs, etc.)"
          className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cancellation Policy
        </label>
        <textarea
          name="policies"
          value={formData.policies}
          onChange={handleInputChange}
          placeholder="Describe your cancellation policy"
          className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green"
        />
      </div>
    </div>
  );
}

// Main Component
export default function FieldOwnerDashboardV3() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('field-details');
  const [showPreview, setShowPreview] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [stepStatus, setStepStatus] = useState({
    'field-details': false,
    'upload-images': false,
    'pricing-availability': false,
    'booking-rules': false
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
    images: [] as string[],
    pricePerHour: '',
    weekendPrice: '',
    instantBooking: false,
    requireDeposit: false,
    rules: '',
    policies: ''
  });

  // Fetch existing field data
  const { data: fieldData, isLoading: fieldLoading } = useGetOwnerField();

  // Mutations
  const saveBasicInfo = useSaveFieldBasicInfo();
  const saveFeatures = useSaveFieldFeatures();
  const saveImages = useSaveFieldImages();
  const saveAvailability = useSaveFieldAvailability();
  const publishField = usePublishField();

  // Load existing field data
  useEffect(() => {
    if (fieldData) {
      setFieldId(fieldData.id || null);
      
      // Pre-populate form data from backend
      setFormData({
        fieldName: fieldData.basicInfo?.name || '',
        fieldSize: fieldData.basicInfo?.size || '',
        terrainType: '', // Map from backend
        maxDogs: '', // Map from backend
        description: fieldData.basicInfo?.description || '',
        openingDays: '', // Map from backend
        startTime: fieldData.features?.openingTime || '',
        endTime: fieldData.features?.closingTime || '',
        amenities: fieldData.features?.facilities?.reduce((acc: any, facility: string) => {
          acc[facility] = true;
          return acc;
        }, {}) || {},
        streetAddress: fieldData.basicInfo?.location || '',
        city: '', // Parse from location
        county: '', // Parse from location
        postalCode: '', // Parse from location
        country: '', // Parse from location
        images: fieldData.images?.images || [],
        pricePerHour: fieldData.basicInfo?.price?.toString() || '',
        weekendPrice: '', // Add weekend price support
        instantBooking: false, // Add to backend
        requireDeposit: false, // Add to backend
        rules: fieldData.features?.rules?.join('\n') || '',
        policies: '' // Add cancellation policy to backend
      });

      // Update step status based on saved data
      setStepStatus({
        'field-details': !!fieldData.basicInfo,
        'upload-images': !!(fieldData.images && fieldData.images.images.length > 0),
        'pricing-availability': !!fieldData.availability,
        'booking-rules': !!fieldData.features?.rules
      });
    }
  }, [fieldData]);

  // Debounced auto-save functions
  const debouncedSaveBasicInfo = useDebouncedCallback(
    async () => {
      if (!formData.fieldName) return;
      
      const basicInfo = {
        name: formData.fieldName,
        location: `${formData.streetAddress}, ${formData.city}, ${formData.county}, ${formData.postalCode}, ${formData.country}`,
        size: formData.fieldSize,
        price: parseFloat(formData.pricePerHour) || 0,
        description: formData.description
      };

      const result = await saveBasicInfo.mutateAsync({
        fieldId,
        basicInfo
      });

      if (result?.data?.field?.id && !fieldId) {
        setFieldId(result.data.field.id);
      }

      setStepStatus(prev => ({ ...prev, 'field-details': true }));
    },
    1000 // 1 second debounce
  );

  const debouncedSaveFeatures = useDebouncedCallback(
    async () => {
      if (!fieldId) return;

      const facilities = Object.entries(formData.amenities)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      const features = {
        facilities,
        rules: formData.rules.split('\n').filter(r => r.trim()),
        openingTime: formData.startTime,
        closingTime: formData.endTime
      };

      await saveFeatures.mutateAsync({
        fieldId,
        features
      });

      setStepStatus(prev => ({ ...prev, 'booking-rules': true }));
    },
    1000
  );

  const debouncedSaveImages = useDebouncedCallback(
    async () => {
      if (!fieldId || formData.images.length === 0) return;

      await saveImages.mutateAsync({
        fieldId,
        images: {
          images: formData.images,
          mainImage: formData.images[0]
        }
      });

      setStepStatus(prev => ({ ...prev, 'upload-images': true }));
    },
    1000
  );

  const debouncedSaveAvailability = useDebouncedCallback(
    async () => {
      if (!fieldId) return;

      const availability = {
        availableDays: getAvailableDays(formData.openingDays)
      };

      await saveAvailability.mutateAsync({
        fieldId,
        availability
      });

      setStepStatus(prev => ({ ...prev, 'pricing-availability': true }));
    },
    1000
  );

  // Helper function to convert opening days to array
  const getAvailableDays = (openingDays: string): string[] => {
    switch (openingDays) {
      case 'weekdays':
        return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      case 'weekends':
        return ['Saturday', 'Sunday'];
      case 'everyday':
        return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      default:
        return [];
    }
  };

  // Auto-save handlers for each section
  const handleAutoSave = useCallback(() => {
    switch (activeSection) {
      case 'field-details':
        debouncedSaveBasicInfo();
        break;
      case 'upload-images':
        debouncedSaveImages();
        break;
      case 'pricing-availability':
        debouncedSaveAvailability();
        break;
      case 'booking-rules':
        debouncedSaveFeatures();
        break;
    }
  }, [activeSection, debouncedSaveBasicInfo, debouncedSaveImages, debouncedSaveAvailability, debouncedSaveFeatures]);

  const handleSubmitField = async () => {
    if (!fieldId) {
      toast.error('Please complete all sections before submitting');
      return;
    }

    try {
      await publishField.mutateAsync(fieldId);
      setShowThankYouModal(true);
      setTimeout(() => {
        router.push('/field-owner');
      }, 3000);
    } catch (error) {
      console.error('Error submitting field:', error);
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
    } else if (currentIndex === sections.length - 1) {
      // Check if all steps are completed
      const allCompleted = Object.values(stepStatus).every(status => status);
      if (allCompleted) {
        setShowPreview(true);
      }
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
          isLoading={publishField.isPending}
        />
      );
    }

    switch (activeSection) {
      case 'field-details':
        return <FieldDetails formData={formData} setFormData={setFormData} onSave={handleAutoSave} />;
      case 'upload-images':
        return <UploadImages formData={formData} setFormData={setFormData} onSave={handleAutoSave} />;
      case 'pricing-availability':
        return <PricingAvailability formData={formData} setFormData={setFormData} onSave={handleAutoSave} />;
      case 'booking-rules':
        return <BookingRules formData={formData} setFormData={setFormData} onSave={handleAutoSave} />;
      default:
        return <FieldDetails formData={formData} setFormData={setFormData} onSave={handleAutoSave} />;
    }
  };

  if (authLoading || fieldLoading) {
    return <div className="min-h-screen bg-light py-8 mt-32 flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  if (!user || user.role !== 'FIELD_OWNER') {
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
          <div className="flex-1 bg-white rounded-2xl p-10">
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
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-full bg-green text-white font-semibold font-sans transition-opacity hover:opacity-90"
                >
                  {activeSection === 'booking-rules' && Object.values(stepStatus).every(s => s) ? 'Preview' : 'Save & Continue'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      {showThankYouModal && (
        <ThankYouModal onClose={() => setShowThankYouModal(false)} />
      )}
    </div>
  );
}