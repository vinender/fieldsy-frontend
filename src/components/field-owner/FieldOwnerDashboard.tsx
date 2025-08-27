import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOwnerField, useSaveFieldProgress } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { FieldOwnerDashboardSkeleton } from '@/components/skeletons/FieldOwnerDashboardSkeleton';
import BackButton from '@/components/common/BackButton';

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

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    
    // On small screens, scroll to form section
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const formElement = document.getElementById('form-content');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div className="w-full lg:w-[432px] bg-white rounded-2xl p-4 sm:p-6 lg:p-8 h-fit lg:sticky lg:top-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-2 text-dark-green font-sans">
        Add your field by following these quick steps.
      </h2>
      
      <div className="mt-8 space-y-4">
        {sections.map((section, index) => (
          <div key={section.id}>
            <button
              onClick={() => handleSectionClick(section.id)}
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
      console.log('fieldData',fieldData)
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
    <div className="min-h-screen bg-light py-4 sm:py-6 lg:py-8 mt-20 sm:mt-24 lg:mt-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        {/* Page Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 lg:mb-8">
          <BackButton size='lg' />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-dark-green font-sans">
            Add Your Field
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar - Keep on left for large screens */}
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} fieldData={fieldData} />

          {/* Form Content */}
          <div id="form-content" className="flex-1 bg-white rounded-2xl p-4 sm:p-6 lg:p-10 scroll-mt-4">
            {renderSection()}

            {/* Action Buttons - Keep original design */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 lg:mt-10">
              <button
                onClick={handleBack}
                className="w-full sm:flex-1 py-3 rounded-full border-2 border-green text-green font-semibold font-sans transition-colors hover:bg-gray-50 order-2 sm:order-1"
              >
                Back
              </button>
              <button
                onClick={handleSaveProgress}
                disabled={isLoading}
                className="w-full sm:flex-1 py-3 rounded-full bg-green text-white font-semibold font-sans transition-opacity hover:opacity-90 order-1 sm:order-2"
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