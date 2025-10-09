import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/custom-select';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { TimeInput } from '@/components/ui/time-input';
import { usePublicSettings } from '@/hooks/usePublicSettings';
import { useAmenities } from '@/hooks/api/useAmenities';
import { useFieldOptions } from '@/hooks/api/useFieldOptions';
import Image from 'next/image';

interface FieldDetailsProps {
  formData: any;
  setFormData: (updater: any) => void;
  validationErrors?: Record<string, string>;
}

export default function FieldDetails({ formData, setFormData, validationErrors = {} }: FieldDetailsProps) {
  const { data: settings } = usePublicSettings();
  const { data: amenities, isLoading: amenitiesLoading } = useAmenities();
  const { data: fieldOptions, isLoading: optionsLoading } = useFieldOptions();
  const minimumOperatingHours = settings?.minimumFieldOperatingHours || 4;
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
      [name]: value
    }));
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

  // Validate time difference
  const validateTimeDifference = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) {
      setTimeError('');
      return;
    }
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const diffMinutes = endMinutes - startMinutes;
    const diffHours = diffMinutes / 60;
    
    if (diffHours < 0) {
      setTimeError('End time must be after start time');
    } else if (diffHours < minimumOperatingHours) {
      setTimeError(`Field must be open for at least ${minimumOperatingHours} hours`);
    } else {
      setTimeError('');
    }
  };

  // Validate whenever times change
  useEffect(() => {
    validateTimeDifference(formData.startTime, formData.endTime);
  }, [formData.startTime, formData.endTime, minimumOperatingHours]);

  console.log('fieldData formData',formData);

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev: any) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2 text-dark-green font-sans">
          Tell us about your field
        </h1>
        <p className="text-base text-gray-text font-sans">
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
              className={`py-3 font-sans ${validationErrors.fieldName ? 'border-red-500' : 'border-gray-border'} focus:border-green`}
            />
            {validationErrors.fieldName && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.fieldName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Field Size <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                name="fieldSize"
                value={formData.fieldSize}
                onChange={(value) => handleInputChange({ target: { name: 'fieldSize', value } } as any)}
                placeholder="Select size"
                options={fieldSizeOptions}
              />
              {validationErrors.fieldSize && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.fieldSize}</p>
              )}
            </div>

            <div className=''>
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
                Max Number of Dogs Allowed <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="maxDogs"
                value={formData.maxDogs}
                onChange={handleInputChange}
                placeholder="Enter max number of dogs allowed"
                className={`py-3 appearance-none font-sans ${validationErrors.maxDogs ? 'border-red-500' : 'border-gray-border'} focus:border-green`}
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
          className={`w-full px-4 py-3 bg-white rounded-2xl border ${validationErrors.description ? 'border-red-500' : 'border-gray-border'} focus:outline-none focus:border-green resize-none font-sans text-gray-input placeholder:text-gray-400`}
        />
        {validationErrors.description && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
        )}
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
                  setFormData((prev: any) => ({
                    ...prev,
                    startTime: value
                  }));
                  validateTimeDifference(value, formData.endTime);
                }}
                placeholder="Select start time"
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
                minHoursDifference={minimumOperatingHours}
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
      <div className=''>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Choose Amenities
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {amenitiesLoading ? (
            <div className="text-gray-500">Loading amenities...</div>
          ) : amenities && amenities.length > 0 ? (
            amenities.map((amenity) => (
              <div
                key={amenity.id}
                role="button"
                tabIndex={0}
                onClick={() => handleAmenityToggle(amenity.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAmenityToggle(amenity.name);
                  }
                }}
                className={`px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                  formData.amenities[amenity.name]
                    ? 'bg-cream border-green'
                    : 'bg-white border-gray-200 hover:border-green/50'
                }`}
                aria-pressed={!!formData.amenities[amenity.name]}
              >
                <CustomCheckbox
                  checked={formData.amenities[amenity.name] || false}
                  onChange={() => handleAmenityToggle(amenity.name)}
                />
                <div className="flex items-center gap-2">
                  {amenity.icon ? (
                    <div className="relative w-5 h-5">
                      <Image
                        src={amenity.icon}
                        alt={amenity.name}
                        height={100}
                        width={100}
                        className="object-contain "
                      />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                  )}
                  <span className="font-sans text-sm text-dark-green">
                    {amenity.name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">No amenities available</div>
          )}
        </div>
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
              className={`w-full px-4 py-3 bg-white rounded-2xl border ${validationErrors.streetAddress ? 'border-red-500' : 'border-gray-border'} focus:outline-none focus:border-green font-sans text-gray-input placeholder:text-gray-400`}
              onAddressSelect={(components) => {
                setFormData((prev: any) => ({
                  ...prev,
                  streetAddress: components.streetAddress,
                  city: components.city,
                  county: components.county,
                  postalCode: components.postalCode,
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
              className={`py-3 text-gray-input font-sans ${validationErrors.city ? 'border-red-500' : 'border-gray-border'} focus:border-green`}
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
              className={`py-3 text-gray-input font-sans ${validationErrors.county ? 'border-red-500' : 'border-gray-border'} focus:border-green`}
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
              className={`py-3 text-gray-input font-sans ${validationErrors.postalCode ? 'border-red-500' : 'border-gray-border'} focus:border-green`}
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