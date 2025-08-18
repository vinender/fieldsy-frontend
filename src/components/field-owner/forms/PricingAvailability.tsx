import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface PricingAvailabilityProps {
  formData: any;
  setFormData: (updater: any) => void;
}

export default function PricingAvailability({ formData, setFormData }: PricingAvailabilityProps) {
  const [pricePerHour, setPricePerHour] = useState(formData.pricePerHour || '');
  const [bookingDuration, setBookingDuration] = useState(formData.bookingDuration || '30min');

  // Update formData when local state changes
  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      pricePerHour,
      bookingDuration
    }));
  }, [pricePerHour, bookingDuration, setFormData]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-semibold text-dark-green font-sans">
          Set Pricing & Availability
        </h1>
        <p className="text-base text-gray-text font-sans">
          We require essential information to help you set competitive pricing for your field
        </p>
      </div>

      {/* Pricing Section */}
      <div className="space-y-8">
        {/* Price Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
            How much do you want to charge per dog, per hour?
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-input font-sans">
              $
            </span>
            <Input
              type="number"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              placeholder="0.00"
              className="pl-8 pr-32 py-3 border-gray-border focus:border-green font-sans"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="h-6 w-px bg-gray-text" />
              <span className="text-sm font-medium whitespace-nowrap text-dark-green font-sans">
                Per dog per hour
              </span>
            </div>
          </div>
        </div>

        {/* Booking Duration */}
        <div>
          <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
            Choose your preferred booking slot duration
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setBookingDuration('30min')}
              className={`flex-1 py-3 px-4 rounded-full font-medium font-sans transition-all ${
                bookingDuration === '30min'
                  ? 'bg-light-green text-white'
                  : 'bg-white border border-gray-border text-gray-text hover:border-light-green'
              }`}
            >
              30 Minutes
            </button>
            <button
              type="button"
              onClick={() => setBookingDuration('1hour')}
              className={`flex-1 py-3 px-4 rounded-full font-medium font-sans transition-all ${
                bookingDuration === '1hour'
                  ? 'bg-light-green text-white'
                  : 'bg-white border border-gray-border text-gray-text hover:border-light-green'
              }`}
            >
              1 Hour
            </button>
          </div>
        </div>

        {/* Additional Pricing Options */}
        <div>
          <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
            Weekend Pricing (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-input font-sans">
              $
            </span>
            <Input
              type="number"
              value={formData.weekendPrice || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, weekendPrice: e.target.value }))}
              placeholder="0.00"
              className="pl-8 pr-32 py-3 border-gray-border focus:border-green font-sans"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="h-6 w-px bg-gray-text" />
              <span className="text-sm font-medium whitespace-nowrap text-dark-green font-sans">
                Weekend rate
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-text mt-1 font-sans">
            Leave blank to use the same rate for weekends
          </p>
        </div>

        {/* Instant Booking Toggle */}
        <div className="space-y-4 border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-dark-green font-sans">
                Enable Instant Booking
              </label>
              <p className="text-xs text-gray-text mt-1 font-sans">
                Allow users to book immediately without approval
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData((prev: any) => ({ ...prev, instantBooking: !prev.instantBooking }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.instantBooking ? 'bg-green' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.instantBooking ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Cancellation Policy Section */}
        <div className="mt-10 pt-10 border-t border-gray-200">
          <div className="space-y-6">
            <div className="bg- rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red mb-3 font-sans">
                Cancellation & Refund Policy:
              </h3>
              <p className="text-base leading-relaxed text-dark-green font-sans">
                Users can cancel or reschedule their booking up to{' '}
                <span className="font-bold">24 hours</span>
                {' '}in advance for a{' '}
                <span className="font-bold">full refund</span>
                {' '}by default.
              </p>
              
              <p className="text-base leading-relaxed mt-3 text-dark-green font-sans">
                You may set your own cancellation terms when listing your field. Cancellations made{' '}
                <span className="font-bold">within 24 hours of the booking time</span>
                {' '}are{' '}
                <span className="font-bold">non-refundable</span>
                {' '}unless you choose to offer flexibility.
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