import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function LoginPromptModal({ 
  isOpen, 
  onClose, 
  message = "Please login or sign up to continue" 
}: LoginPromptModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  const handleSignup = () => {
    onClose();
    router.push('/register');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">Welcome to Fieldsy - Login or Sign Up</DialogTitle>
        <div className="relative">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-[#3A6B22] to-[#8FB366] p-6 text-white">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <Image 
                  src="/logo/logo.svg" 
                  alt="Fieldsy" 
                  width={60} 
                  height={60} 
                  className="object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Welcome to Fieldsy!</h2>
            <p className="text-center text-white/90">{message}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Join our community to book fields, save your favorites, and manage your bookings.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                className="w-full bg-[#3A6B22] text-white font-semibold py-3 px-4 rounded-full hover:bg-[#2e5519] transition-colors"
              >
                Login
              </button>
              
              <button
                onClick={handleSignup}
                className="w-full bg-white text-[#3A6B22] font-semibold py-3 px-4 rounded-full border-2 border-[#3A6B22] hover:bg-gray-50 transition-colors"
              >
                Sign Up
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">or continue browsing</span>
              </div>
            </div>

            {/* Continue browsing button */}
            <button
              onClick={onClose}
              className="w-full text-gray-600 font-medium py-2 hover:text-gray-800 transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}