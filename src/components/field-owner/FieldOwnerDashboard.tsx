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
function Sidebar({ activeSection, onSectionChange, fieldData, canNavigateTo }: { 
  activeSection: string; 
  onSectionChange: (sectionId: string) => void;
  fieldData?: any;
  canNavigateTo: (sectionId: string) => boolean;
}) {
  const sections = [
    { id: 'field-details', label: 'Field Details', completed: fieldData?.fieldDetailsCompleted || false },
    { id: 'upload-images', label: 'Upload Images', completed: fieldData?.uploadImagesCompleted || false },
    { id: 'pricing-availability', label: 'Pricing & Availability', completed: fieldData?.pricingAvailabilityCompleted || false },
    { id: 'booking-rules', label: 'Booking Rules & Policies', completed: fieldData?.bookingRulesCompleted || false }
  ];

  const handleSectionClick = (sectionId: string) => {
    // Only allow navigation if the section can be accessed
    if (!canNavigateTo(sectionId)) {
      return;
    }
    
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
              disabled={!canNavigateTo(section.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                activeSection === section.id ? 'bg-gray-50' : canNavigateTo(section.id) ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <span 
                className={`font-medium font-sans ${
                  activeSection === section.id 
                    ? 'text-dark-green' 
                    : canNavigateTo(section.id) 
                      ? 'text-gray-text' 
                      : 'text-gray-400'
                }`}
              >
                {section.label}
              </span>
              {section.completed ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="currentColor" className="fill-green"/>
                  <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : !canNavigateTo(section.id) && section.id !== 'field-details' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                  <path d="M19 11H5V21H19V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <img src='/add-field/arrow.svg' className='w-8 h-8 text-white' />
              )}
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
    price: string;
    bookingDuration: string;
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
    price: '',
    bookingDuration: '30min',
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
        price: fieldData.price?.toString() || fieldData.pricePerHour?.toString() || '',
        bookingDuration: fieldData.bookingDuration || '30min',
        instantBooking: fieldData.instantBooking || false,
        requireDeposit: false,
        rules: fieldData.rules?.[0] || '',
        policies: fieldData.cancellationPolicy || ''
      }));
    }
  }, [fieldData]);

  // Remove auto-save - only save on button click

  // Validation function for each section
  const validateSection = (section: string): boolean => {
    const errors: Record<string, string> = {};
    
    switch (section) {
      case 'field-details':
        if (!formData.fieldName?.trim()) errors.fieldName = 'Please enter a field name';
        if (!formData.fieldSize) errors.fieldSize = 'Please select a field size';
        if (!formData.terrainType) errors.terrainType = 'Please select a terrain type';
        if (!formData.fenceType) errors.fenceType = 'Please select a fence type';
        if (!formData.fenceSize) errors.fenceSize = 'Please select a fence size';
        if (!formData.surfaceType) errors.surfaceType = 'Please select a surface type';
        if (!formData.maxDogs) errors.maxDogs = 'Please enter the maximum number of dogs allowed';
        if (!formData.description?.trim()) errors.description = 'Please provide a description of your field';
        if (!formData.openingDays) errors.openingDays = 'Please select your opening days';
        if (!formData.startTime) errors.startTime = 'Please select a start time';
        if (!formData.endTime) errors.endTime = 'Please select an end time';
        if (!formData.streetAddress?.trim()) errors.streetAddress = 'Please enter a street address';
        if (!formData.city?.trim()) errors.city = 'Please enter a city';
        if (!formData.county?.trim()) errors.county = 'Please enter a county or state';
        if (!formData.postalCode?.trim()) errors.postalCode = 'Please enter a postal code';
        break;
        
      case 'upload-images':
        if (!formData.images || formData.images.length === 0) {
          errors.images = 'Please upload at least one image of your field';
        }
        break;
        
      case 'pricing-availability':
        if (!formData.price || parseFloat(formData.price) <= 0) {
          errors.price = 'Please enter a valid price (must be greater than 0)';
        }
        if (!formData.bookingDuration) errors.bookingDuration = 'Please select a booking duration';
        break;
        
      case 'booking-rules':
        if (!formData.rules?.trim()) errors.rules = 'Please specify your booking rules';
        if (!formData.policies?.trim()) errors.policies = 'Please specify your cancellation policy';
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if user can navigate to a specific section
  const canNavigateTo = (sectionId: string): boolean => {
    // If all sections are completed (field is submitted), allow free navigation
    if (fieldData && 
        fieldData.fieldDetailsCompleted && 
        fieldData.uploadImagesCompleted && 
        fieldData.pricingAvailabilityCompleted && 
        fieldData.bookingRulesCompleted) {
      return true; // Allow editing any tab when field is fully submitted
    }
    
    const sections = ['field-details', 'upload-images', 'pricing-availability', 'booking-rules'];
    const targetIndex = sections.indexOf(sectionId);
    const currentIndex = sections.indexOf(activeSection);
    
    // Always allow first tab
    if (sectionId === 'field-details') {
      return true;
    }
    
    // Can go back to a previously completed section
    if (targetIndex < currentIndex) {
      // Check if the target section was completed
      const completedKeyMap: Record<string, string> = {
        'field-details': 'fieldDetailsCompleted',
        'upload-images': 'uploadImagesCompleted',
        'pricing-availability': 'pricingAvailabilityCompleted',
        'booking-rules': 'bookingRulesCompleted',
      };

      const targetCompletedKey = completedKeyMap[sectionId];
      return fieldData && fieldData[targetCompletedKey] === true;
    }
    


    // Can only go forward if ALL previous sections are completed
    for (let i = 0; i < targetIndex; i++) {
      const sectionKey = sections[i];
      const completedKeyMap: Record<string, string> = {
        'field-details': 'fieldDetailsCompleted',
        'upload-images': 'uploadImagesCompleted',
        'pricing-availability': 'pricingAvailabilityCompleted',
        'booking-rules': 'bookingRulesCompleted'
      };

      const completedKey = completedKeyMap[sectionKey];
      if (!fieldData || !fieldData[completedKey]) {
        return false;
      }

    }
    
    return false; // Default to disabled for forward navigation
  };


  // Use custom save progress mutation hook
  const saveProgressMutation = useSaveFieldProgress({
    onSuccess: (result) => {
      if (result.fieldId && !fieldId) {
        setFieldId(result.fieldId);
      }
      // Refetch field data after saving
      refetch();
      // Clear validation errors on successful save
      setValidationErrors({});
      handleNext();
    },
    onError: (error) => {
      console.error('Failed to save progress:', error);
      alert('Failed to save progress. Please check all required fields.');
    }
  });

  const handleSaveProgress = async () => {
    // Validate current section before saving
    if (!validateSection(activeSection)) {
      // Validation errors are already set and displayed
      // Scroll to the form content area to show errors
      setTimeout(() => {
        const formElement = document.getElementById('form-content');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }
    
    setIsLoading(true);
    try {
      await saveProgressMutation.mutateAsync({
        step: activeSection,
        data: formData,
        fieldId
      });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate on form data change for better UX
  const handleFormDataChange = (updater: any) => {
    setFormData(updater);
    // Clear specific field error when user starts typing
    if (typeof updater === 'function') {
      const newData = updater(formData);
      // Clear errors for fields that now have values
      const newErrors = { ...validationErrors };
      Object.keys(newErrors).forEach(key => {
        if (newData[key] && newData[key] !== '') {
          delete newErrors[key];
        }
      });
      setValidationErrors(newErrors);
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
        return <FieldDetails formData={formData} setFormData={handleFormDataChange} validationErrors={validationErrors} />;
      case 'upload-images':
        return <UploadImages formData={formData} setFormData={handleFormDataChange} validationErrors={validationErrors} />;
      case 'pricing-availability':
        return <PricingAvailability formData={formData} setFormData={handleFormDataChange} validationErrors={validationErrors} />;
      case 'booking-rules':
        return <BookingRules formData={formData} setFormData={handleFormDataChange} validationErrors={validationErrors} />;
      default:
        return <FieldDetails formData={formData} setFormData={handleFormDataChange} validationErrors={validationErrors} />;
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
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
            fieldData={fieldData} 
            canNavigateTo={canNavigateTo}
          />

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