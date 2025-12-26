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
  isStartTime?: boolean; // Whether this is a start time selector (restricts hours)
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
  isEndTime = false,
  isStartTime = false
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

    // Convert to 12-hour format hour to 24-hour format for storage
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

  // Get hours based on whether this is start/end time and selected period
  const getFilteredHours = (): number[] => {
    if (isStartTime) {
      if (selectedPeriod === 'AM') {
        // AM: 7, 8, 9, 10, 11
        return [7, 8, 9, 10, 11];
      } else {
        // PM: 12, 1, 2, 3, 4, 5, 6, 7, 8 (max 8 PM for start to allow valid end time)
        return [12, 1, 2, 3, 4, 5, 6, 7, 8];
      }
    }
    if (isEndTime) {
      if (selectedPeriod === 'PM') {
        // End time PM: 12, 1, 2, 3, 4, 5, 6, 7, 8 (max 8 PM - last selectable hour)
        return [12, 1, 2, 3, 4, 5, 6, 7, 8];
      } else {
        // End time AM: 12, 7, 8, 9, 10, 11 (reasonable morning hours)
        return [7, 8, 9, 10, 11, 12];
      }
    }
    // Default: all hours (12, 1, 2, 3, ... 11)
    return Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
  };

  const hours = getFilteredHours();
  const minutes = ['00', '15', '30', '45'];

  // Get default hour when switching periods for start time
  const getDefaultHourForPeriod = (period: string): string => {
    if (isStartTime) {
      return period === 'AM' ? '7' : '1';
    }
    return selectedHour || '12';
  };
  
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

    // Calculate time difference, handling overnight periods
    let diffMinutes = endTotalMinutes - startTotalMinutes;

    // If end time is "before" start time, it means crossing midnight
    // Add 24 hours to get the actual duration
    if (diffMinutes < 0) {
      diffMinutes = diffMinutes + (24 * 60);
    }

    const diffHours = diffMinutes / 60;

    // Only disable if less than minimum hours
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
          transition-all duration-200 font-sans text-[15px] shadow-sm
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400'}
          ${isOpen ? 'border-green ring-1 ring-green/20' : 'border-gray-300'}
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
                    // Disable AM for end time if start time is PM
                    const isAMDisabledForEndTime = isEndTime && startTime && period === 'AM' && (() => {
                      const [startHours] = startTime.split(':').map(Number);
                      return startHours >= 12; // Start time is PM (12:00 or later)
                    })();

                    const periodDisabled = isAMDisabledForEndTime || (selectedHour && isHourDisabled(parseInt(selectedHour), period));
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => !periodDisabled && handleTimeSelect(getDefaultHourForPeriod(period), selectedMinute || '00', period)}
                        disabled={!!periodDisabled}
                        className={`
                          w-full px-2 py-1.5 text-sm rounded-lg transition-colors
                          ${periodDisabled
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