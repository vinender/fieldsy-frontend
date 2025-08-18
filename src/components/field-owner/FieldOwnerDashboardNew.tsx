import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { CustomSelect } from '@/components/ui/custom-select';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { Input } from '@/components/ui/input';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Upload, X, CheckCircle, Image, ArrowLeft } from 'lucide-react';
import { s3DirectUploader, UploadProgress } from '@/utils/s3UploadDirect';
import { toast } from 'sonner';
import FieldPreview from './FieldPreview';
import ThankYouModal from '@/components/modal/ThankYouModal';
import { useOwnerField, useSaveFieldProgress, useSubmitFieldForReview } from '@/hooks';

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Fence Type
              </label>
              <CustomSelect
                name="fenceType"
                value={formData.fenceType}
                onChange={(value) => handleInputChange({ target: { name: 'fenceType', value } } as any)}
                placeholder="Select fence type"
                options={[
                  { value: 'Wooden', label: 'Wooden' },
                  { value: 'Metal', label: 'Metal' },
                  { value: 'Mesh', label: 'Mesh' },
                  { value: 'Electric', label: 'Electric' },
                  { value: 'Stone', label: 'Stone' },
                  { value: 'Mixed', label: 'Mixed' }
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
                  { value: '3ft', label: '3ft' },
                  { value: '4ft', label: '4ft' },
                  { value: '5ft', label: '5ft' },
                  { value: '6ft', label: '6ft' },
                  { value: '6ft+', label: '6ft+' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  { value: 'Soft Sand', label: 'Soft Sand' },
                  { value: 'Grass', label: 'Grass' },
                  { value: 'Artificial Grass', label: 'Artificial Grass' },
                  { value: 'Concrete', label: 'Concrete' },
                  { value: 'Mixed', label: 'Mixed' }
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
            <div key={amenity} className="flex items-center space-x-2">
              <CustomCheckbox
                checked={formData.amenities[amenity] || false}
                onChange={() => handleAmenityToggle(amenity)}
              />
              <label className="text-sm font-medium text-dark-green font-sans cursor-pointer" onClick={() => handleAmenityToggle(amenity)}>
                {amenity}
              </label>
            </div>
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

// Upload Images Component using the new ImageUploader
function UploadImages({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-dark-green mb-2">
          Upload Field Images
        </h2>
        <p className="text-gray-600">
          Add photos to showcase your field
        </p>
      </div>

      <ImageUploader
        value={formData.images}
        onChange={(images) => {
          setFormData((prev: any) => ({
            ...prev,
            images: images
          }));
        }}
        multiple={true}
        maxFiles={10}
        maxSize={10}
        folder="field-images"
        label="Field Images"
        description="Upload up to 10 images of your field. High-quality images help attract more bookings."
        gridCols={3}
        showPreview={true}
      />

      {formData.images && formData.images.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            ✓ {formData.images.length} image(s) uploaded successfully
          </p>
        </div>
      )}
    </div>
  );
}

// OLD Upload Images Component - REMOVED (now using ImageUploader component)
/* OLD CODE REMOVED - The old upload component has been replaced with the reusable ImageUploader component */

// The old upload component code has been removed - now using the reusable ImageUploader

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
          <div className="flex items-center space-x-2">
            <CustomCheckbox
              checked={formData.instantBooking}
              onChange={(checked) => setFormData((prev: any) => ({ ...prev, instantBooking: checked }))}
            />
            <label className="text-sm font-medium text-dark-green font-sans cursor-pointer" onClick={() => setFormData((prev: any) => ({ ...prev, instantBooking: !formData.instantBooking }))}>
              Enable instant booking (no approval required)
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <CustomCheckbox
              checked={formData.requireDeposit}
              onChange={(checked) => setFormData((prev: any) => ({ ...prev, requireDeposit: checked }))}
            />
            <label className="text-sm font-medium text-dark-green font-sans cursor-pointer" onClick={() => setFormData((prev: any) => ({ ...prev, requireDeposit: !formData.requireDeposit }))}>
              Require deposit for bookings
            </label>
          </div>
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
  
  const [formData, setFormData] = useState<{
    fieldName: string;
    fieldSize: string;
    terrainType: string;
    fenceType: string;
    fenceSize: string;
    surfaceType: string;
    maxDogs: string;
    description: string;
    openingDays: string;
    startTime: string;
    endTime: string;
    amenities: Record<string, any>;
    streetAddress: string;
    city: string;
    county: string;
    postalCode: string;
    country: string;
    images: string[];
    pricePerHour: string;
    weekendPrice: string;
    instantBooking: boolean;
    requireDeposit: boolean;
    rules: string;
    policies: string;
  }>({
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

  // Fetch existing field data using custom hook
  const { 
    data: fieldData, 
    isLoading: fetchingField,
    refetch
  } = useOwnerField({
    enabled: status === 'authenticated' && session?.user?.role === 'FIELD_OWNER',
  });

  // Load field data when fetched
  useEffect(() => {
    if (fieldData) {
      setFieldId(fieldData.id);
      setStepStatus(fieldData.stepStatus || {
        fieldDetails: false,
        uploadImages: false,
        pricingAvailability: false,
        bookingRules: false
      });
      
      // Pre-populate form data
      setFormData({
        fieldName: fieldData.name || '',
        fieldSize: fieldData.size || '',
        terrainType: fieldData.type || '',
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
        city: fieldData.city || '',
        county: fieldData.state || '',
        postalCode: fieldData.zipCode || '',
        country: fieldData.country || '',
        images: fieldData.images || [],
        pricePerHour: fieldData.pricePerHour?.toString() || '',
        weekendPrice: fieldData.pricePerDay?.toString() || '',
        instantBooking: fieldData.instantBooking || false,
        requireDeposit: false,
        rules: fieldData.rules?.[0] || '',
        policies: fieldData.cancellationPolicy || ''
      });
    }
  }, [fieldData]);

  // Remove auto-save - only save on button click

  // Use custom save progress mutation hook
  const saveProgressMutation = useSaveFieldProgress({
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
      
      // Refetch field data immediately after saving
      refetch();
      
      // Check if all steps completed
      if (result.allStepsCompleted && activeSection === 'booking-rules') {
        setShowPreview(true);
      } else {
        handleNext();
      }
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

  // Use custom submit field mutation hook
  const submitFieldMutation = useSubmitFieldForReview({
    onSuccess: () => {
      setShowThankYouModal(true);
      setTimeout(() => {
        router.push('/field-owner');
      }, 3000);
    }
  });

  const handleSubmitField = async () => {
    setIsLoading(true);
    try {
      await submitFieldMutation.mutateAsync({ fieldId });
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