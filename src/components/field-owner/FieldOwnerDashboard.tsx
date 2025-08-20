import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useOwnerField, useSaveFieldProgress } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { FieldOwnerDashboardSkeleton } from '@/components/skeletons/FieldOwnerDashboardSkeleton';

// Import form components
import FieldDetails from './forms/FieldDetails';
import UploadImages from './forms/UploadImages';
import PricingAvailability from './forms/PricingAvailability';
import BookingRules from './forms/BookingRules';

// Sidebar Navigation Component - Use API data for completion status
function Sidebar({ activeSection, onSectionChange, fieldData }: { 
  activeSection: string; 
  onSectionChange: (sectionId: string) => void;
  fieldData?: any;
}) {
  const sections = [
    { id: 'field-details', label: 'Field Details', completed: fieldData?.fieldDetailsCompleted || false },
    { id: 'upload-images', label: 'Upload Images', completed: fieldData?.uploadImagesCompleted || false },
    { id: 'pricing-availability', label: 'Pricing & Availability', completed: fieldData?.pricingAvailabilityCompleted || false },
    { id: 'booking-rules', label: 'Booking Rules & Policies', completed: fieldData?.bookingRulesCompleted || false }
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
              ) :  <img src='/add-field/arrow.svg' className='w-8 h-8 text-white' />}
            </button>
            {index < sections.length - 1 && <div className="h-px bg-gray-200 mt-2" />}
          </div>
        ))}
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
    apartment: string;
    city: string;
    county: string;
    postalCode: string;
    country: string;
    images: string[];
    pricePerHour: string;
    bookingDuration: string;
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
    apartment: '',
    city: '',
    county: '',
    postalCode: '',
    country: '',
    images: [], // Add images field
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

  // Check if current section has been completed
  const isCurrentSectionCompleted = () => {
    if (!fieldData) return false;
    
    const sectionMap: Record<string, boolean> = {
      'field-details': fieldData.fieldDetailsCompleted || false,
      'upload-images': fieldData.uploadImagesCompleted || false,
      'pricing-availability': fieldData.pricingAvailabilityCompleted || false,
      'booking-rules': fieldData.bookingRulesCompleted || false
    };
    
    return sectionMap[activeSection] || false;
  };

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
        images: fieldData.images || [],
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
    } else if (currentIndex === sections.length - 1) {
      // On last tab (booking-rules), redirect to preview page
      router.push('/field-owner/preview');
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
    return <FieldOwnerDashboardSkeleton />;
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
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} fieldData={fieldData} />

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
                {isLoading ? 
                  'Saving...' 
                  : activeSection === 'booking-rules' 
                    ? (isCurrentSectionCompleted() ? 'Update & Preview' : 'Save & Preview')
                    : (isCurrentSectionCompleted() ? 'Update & Next' : 'Save & Next')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}