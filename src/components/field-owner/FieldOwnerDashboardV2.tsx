import React, { useState, useEffect } from 'react';
import { CustomSelect } from '@/components/ui/custom-select';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { Input } from '@/components/ui/input';
import { Upload, X, CheckCircle, Image, AlertCircle, Lock } from 'lucide-react';
import { s3Uploader, UploadProgress } from '@/utils/s3Upload';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

// Types
interface StepStatus {
  fieldDetails: boolean;
  uploadImages: boolean;
  pricingAvailability: boolean;
  bookingRules: boolean;
}

interface FieldFormData {
  // Field Details
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
  amenities: Record<string, boolean>;
  streetAddress: string;
  apartment: string;
  city: string;
  county: string;
  postalCode: string;
  country: string;
  
  // Images
  images: string[];
  
  // Pricing
  pricePerHour: string;
  bookingDuration: string;
  weekendPrice: string;
  instantBooking: boolean;
  requireDeposit: boolean;
  
  // Rules & Policies
  rules: string;
  policies: string;
  
  // Metadata
  stepStatus: StepStatus;
  submissionStatus: 'DRAFT' | 'SUBMITTED' | 'ACTIVE' | 'INACTIVE';
  fieldId?: string;
}

// Sidebar Navigation Component
function Sidebar({ 
  activeSection, 
  onSectionChange, 
  stepStatus,
  isLoading 
}: { 
  activeSection: string; 
  onSectionChange: (sectionId: string) => void;
  stepStatus: StepStatus;
  isLoading: boolean;
}) {
  const sections = [
    { id: 'field-details', label: 'Field Details', key: 'fieldDetails' as keyof StepStatus },
    { id: 'upload-images', label: 'Upload Images', key: 'uploadImages' as keyof StepStatus },
    { id: 'pricing-availability', label: 'Pricing & Availability', key: 'pricingAvailability' as keyof StepStatus },
    { id: 'booking-rules', label: 'Booking Rules & Policies', key: 'bookingRules' as keyof StepStatus }
  ];

  const currentIndex = sections.findIndex(s => s.id === activeSection);

  const isSectionAccessible = (index: number) => {
    if (index === 0) return true; // First section always accessible
    
    // Check if all previous sections are completed
    for (let i = 0; i < index; i++) {
      if (!stepStatus[sections[i].key]) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="w-[432px] bg-white rounded-2xl p-8 h-fit">
      <h2 className="text-xl font-semibold mb-2 text-dark-green font-sans">
        Add your field by following these quick steps.
      </h2>
      
      {isLoading && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-sans">Saving your progress...</p>
        </div>
      )}
      
      <div className="mt-8 space-y-4">
        {sections.map((section, index) => {
          const isAccessible = isSectionAccessible(index);
          const isCompleted = stepStatus[section.key];
          const isCurrent = activeSection === section.id;
          
          return (
            <div key={section.id}>
              <button
                onClick={() => isAccessible && onSectionChange(section.id)}
                disabled={!isAccessible}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  isCurrent 
                    ? 'bg-green-50 border-2 border-green' 
                    : isAccessible 
                      ? 'hover:bg-gray-50 border-2 border-transparent'
                      : 'opacity-50 cursor-not-allowed border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className={`font-medium font-sans ${
                      isCurrent 
                        ? 'text-dark-green' 
                        : isAccessible 
                          ? 'text-gray-text' 
                          : 'text-gray-400'
                    }`}
                  >
                    {section.label}
                  </span>
                  {!isAccessible && (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green" />
                  )}
                  {!isCompleted && index > 0 && !isSectionAccessible(index) && (
                    <span className="text-xs text-gray-400 font-sans">
                      Complete previous steps
                    </span>
                  )}
                </div>
              </button>
              
              {index < sections.length - 1 && <div className="h-px bg-gray-200 mt-2" />}
            </div>
          );
        })}
      </div>
      
      {/* Progress Indicator */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-sans">Overall Progress</span>
          <span className="font-sans">
            {Object.values(stepStatus).filter(Boolean).length} / {sections.length} steps
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.values(stepStatus).filter(Boolean).length / sections.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Field Details Component with Validation
function FieldDetails({ formData, setFormData, onValidation }: any) {
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

  // Validate field details
  const validateStep = () => {
    const required = [
      'fieldName', 'fieldSize', 'terrainType', 'fenceType', 
      'fenceSize', 'surfaceType', 'maxDogs', 'description',
      'openingDays', 'startTime', 'endTime', 'streetAddress',
      'city', 'county', 'postalCode', 'country'
    ];

    const isValid = required.every(field => {
      const value = formData[field];
      return value && value.toString().trim() !== '';
    });

    onValidation(isValid);
    return isValid;
  };

  useEffect(() => {
    validateStep();
  }, [formData]);

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
          Basic Info <span className="text-red">*</span>
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Field Name <span className="text-red">*</span>
            </label>
            <Input
              type="text"
              name="fieldName"
              value={formData.fieldName}
              onChange={handleInputChange}
              placeholder="Enter field name"
              className={`py-3 border ${!formData.fieldName ? 'border-red' : 'border-gray-border'} focus:border-green font-sans`}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Field Size <span className="text-red">*</span>
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

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Terrain Type <span className="text-red">*</span>
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

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Fence Type <span className="text-red">*</span>
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
                Fence Size <span className="text-red">*</span>
              </label>
              <CustomSelect
                name="fenceSize"
                value={formData.fenceSize}
                onChange={(value) => handleInputChange({ target: { name: 'fenceSize', value } } as any)}
                placeholder="Select fence size"
                options={[
                  {value:'under-1-metre',label: 'Under 1 metre (3 ft)'},
                  {value:'1-2-metres', label: '1-2 metres (3-6 ft)'},
                  {value:'2-3-metres', label: '2-3 metres (6-9 ft)'},
                  {value:'3-4-metres', label: '3-4 metres (9-12 ft)'},
                  {value:'4-5-metres', label: '4-5 metres (12-15 ft)'},
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Surface Type <span className="text-red">*</span>
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
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Max Number of Dogs <span className="text-red">*</span>
              </label>
              <Input
                type="number"
                name="maxDogs"
                value={formData.maxDogs}
                onChange={handleInputChange}
                placeholder="Enter max number"
                min="1"
                className={`py-3 ${!formData.maxDogs ? 'border-red' : 'border-gray-border'} focus:border-green font-sans`}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rest of field details sections... */}
      {/* Description, Opening Hours, Amenities, Address sections follow similar pattern */}
    </div>
  );
}

// Main Dashboard Component
export default function FieldOwnerDashboardV2() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('field-details');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FieldFormData>({
    // Initialize all fields
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
    country: 'UK',
    images: [],
    pricePerHour: '',
    bookingDuration: '30min',
    weekendPrice: '',
    instantBooking: false,
    requireDeposit: false,
    rules: '',
    policies: '',
    stepStatus: {
      fieldDetails: false,
      uploadImages: false,
      pricingAvailability: false,
      bookingRules: false
    },
    submissionStatus: 'DRAFT'
  });

  // Load existing field data if editing
  useEffect(() => {
    loadFieldData();
  }, [session]);

  const loadFieldData = async () => {
    try {
      const token = session?.accessToken || localStorage.getItem('currentUser')?.token;
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fields/owner/field`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.field) {
          setFormData(data.field);
        }
      }
    } catch (error) {
      console.error('Error loading field data:', error);
    }
  };

  const handleSectionChange = async (newSection: string) => {
    // Save current section progress before switching
    await saveProgress();
    setActiveSection(newSection);
  };

  const saveProgress = async () => {
    setIsSaving(true);
    try {
      const token = session?.accessToken || localStorage.getItem('currentUser')?.token;
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fields/save-progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.fieldId && !formData.fieldId) {
          setFormData(prev => ({ ...prev, fieldId: data.fieldId }));
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStepValidation = (stepKey: keyof StepStatus, isValid: boolean) => {
    setFormData(prev => ({
      ...prev,
      stepStatus: {
        ...prev.stepStatus,
        [stepKey]: isValid
      }
    }));
  };

  const handleSubmit = async () => {
    // Check if all steps are completed
    const allStepsCompleted = Object.values(formData.stepStatus).every(status => status);
    
    if (!allStepsCompleted) {
      alert('Please complete all steps before submitting');
      return;
    }

    setIsSaving(true);
    try {
      const token = session?.accessToken || localStorage.getItem('currentUser')?.token;
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fields/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          submissionStatus: 'SUBMITTED'
        })
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error submitting field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    const sections = ['field-details', 'upload-images', 'pricing-availability', 'booking-rules'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex < sections.length - 1) {
      handleSectionChange(sections[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const sections = ['field-details', 'upload-images', 'pricing-availability', 'booking-rules'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1]);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'field-details':
        return (
          <FieldDetails 
            formData={formData} 
            setFormData={setFormData}
            onValidation={(isValid: boolean) => handleStepValidation('fieldDetails', isValid)}
          />
        );
      // Add other sections here
      default:
        return null;
    }
  };

  const allStepsCompleted = Object.values(formData.stepStatus).every(status => status);
  const isLastStep = activeSection === 'booking-rules';

  return (
    <div className="min-h-screen bg-light py-8 mt-32">
      <div className="container mx-auto px-20">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="w-12 h-12 bg-cream rounded-full flex items-center justify-center hover:bg-cream/80 transition-colors"
            >
              <img src='/back.svg' alt='arrow-left' className='w-6 h-6' />
            </button>
            <h1 className="text-3xl font-semibold text-dark-green font-sans">
              {formData.fieldId ? 'Edit Your Field' : 'Add Your Field'}
            </h1>
          </div>
          
          {isSaving && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <div className="w-4 h-4 border-2 border-green border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-green font-sans">Saving...</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
            stepStatus={formData.stepStatus}
            isLoading={isSaving}
          />

          {/* Form Content */}
          <div className="flex-1 bg-white rounded-2xl p-10">
            {renderSection()}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-10">
              <button
                onClick={handleBack}
                disabled={activeSection === 'field-details'}
                className="flex-1 py-3 rounded-full border-2 border-green text-green font-semibold font-sans transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              
              {isLastStep && allStepsCompleted ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-full bg-green text-white font-semibold font-sans transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Submit Field
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!formData.stepStatus[activeSection === 'field-details' ? 'fieldDetails' : 
                            activeSection === 'upload-images' ? 'uploadImages' :
                            activeSection === 'pricing-availability' ? 'pricingAvailability' : 'bookingRules']}
                  className="flex-1 py-3 rounded-full bg-green text-white font-semibold font-sans transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save & Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}