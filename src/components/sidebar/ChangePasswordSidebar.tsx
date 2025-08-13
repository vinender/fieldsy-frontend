import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChangePasswordSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  showTriggerButton?: boolean;
}

const ChangePasswordSidebar: React.FC<ChangePasswordSidebarProps> = ({ 
  isOpen: isOpenProp = false, 
  onClose,
  showTriggerButton = true 
}) => {
  const [isOpen, setIsOpen] = useState(isOpenProp);
  
  // Update internal state when prop changes
  useEffect(() => {
    setIsOpen(isOpenProp);
  }, [isOpenProp]);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field: 'oldPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Add password change logic here
    console.log('Password change submitted:', formData);
    // Reset form after submission
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsOpen(false);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    // Reset form when closing
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      old: false,
      new: false,
      confirm: false
    });
    // Call parent's onClose if provided
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Trigger Button - Only show if showTriggerButton is true */}
      {showTriggerButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="text-[16px] font-semibold text-[#3a6b22] underline hover:opacity-80 transition-opacity"
        >
          Change Password?
        </button>
      )}

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-[540px] bg-[#fffcf3] z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={closeSidebar}
              className="w-12 h-12 bg-[#f8f1d7] rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-[#192215]" />
            </button>
            <h2 className="text-[29px] font-semibold text-[#192215]">
              Change Password
            </h2>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

        {/* Content */}
        <div className="px-6 py-8">
          <div className="space-y-6">
            {/* Description */}
            <p className="text-[16px] text-[#192215] leading-[24px] mb-8">
              Generate a strong and unique password for your account to enhance security measures 
              and protect from unauthorized access.
            </p>

            {/* Old Password Field */}
            <div>
              <label className="block text-[15px] font-medium text-[#192215] mb-2">
                Old Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.old ? 'text' : 'password'}
                  value={formData.oldPassword}
                  onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                  placeholder="Enter old password"
                  className="h-14 pr-12 text-[15px] border-[#e3e3e3] focus:border-[#3a6b22]"
                />
                <button
                  onClick={() => togglePasswordVisibility('old')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8d8d8d] hover:text-[#192215] transition-colors"
                >
                  {showPasswords.old ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-[15px] font-medium text-[#192215] mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  className="h-14 pr-12 text-[15px] border-[#e3e3e3] focus:border-[#3a6b22]"
                />
                <button
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8d8d8d] hover:text-[#192215] transition-colors"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password Field */}
            <div>
              <label className="block text-[15px] font-medium text-[#192215] mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  className="h-14 pr-12 text-[15px] border-[#e3e3e3] focus:border-[#3a6b22]"
                />
                <button
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8d8d8d] hover:text-[#192215] transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {/* <div className="bg-[#f8f1d7] rounded-lg p-4 mt-4">
              <p className="text-[14px] font-medium text-[#192215] mb-2">Password must contain:</p>
              <ul className="text-[13px] text-[#192215] space-y-1">
                <li className="flex items-center gap-2">
                  <span className={formData.newPassword.length >= 8 ? 'text-[#3a6b22]' : 'text-[#8d8d8d]'}>
                    • At least 8 characters
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={/[A-Z]/.test(formData.newPassword) ? 'text-[#3a6b22]' : 'text-[#8d8d8d]'}>
                    • One uppercase letter
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={/[a-z]/.test(formData.newPassword) ? 'text-[#3a6b22]' : 'text-[#8d8d8d]'}>
                    • One lowercase letter
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={/[0-9]/.test(formData.newPassword) ? 'text-[#3a6b22]' : 'text-[#8d8d8d]'}>
                    • One number
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={/[!@#$%^&*]/.test(formData.newPassword) ? 'text-[#3a6b22]' : 'text-[#8d8d8d]'}>
                    • One special character
                  </span>
                </li>
              </ul>
            </div> */}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full h-14 bg-[#3a6b22] text-white text-[16px] font-semibold rounded-full hover:bg-[#2d5319] transition-colors mt-8"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordSidebar;