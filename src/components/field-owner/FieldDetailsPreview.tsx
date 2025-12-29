import React, { useMemo } from 'react';
import { formatTimeDisplay } from '@/components/ui/time-input';
import { useFieldOptions } from '@/hooks/api/useFieldOptions';

interface FieldDetailsPreviewProps {
  formData: any;
  readOnly?: boolean;
}

export default function FieldDetailsPreview({ formData, readOnly = true }: FieldDetailsPreviewProps) {
  const { data: fieldOptions } = useFieldOptions();

  // Create a lookup map for fast label retrieval
  const labelMap = useMemo(() => {
    if (!fieldOptions?.data) return {};
    const map: Record<string, string> = {};
    Object.values(fieldOptions.data).flat().forEach((option: any) => {
      map[option.value] = option.label;
    });
    return map;
  }, [fieldOptions]);

  const formatValue = (value: any) => {
    if (!value || value === '') return 'Not specified';
    return value;
  };

  const formatLabel = (value: string) => {
    return labelMap[value] || value;
  };

  const amenityLabels: any = {
    secureFencing: { icon: '/field-details/fence.svg', label: 'Secure Fencing' },
    waterAccess: { icon: '/add-field/water.svg', label: 'Water Access' },
    parking: { icon: '/payment/card.svg', label: 'Parking Available' },
    toilet: { icon: '/field-details/home.svg', label: 'Toilet Facilities' },
    shelter: { icon: '/add-field/shelter.svg', label: 'Shelter' },
    wasteDisposal: { icon: '/field-details/bin.svg', label: 'Waste Disposal' },
    dogAgility: { icon: '/add-field/dog-agility.svg', label: 'Dog Agility' },
    swimming: { icon: '/add-field/swimming.svg', label: 'Swimming Area' },
    playArea: { icon: '/add-field/dog-play.svg', label: 'Play Area' },
    cctv: { icon: '/add-field/cctv.svg', label: 'CCTV Security' },
    shadeAreas: { icon: '/add-field/tree.svg', label: 'Shade Areas' },
    lighting: { icon: '/add-field/clock.svg', label: 'Night Lighting' }
  };

  return (
    <div className="space-y-8">
      {/* Basic Info Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Basic Info
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Field Name
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-gray-input font-sans">{formatValue(formData?.fieldName)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Field Size
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-gray-input font-sans">{formatLabel(formData?.fieldSize)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Terrain Type
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-gray-input font-sans">{formatLabel(formData?.terrainType)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Fence Type
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-gray-input font-sans">{formatLabel(formData?.fenceType)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Fence Size
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-gray-input font-sans">{formatLabel(formData?.fenceSize)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Surface Type
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-gray-input font-sans">{formatLabel(formData?.surfaceType)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Max Number of Dogs Allowed Per Booking
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-gray-input font-sans">{formatValue(formData?.maxDogs)}</span>
              </div>
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
          Field description
        </label>
        <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 min-h-[120px]">
          <p className="text-gray-input font-sans whitespace-pre-wrap">
            {formatValue(formData?.description)}
          </p>
        </div>
      </div>

      {/* Opening Days & Hours */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Opening Days & Hours
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Opening Days
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-gray-input font-sans">{formatLabel(formData?.openingDays)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Start Time
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-gray-input font-sans">{formatTimeDisplay(formData?.startTime) || 'Not specified'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                End Time
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-gray-input font-sans">{formatTimeDisplay(formData?.endTime) || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Amenities
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {Object.entries(amenityLabels).map(([key, { icon, label }]) => {
            const isSelected = formData?.amenities?.[key];
            if (!isSelected) return null;
            
            return (
              <div
                key={key}
                className="px-4 py-2.5 rounded-2xl border bg-cream border-green flex items-center gap-3"
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={icon} 
                    alt={label} 
                    className="w-5 h-5 object-contain"
                  />
                  <span className="font-sans text-sm text-dark-green">
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
          {(!formData?.amenities || Object.values(formData.amenities).every(v => !v)) && (
            <span className="text-gray-text font-sans">No amenities selected</span>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Address
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Street Address
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-gray-input font-sans">{formatValue(formData?.streetAddress)}</span>
            </div>
          </div>
          {/* <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Apartment/Suite
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-gray-input font-sans">{formatValue(formData?.apartment)}</span>
            </div>
          </div> */}
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              City
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-gray-input font-sans">{formatValue(formData?.city)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              County/State
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-gray-input font-sans">{formatValue(formData?.county)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Postal Code
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-gray-input font-sans">{formatValue(formData?.postalCode)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}