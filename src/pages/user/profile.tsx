import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Check,
  ChevronDown,
  Upload
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import ChangePasswordSidebar from '@/components/sidebar/ChangePasswordSidebar';
import { Input } from '@/components/ui/input';
import { useProfile, useUpdateProfile, useUploadProfileImage, useDeleteProfileImage } from '@/hooks/useProfile';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { ProfileSkeleton } from '@/components/skeletons/SkeletonComponents';
import { DeleteProfileImageModal } from '@/components/modal/DeleteProfileImageModal';

const MyProfilePage = () => {
  const router = useRouter();
  const [isPasswordSidebarOpen, setIsPasswordSidebarOpen] = useState(false);
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  
  // Fetch profile data
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadImageMutation = useUploadProfileImage();
  const deleteImageMutation = useDeleteProfileImage();
  console.log('profile',profile?.image)
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+44',
    phoneNumber: '',
    bio: ''
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.name || '',
        email: profile.email || '',
        countryCode: '+44',
        phoneNumber: profile.phone?.replace('+44', '').trim() || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    // For phone number, only allow digits
    if (field === 'phoneNumber') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      const updates: any = {};
      
      if (formData.fullName !== profile?.name) {
        updates.name = formData.fullName;
      }
      
      if (formData.phoneNumber && formData.phoneNumber !== profile?.phone?.replace('+44', '').trim()) {
        updates.phone = `${formData.countryCode}${formData.phoneNumber}`;
      }
      
      if (formData.bio !== profile?.bio) {
        updates.bio = formData.bio;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateProfileMutation.mutateAsync(updates);
      } else {
        toast.info('No changes to update');
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type - only allow images
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload only image files (JPEG, PNG, GIF, WebP, or SVG)');
        event.target.value = ''; // Clear the input
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        event.target.value = ''; // Clear the input
        return;
      }

      try {
        await uploadImageMutation.mutateAsync(file);
      } catch (error) {
        // Error handled by mutation
      } finally {
        // Clear the input to allow uploading the same file again
        event.target.value = '';
      }
    }
  };

  const handleDeleteImage = () => {
    setShowDeleteImageModal(true);
  };

  const confirmDeleteImage = async () => {
    try {
      await deleteImageMutation.mutateAsync();
      setShowDeleteImageModal(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffcf3] py-6 sm:py-10 mt-16 xl:mt-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#fffcf3] py-6 sm:py-10 mt-16 xl:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 text-center">
          <p className="text-red-500 text-sm sm:text-base">Failed to load profile. Please try again.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-[#3A6B22] text-white text-sm sm:text-base rounded-full hover:bg-[#2e5519]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#fffcf3] py-6 sm:py-10 mt-16 xl:mt-24">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-20">
        {/* Page Title with Back Button */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f8f1d7] rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215]" />
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-[29px] font-semibold text-[#192215]">My Profile</h1>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Left Column - Profile Details */}
          <div className="w-full lg:w-[408px] bg-white rounded-[14px] border border-[#19221533] p-4 sm:p-6 lg:p-8 h-fit">
            <h2 className="text-base sm:text-lg font-semibold text-[#192215] mb-4">Profile details</h2>
            
            {/* User Info */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              {profile?.image ? (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#3A6B22] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.image}
                    alt={profile?.name || 'User'}
                    className="w-full h-full rounded-full object-cover absolute inset-0"
                    onError={(e) => {
                      // Hide broken image
                      e.currentTarget.style.display = 'none';
                      // Show fallback initial
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('.fallback-initial')) {
                        const initial = document.createElement('span');
                        initial.className = 'fallback-initial text-white text-lg sm:text-xl font-semibold relative z-10';
                        initial.textContent = profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U';
                        parent.appendChild(initial);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#3A6B22] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg sm:text-xl font-semibold">
                    {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-base sm:text-[18px] font-semibold text-[#323232] truncate">{profile.name || 'User'}</h3>
                <p className="text-xs sm:text-sm text-[#323232] truncate">{profile.email}</p>
              </div>
            </div>

            <div className="h-px bg-[#e2e2e2] my-4" />

            {/* More Info Section */}
            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-bold text-[#192215]">More info</h4>
              
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-start sm:items-center gap-3">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215] flex-shrink-0" />
                  <span className="text-sm sm:text-base text-[#8d8d8d] break-all">{profile.email}</span>
                </div>
                
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215] flex-shrink-0" />
                    <span className="text-sm sm:text-base text-[#8d8d8d]">{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* About Me Section */}
            {profile.bio && (
              <div className="mt-6">
                <h4 className="text-xs sm:text-sm font-bold text-[#192215] mb-3">About me</h4>
                <p className="text-sm sm:text-base text-[#8d8d8d] leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Edit Profile */}
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-[29px] font-semibold text-[#192215] mb-4 sm:mb-6">Edit profile</h2>

            {/* Profile Image Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
              {profile?.image ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#3A6B22] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.image}
                    alt={profile.name || 'User'}
                    className="w-full h-full rounded-full object-cover absolute inset-0"
                    onError={(e) => {
                      // Hide broken image
                      e.currentTarget.style.display = 'none';
                      // Show fallback initial
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('.fallback-initial')) {
                        const initial = document.createElement('span');
                        initial.className = 'fallback-initial text-white text-xl sm:text-2xl font-semibold relative z-10';
                        initial.textContent = profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U';
                        parent.appendChild(initial);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#3A6B22] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl sm:text-2xl font-semibold">
                    {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label className="text-sm sm:text-base font-semibold text-[#3a6b22] underline hover:opacity-80 transition-opacity cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadImageMutation.isPending || deleteImageMutation.isPending}
                  />
                  {uploadImageMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Uploading...
                    </span>
                  ) : (
                    'Change Profile Image'
                  )}
                </label>
                {profile?.image && (
                  <button
                    onClick={handleDeleteImage}
                    disabled={deleteImageMutation.isPending || uploadImageMutation.isPending}
                    className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteImageMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" />
                        Deleting...
                      </span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name and Email Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm sm:text-[15px] font-medium text-[#192215] mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder='Enter Name'
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    maxLength={50}
                    className="h-12 sm:h-14 text-sm sm:text-[15px] border-[#e3e3e3] focus:border-[#3a6b22]"
                  />
                  <p className="text-gray-500 text-xs mt-1 text-right">
                    {formData.fullName.length}/50
                  </p>
                </div>

                <div className="flex-1">
                  <label className="block text-sm sm:text-[15px] font-medium text-[#192215] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="h-12 sm:h-14 pr-12 text-sm sm:text-[15px] border-[#e3e3e3] text-opacity-30"
                    />
                    <Check className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-[#3a6b22]" />
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="w-full lg:max-w-[408px]">
                <label className="block text-sm sm:text-[15px] font-medium text-[#192215] mb-2">
                  Phone Number
                </label>
                <div className="flex items-center h-12 sm:h-14 px-3 sm:px-4 bg-white border border-[#e3e3e3] rounded-full">
                  <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-3 border-r border-[#8d8d8d]">
                    <span className="text-sm sm:text-[15px] text-[#192215]">{formData.countryCode}</span>
                    {/* <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#192215]" /> */}
                  </div>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 ml-2 sm:ml-3 bg-white text-sm sm:text-[15px] border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                  />

                  {/* {formData.phoneNumber && formData.phoneNumber.trim() !== '' && (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-[#3a6b22]" />
                  )} */}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm sm:text-[15px] font-medium text-[#192215] mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  placeholder='Enter Bio'
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  maxLength={2000}
                  className="w-full h-[100px] sm:h-[122px] p-3 sm:p-4 bg-white border border-[#e3e3e3] rounded-[20px] text-sm sm:text-[15px] text-[#192215] leading-relaxed resize-none focus:outline-none focus:border-[#3a6b22] transition-colors"
                />
                <p className="text-gray-500 text-xs mt-1 text-right">
                  {formData.bio.length}/2000
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 sm:pt-6">
                {profile.provider === 'general' || profile.provider === 'credentials' || !profile.provider ? (
                  <button
                    onClick={() => setIsPasswordSidebarOpen(true)}
                    className="px-6 py-2.5 sm:px-0 sm:py-0 border-2 border-[#3a6b22] sm:border-0 rounded-full sm:rounded-none text-sm sm:text-base font-semibold text-[#3a6b22] sm:underline hover:bg-[#3a6b22] sm:hover:bg-transparent hover:text-white sm:hover:text-[#3a6b22] hover:opacity-80 transition-all text-center sm:text-left"
                  >
                    Change Password?
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}
                <button
                  onClick={handleUpdate}
                  disabled={updateProfileMutation.isPending}
                  className="px-8 sm:px-12 py-3 sm:py-4 bg-[#3a6b22] text-white text-sm sm:text-base font-semibold rounded-full hover:bg-[#2d5319] transition-colors disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      Updating...
                    </span>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Sidebar */}
      <ChangePasswordSidebar
        isOpen={isPasswordSidebarOpen}
        onClose={() => setIsPasswordSidebarOpen(false)}
        showTriggerButton={false}
      />

      {/* Delete Profile Image Modal */}
      <DeleteProfileImageModal
        isOpen={showDeleteImageModal}
        onClose={() => setShowDeleteImageModal(false)}
        onConfirm={confirmDeleteImage}
        isDeleting={deleteImageMutation.isPending}
      />
    </div>
  );
};

export default MyProfilePage;
// Force SSR for this authenticated page - prevents _next/data routing issues
export async function getServerSideProps() {
  return {
    props: {},
  };
}
