import React, { useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';
import mockData from '@/data/mock-data.json';
import { DocumentUploader } from '@/components/ui/image-grid-uploader';
import { UserLayout } from '@/components/layout/UserLayout';
import { useSubmitFieldClaim } from '@/hooks/useFieldClaim';
import { ClaimSuccessModal } from '@/components/modal/ClaimSuccessModal';
import BackButton from '@/components/common/BackButton';

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
    isLegalOwner: null
  });
  
  const [phoneCode, setPhoneCode] = useState('+44');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const submitClaimMutation = useSubmitFieldClaim();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilesChange = (files: string[]) => {
    setUploadedFiles(files);
  };

  // Get field data based on field_id
  const field = field_id ? mockData.fields.find(f => f.id === field_id) : null;

  const handleSubmit = async () => {
    // Validate form
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.isLegalOwner === null) {
      alert('Please indicate if you are the legal owner');
      return;
    }

    if (uploadedFiles.length === 0) {
      alert('Please upload at least one ownership document');
      return;
    }

    // Check if all files are uploaded
    // Files are already URLs in the new component

    // Prepare data for submission
    const submitData = {
      fieldId: field_id as string,
      fullName: formData.fullName,
      email: formData.email,
      phoneCode,
      phoneNumber: formData.phoneNumber,
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

  return (
    <UserLayout>
      <div className="min-h-screen bg-light">
   

      {/* Main Content */}
      <main className="container mx-auto mt-16 md:mt-[100px]  py-4 lg:py-10">
        {/* Back Button and Title */}
         
            <BackButton size="lg" showLabel={true}  label="Back to Field" />
            
          
        

        {/* Form Container */}
        <div className="grid lg:grid-cols-2">
          {/* Left Column - Personal Information */}
          <div className="bg-white rounded-l-2xl p-6 lg:p-8 ">
            <h3 className="text-xl font-bold text-dark-green mb-2">Personal Information</h3>
            <p className="text-[#6B737D] text-sm mb-6">
              We'll use this information to contact you and verify your request.
            </p>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-dark-green mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="py-3 border-gray-200 focus:border-[#3A6B22] focus:ring-[#3A6B22]"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-dark-green mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="py-3 border-gray-200 focus:border-[#3A6B22] focus:ring-[#3A6B22]"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-dark-green mb-2">
                  Phone Number
                </label>

                {/* Wrapper with focus-within */}
                <div className="flex rounded-[76px] border border-gray-200 bg-white focus-within:border-[#3A6B22] focus-within:ring-1 focus-within:ring-[#3A6B22] transition-colors">
                  <select
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="px-3 py-3 rounded-l-[76px] border-none  bg-transparent focus:outline-none"
                  >
                    <option value="+44">+44</option>
                    <option value="+1">+1</option>
                    <option value="+91">+91</option>
                  </select>

                  <div className="h-10 my-auto w-px bg-gray-300"></div>

                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="flex-1 py-3 border-none rounded-r-[76px] focus:ring-0 border-border-none focus:outline-none bg-transparent"
                  />
                </div>
              </div>


              {/* Legal Owner Question */}
              <div>
                <label className="block text-sm font-medium text-dark-green mb-3">
                  Are you the legal owner of this field?
                </label>
                <div className="flex gap-3 w-1/2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isLegalOwner: true }))}
                    className={`flex-1 py-3 px-4 rounded-[14px] font-medium transition-all ${
                      formData.isLegalOwner === true
                        ? 'bg-[#8FB366] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isLegalOwner: false }))}
                    className={`flex-1 py-3 px-4 rounded-[14px] font-medium transition-all ${
                      formData.isLegalOwner === false
                        ? 'bg-gray-400 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Ownership Proof */}
          <div className="bg-white rounded-r-2xl p-6 lg:p-8">
            <h3 className="text-xl font-bold text-dark-green mb-2">Ownership Proof</h3>
            <p className="text-[#6B737D] text-sm mb-6">
              We require ownership evidence to ensure the field is genuine & secure.
            </p>
            <DocumentUploader
              value={uploadedFiles}
              onChange={handleFilesChange}
              uploadText="Upload ID Here"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center py-4 bg-white gap-4 ">
          <button 
            onClick={() => router.push(`/fields/${field_id}`)}
            disabled={submitClaimMutation.isPending}
            className="px-8 py-3 border border-gray-300 rounded-full font-semibold text-dark-green hover:bg-gray-50 transition-colors min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitClaimMutation.isPending}
            className="px-8 py-3 bg-[#3A6B22] text-white rounded-full font-semibold hover:bg-[#2D5A1B] transition-colors min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitClaimMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Claim'
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