'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  disabled?: boolean;
  minHoursDifference?: number; // Minimum hours difference for end time
  startTime?: string; // Start time in 24-hour format (for end time validation)
  isEndTime?: boolean; // Whether this is an end time selector
}

// Helper function to format 24-hour time to 12-hour with AM/PM
export function formatTimeDisplay(time24: string | undefined | null): string {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const minute = parseInt(minutes);
  
  if (isNaN(hour) || isNaN(minute)) return '';
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function TimeInput({
  value,
  onChange,
  placeholder = 'Select time',
  className = '',
  name,
  disabled = false,
  minHoursDifference = 0,
  startTime,
  isEndTime = false
}: TimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      // Convert 24-hour format to 12-hour format if needed
      const [hours, minutes] = value.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      
      if (!isNaN(hour) && hour >= 0 && hour <= 23 && !isNaN(minute)) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        setSelectedHour(displayHour.toString());
        setSelectedMinute(minute.toString().padStart(2, '0'));
        setSelectedPeriod(period);
      }
    } else {
      // Reset when value is cleared
      setSelectedHour('');
      setSelectedMinute('');
      setSelectedPeriod('AM');
    }
  }, [value]);

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

  const handleTimeSelect = (hour: string, minute: string, period: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    
    // Convert to 24-hour format for storage
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    const formattedTime = `${hour24.toString().padStart(2, '0')}:${minute}`;
    onChange(formattedTime);
    setIsOpen(false);
  };

  const displayValue = selectedHour && selectedMinute 
    ? `${selectedHour}:${selectedMinute} ${selectedPeriod}`
    : '';

  const hours = Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
  const minutes = ['00', '15', '30', '45'];
  
  // Calculate disabled hours for end time based on start time and minimum hours
  const isHourDisabled = (hour: number, period: string): boolean => {
    if (!isEndTime || !startTime || !minHoursDifference) return false;
    
    // Convert hour to 24-hour format
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour === 12) {
      hour24 = 0;
    }
    
    // Parse start time
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    
    // Calculate end time in minutes
    const endTotalMinutes = hour24 * 60;
    
    // Check if the difference meets minimum hours requirement
    const diffHours = (endTotalMinutes - startTotalMinutes) / 60;
    
    // Disable if less than minimum hours or if end time is before start time
    return diffHours < minHoursDifference;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 pr-12 text-left bg-white border rounded-full
          transition-all duration-200 font-sans text-[15px]
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-light-green'}
          ${isOpen ? 'border-green ring-1 ring-green/20' : 'border-gray-border'}
          ${!displayValue ? 'text-gray-400' : 'text-dark-green font-medium'}
        `}
      >
        {displayValue || placeholder}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <img 
            src="/add-field/clock.svg" 
            alt="Clock" 
            className="w-5 h-5"
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {/* Hours Column */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2">Hour</div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {hours.map(hour => {
                    const disabled = isHourDisabled(hour, selectedPeriod);
                    return (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => !disabled && handleTimeSelect(hour.toString(), selectedMinute || '00', selectedPeriod)}
                        disabled={disabled}
                        className={`
                          w-full px-2 py-1.5 text-sm rounded-lg transition-colors
                          ${disabled 
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                            : selectedHour === hour.toString() 
                              ? 'bg-light-green text-white font-medium' 
                              : 'hover:bg-gray-100 text-gray-700'}
                        `}
                      >
                        {hour}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minutes Column */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2">Minute</div>
                <div className="space-y-1">
                  {minutes.map(minute => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleTimeSelect(selectedHour || '12', minute, selectedPeriod)}
                      className={`
                        w-full px-2 py-1.5 text-sm rounded-lg transition-colors
                        ${selectedMinute === minute 
                          ? 'bg-light-green text-white font-medium' 
                          : 'hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM Column */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2">Period</div>
                <div className="space-y-1">
                  {['AM', 'PM'].map(period => {
                    const disabled = selectedHour && isHourDisabled(parseInt(selectedHour), period);
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => !disabled && handleTimeSelect(selectedHour || '12', selectedMinute || '00', period)}
                        disabled={disabled}
                        className={`
                          w-full px-2 py-1.5 text-sm rounded-lg transition-colors
                          ${disabled
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : selectedPeriod === period 
                              ? 'bg-light-green text-white font-medium' 
                              : 'hover:bg-gray-100 text-gray-700'}
                        `}
                      >
                        {period}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}