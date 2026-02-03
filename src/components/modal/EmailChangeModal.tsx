import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { OTPInput } from '@/components/ui/otp-input';
import { useRequestEmailChange, useVerifyEmailChange } from '@/hooks/mutations/useEmailChangeMutations';

interface EmailChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSuccess: () => void;
}

type Step = 'enter-email' | 'verify-otp';

export function EmailChangeModal({ isOpen, onClose, currentEmail, onSuccess }: EmailChangeModalProps) {
  const [step, setStep] = useState<Step>('enter-email');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const requestMutation = useRequestEmailChange();
  const verifyMutation = useVerifyEmailChange();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('enter-email');
      setNewEmail('');
      setOtp('');
      setEmailError(null);
      setOtpError(null);
      setResendCooldown(0);
      requestMutation.reset();
      verifyMutation.reset();
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRequestOtp = async () => {
    setEmailError(null);
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (trimmedEmail === currentEmail.toLowerCase()) {
      setEmailError('New email must be different from your current email');
      return;
    }

    try {
      await requestMutation.mutateAsync({ newEmail: trimmedEmail });
      setStep('verify-otp');
      setResendCooldown(60);
    } catch {
      // Error handled by mutation onError
    }
  };

  const handleVerifyOtp = async (otpValue: string) => {
    setOtpError(null);
    try {
      await verifyMutation.mutateAsync({
        newEmail: newEmail.trim().toLowerCase(),
        otp: otpValue,
      });
      onSuccess();
    } catch {
      setOtpError('Invalid or expired code');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || requestMutation.isPending) return;
    setOtp('');
    setOtpError(null);
    try {
      await requestMutation.mutateAsync({ newEmail: newEmail.trim().toLowerCase() });
      setResendCooldown(60);
    } catch {
      // Error handled by mutation
    }
  };

  const isLoading = requestMutation.isPending || verifyMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[32px] max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300 overflow-visible">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute -right-4 -top-4 sm:-right-3 sm:-top-3 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'enter-email' ? (
          <>
            {/* Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#3a6b22]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-dark-green mb-2">
              Change Email Address
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Current email: <span className="font-medium text-gray-700">{currentEmail}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              A verification code will be sent to your new email
            </p>

            <div className="text-left mb-6">
              <label className="block text-sm font-medium text-[#192215] mb-2">
                New Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRequestOtp();
                }}
                disabled={isLoading}
                className={`h-12 sm:h-14 text-sm sm:text-[15px] ${emailError ? 'border-red-500' : 'border-[#e3e3e3]'} focus:border-[#3a6b22]`}
              />
              {emailError && (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 rounded-full border-2 border-gray-300 text-gray-700 font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="flex-1 py-3 rounded-full bg-[#3a6b22] text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestMutation.isPending ? 'Sending...' : 'Send Code'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={() => {
                setStep('enter-email');
                setOtp('');
                setOtpError(null);
              }}
              disabled={isLoading}
              className="absolute left-6 top-6 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#3a6b22]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-dark-green mb-2">
              Verify Your Email
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter the 6-digit code sent to <span className="font-medium text-gray-700">{newEmail.trim()}</span>
            </p>

            <div className="mb-6">
              <OTPInput
                length={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  if (otpError) setOtpError(null);
                }}
                onComplete={handleVerifyOtp}
                disabled={isLoading}
                error={!!otpError}
              />
              {otpError && (
                <p className="text-xs text-red-500 mt-2">{otpError}</p>
              )}
            </div>

            <button
              onClick={() => handleVerifyOtp(otp)}
              disabled={isLoading || otp.length < 6}
              className="w-full py-3 rounded-full bg-[#3a6b22] text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
            </button>

            <p className="text-sm text-gray-500">
              Didn&apos;t receive the code?{' '}
              {resendCooldown > 0 ? (
                <span className="text-gray-400">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={requestMutation.isPending}
                  className="text-[#3a6b22] font-semibold hover:underline disabled:opacity-50"
                >
                  {requestMutation.isPending ? 'Sending...' : 'Resend Code'}
                </button>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
