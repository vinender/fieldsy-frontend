import React from 'react';
import FieldDetailsScreen from '@/components/fields/FieldDetailsScreen';
import { Switch } from '@/components/ui/switch';

interface FieldPreviewProps {
  formData: any;
  onEdit: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  isSubmitted?: boolean;
  isActive?: boolean;
  onToggleActive?: () => void;
}

export default function FieldPreview({ formData, onEdit, onSubmit, isLoading, isSubmitted, isActive, onToggleActive }: FieldPreviewProps) {
  // Transform formData to match field structure if needed
  const field = {
    ...formData,
    name: formData?.fieldName,
    address: formData?.streetAddress,
    apartment: formData?.apartment,
    city: formData?.city,
    zipCode: formData?.postalCode,
    country: formData?.country,
    // Map amenities from object format to array format
    amenities: formData?.amenities 
      ? Object.entries(formData.amenities)
          .filter(([_, isSelected]) => isSelected)
          .map(([key]) => {
            // Map amenity keys to display labels
            const amenityLabels: Record<string, string> = {
              'secureFencing': 'Secure fencing',
              'waterAccess': 'Water Access',
              'parking': 'Parking',
              'toilet': 'Toilet',
              'shelter': 'Shelter',
              'wasteDisposal': 'Waste Disposal',
              'dogAgility': 'Dog Agility',
              'swimming': 'Swimming',
              'playArea': 'Play Area',
              'cctv': 'CCTV',
              'shadeAreas': 'Shade Areas',
              'lighting': 'Lighting'
            };
            return amenityLabels[key] || key;
          })
      : [],
    // Map other fields as needed
    state: formData?.county,
    openingTime: formData?.startTime,
    closingTime: formData?.endTime,
    size: formatLabel(formData?.fieldSize),
    fenceType: formatLabel(formData?.fenceType) + (formData?.fenceSize ? ` • ${formatLabel(formData?.fenceSize)}` : ''),
    type: formatLabel(formData?.terrainType),
    surfaceType: formatLabel(formData?.surfaceType),
    rules: formData?.rules,
    cancellationPolicy: formData?.policies,
    instantBooking: formData?.instantBooking,
    maxDogs: formData?.maxDogs,
    minBookingDuration: formData?.bookingDuration,
    // Set isActive to true for preview to show all sections
    isActive: true
  };

  function formatLabel(value: string) {
    if (!value) return null;
    
    const labelMappings: any = {
      'small': 'Small (1 acre or less)',
      'medium': 'Medium (1-3 acres)',
      'large': 'Large (3+ acres)',
      'soft-grass': 'Soft Grass',
      'walking-path': 'Walking Path',
      'wood-chips': 'Wood Chips',
      'artificial-grass': 'Artificial Grass',
      'mixed-terrain': 'Mixed Terrain',
      'post-and-wire': 'Post and Wire',
      'wooden-panel': 'Wooden Panel',
      'fully-enclosed-field-fencing': 'Fully Enclosed Field Fencing',
      'metal-rail': 'Metal Rail',
      'mixed-multiple-types': 'Mixed/Multiple Types',
      'no-fence': 'No Fence',
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
      'grass': 'Grass',
      'gravel': 'Gravel',
      'meadow': 'Meadow',
      'paved-path': 'Paved Path',
      'flat-with-gentle-slopes': 'Flat with gentle slopes',
      'muddy': 'Muddy',
      'other': 'Other',
      'everyday': 'Every day',
      'weekdays': 'Weekdays only',
      'weekends': 'Weekends only'
    };
    
    return labelMappings[value] || value;
  }

  const headerContent = (
    <div className="flex justify-between items-center">
      <div>
        
        <h1 className="text-3xl font-semibold text-dark-green font-sans">{isSubmitted ? 'My Field' : 'Preview '}</h1>
        {/* {!isSubmitted && (
          <p className="text-base text-gray-text font-sans mt-1">Review how your field will appear to potential customers</p>
        )} */}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onEdit}
          className="px-[20px] py-[16px] w-[120px] rounded-[70px] border border-green text-green text-[16px] font-[700] font-sans bg-cream transition-colors hover:bg-gray-50"
        >
          Edit
        </button>
        {isSubmitted ? (
          <div className="flex items-center bg-cream border border-green gap-2 rounded-[70px] px-[20px] py-[16px]">
            <span className="text-[16px] font-[700] w-[110px] text-green">{isActive ? 'Enabled' : 'Disable Field'}</span>
            <Switch checked={!!isActive} onCheckedChange={() => onToggleActive?.()} />
          </div>
        ) : (
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-[20px] py-[16px] w-[120px] rounded-full bg-green text-white font-semibold font-sans transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <FieldDetailsScreen
      field={field}
      isPreview={true}
      showReviews={false}
      showOwnerInfo={false}
      showClaimField={false}
      headerContent={headerContent}
    />
  );
}