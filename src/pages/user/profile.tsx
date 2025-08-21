import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Check,
  ChevronDown,
  Upload,
  Loader2
} from 'lucide-react';
import ChangePasswordSidebar from '@/components/sidebar/ChangePasswordSidebar';
import { Input } from '@/components/ui/input';
import { useProfile, useUpdateProfile, useUploadProfileImage, useDeleteProfileImage } from '@/hooks/useProfile';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

const MyProfilePage = () => {
  const router = useRouter();
  const [isPasswordSidebarOpen, setIsPasswordSidebarOpen] = useState(false);
  
  // Fetch profile data
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadImageMutation = useUploadProfileImage();
  const deleteImageMutation = useDeleteProfileImage();
  
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      try {
        await uploadImageMutation.mutateAsync(file);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleDeleteImage = async () => {
    if (confirm('Are you sure you want to delete your profile image?')) {
      try {
        await deleteImageMutation.mutateAsync();
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffcf3] py-10 mt-16 xl:mt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3A6B22]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#fffcf3] py-10 mt-16 xl:mt-24">
        <div className="max-w-7xl mx-auto px-20 text-center">
          <p className="text-red-500">Failed to load profile. Please try again.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-[#3A6B22] text-white rounded-full hover:bg-[#2e5519]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf3] py-10 mt-16 xl:mt-24">
      <div className="max-w-7xl mx-auto px-20">
        {/* Page Title with Back Button */}
        <div className="flex items-center gap-4 mb-10">
          <button className="w-12 h-12 bg-[#f8f1d7] rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#192215]" />
          </button>
          <h1 className="text-[29px] font-semibold text-[#192215]">My Profile</h1>
        </div>

        {/* Main Content Grid */}
        <div className="flex gap-10">
          {/* Left Column - Profile Details */}
          <div className="w-[408px] bg-white rounded-[14px] border border-[#19221533] p-8 h-fit">
            <h2 className="text-[18px] font-semibold text-[#192215] mb-4">Profile details</h2>
            
            {/* User Info */}
            <div className="flex items-center gap-4 mb-4">
              {profile.image ? (
                <img 
                  src={profile.image} 
                  alt={profile.name || 'User'} 
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">
                    {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-[18px] font-semibold text-[#323232]">{profile.name || 'User'}</h3>
                <p className="text-[14px] text-[#323232]">{profile.email}</p>
              </div>
            </div>

            <div className="h-px bg-[#e2e2e2] my-4" />

            {/* More Info Section */}
            <div className="space-y-4">
              <h4 className="text-[14px] font-bold text-[#192215]">More info</h4>
              
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-[#192215]" />
                  <span className="text-[16px] text-[#8d8d8d]">{profile.email}</span>
                </div>
                
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-[#192215]" />
                    <span className="text-[16px] text-[#8d8d8d]">{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* About Me Section */}
            {profile.bio && (
              <div className="mt-6">
                <h4 className="text-[14px] font-bold text-[#192215] mb-3">About me</h4>
                <p className="text-[16px] text-[#8d8d8d] leading-[24px]">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Edit Profile */}
          <div className="flex-1">
            <h2 className="text-[29px] font-semibold text-[#192215] mb-6">Edit profile</h2>

            {/* Profile Image Section */}
            <div className="flex items-center gap-4 mb-8">
              {profile.image ? (
                <img 
                  src={profile.image} 
                  alt={profile.name || 'User'} 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">
                    {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="text-[16px] font-semibold text-[#3a6b22] underline hover:opacity-80 transition-opacity cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadImageMutation.isPending || deleteImageMutation.isPending}
                  />
                  {uploadImageMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    'Change Profile Image'
                  )}
                </label>
                {profile.image && (
                  <button
                    onClick={handleDeleteImage}
                    disabled={deleteImageMutation.isPending || uploadImageMutation.isPending}
                    className="text-[14px] font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteImageMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
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
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[15px] font-medium text-[#192215] mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="h-14 text-[15px] border-[#e3e3e3] focus:border-[#3a6b22]"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[15px] font-medium text-[#192215] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="h-14 pr-12 text-[15px] border-[#e3e3e3] text-opacity-30"
                    />
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#3a6b22]" />
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="w-[408px]">
                <label className="block text-[15px] font-medium text-[#192215] mb-2">
                  Phone Number
                </label>
                <div className="flex items-center h-14 px-4 bg-white border border-[#e3e3e3] rounded-full">
                  <div className="flex items-center gap-2 pr-3 border-r border-[#8d8d8d]">
                    <span className="text-[15px] text-[#192215]">{formData.countryCode}</span>
                    <ChevronDown className="w-5 h-5 text-[#192215]" />
                  </div>
                  <Input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="flex-1 ml-3 text-[15px] border-0 px-0 focus:ring-0"
                  />
                  <Check className="w-6 h-6 text-[#3a6b22]" />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[15px] font-medium text-[#192215] mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full h-[122px] p-4 bg-white border border-[#e3e3e3] rounded-[20px] text-[15px] text-[#192215] leading-[24px] resize-none focus:outline-none focus:border-[#3a6b22] transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6">
                {profile.provider === 'general' ? (
                  <button 
                    onClick={() => setIsPasswordSidebarOpen(true)}
                    className="text-[16px] font-semibold text-[#3a6b22] underline hover:opacity-80 transition-opacity">
                    Change Password?
                  </button>
                ) : (
                  <div /> // Empty div to maintain justify-between spacing
                )}
                <button 
                  onClick={handleUpdate}
                  disabled={updateProfileMutation.isPending}
                  className="px-12 py-4 bg-[#3a6b22] text-white text-[16px] font-semibold rounded-full hover:bg-[#2d5319] transition-colors"
                >
                  {updateProfileMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
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
    </div>
  );
};

export default MyProfilePage;