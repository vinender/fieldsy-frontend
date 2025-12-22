import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';
import { DocumentUploader } from '@/components/ui/image-grid-uploader';
import { UserLayout } from '@/components/layout/UserLayout';
import { useSubmitFieldClaim } from '@/hooks/useFieldClaim';
import { ClaimSuccessModal } from '@/components/modal/ClaimSuccessModal';
import BackButton from '@/components/common/BackButton';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';

const ClaimFieldPage = () => {
  const router = useRouter();
  const { field_id } = router.query;
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
    isLegalOwner: boolean | null;
  }>({
    fullName: '',
    email: '',
    phoneNumber: '',
    isLegalOwner: true
  });

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    isLegalOwner?: string;
    documents?: string;
  }>({});
  const [touched, setTouched] = useState<{
    fullName?: boolean;
    email?: boolean;
    phoneNumber?: boolean;
    isLegalOwner?: boolean;
    documents?: boolean;
  }>({});
  const [showValidationError, setShowValidationError] = useState(false);
  const submitClaimMutation = useSubmitFieldClaim();

  // Field data state
  const [field, setField] = useState<any>(null);
  const [isLoadingField, setIsLoadingField] = useState(true);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Fetch field data and check claim eligibility
  useEffect(() => {
    const fetchFieldAndCheckEligibility = async () => {
      if (!field_id) return;

      setIsLoadingField(true);
      setFieldError(null);

      try {
        // Fetch field data
        const fieldResponse = await axiosClient.get(`/fields/${field_id}`);
        const fieldData = fieldResponse.data?.data || fieldResponse.data;
        setField(fieldData);

        // Check claim eligibility using the backend endpoint
        const eligibilityResponse = await axiosClient.get(`/claims/check-eligibility/${field_id}`);
        const eligibility = eligibilityResponse.data;

        if (!eligibility.canClaim) {
          setFieldError(eligibility.reason || 'This field cannot be claimed.');
          toast.error(eligibility.reason || 'This field cannot be claimed.');
        }
      } catch (error: any) {
        console.error('Error fetching field or checking eligibility:', error);
        setFieldError('Failed to load field information.');
        toast.error('Failed to load field information.');
      } finally {
        setIsLoadingField(false);
      }
    };

    fetchFieldAndCheckEligibility();
  }, [field_id]);
  

  // Cleanup function to delete uploaded files from S3
  const deleteUploadedFiles = async () => {
    if (uploadedFiles.length === 0) return;

    try {
      console.log('[ClaimForm] Deleting uploaded files:', uploadedFiles);

      // Call delete API for each uploaded file
      const deletePromises = uploadedFiles.map(async (fileUrl) => {
        try {
          const response = await fetch('/api/upload/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileUrl }),
          });

          if (!response.ok) {
            console.error(`[ClaimForm] Failed to delete file: ${fileUrl}`);
          } else {
            console.log(`[ClaimForm] Successfully deleted: ${fileUrl}`);
          }
        } catch (error) {
          console.error(`[ClaimForm] Error deleting file ${fileUrl}:`, error);
        }
      });

      await Promise.all(deletePromises);
      console.log('[ClaimForm] Cleanup completed');
    } catch (error) {
      console.error('[ClaimForm] Error during cleanup:', error);
    }
  };

  // Handle back button click with cleanup
  const handleBackClick = async () => {
    await deleteUploadedFiles();
    router.back();
  };

  // Handle cancel button click with cleanup
  const handleCancelClick = async () => {
    await deleteUploadedFiles();
    router.push(`/fields/${field_id}`);
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    // UK phone number validation (without country code)
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateField = (name: string, value: any) => {
    let error = '';
    
    switch (name) {
      case 'fullName':
        if (!value || value.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          error = 'Full name must be less than 100 characters';
        }
        break;
      
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      
      case 'phoneNumber':
        if (!value) {
          error = 'Phone number is required';
        } else if (!validatePhoneNumber(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      
      case 'isLegalOwner':
        if (value === null) {
          error = 'Please indicate if you are the legal owner';
        }
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    // Validate all fields
    newErrors.fullName = validateField('fullName', formData.fullName);
    newErrors.email = validateField('email', formData.email);
    newErrors.phoneNumber = validateField('phoneNumber', formData.phoneNumber);
    newErrors.isLegalOwner = validateField('isLegalOwner', formData.isLegalOwner);
    
    // Validate document upload
    if (uploadedFiles.length === 0) {
      newErrors.documents = 'Please upload at least one ownership document';
    }
    
    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key as keyof typeof newErrors]) {
        delete newErrors[key as keyof typeof newErrors];
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFilesChange = (files: string[]) => {
    setUploadedFiles(files);
    
    // Clear document error when files are uploaded
    if (files.length > 0 && errors.documents) {
      setErrors(prev => ({
        ...prev,
        documents: ''
      }));
    }
    
    setTouched(prev => ({
      ...prev,
      documents: true
    }));
  };

  const handleSubmit = async () => {
    // Check if there's an error (field cannot be claimed)
    if (fieldError) {
      toast.error(fieldError);
      return;
    }

    // Mark all fields as touched to show validation errors
    setTouched({
      fullName: true,
      email: true,
      phoneNumber: true,
      isLegalOwner: true,
      documents: true
    });

    // Validate form
    const isValid = validateForm();
    
    if (!isValid) {
      setShowValidationError(true);
      // Scroll to first error
      const firstErrorElement = document.querySelector('.error-field');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Hide validation error message after 5 seconds
      setTimeout(() => setShowValidationError(false), 5000);
      return;
    }

    // Prepare data for submission
    const submitData = {
      fieldId: field_id as string,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phoneCode: '+44',
      phoneNumber: formData.phoneNumber.trim(),
      isLegalOwner: formData.isLegalOwner!,
      documents: uploadedFiles
    };

    try {
      await submitClaimMutation.mutateAsync(submitData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting claim:', error);
      // Error is already handled by the mutation hook (toast notification)
    }
  };

  const handleOwnershipChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, isLegalOwner: value }));
    setTouched(prev => ({ ...prev, isLegalOwner: true }));
    
    // Clear error when selection is made
    if (errors.isLegalOwner) {
      setErrors(prev => ({ ...prev, isLegalOwner: '' }));
    }
  };

  // Show loading state
  if (isLoadingField) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-light flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading field information...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Show error if field cannot be claimed
  if (fieldError) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-light">
          <main className="w-full mt-16 md:mt-[100px] py-4 lg:py-10 px-4 sm:px-6 lg:px-8 xl:px-20">
            <BackButton size="lg" showLabel={true} label="Back to Field" onClick={() => router.push(`/fields/${field_id}`)} />

            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-red-800 mb-2">
                  Cannot Claim This Field
                </h2>
                <p className="text-red-600 mb-6">
                  {fieldError}
                </p>
                <button
                  onClick={() => router.push(`/fields/${field_id}`)}
                  className="px-6 py-3 bg-[#3A6B22] text-white rounded-full font-semibold hover:bg-[#2D5A1B] transition-colors"
                >
                  Back to Field Details
                </button>
              </div>
            </div>
          </main>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-light">


      {/* Main Content */}
      <main className="w-full mt-16 md:mt-[100px]  py-4 lg:py-10 px-4 sm:px-6 lg:px-8 xl:px-20">
        {/* Back Button and Title */}

            <BackButton size="lg" showLabel={true} label="Back to Field" onClick={handleBackClick} />

        {/* Validation Error Alert */}
        {showValidationError && (
          <div className="mt-4 mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Please fix the following errors:</p>
              <ul className="mt-2 space-y-1">
                {Object.entries(errors).map(([key, value]) => value && (
                  <li key={key} className="text-sm text-red-600">• {value}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="grid lg:grid-cols-2 border-b">
          {/* Left Column - Personal Information */}
          <div className="bg-white rounded-l-2xl p-6 lg:p-8 ">
            <h3 className="text-xl font-bold text-dark-green mb-2">Personal Information</h3>
            <p className="text-[#6B737D] text-sm mb-6">
              We'll use this information to contact you and verify your request.
            </p>

            <div className="space-y-5">
              {/* Full Name */}
              <div className={errors.fullName && touched.fullName ? 'error-field' : ''}>
                <label className="block text-sm font-medium text-dark-green mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Enter full name"
                  className={`py-3 ${
                    errors.fullName && touched.fullName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-[#3A6B22] focus:ring-[#3A6B22]'
                  }`}
                />
                {errors.fullName && touched.fullName && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className={errors.email && touched.email ? 'error-field' : ''}>
                <label className="block text-sm font-medium text-dark-green mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Enter email address"
                  className={`py-3 ${
                    errors.email && touched.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-[#3A6B22] focus:ring-[#3A6B22]'
                  }`}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className={errors.phoneNumber && touched.phoneNumber ? 'error-field' : ''}>
                <label className="block text-sm font-medium text-dark-green mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>

                {/* Wrapper with focus-within */}
                <div className={`flex rounded-[76px] border bg-white transition-colors ${
                  errors.phoneNumber && touched.phoneNumber
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500'
                    : 'border-gray-200 focus-within:border-[#3A6B22] focus-within:ring-1 focus-within:ring-[#3A6B22]'
                }`}>
                  <div className="px-4 py-3 flex items-center text-gray-700 font-medium">
                    +44
                  </div>

                  <div className="h-10 my-auto w-px bg-gray-300"></div>

                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="Enter phone number"
                    className="flex-1 py-3 border-none rounded-r-[76px] focus:ring-0 border-border-none focus:outline-none bg-transparent"
                  />
                </div>
                {errors.phoneNumber && touched.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>


              {/* Legal Owner Question */}
              <div className={errors.isLegalOwner && touched.isLegalOwner ? 'error-field' : ''}>
                <label className="block text-sm font-medium text-dark-green mb-3">
                  Are you the legal owner of this field? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 w-1/2">
                  <button
                    type="button"
                    onClick={() => handleOwnershipChange(true)}
                    className={`flex-1 py-3 px-4 rounded-[14px] font-medium transition-all ${
                      formData.isLegalOwner === true
                        ? 'bg-[#8FB366] text-white'
                        : errors.isLegalOwner && touched.isLegalOwner
                        ? 'bg-red-50 text-gray-600 hover:bg-red-100 border border-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOwnershipChange(false)}
                    className={`flex-1 py-3 px-4 rounded-[14px] font-medium transition-all ${
                      formData.isLegalOwner === false
                        ? 'bg-gray-400 text-white'
                        : errors.isLegalOwner && touched.isLegalOwner
                        ? 'bg-red-50 text-gray-600 hover:bg-red-100 border border-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
                {errors.isLegalOwner && touched.isLegalOwner && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.isLegalOwner}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Ownership Proof */}
          <div className="bg-white rounded-r-2xl p-6 lg:p-8">
            <h3 className="text-xl font-bold text-dark-green mb-2">
              Ownership Proof <span className="text-red-500">*</span>
            </h3>
            <p className="text-[#6B737D] text-sm mb-6">
              We require ownership evidence to ensure the field is genuine & secure.
            </p>
            <div className={errors.documents && touched.documents ? 'error-field' : ''}>
              <DocumentUploader
                value={uploadedFiles}
                onChange={handleFilesChange}
                uploadText="Upload Ownership Documents"
              />
              {errors.documents && touched.documents && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.documents}
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Acceptable documents: Property deed, Land registry document, Lease agreement, or Council tax bill
                  </p>
                </div>
              )}
              {uploadedFiles.length > 0 && !errors.documents && (
                <p className="mt-2 text-sm text-green flex items-center gap-1">
                  ✓ {uploadedFiles.length} document{uploadedFiles.length > 1 ? 's' : ''} uploaded successfully
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center py-4 bg-white gap-4 ">
          <button
            onClick={handleCancelClick}
            disabled={submitClaimMutation.isPending}
            className="px-8 py-3 border border-gray-300 rounded-full font-semibold text-dark-green hover:bg-gray-50 transition-colors min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitClaimMutation.isPending}
            className="px-8 py-3 bg-[#3A6B22] text-white rounded-full font-semibold hover:bg-[#2D5A1B] transition-colors min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative group"
            title={Object.keys(errors).length > 0 ? 'Please fix all errors before submitting' : ''}
          >
            {submitClaimMutation.isPending ? (
              <>
                <Spinner size="sm" inline />
                Submitting...
              </>
            ) : (
              <>
                Submit Claim
                {Object.keys(errors).length > 0 && touched.fullName && (
                  <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Please complete all required fields
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </main>

  
    </div>
    
    {/* Success Modal */}
    <ClaimSuccessModal
      isOpen={showSuccessModal}
      onClose={() => {
        setShowSuccessModal(false);
        router.push(`/fields/${field_id}`);
      }}
      fieldName={field?.name}
      fieldId={field_id as string}
    />
    </UserLayout>
  );
};

export default ClaimFieldPage;