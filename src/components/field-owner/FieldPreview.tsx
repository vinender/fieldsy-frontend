import React, { useMemo } from 'react';
import FieldDetailsScreen from '@/components/fields/FieldDetailsScreen';
import { Switch } from '@/components/ui/switch';
import BackButton from '@/components/common/BackButton';
import { useFieldOptions } from '@/hooks/api/useFieldOptions';

interface FieldPreviewProps {
  formData: any;
  onEdit: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  isSubmitted?: boolean;
  isActive?: boolean;
  onToggleActive?: () => void;
  onBack?: () => void;
}

export default function FieldPreview({ formData, onEdit, onSubmit, isLoading, isSubmitted, isActive, onToggleActive, onBack }: FieldPreviewProps) {
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

  const formatLabel = (value: string) => {
    if (!value) return null;
    return labelMap[value] || value;
  };

  // Transform formData to match field structure if needed
  const field = {
    ...formData,
    name: formData?.fieldName,
    address: formData?.streetAddress,
    apartment: formData?.apartment,
    city: formData?.city,
    zipCode: formData?.postalCode,
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


  const headerContent = (
    <div className="flex justify-between items-center">
      <BackButton
        size='lg'
        label={isSubmitted ? 'My Field' : 'Preview'}
        showLabel={true}
        onClick={onBack}
      />
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