"use client"

import React from 'react';
import { Check } from 'lucide-react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function CustomCheckbox({ 
  checked, 
  onChange,
  className = ""
}: CustomCheckboxProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
        checked 
          ? 'bg-green border-green' 
          : 'bg-white border-gray-300 hover:border-green/50'
      } ${className}`}
    >
      {checked && (
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      )}
    </button>
  );
}