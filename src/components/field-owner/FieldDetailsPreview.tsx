import React from 'react';
import { formatTimeDisplay } from '@/components/ui/time-input';

interface FieldDetailsPreviewProps {
  formData: any;
  readOnly?: boolean;
}

export default function FieldDetailsPreview({ formData, readOnly = true }: FieldDetailsPreviewProps) {
  const formatValue = (value: any) => {
    if (!value || value === '') return 'Not specified';
    return value;
  };

  const formatLabel = (value: string) => {
    // Convert value like 'small' to 'Small (1 acre or less)'
    const labelMappings: any = {
      // Field Size
      'small': 'Small (1 acre or less)',
      'medium': 'Medium (1-3 acres)',
      'large': 'Large (3+ acres)',
      // Terrain Type
      'soft-grass': 'Soft Grass',
      'walking-path': 'Walking Path',
      'wood-chips': 'Wood Chips',
      'artificial-grass': 'Artificial Grass',
      'mixed-terrain': 'Mixed Terrain',
      // Fence Type
      'post-and-wire': 'Post and Wire',
      'wooden-panel': 'Wooden Panel',
      'fully-enclosed-field-fencing': 'Fully Enclosed Field Fencing',
      'metal-rail': 'Metal Rail',
      'mixed-multiple-types': 'Mixed/Multiple Types',
      'no-fence': 'No Fence',
      // Fence Size
      'under-1-metre': 'Under 1 metre (3 ft)',
      '1-2-metres': '1-2 metres (3-6 ft)',
      '2-3-metres': '2-3 metres (6-9 ft)',
      '3-4-metres': '3-4 metres (9-12 ft)',
      '4-5-metres': '4-5 metres (12-15 ft)',
      '5-6-metres': '5-6 metres (15-18 ft)',
      '6-7-metres': '6-7 metres (18-21 ft)',
      '7-8-metres': '7-8 metres (21-24 ft)',
      '8-9-metres': '8-9 metres (24-27 ft)',
      '9-10-metres': '9-10 metres (27-30 ft)',
      // Surface Type
      'grass': 'Grass',
      'gravel': 'Gravel',
      'meadow': 'Meadow',
      'paved-path': 'Paved Path',
      'flat-with-gentle-slopes': 'Flat with Gentle Slopes',
      'muddy': 'Muddy',
      'other': 'Other',
      // Opening Days
      'everyday': 'Every day',
      'weekdays': 'Weekdays only',
      'weekends': 'Weekends only'
    };
    
    return labelMappings[value] || value;
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
                Max Number of Dogs Allowed
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