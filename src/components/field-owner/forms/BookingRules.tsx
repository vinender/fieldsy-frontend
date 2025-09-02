import React from 'react';

interface BookingRulesProps {
  formData: any;
  setFormData: (updater: any) => void;
  validationErrors?: Record<string, string>;
}

export default function BookingRules({ formData, setFormData, validationErrors = {} }: BookingRulesProps) {
  const handleRulesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      rules: e.target.value
    }));
  };

  const handlePoliciesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      policies: e.target.value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-semibold text-dark-green font-sans">
          Set Booking Rules & Policies
        </h1>
        <p className="text-base text-gray-text font-sans">
          Set clear guidelines to ensure a smooth, safe, and respectful experience for all visitors.
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-8">
        {/* Rules Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-dark-green font-sans">
            Rules
          </h2>
          <div className="space-y-2">
            <label 
              htmlFor="rules" 
              className="block text-sm font-medium text-dark-green font-sans"
            >
              Write about your rules <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                id="rules"
                value={formData.rules || ''}
                onChange={handleRulesChange}
                placeholder="Write your rules here..."
                className={`w-full min-h-[160px] rounded-2xl border bg-white p-4 text-gray-input placeholder:text-gray-400 font-sans focus:border-green focus:outline-none focus:ring-1 focus:ring-green resize-y ${
                  validationErrors.rules ? 'border-red-500' : 'border-gray-border'
                }`}
                rows={5}
              />
              {validationErrors.rules && (
                <p className="mt-1 text-sm text-red-500 font-sans">
                  {validationErrors.rules}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-text font-sans">
              Example: No aggressive dogs, must clean up after your pet, respect other users' time slots
            </p>
          </div>
        </div>

        {/* Booking Policies Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-dark-green font-sans">
            Booking Policies
          </h2>
          <div className="space-y-2">
            <label 
              htmlFor="policies" 
              className="block text-sm font-medium text-dark-green font-sans"
            >
              Write about your policies <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                id="policies"
                value={formData.policies || ''}
                onChange={handlePoliciesChange}
                placeholder="Write your policies here..."
                className={`w-full min-h-[160px] rounded-2xl border bg-white p-4 text-gray-input placeholder:text-gray-400 font-sans focus:border-green focus:outline-none focus:ring-1 focus:ring-green resize-y ${
                  validationErrors.policies ? 'border-red-500' : 'border-gray-border'
                }`}
                rows={5}
              />
              {validationErrors.policies && (
                <p className="mt-1 text-sm text-red-500 font-sans">
                  {validationErrors.policies}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-text font-sans">
              Example: 24-hour cancellation policy, maximum 2 dogs per booking, arrival and departure times
            </p>
          </div>
        </div>

        {/* Preview Section */}
        {(formData.rules || formData.policies) && (
          <div className="bg-green-lighter rounded-2xl p-6">
            <h3 className="text-base font-semibold text-dark-green mb-3 font-sans">
              Preview
            </h3>
            {formData.rules && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-dark-green mb-1 font-sans">Rules:</h4>
                <p className="text-sm text-gray-input font-sans whitespace-pre-wrap">{formData.rules}</p>
              </div>
            )}
            {formData.policies && (
              <div>
                <h4 className="text-sm font-medium text-dark-green mb-1 font-sans">Policies:</h4>
                <p className="text-sm text-gray-input font-sans whitespace-pre-wrap">{formData.policies}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}