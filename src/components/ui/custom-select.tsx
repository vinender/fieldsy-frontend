"use client"

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  className?: string;
}

export function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option",
  name,
  className = ""
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the label for the selected value
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-full bg-white border border-gray-border 
          focus:outline-none focus:border-green font-sans text-left flex items-center justify-between
          transition-colors hover:border-green/50 ${className}`}
      >
        <span className={value ? 'text-gray-input' : 'text-gray-200'}>
          {displayText}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-text transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-border rounded-2xl shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-3 text-left font-sans transition-colors
                  hover:bg-cream ${
                    value === option.value 
                      ? 'bg-cream text-dark-green font-medium' 
                      : 'text-gray-input hover:text-dark-green'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden input for form compatibility */}
      <input
        type="hidden"
        name={name}
        value={value}
      />
    </div>
  );
}