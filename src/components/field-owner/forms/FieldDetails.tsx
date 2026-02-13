import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/custom-select';
import { CustomMultiSelect } from '@/components/ui/custom-multi-select';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { TimeInput } from '@/components/ui/time-input';
import { useAmenities } from '@/hooks/api/useAmenities';
import { useFieldOptions } from '@/hooks/api/useFieldOptions';
import { AmenityIcon, ICON_COLORS } from '@/components/ui/AmenityIcon';
import { getAmenityIcon } from '@/config/amenities.config';

interface FieldDetailsProps {
  formData: any;
  setFormData: (updater: any) => void;
  validationErrors?: Record<string, string>;
}

export default function FieldDetails({ formData, setFormData, validationErrors = {} }: FieldDetailsProps) {
  const { data: amenities, isLoading: amenitiesLoading } = useAmenities();
  const { data: fieldOptions, isLoading: optionsLoading } = useFieldOptions();
  const [timeError, setTimeError] = useState('');

  // Extract options from API response
  const fieldSizeOptions = fieldOptions?.data?.fieldSize || [];
  const terrainTypeOptions = fieldOptions?.data?.terrainType || [];
  const fenceTypeOptions = fieldOptions?.data?.fenceType || [];
  const fenceSizeOptions = fieldOptions?.data?.fenceSize || [];
  const surfaceTypeOptions = fieldOptions?.data?.surfaceType || [];
  const openingDaysOptions = fieldOptions?.data?.openingDays || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
      ...(name === 'streetAddress' ? { addressVerified: false } : {}),
    }));
  };

  const handleMaxDogsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      // Limit to max 10
      if (value === '' || (numValue >= 1 && numValue <= 10)) {
        setFormData((prev: any) => ({
          ...prev,
          maxDogs: value,
        }));
      }
    }
  };

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [time, period] = timeStr.split(/(?=[AP]M)/i);
    const [hours, minutes] = time.split(':').map(Number);
    let totalHours = hours;
    if (period === 'PM' && hours !== 12) totalHours += 12;
    if (period === 'AM' && hours === 12) totalHours = 0;
    return totalHours * 60 + (minutes || 0);
  };

  // Validate time difference - just ensure end time is after start time
  const validateTimeDifference = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) {
      setTimeError('');
      return;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Calculate time difference
    let diffMinutes = endMinutes - startMinutes;

    // If end time is "before" start time, it means the period crosses midnight
    // Add 24 hours (1440 minutes) to get the actual duration
    if (diffMinutes < 0) {
      diffMinutes = diffMinutes + (24 * 60); // Add 24 hours in minutes
    }

    // Just ensure end time is different from start time (at least some duration)
    if (diffMinutes === 0) {
      setTimeError('End time must be different from start time');
    } else {
      setTimeError('');
    }
  };

  // Validate whenever times change
  useEffect(() => {
    validateTimeDifference(formData.startTime, formData.endTime);
  }, [formData.startTime, formData.endTime]);

  console.log('fieldData formData', formData);

  const handleAmenityToggle = (amenityId: string) => {
    setFormData((prev: any) => {
      const currentAmenities = Array.isArray(prev.amenities) ? prev.amenities : [];
      const isSelected = currentAmenities.includes(amenityId);

      return {
        ...prev,
        amenities: isSelected
          ? currentAmenities.filter((id: string) => id !== amenityId)
          : [...currentAmenities, amenityId]
      };
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 text-dark-green font-sans">
          Tell us about your field
        </h1>
        <p className="text-sm sm:text-base text-gray-text font-sans">
          Share key details like size, fencing, amenities, and what makes your space perfect for safe, off-lead adventures.
        </p>
        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">
              Please fill in all required fields marked with *
            </p>
          </div>
        )}
      </div>

      {/* Basic Info Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Basic Info
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Field Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="fieldName"
              value={formData.fieldName}
              onChange={handleInputChange}
              placeholder="Enter field name"
              maxLength={50}
              className={`py-3 ${validationErrors.fieldName ? 'border-red-500' : ''}`}
              aria-invalid={!!validationErrors.fieldName}
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {validationErrors.fieldName && (
                  <p className="text-red-500 text-sm">{validationErrors.fieldName}</p>
                )}
              </div>
              <p className="text-gray-500 text-xs">
                {formData.fieldName.length}/50
              </p>
            </div>
          </div>

          {/* Field Size - Dropdown with Custom option */}
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Field Size <span className="text-red-500">*</span>
            </label>
            <div className="space-y-4">
              <CustomSelect
                name="fieldSize"
                value={formData.fieldSize}
                onChange={(value) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    fieldSize: value,
                    // Clear custom field size if not selecting Custom
                    customFieldSize: value === 'Custom' ? prev.customFieldSize : '',
                  }));
                }}
                placeholder="Select size"
                options={[...fieldSizeOptions, { value: 'Custom', label: 'Custom' }]}
              />
              {/* Show custom input only when Custom is selected */}
              {formData.fieldSize === 'Custom' && (
                <div className="relative">
                  <Input
                    type="number"
                    name="customFieldSize"
                    value={formData.customFieldSize || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow whole numbers (no decimals), max 20
                      if (value === '' || (/^\d{1,2}$/.test(value) && parseInt(value) <= 20)) {
                        setFormData((prev: any) => ({
                          ...prev,
                          customFieldSize: value,
                        }));
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent 'e', 'E', '-', '+', '.' keys (only allow whole numbers)
                      if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+' || e.key === '.') {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      // Extra protection: remove any non-digit characters and limit to max 20
                      const input = e.target as HTMLInputElement;
                      let value = input.value.replace(/[^0-9]/g, '');
                      if (parseInt(value) > 20) value = '20';
                      input.value = value;
                    }}
                    maxLength={2}
                    placeholder="Enter custom field size (max 20)"
                    className="py-3 pr-16"
                    min="1"
                    max="20"
                    step="1"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">acres</span>
                </div>
              )}
            </div>
            {validationErrors.fieldSize && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.fieldSize}</p>
            )}
          </div>

          {/* Terrain Type - Full width on its own row */}
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Terrain Type <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              name="terrainType"
              value={formData.terrainType}
              onChange={(value) => handleInputChange({ target: { name: 'terrainType', value } } as any)}
              placeholder="Select terrain type"
              options={terrainTypeOptions}
            />
            {validationErrors.terrainType && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.terrainType}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className='w-full'>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Fence Type <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                name="fenceType"
                value={formData.fenceType}
                onChange={(value) => handleInputChange({ target: { name: 'fenceType', value } } as any)}
                placeholder="Select fence type"
                options={fenceTypeOptions}
              />
              {validationErrors.fenceType && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.fenceType}</p>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Fence Size <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                name="fenceSize"
                value={formData.fenceSize}
                onChange={(value) => handleInputChange({ target: { name: 'fenceSize', value } } as any)}
                placeholder="Select fence size"
                options={fenceSizeOptions}
              />
              {validationErrors.fenceSize && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.fenceSize}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Surface Type <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                name="surfaceType"
                value={formData.surfaceType}
                onChange={(value) => handleInputChange({ target: { name: 'surfaceType', value } } as any)}
                placeholder="Select surface type"
                options={surfaceTypeOptions}
              />
              {validationErrors.surfaceType && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.surfaceType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Max Number of Dogs Allowed Per Booking <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="maxDogs"
                value={formData.maxDogs}
                onChange={handleMaxDogsChange}
                placeholder="Enter max number of dogs (1-10)"
                maxLength={2}
                className={`py-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${validationErrors.maxDogs ? 'border-red-500' : ''}`}
                aria-invalid={!!validationErrors.maxDogs}
              />
              {validationErrors.maxDogs && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.maxDogs}</p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Description Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Description
        </h2>
        <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
          Write a description of your field <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Write a description here..."
          rows={5}
          maxLength={2000}
          className={`w-full px-4 py-3 bg-white rounded-2xl border ${validationErrors.description ? 'border-red-500' : 'border-gray-300'} hover:border-gray-400 focus:outline-none focus:border-green focus:ring-1 focus:ring-green/20 resize-none font-sans text-gray-input placeholder:text-gray-400 shadow-sm transition-all duration-200`}
          aria-invalid={!!validationErrors.description}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {validationErrors.description && (
              <p className="text-red-500 text-sm">{validationErrors.description}</p>
            )}
          </div>
          <p className="text-gray-500 text-xs">
            {formData.description.length}/2000
          </p>
        </div>
      </div>

      {/* Google Maps URL Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Google Reviews
        </h2>
        <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
          Google Maps URL <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <Input
          name="googleMapsUrl"
          value={formData.googleMapsUrl || ''}
          onChange={handleInputChange}
          placeholder="https://maps.google.com/..."
          className="mb-2"
        />
        <p className="text-gray-500 text-xs">
          Add your Google Maps business URL to display Google reviews on your field page.
          Find your URL by searching for your location on Google Maps and copying the URL from your browser.
        </p>
      </div>

      {/* Opening Days & Hours */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Opening Days & Hours
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Opening Days <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              name="openingDays"
              value={formData.openingDays}
              onChange={(value) => handleInputChange({ target: { name: 'openingDays', value } } as any)}
              placeholder="Select opening days"
              options={openingDaysOptions}
            />
            {validationErrors.openingDays && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.openingDays}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Start Time <span className="text-red-500">*</span>
              </label>
              <TimeInput
                name="startTime"
                value={formData.startTime}
                onChange={(value) => {
                  // Auto-calculate a suggested end time (1 hour after start) - no caps
                  const calculateAutoEndTime = (startTime: string): string => {
                    if (!startTime) return '';

                    // Parse 24-hour format from TimeInput
                    const [hours, minutes] = startTime.split(':').map(Number);

                    // Add 1 hour as default duration
                    let endHours = hours + 1;
                    let endMinutes = minutes || 0;

                    // Handle day overflow (e.g., 23:00 + 1 = 00:00)
                    if (endHours >= 24) {
                      endHours = endHours - 24;
                    }

                    // Return in 24-hour format (HH:MM) for TimeInput component
                    const formattedMinutes = endMinutes.toString().padStart(2, '0');
                    return `${endHours.toString().padStart(2, '0')}:${formattedMinutes}`;
                  };

                  const autoEndTime = calculateAutoEndTime(value);

                  setFormData((prev: any) => ({
                    ...prev,
                    startTime: value,
                    endTime: autoEndTime // Auto-set end time (can be changed by user)
                  }));
                  validateTimeDifference(value, autoEndTime);
                }}
                placeholder="Select start time"
                isStartTime={true}
              />
              {validationErrors.startTime && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                End Time <span className="text-red-500">*</span>
              </label>
              <TimeInput
                name="endTime"
                value={formData.endTime}
                onChange={(value) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    endTime: value
                  }));
                  validateTimeDifference(formData.startTime, value);
                }}
                placeholder="Select end time"
                isEndTime={true}
                startTime={formData.startTime}
              />
              {validationErrors.endTime && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.endTime}</p>
              )}
            </div>
          </div>
          {timeError && (
            <p className="text-red-500 text-sm mt-1 col-span-2">{timeError}</p>
          )}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Choose Amenities
        </h2>
        <div className="flex flex-wrap gap-3">
          {amenitiesLoading ? (
            <div className="text-gray-500">Loading amenities...</div>
          ) : amenities && amenities.length > 0 ? (
            amenities.map((amenity) => {
              const currentAmenities = Array.isArray(formData.amenities) ? formData.amenities : [];
              const isSelected = currentAmenities.includes(amenity.id);

              return (
                <div
                  key={amenity.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleAmenityToggle(amenity.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleAmenityToggle(amenity.id);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${isSelected
                    ? 'bg-cream border-green'
                    : 'bg-white border-gray-200 hover:border-green/50'
                    }`}
                  aria-pressed={isSelected}
                >
                  <CustomCheckbox
                    checked={isSelected}
                    onChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5">
                      <AmenityIcon
                        src={amenity.icon}
                        alt={amenity.name}
                        color={isSelected ? ICON_COLORS.green : ICON_COLORS.black}
                        size={20}
                      />
                    </div>
                    <span className="font-sans text-sm text-dark-green">
                      {amenity.label || amenity.name}
                    </span>
                  </div>
                </div >
              );
            })
          ) : (
            <div className="text-gray-500">No amenities available</div>
          )}
        </div>
        {validationErrors.amenities && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.amenities}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Address
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Street Address <span className="text-red-500">*</span>
            </label>
            <AddressAutocomplete
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              placeholder="42 Meadowcroft Lane"
              className={`w-full px-4 py-3 bg-white rounded-3xl border ${validationErrors.streetAddress ? 'border-red-500' : 'border-gray-300'} hover:border-gray-400 focus:outline-none focus:border-green focus:ring-1 focus:ring-green/20 font-sans text-gray-input placeholder:text-gray-400 shadow-sm transition-all duration-200`}
              onManualInput={() => {
                setFormData((prev: any) => ({
                  ...prev,
                  addressVerified: false,
                }));
              }}
              onAddressSelect={(components) => {
                // Validate that the address is in the UK
                const isUK = components.country === 'United Kingdom' ||
                  components.country === 'UK' ||
                  components.country === 'GB' ||
                  components.country === 'Great Britain';

                if (!isUK) {
                  alert('Please select a UK address only. This platform currently only supports UK locations.');
                  return;
                }

                setFormData((prev: any) => ({
                  ...prev,
                  streetAddress: components.streetAddress,
                  city: components.city,
                  county: components.county,
                  postalCode: components.postalCode,
                  addressVerified: true,
                  // Store the complete location object
                  location: {
                    streetAddress: components.streetAddress,
                    city: components.city,
                    county: components.county,
                    postalCode: components.postalCode,
                    lat: components.lat,
                    lng: components.lng,
                    formatted_address: components.formatted_address
                  }
                }));
              }}
            />
            {validationErrors.streetAddress && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.streetAddress}</p>
            )}
          </div>
          {/* <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Apartment/Suite
            </label>
            <Input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleInputChange}
              placeholder="Flat 5B"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div> */}
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              City <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Guildford"
              className={`py-3 ${validationErrors.city ? 'border-red-500' : ''}`}
              aria-invalid={!!validationErrors.city}
            />
            {validationErrors.city && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              County/State <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="county"
              value={formData.county}
              onChange={handleInputChange}
              placeholder="Surrey"
              className={`py-3 ${validationErrors.county ? 'border-red-500' : ''}`}
              aria-invalid={!!validationErrors.county}
            />
            {validationErrors.county && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.county}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="GU1 1AA"
              className={`py-3 ${validationErrors.postalCode ? 'border-red-500' : ''}`}
              aria-invalid={!!validationErrors.postalCode}
            />
            {validationErrors.postalCode && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.postalCode}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
