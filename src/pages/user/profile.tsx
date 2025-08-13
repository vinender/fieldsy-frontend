import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Check,
  ChevronDown,
  Upload
} from 'lucide-react';
import ChangePasswordSidebar from '@/components/sidebar/ChangePasswordSidebar';
import { Input } from '@/components/ui/input';

const MyProfilePage = () => {
  const [isPasswordSidebarOpen, setIsPasswordSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'David Wood',
    email: 'davidengland12@gmail.com',
    countryCode: '+44',
    phoneNumber: '7700 123456',
    bio: "I'm a proud dog parent always looking for safe, private spaces where my pup can run free, sniff everything, and have fun without stress. I use Fieldsy to discover hidden gems near me — and nothing makes me happier than seeing a wagging tail at the end of every walk! 🐾"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
              <img 
                src="https://i.pravatar.cc/150?img=8" 
                alt="David Wood" 
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <h3 className="text-[18px] font-semibold text-[#323232]">David Wood</h3>
                <p className="text-[14px] text-[#323232]">davidengland12@gmail.com</p>
              </div>
            </div>

            <div className="h-px bg-[#e2e2e2] my-4" />

            {/* More Info Section */}
            <div className="space-y-4">
              <h4 className="text-[14px] font-bold text-[#192215]">More info</h4>
              
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-[#192215]" />
                  <span className="text-[16px] text-[#8d8d8d]">davidengland12@gmail.com</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-[#192215]" />
                  <span className="text-[16px] text-[#8d8d8d]">+44 7700 123456</span>
                </div>
              </div>
            </div>

            {/* About Me Section */}
            <div className="mt-6">
              <h4 className="text-[14px] font-bold text-[#192215] mb-3">About me</h4>
              <p className="text-[16px] text-[#8d8d8d] leading-[24px]">
                I'm a proud dog parent always looking for safe, private spaces where my pup can run free, 
                sniff everything, and have fun without stress. I use Fieldsy to discover hidden gems near 
                me — and nothing makes me happier than seeing a wagging tail at the end of every walk! 🐾
              </p>
            </div>
          </div>

          {/* Right Column - Edit Profile */}
          <div className="flex-1">
            <h2 className="text-[29px] font-semibold text-[#192215] mb-6">Edit profile</h2>

            {/* Profile Image Section */}
            <div className="flex items-center gap-4 mb-8">
              <img 
                src="https://i.pravatar.cc/150?img=8" 
                alt="David Wood" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <button className="text-[16px] font-semibold text-[#3a6b22] underline hover:opacity-80 transition-opacity">
                Change Profile Image
              </button>
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
                <button 
                  onClick={() => setIsPasswordSidebarOpen(true)}
                  className="text-[16px] font-semibold text-[#3a6b22] underline hover:opacity-80 transition-opacity">
                  Change Password?
                </button>
                <button className="px-12 py-4 bg-[#3a6b22] text-white text-[16px] font-semibold rounded-full hover:bg-[#2d5319] transition-colors">
                  Update
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