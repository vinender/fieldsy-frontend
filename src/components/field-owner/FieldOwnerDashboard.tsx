import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useOwnerField, useOwnerFields, useSaveFieldProgress, useFieldDetails } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { FieldOwnerDashboardSkeleton } from '@/components/skeletons/FieldOwnerDashboardSkeleton';
import BackButton from '@/components/common/BackButton';
import { useAmenities } from '@/hooks/api/useAmenities';
import { UnsavedImagesModal } from '@/components/modal/UnsavedImagesModal';

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
      <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 text-dark-green font-sans">
        Add your field by following these quick steps.
      </h2>

      <div className="mt-8 space-y-4">
        {sections.map((section, index) => (
          <div key={section.id}>
            <button
              onClick={() => handleSectionClick(section.id)}
              disabled={!canNavigateTo(section.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${activeSection === section.id ? 'bg-gray-50' : canNavigateTo(section.id) ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
            >
              <span
                className={`text-sm sm:text-base font-medium font-sans ${activeSection === section.id
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
                  <circle cx="12" cy="12" r="10" fill="currentColor" className="fill-green" />
                  <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : !canNavigateTo(section.id) && section.id !== 'field-details' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                  <path d="M19 11H5V21H19V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
interface FieldOwnerDashboardProps {
  initialEditMode?: boolean;
  initialAddNewMode?: boolean;
  initialFieldId?: string | null;
}

export default function FieldOwnerDashboard({
  initialEditMode = false,
  initialAddNewMode = false,
  initialFieldId = null
}: FieldOwnerDashboardProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('field-details');
  const [fieldId, setFieldId] = useState<string | null>(initialFieldId);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Debug logging
  useEffect(() => {
    console.log('[FieldOwnerDashboard] Mounted', {
      userRole: user?.role,
      isAuthenticated: !!user,
      routerQuery: router.query,
      routerIsReady: router.isReady,
      props: { initialEditMode, initialAddNewMode, initialFieldId }
    });
  }, [user, router.query, router.isReady, initialEditMode, initialAddNewMode, initialFieldId]);

  // Track saved images and unsaved changes
  const savedImagesRef = useRef<string[]>([]);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    fieldName: string;
    fieldSize: string;
    customFieldSize: string;
    terrainType: string;
    fenceType: string;
    fenceSize: string;
    surfaceType: string;
    maxDogs: string;
    description: string;
    openingDays: string;
    startTime: string;
    endTime: string;
    amenities: string[];
    streetAddress: string;
    apartment: string;
    city: string;
    county: string;
    postalCode: string;
    country: string;
    addressVerified: boolean;
    images: string[];
    price: string;
    price30min: string;
    price1hr: string;
    bookingDuration: string;
    instantBooking: boolean;
    requireDeposit: boolean;
    rules: string;
    policies: string;
  }>({
    fieldName: '',
    fieldSize: '',
    customFieldSize: '',
    terrainType: '',
    fenceType: '',
    fenceSize: '',
    surfaceType: '',
    maxDogs: '',
    description: '',
    openingDays: '',
    startTime: '',
    endTime: '',
    amenities: [],
    streetAddress: '',
    apartment: '',
    city: '',
    county: '',
    postalCode: '',
    country: '',
    addressVerified: false,
    images: [],
    // Pricing fields
    price: '',
    price30min: '',
    price1hr: '',
    bookingDuration: '30min',
    instantBooking: false,
    requireDeposit: false,
    // Booking rules and policies
    rules: '',
    policies: '',
  });


  // Helper to get query params from window location (more reliable during transitions)
  const getQueryFromPath = () => {
    if (typeof window === 'undefined') return { edit: false, addNew: false, fieldId: null };
    const url = new URL(window.location.href);
    return {
      edit: url.searchParams.get('edit') === 'true',
      addNew: url.searchParams.get('addNew') === 'true',
      fieldId: url.searchParams.get('fieldId')
    };
  };

  const urlParams = typeof window !== 'undefined' ? getQueryFromPath() : { edit: false, addNew: false, fieldId: null };

  // Ensure we use the prop fieldId if provided, effectively prioritizing parent state
  const editFieldId = fieldId || initialFieldId || (router.query.fieldId as string) || urlParams.fieldId || undefined;

  // Mode detection
  const isAddNewMode = (initialAddNewMode || (router.isReady && router.query.addNew === 'true') || urlParams.addNew) && !editFieldId;
  const isEditMode = initialEditMode || (router.isReady && router.query.edit === 'true') || urlParams.edit || !!editFieldId;
  const stepFromQuery = router.query.step as string | undefined;

  // Local Storage Persistence
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const persistenceKey = editFieldId ? `field-form-${editFieldId}` : 'field-form-new';

    // Load from local storage on mount or id change
    const savedData = localStorage.getItem(persistenceKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
        console.log(`[FormPersistence] Loaded data from ${persistenceKey}`);
      } catch (e) {
        console.error('Failed to parse persisted data', e);
      }
    }
  }, [editFieldId]);

  // Save to local storage on form data change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const persistenceKey = editFieldId ? `field-form-${editFieldId}` : 'field-form-new';
    localStorage.setItem(persistenceKey, JSON.stringify(formData));
  }, [formData, editFieldId]);

  // Sync active section to URL
  useEffect(() => {
    if (router.isReady && activeSection) {
      const currentQuery = { ...router.query };
      if (currentQuery.step !== activeSection) {
        router.replace({
          pathname: router.pathname,
          query: { ...currentQuery, step: activeSection }
        }, undefined, { shallow: true });
      }
    }
  }, [activeSection, router.isReady]);

  // Fetch specific field details when in edit mode (replaces searching in allFields)
  const {
    data: specificFieldResponse,
    isLoading: fetchingSpecificField,
    refetch: refetchSpecific
  } = useFieldDetails(editFieldId || '', {
    enabled: !!user && user.role === 'FIELD_OWNER' && !!editFieldId && router.isReady,
  });

  // Fetch all fields for general awareness/fallback
  const {
    data: allFields,
    isLoading: fetchingAllFields,
    refetch: refetchAllFields
  } = useOwnerFields({
    enabled: !!user && user.role === 'FIELD_OWNER' && isEditMode && !!editFieldId && router.isReady,
  });

  // Fetch single field when not in edit mode (legacy behavior)
  const {
    data: singleField,
    isLoading: fetchingSingleField,
    refetch: refetchSingleField
  } = useOwnerField({
    enabled: !!user && user.role === 'FIELD_OWNER' && !isAddNewMode && !isEditMode && router.isReady,
  });

  // Fetch amenities for mapping names to IDs
  const { data: amenitiesList } = useAmenities();

  // Determine which field data to use
  // Priority: Specific field details > All fields search > Single field
  const specificFieldData = specificFieldResponse?.data || specificFieldResponse?.field || specificFieldResponse;

  const fieldData = (isEditMode && editFieldId)
    ? (specificFieldData || allFields?.find((f: any) => f.id === editFieldId))
    : singleField;

  const fetchingField = isEditMode ? (fetchingSpecificField || fetchingAllFields) : fetchingSingleField;
  const refetch = () => {
    if (isEditMode && editFieldId) {
      refetchSpecific();
      refetchAllFields();
    } else {
      refetchSingleField();
    }
  };

  // Check if this is first-time field owner (no existing fields)
  const isFirstTimeFieldOwner = !fieldData && !isAddNewMode && !isEditMode;


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


  // Set initial active section from query parameter
  useEffect(() => {
    if (stepFromQuery) {
      const validSteps = ['field-details', 'upload-images', 'pricing-availability', 'booking-rules'];
      if (validSteps.includes(stepFromQuery)) {
        setActiveSection(stepFromQuery);
      }
    }
  }, [stepFromQuery]);

  // Reset form when in add new mode
  useEffect(() => {
    // Only reset if we are truly in add new mode AND have no active field ID
    if (isAddNewMode && !fieldId && !editFieldId) {
      setFormData({
        fieldName: '',
        fieldSize: '',
        customFieldSize: '',
        terrainType: '',
        fenceType: '',
        fenceSize: '',
        surfaceType: '',
        maxDogs: '',
        description: '',
        openingDays: '',
        startTime: '',
        endTime: '',
        amenities: [],
        streetAddress: '',
        apartment: '',
        city: '',
        county: '',
        postalCode: '',
        country: '',
        addressVerified: false,
        images: [],
        price: '',
        price30min: '',
        price1hr: '',
        bookingDuration: '30min',
        instantBooking: false,
        requireDeposit: false,
        rules: '',
        policies: ''
      });
      console.log('Form reset for add new mode');
    }
  }, [isAddNewMode, fieldId, editFieldId]);

  // Load field data when fetched (only if not in add new mode)
  useEffect(() => {
    if (fieldData && !isAddNewMode) {
      // When in edit mode with fieldId, use that; otherwise use fieldData.id
      const currentFieldId = isEditMode && editFieldId ? editFieldId : fieldData.id;
      setFieldId(currentFieldId);
      console.log('Loading field data for edit:', currentFieldId, fieldData)

      // Store current saved images for comparison
      const currentImages = fieldData.images || [];
      savedImagesRef.current = currentImages;
      console.log('[FieldForm] Saved images ref initialized from DB:', currentImages);

      // Pre-populate form data
      // Check if field size looks like a custom value (contains "acres" but isn't a preset option)
      const isCustomSize = fieldData.size && fieldData.size.includes('acres') && /^\d+(\.\d+)?\s*acres$/i.test(fieldData.size);
      const customAcres = isCustomSize ? fieldData.size.replace(/\s*acres$/i, '') : '';

      setFormData(prev => ({
        ...prev,
        fieldName: fieldData.name || '',
        fieldSize: fieldData.size || '',
        customFieldSize: fieldData.customFieldSize || customAcres,
        terrainType: fieldData.terrainType || '',
        fenceType: fieldData.fenceType || '',
        fenceSize: fieldData.fenceSize || '',
        surfaceType: fieldData.surfaceType || '',
        maxDogs: fieldData.maxDogs?.toString() || '',
        description: fieldData.description || '',
        openingDays: fieldData.operatingDays?.[0] || '',
        startTime: fieldData.openingTime || '',
        endTime: fieldData.closingTime || '',
        amenities: (() => {
          if (!Array.isArray(fieldData.amenities)) return [];

          return fieldData.amenities.map((amenity: any) => {
            // If amenity is an object with id property, extract the id
            if (typeof amenity === 'object' && amenity.id) {
              return amenity.id;
            }

            // If amenity is a string
            if (typeof amenity === 'string') {
              // Check if it's already an ID (UUID format - 24 hex chars)
              if (amenity.match(/^[0-9a-f]{24}$/i)) {
                return amenity;
              }

              // Otherwise, try to map name to ID if amenitiesList is available
              if (amenitiesList && amenitiesList.length > 0) {
                const found = amenitiesList.find((a) => a.name === amenity);
                return found ? found.id : amenity;
              }
            }

            return amenity;
          });
        })(),
        streetAddress: fieldData.address || '',
        apartment: fieldData.apartment || '',
        city: fieldData.city || '',
        county: fieldData.state || '',
        postalCode: fieldData.zipCode || '',
        country: fieldData.country || '',
        addressVerified: Boolean(fieldData.address || fieldData.streetAddress || fieldData.location),
        images: fieldData.images || [],
        price: fieldData.price?.toString() || fieldData.pricePerHour?.toString() || '',
        price30min: fieldData.price30min?.toString() || '',
        price1hr: fieldData.price1hr?.toString() || '',
        bookingDuration: fieldData.bookingDuration || '30min',
        instantBooking: fieldData.instantBooking || false,
        requireDeposit: false,
        rules: fieldData.rules?.[0] || '',
        policies: fieldData.cancellationPolicy || ''
      }));
    }
  }, [fieldData, isAddNewMode, isEditMode, editFieldId, amenitiesList]);

  // Remove auto-save - only save on button click

  // Validation function for each section
  const validateSection = (section: string): boolean => {
    const errors: Record<string, string> = {};

    switch (section) {
      case 'field-details':
        if (!formData.fieldName?.trim()) errors.fieldName = 'Please enter a field name';
        if (!formData.fieldSize && !formData.customFieldSize) errors.fieldSize = 'Please select or enter a field size';
        if (!formData.terrainType) errors.terrainType = 'Please select a terrain type';
        if (!formData.fenceType) errors.fenceType = 'Please select a fence type';
        if (!formData.fenceSize) errors.fenceSize = 'Please select a fence size';
        if (!formData.surfaceType) errors.surfaceType = 'Please select a surface type';
        if (!formData.maxDogs) errors.maxDogs = 'Please enter the maximum number of dogs allowed';
        if (!formData.description?.trim()) errors.description = 'Please provide a description of your field';
        if (!formData.openingDays) errors.openingDays = 'Please select your opening days';
        if (!formData.startTime) errors.startTime = 'Please select a start time';
        if (!formData.endTime) errors.endTime = 'Please select an end time';
        if (formData.startTime && formData.endTime) {
          const [sh, sm] = formData.startTime.split(':').map(Number);
          const [eh, em] = formData.endTime.split(':').map(Number);
          if ((eh * 60 + em) <= (sh * 60 + sm)) {
            errors.endTime = 'Closing time must be after opening time';
          }
        }
        if (!formData.streetAddress?.trim()) {
          errors.streetAddress = 'Please enter a street address';
        } else if (!formData.addressVerified) {
          errors.streetAddress = 'Please select an address from the suggestions';
        }
        if (!formData.city?.trim()) errors.city = 'Please enter a city';
        if (!formData.county?.trim()) errors.county = 'Please enter a county or state';
        if (!formData.postalCode?.trim()) errors.postalCode = 'Please enter a postal code';
        break;

      case 'upload-images':
        if (!formData.images || formData.images.length === 0) {
          errors.images = 'Please upload at least 4 images of your field';
        } else if (formData.images.length < 4) {
          errors.images = `Please upload ${4 - formData.images.length} more image${4 - formData.images.length > 1 ? 's' : ''} (minimum 4 required)`;
        }
        break;

      case 'pricing-availability':
        // At least one price (30min or 1hr) is required
        const has30minPrice = formData.price30min && parseFloat(formData.price30min) > 0;
        const has1hrPrice = formData.price1hr && parseFloat(formData.price1hr) > 0;

        if (!has30minPrice && !has1hrPrice) {
          errors.price1hr = 'Please enter a valid price for at least one slot duration (30 minutes or 1 hour)';
        }
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
    // In add new mode, enforce sequential completion
    if (isAddNewMode) {
      const sections = ['field-details', 'upload-images', 'pricing-availability', 'booking-rules'];
      const targetIndex = sections.indexOf(sectionId);

      // Always allow first tab
      if (sectionId === 'field-details') {
        return true;
      }

      // For other sections, check if previous section is completed
      // Since we don't have fieldData in add new mode, use local state
      return false; // Only allow next section after current is completed via button
    }

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

    // If all previous sections are completed, allow access to this section
    return true;
  };


  // Use custom save progress mutation hook
  const saveProgressMutation = useSaveFieldProgress({
    onSuccess: (result) => {
      let finalId = fieldId;
      if (result.fieldId) {
        finalId = result.fieldId;
        // Update both local state and what handleNext will use
        setFieldId(result.fieldId);
      }

      // Refetch field data after saving
      refetch();
      // Clear validation errors on successful save
      setValidationErrors({});
      // Update saved images ref after successful save
      if (activeSection === 'upload-images') {
        savedImagesRef.current = formData.images || [];
        console.log('[FieldForm] Saved images ref updated after save:', savedImagesRef.current);
      }

      // Pass the new fieldId to handleNext so it can perform atomic transition
      handleNext(finalId);
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
      const { addressVerified, ...payload } = formData;
      await saveProgressMutation.mutateAsync({
        step: activeSection,
        data: payload,
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

  // Check if there are unsaved image changes
  const hasUnsavedImages = (): boolean => {
    if (activeSection !== 'upload-images') return false;

    const currentImages = formData.images || [];
    const savedImages = savedImagesRef.current || [];

    // Check if images have changed (different length or different URLs)
    if (currentImages.length !== savedImages.length) return true;

    // Check if any URL is different
    return currentImages.some((url, index) => url !== savedImages[index]);
  };

  // Delete uploaded images that haven't been saved
  const deleteUnsavedImages = async () => {
    const currentImages = formData.images || [];
    const savedImages = savedImagesRef.current || [];

    console.log('[FieldForm] Delete check - Current images:', currentImages);
    console.log('[FieldForm] Delete check - Saved images (from DB):', savedImages);

    // Find new images that were uploaded but not saved (exist in current but not in saved)
    const newImages = currentImages.filter(url => !savedImages.includes(url));

    console.log('[FieldForm] Images to delete (new uploads only):', newImages);

    if (newImages.length === 0) {
      console.log('[FieldForm] No unsaved images to delete');
      return;
    }

    try {
      console.log(`[FieldForm] Deleting ${newImages.length} newly uploaded unsaved images`);

      const deletePromises = newImages.map(async (fileUrl) => {
        try {
          console.log(`[FieldForm] Deleting: ${fileUrl}`);
          const response = await fetch('/api/upload/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileUrl }),
          });

          if (!response.ok) {
            console.error(`[FieldForm] Failed to delete file: ${fileUrl}`);
          } else {
            console.log(`[FieldForm] Successfully deleted unsaved image: ${fileUrl}`);
          }
        } catch (error) {
          console.error(`[FieldForm] Error deleting file ${fileUrl}:`, error);
        }
      });

      await Promise.all(deletePromises);
      console.log('[FieldForm] Cleanup completed - only new images deleted');
    } catch (error) {
      console.error('[FieldForm] Error during cleanup:', error);
    }
  };

  const handleBack = () => {
    // Check for unsaved images
    if (hasUnsavedImages()) {
      setPendingNavigation('back');
      setShowUnsavedModal(true);
      return;
    }

    const sections = ['field-details', 'upload-images', 'pricing-availability', 'booking-rules'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1]);
    }
  };

  const handleNext = (newFieldId?: string | null) => {
    const sections = ['field-details', 'upload-images', 'pricing-availability', 'booking-rules'];
    const currentIndex = sections.indexOf(activeSection);

    // Use the new ID if provided (happens on first save), otherwise use existing state
    const effectiveFieldId = newFieldId || fieldId;

    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];

      // If we have a fieldId (new or existing), ensure URL is synced to 'edit' mode with that ID
      if (effectiveFieldId) {
        const currentQuery = { ...router.query };
        router.push({
          pathname: router.pathname,
          query: {
            ...currentQuery,
            edit: 'true',
            fieldId: effectiveFieldId,
            step: nextSection,
            addNew: undefined
          }
        }, undefined, { shallow: true });
      }

      setActiveSection(nextSection);
    } else if (currentIndex === sections.length - 1) {
      // On last tab (booking-rules), redirect to preview page with the current field ID
      const finalId = effectiveFieldId || fieldId;
      if (finalId) {
        router.push(`/field-owner/preview?fieldId=${finalId}`);
      } else {
        router.push('/field-owner/preview');
      }
    }
  };

  // Handle sidebar section change with unsaved image check
  const handleSectionChange = (sectionId: string) => {
    // Check for unsaved images when leaving upload-images section
    if (activeSection === 'upload-images' && sectionId !== 'upload-images' && hasUnsavedImages()) {
      setPendingNavigation(sectionId);
      setShowUnsavedModal(true);
      return;
    }

    setActiveSection(sectionId);

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

  // Modal handlers
  const handleSaveUnsavedImages = async () => {
    setShowUnsavedModal(false);
    // Save the progress first
    await handleSaveProgress();
    // Navigation will happen in onSuccess callback via handleNext
  };

  const handleDiscardUnsavedImages = async () => {
    setShowUnsavedModal(false);

    // Delete unsaved images
    await deleteUnsavedImages();

    // Revert to saved images
    setFormData(prev => ({
      ...prev,
      images: savedImagesRef.current
    }));

    // Proceed with navigation
    if (pendingNavigation === 'back') {
      const sections = ['field-details', 'upload-images', 'pricing-availability', 'booking-rules'];
      const currentIndex = sections.indexOf(activeSection);
      if (currentIndex > 0) {
        setActiveSection(sections[currentIndex - 1]);
      }
    } else if (pendingNavigation) {
      setActiveSection(pendingNavigation);
    }

    setPendingNavigation(null);
  };

  const handleCloseUnsavedModal = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
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

  // Wait for router to be ready before making any decisions
  if (!router.isReady) {
    return <FieldOwnerDashboardSkeleton />;
  }

  // Show loading skeleton while auth state is being determined
  // This prevents incorrect redirects during navigation/hydration
  if (isAuthLoading) {
    return <FieldOwnerDashboardSkeleton />;
  }

  if (user === null && typeof window !== 'undefined') {
    // Check if we have auth token in localStorage - if yes, user is likely authenticated
    const hasAuthToken = localStorage.getItem('authToken');
    if (hasAuthToken) {
      // User is likely authenticated, just loading - show skeleton
      return <FieldOwnerDashboardSkeleton />;
    }
  }

  // Check if user is authenticated and is a field owner
  // NOTE: This check is redundant as parent component (FieldOwnerHome) handles auth
  // Removing strict redirect to avoid race conditions during loading
  if (!user || user.role !== 'FIELD_OWNER') {
    console.log('[FieldOwnerDashboard] Missing auth/role but creating/editing allowed per parent', { user, role: user?.role });
    // Don't redirect here, just render (or return null if critical data missing, but let parent decide)
    // if (typeof window !== 'undefined') {
    //   router.push('/login');
    // }
    // return null;
  }

  // Only show loading skeleton when actually fetching data (not in addNew mode)
  if (fetchingField && !isAddNewMode) {
    return <FieldOwnerDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-light py-4 sm:py-6 lg:py-8 mt-20 sm:mt-24 lg:mt-32">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
        {/* Page Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 lg:mb-8">
          {/* Show back button in edit mode to go back to my-fields */}
          {isEditMode && (
            <BackButton
              size='lg'
              onClick={() => router.push('/field-owner/my-fields')}
            />
          )}
          {/* Show back button in add mode too */}
          {!isEditMode && (
            <BackButton
              size='lg'
              onClick={() => {
                if (activeSection === 'field-details') {
                  // If on first step of adding, go back to dashboard
                  router.push('/field-owner/my-fields');
                } else {
                  // Otherwise go entirely back (or could use handleBack for internal nav?)
                  // The bottom "Back" button handles internal nav. This top button usually means "Exit"
                  router.push('/field-owner/my-fields');
                }
              }}
            />
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-dark-green font-sans">
            {isEditMode ? 'Edit Your Field' : 'Add Your Field'}
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar - Keep on left for large screens */}
          <Sidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            fieldData={isAddNewMode ? null : fieldData}
            canNavigateTo={canNavigateTo}
          />

          {/* Form Content */}
          <div id="form-content" className="flex-1 bg-white rounded-2xl p-4 sm:p-6 lg:p-10 scroll-mt-4">
            {renderSection()}

            {/* Action Buttons - Keep original design */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 lg:mt-10">
              {activeSection !== 'field-details' && !isFirstTimeFieldOwner && (
                <button
                  onClick={handleBack}
                  className="w-full sm:flex-1 py-3 px-4 rounded-full border-2 border-green text-green font-semibold font-sans transition-colors hover:bg-gray-50 order-2 sm:order-1 text-sm sm:text-base"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleSaveProgress}
                disabled={isLoading || (activeSection === 'upload-images' && (formData.images?.length || 0) < 4)}
                className={`w-full py-3 px-4 rounded-full font-semibold font-sans transition-opacity order-1 text-sm sm:text-base ${(activeSection === 'field-details' || isFirstTimeFieldOwner) ? '' : 'sm:flex-1 sm:order-2'} ${(isLoading || (activeSection === 'upload-images' && (formData.images?.length || 0) < 4)) ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-green text-white hover:opacity-90'}`}
              >
                {isLoading ?
                  'Saving...'
                  : activeSection === 'upload-images' && (formData.images?.length || 0) < 4
                    ? `Upload ${4 - (formData.images?.length || 0)} More`
                    : activeSection === 'booking-rules'
                      ? (isCurrentSectionCompleted() ? 'Update & Preview' : 'Save & Preview')
                      : (isCurrentSectionCompleted() ? 'Update & Next' : 'Save & Next')
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Images Modal */}
      <UnsavedImagesModal
        isOpen={showUnsavedModal}
        onClose={handleCloseUnsavedModal}
        onSave={handleSaveUnsavedImages}
        onDiscard={handleDiscardUnsavedImages}
        imageCount={formData.images?.length || 0}
        hasMinimumImages={(formData.images?.length || 0) >= 4}
      />
    </div>
  );
}
