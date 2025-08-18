import React, { useState, useEffect } from 'react';

interface BookingRulesProps {
  formData: any;
  setFormData: (updater: any) => void;
}

export default function BookingRules({ formData, setFormData }: BookingRulesProps) {
  const [rules, setRules] = useState(formData.rules || '');
  const [policies, setPolicies] = useState(formData.policies || '');
  const [errors, setErrors] = useState({ rules: '', policies: '' });

  // Update formData when local state changes
  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      rules,
      policies
    }));
  }, [rules, policies, setFormData]);

  const validateForm = () => {
    const newErrors = { rules: '', policies: '' };
    
    if (!rules.trim()) {
      newErrors.rules = 'Please write your rules before proceeding.';
    }
    
    if (!policies.trim()) {
      newErrors.policies = 'Please write your booking policies before proceeding.';
    }
    
    setErrors(newErrors);
    return !newErrors.rules && !newErrors.policies;
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
              Write about your rules
            </label>
            <div className="relative">
              <textarea
                id="rules"
                value={rules}
                onChange={(e) => {
                  setRules(e.target.value);
                  if (errors.rules) {
                    setErrors({ ...errors, rules: '' });
                  }
                }}
                placeholder="Write your rules here..."
                className={`w-full min-h-[160px] rounded-2xl border bg-white p-4 text-gray-input placeholder:text-gray-400 font-sans focus:border-green focus:outline-none focus:ring-1 focus:ring-green resize-y ${
                  errors.rules ? 'border-red' : 'border-gray-border'
                }`}
                rows={5}
              />
              {errors.rules && (
                <p className="mt-1 text-sm text-red font-sans">
                  {errors.rules}
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
              Write about your policies
            </label>
            <div className="relative">
              <textarea
                id="policies"
                value={policies}
                onChange={(e) => {
                  setPolicies(e.target.value);
                  if (errors.policies) {
                    setErrors({ ...errors, policies: '' });
                  }
                }}
                placeholder="Write your policies here..."
                className={`w-full min-h-[160px] rounded-2xl border bg-white p-4 text-gray-input placeholder:text-gray-400 font-sans focus:border-green focus:outline-none focus:ring-1 focus:ring-green resize-y ${
                  errors.policies ? 'border-red' : 'border-gray-border'
                }`}
                rows={5}
              />
              {errors.policies && (
                <p className="mt-1 text-sm text-red font-sans">
                  {errors.policies}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-text font-sans">
              Example: 24-hour cancellation policy, maximum 2 dogs per booking, arrival and departure times
            </p>
          </div>
        </div>

        {/* Preview Section */}
        {(rules || policies) && (
          <div className="bg-green-lighter rounded-2xl p-6">
            <h3 className="text-base font-semibold text-dark-green mb-3 font-sans">
              Preview
            </h3>
            {rules && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-dark-green mb-1 font-sans">Rules:</h4>
                <p className="text-sm text-gray-input font-sans whitespace-pre-wrap">{rules}</p>
              </div>
            )}
            {policies && (
              <div>
                <h4 className="text-sm font-medium text-dark-green mb-1 font-sans">Policies:</h4>
                <p className="text-sm text-gray-input font-sans whitespace-pre-wrap">{policies}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}