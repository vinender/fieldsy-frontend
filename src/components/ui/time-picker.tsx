'use client';

import React from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

interface TimePickerInputProps {
  value: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  disabled?: boolean;
}

export function TimePickerInput({
  value,
  onChange,
  placeholder = 'Select time',
  className = '',
  name,
  disabled = false
}: TimePickerInputProps) {
  return (
    <div className={`time-picker-wrapper ${className}`}>
      <TimePicker
        onChange={onChange}
        value={value}
        disabled={disabled}
        disableClock={true}
        clearIcon={null}
        clockIcon={
          <img 
            src="/add-field/clock.svg" 
            alt="Clock" 
            className="w-5 h-5"
          />
        }
        format="h:mm a"
        hourPlaceholder="hh"
        minutePlaceholder="mm"
        className="fieldsy-time-picker"
        maxDetail="minute"
      />
      
      <style jsx global>{`
        .time-picker-wrapper .react-time-picker {
          width: 100%;
        }
        
        .time-picker-wrapper .react-time-picker__wrapper {
          border: 1px solid #E3E3E3;
          border-radius: 50px;
          padding: 12px 16px;
          background: white;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        
        .time-picker-wrapper .react-time-picker__wrapper:hover {
          border-color: #8FB366;
        }
        
        .time-picker-wrapper .react-time-picker--open .react-time-picker__wrapper {
          border-color: #3A6B22;
        }
        
        .time-picker-wrapper .react-time-picker__inputGroup {
          font-size: 15px;
          color: #545662;
        }
        
        .time-picker-wrapper .react-time-picker__inputGroup__input {
          color: #192215;
          font-weight: 500;
          outline: none;
        }
        
        .time-picker-wrapper .react-time-picker__inputGroup__input:focus {
          outline: none;
        }
        
        .time-picker-wrapper .react-time-picker__inputGroup__input:invalid {
          background: transparent;
        }
        
        .time-picker-wrapper .react-time-picker__button {
          padding: 0;
          margin-left: 8px;
        }
        
        .time-picker-wrapper .react-time-picker__inputGroup__divider {
          color: #8d8d8d;
        }
        
        .time-picker-wrapper .react-time-picker__inputGroup__leadingZero {
          color: #d1d1d1;
        }
        
        /* AM/PM selector styling */
        .time-picker-wrapper .react-time-picker__inputGroup__amPm {
          color: #3A6B22;
          font-weight: 600;
          font-size: 14px;
        }
        
        /* Disabled state */
        .time-picker-wrapper .react-time-picker--disabled {
          opacity: 0.5;
        }
        
        .time-picker-wrapper .react-time-picker--disabled .react-time-picker__wrapper {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}