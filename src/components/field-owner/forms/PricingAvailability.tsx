import React from 'react';
import { Input } from '@/components/ui/input';

interface PricingAvailabilityProps {
  formData: any;
  setFormData: (updater: any) => void;
  validationErrors?: Record<string, string>;
}

export default function PricingAvailability({ formData, setFormData, validationErrors = {} }: PricingAvailabilityProps) {
  const handlePriceChange = (field: 'price30min' | 'price1hr', value: string) => {
    // Allow empty value
    if (value === '') {
      setFormData((prev: any) => ({
        ...prev,
        [field]: ''
      }));
      return;
    }

    // Only allow whole numbers (no decimals)
    const priceRegex = /^\d+$/;

    if (priceRegex.test(value)) {
      // Enforce max limit of 100
      const numValue = parseInt(value, 10);
      if (numValue > 100) {
        setFormData((prev: any) => ({
          ...prev,
          [field]: '100'
        }));
        return;
      }
      setFormData((prev: any) => ({
        ...prev,
        [field]: value
      }));
    }
    // If pattern doesn't match, ignore the input
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent 'e', 'E', '-', '+', and '.' (decimal point) keys
    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+' || e.key === '.') {
      e.preventDefault();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    // Extra protection: remove any non-digit characters
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-dark-green font-sans">
          Set Pricing & Availability
        </h1>
        <p className="text-sm sm:text-base text-gray-text font-sans">
          We require essential information to help you set competitive pricing for your field
        </p>
        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">
              Please fill in all required fields marked with *
            </p>
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div className="space-y-8">
        {/* Price Inputs for both durations */}
        <div className="space-y-6">
          <label className="block text-sm font-medium text-dark-green font-sans">
            Set your pricing for each booking duration <span className="text-red-500">*</span>
          </label>

          {/* 30 Minutes Price */}
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              30 Minutes Booking <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-input font-sans">
                £
              </span>
              <Input
                type="number"
                value={formData.price30min || ''}
                onChange={(e) => handlePriceChange('price30min', e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                min="0"
                max="100"
                step="1"
                placeholder="0"
                className={`pl-8 pr-4 sm:pr-40 py-3 ${validationErrors.price30min ? 'border-red-500' : ''}`}
                aria-invalid={!!validationErrors.price30min}
              />
              <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-2">
                <div className="h-6 w-px bg-gray-text" />
                <span className="text-sm font-medium whitespace-nowrap text-dark-green font-sans">
                  Per dog per 30 min
                </span>
              </div>
            </div>
            <p className="sm:hidden text-xs text-gray-text mt-1 font-sans">
              Per dog per 30 min
            </p>
            {validationErrors.price30min && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.price30min}</p>
            )}
          </div>

          {/* 1 Hour Price */}
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              1 Hour Booking <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-input font-sans">
                £
              </span>
              <Input
                type="number"
                value={formData.price1hr || ''}
                onChange={(e) => handlePriceChange('price1hr', e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                min="0"
                max="100"
                step="1"
                placeholder="0"
                className={`pl-8 pr-4 sm:pr-40 py-3 ${validationErrors.price1hr ? 'border-red-500' : ''}`}
                aria-invalid={!!validationErrors.price1hr}
              />
              <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-2">
                <div className="h-6 w-px bg-gray-text" />
                <span className="text-sm font-medium whitespace-nowrap text-dark-green font-sans">
                  Per dog per 1 hr
                </span>
              </div>
            </div>
            <p className="sm:hidden text-xs text-gray-text mt-1 font-sans">
              Per dog per 1 hr
            </p>
            {validationErrors.price1hr && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.price1hr}</p>
            )}
          </div>

        </div>

        {/* Cancellation Policy Section */}
        <div className="mt-10 pt-10 border-t border-gray-200">
          <div className="space-y-6">
            <div className="bg- rounded-2xl p-6">
              <h3 className="text-lg text-red-400 font-semibold text-red-500 mb-3 font-sans">
                Cancellation & Refund Policy:
              </h3>
              <p className="text-base leading-relaxed text-dark-green font-sans">
                Users can cancel their booking up to the{' '}
                <span className="font-bold">cancellation window</span>
                {' '}(default 24 hours) in advance for a{' '}
                <span className="font-bold">full refund</span>.
                Cancellations made within the cancellation window are{' '}
                <span className="font-bold">non-refundable</span>.
              </p>
            </div>

            <div className="bg- rounded-2xl p-6">
              {/* <h3 className="text-lg text-blue-500 font-semibold mb-3 font-sans">
                Reschedule Policy:
              </h3>
              <p className="text-base leading-relaxed text-dark-green font-sans">
                Users can reschedule their booking up to the{' '}
                <span className="font-bold">cancellation window</span>
                {' '}before the booking time, with a maximum of{' '}
                <span className="font-bold">3 reschedules per booking</span>.
              </p> */}
              <p className="text-base leading-relaxed mt-3 text-dark-green font-sans">
                For recurring bookings, rescheduling is{' '}
                <span className="font-bold">not available</span>
                {' '}once any booking in the subscription has been completed.
                The recurring interval cannot be changed during rescheduling.
              </p>
            </div>

            <div className=" rounded-2xl p-6">
              <p className="text-base leading-relaxed font-sans">
                <span className="font-bold text-green">
                  Note:
                </span>
                <span className="text-dark-green">
                  {' '}Clearly communicating your policy in your listing helps reduce disputes and builds trust with users.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}