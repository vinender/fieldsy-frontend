"use client"

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface CustomMultiSelectProps {
    options: Option[];
    value: string; // Comma-separated string or array? Let's use comma-separated for compatibility with seed
    onChange: (value: string) => void;
    placeholder?: string;
    name?: string;
    className?: string;
}

export function CustomMultiSelect({
    options,
    value,
    onChange,
    placeholder = "Select options",
    name,
    className = ""
}: CustomMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Parse current values
    const selectedValues = value ? value.split(',').map(v => v.trim()).filter(Boolean) : [];

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

    const handleToggle = (optionValue: string) => {
        let newValues: string[];
        if (selectedValues.includes(optionValue)) {
            newValues = selectedValues.filter(v => v !== optionValue);
        } else {
            newValues = [...selectedValues, optionValue];
        }
        onChange(newValues.join(', '));
    };

    const removeValue = (e: React.MouseEvent, optionValue: string) => {
        e.stopPropagation();
        const newValues = selectedValues.filter(v => v !== optionValue);
        onChange(newValues.join(', '));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2 min-h-[48px] rounded-full bg-white border border-gray-300
          focus-within:border-green font-sans text-left flex items-center justify-between
          transition-colors hover:border-gray-400 shadow-sm cursor-pointer ${className}`}
            >
                <div className="flex flex-wrap gap-1 items-center">
                    {selectedValues.length === 0 ? (
                        <span className="text-placeholder-gray">{placeholder}</span>
                    ) : (
                        selectedValues.map(v => {
                            const option = options.find(opt => opt.value === v);
                            return (
                                <span
                                    key={v}
                                    className="bg-cream text-dark-green text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 border border-green/20"
                                >
                                    {option ? option.label : v}
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                                        onClick={(e) => removeValue(e, v)}
                                    />
                                </span>
                            );
                        })
                    )}
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-gray-text transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-30 w-full mt-2 bg-white border border-gray-border rounded-2xl shadow-lg overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                        {options.map((option) => {
                            const isSelected = selectedValues.includes(option.value);
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleToggle(option.value)}
                                    className={`w-full px-4 py-3 text-left font-sans transition-colors
                    flex items-center justify-between
                    hover:bg-cream ${isSelected
                                            ? 'bg-cream/50 text-dark-green font-medium'
                                            : 'text-gray-input hover:text-dark-green'
                                        }`}
                                >
                                    <span>{option.label}</span>
                                    {isSelected && (
                                        <div className="w-4 h-4 rounded-full bg-green flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                        {options.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 italic">No options available</div>
                        )}
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
