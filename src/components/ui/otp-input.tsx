import React, { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function OTPInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value) {
      const otpArray = value.split('').slice(0, length);
      setOtp([...otpArray, ...new Array(length - otpArray.length).fill('')]);
    }
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Handle paste
      const pastedData = val.slice(0, length).split('');
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < length && /^\d$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const otpValue = newOtp.join('');
      onChange?.(otpValue);
      
      // Focus next empty input or last input
      const nextEmptyIndex = newOtp.findIndex((v, i) => i >= index && v === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
      inputRefs.current[focusIndex]?.focus();
      
      if (otpValue.length === length && !otpValue.includes('')) {
        onComplete?.(otpValue);
      }
      return;
    }

    // Only allow digits
    if (val && !/^\d$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    
    const otpValue = newOtp.join('');
    onChange?.(otpValue);

    // Move to next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (otpValue.length === length && !otpValue.includes('')) {
      onComplete?.(otpValue);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current input
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const pastedArray = pastedData.slice(0, length).split('');
    const newOtp = [...pastedArray, ...new Array(length - pastedArray.length).fill('')];
    setOtp(newOtp);
    
    const otpValue = newOtp.join('');
    onChange?.(otpValue);
    
    // Focus last filled input or last input
    const lastFilledIndex = newOtp.findLastIndex(v => v !== '');
    const focusIndex = lastFilledIndex < length - 1 ? lastFilledIndex + 1 : length - 1;
    inputRefs.current[focusIndex]?.focus();
    
    if (otpValue.length === length && !otpValue.includes('')) {
      onComplete?.(otpValue);
    }
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={length}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 transition-all',
            'focus:outline-none focus:ring-1 focus:ring-offset-2',
            error
              ? 'border-red-500 focus:ring-red-500 bg-red-50'
              : 'border-gray-300 focus:border-[#FF6B35] focus:ring-[#FF6B35] bg-white',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
            'hover:border-gray-400'
          )}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}