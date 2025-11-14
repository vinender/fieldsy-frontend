
import React, { useMemo, useState } from 'react';
import FieldDetailsScreen from '@/components/fields/FieldDetailsScreen';
import { Switch } from '@/components/ui/switch';
import BackButton from '@/components/common/BackButton';
import { useFieldOptions } from '@/hooks/api/useFieldOptions';
import { useAmenities } from '@/hooks/api/useAmenities';
import { ToggleFieldStatusModal } from '@/components/modal/ToggleFieldStatusModal';


interface FieldPreviewProps {
  formData: any;
  onEdit: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  isSubmitted?: boolean;
  isActive?: boolean;
  isClaimed?: boolean;
  onToggleActive?: () => void;
  onBack?: () => void;
}


export default function FieldPreview({ formData, onEdit, onSubmit, isLoading, isSubmitted, isActive, isClaimed = false, onToggleActive, onBack }: FieldPreviewProps) {
  const { data: fieldOptions } = useFieldOptions();
  const { data: amenitiesData } = useAmenities();
  const [modalOpen, setModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);


  // Create a lookup map for fast label retrieval
  const labelMap = useMemo(() => {
    if (!fieldOptions?.data) return {};
    const map: Record<string, string> = {};
    Object.values(fieldOptions.data).flat().forEach((option: any) => {
      map[option.value] = option.label;
    });
    return map;
  }, [fieldOptions]);


  // Create amenity lookup map
  const amenityMap = useMemo(() => {
    if (!amenitiesData) return {};
    const map: Record<string, string> = {};
    amenitiesData.forEach((amenity: any) => {
      map[amenity.id] = amenity.label || amenity.name;
    });
    console.log('Amenity Map:', map);
    return map;
  }, [amenitiesData]);


  // Debug: Log formData amenities
  console.log('FormData amenities:', formData?.amenities);


  // Handle toggle status click - open confirmation modal
  const handleToggleStatusClick = () => {
    if (isClaimed) {
      setModalOpen(true);
    }
  };

  
  // Handle confirm toggle from modal
  const handleConfirmToggle = async () => {
    if (!onToggleActive) return;

    setIsToggling(true);
    try {
      await onToggleActive();
      setModalOpen(false);
    } finally {
      setIsToggling(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

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
    // Map amenities - keep original format for proper icon display
    amenities: (() => {
      console.log('🔍 FieldPreview amenities processing:', {
        formDataAmenities: formData?.amenities,
        isArray: Array.isArray(formData?.amenities),
        firstElement: formData?.amenities?.[0],
        typeofFirstElement: typeof formData?.amenities?.[0]
      });

      if (!formData?.amenities) return [];

      // If amenities is an array
      if (Array.isArray(formData.amenities)) {
        // Check if array contains objects (already enriched from API with iconUrl)
        if (formData.amenities.length > 0 && typeof formData.amenities[0] === 'object' && formData.amenities[0] !== null) {
          // Return objects as-is for proper icon display
          console.log('✅ Returning enriched amenity objects:', formData.amenities);
          return formData.amenities;
        }

        // Array of strings (IDs or names) - enrich with amenityMap data
        const enrichedAmenities = formData.amenities
          .map((id: string) => {
            const amenityData = amenitiesData?.find((a: any) => a.id === id || a.name === id);
            if (amenityData) {
              console.log('🔑 Enriching amenity:', { id, amenityData });
              return {
                id: amenityData.id,
                name: amenityData.name,
                label: amenityData.label || amenityData.name,
                iconUrl: amenityData.icon
              };
            }
            // Fallback: return as string for backward compatibility
            const label = amenityMap[id] || id;
            console.log('⚠️ Using fallback for amenity:', { id, label });
            return label;
          })
          .filter(Boolean);

        console.log('✅ Returning enriched amenities:', enrichedAmenities);
        return enrichedAmenities;
      }

      // If amenities is an object (old format)
      if (typeof formData.amenities === 'object') {
        console.log('📦 Processing object format amenities');
        return Object.entries(formData.amenities)
          .filter(([_, isSelected]) => isSelected)
          .map(([key]) => {
            // Try to get from amenitiesData first
            const amenityData = amenitiesData?.find((a: any) =>
              a.id === key || a.name?.toLowerCase() === key.toLowerCase()
            );

            if (amenityData) {
              return {
                id: amenityData.id,
                name: amenityData.name,
                label: amenityData.label || amenityData.name,
                iconUrl: amenityData.icon
              };
            }

            // Fallback to hardcoded labels
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
          });
      }

      return [];
    })(),
    // Map other fields as needed
    state: formData?.county,
    openingTime: formData?.startTime,
    closingTime: formData?.endTime,
    openingDays: formData?.openingDays,
    operatingDays: formData?.openingDays ? [formData.openingDays] : [],
    size: formatLabel(formData?.fieldSize),
    fenceType: formatLabel(formData?.fenceType),
    fenceSize: formatLabel(formData?.fenceSize),
    type: formatLabel(formData?.terrainType),
    surfaceType: formatLabel(formData?.surfaceType),
    rules: formData?.rules ? [formData.rules] : [],
    cancellationPolicy: formData?.policies,
    instantBooking: formData?.instantBooking,
    maxDogs: formData?.maxDogs,
    minBookingDuration: formData?.bookingDuration,
    // Add missing fields for preview sections
    bufferTime: formData?.bufferTime || 30,
    bookingPolicies: formData?.bookingPolicies || [],
    latitude: formData?.latitude,
    longitude: formData?.longitude,
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
          <div className={`flex items-center bg-cream border border-green gap-2 rounded-[70px] px-[20px] py-[16px] ${!isClaimed ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-[16px] font-[700] w-[110px] text-green">{isActive ? 'Enabled' : 'Disable Field'}</span>
            <Switch
              checked={!!isActive}
              onCheckedChange={handleToggleStatusClick}
              disabled={!isClaimed || isToggling}
            />
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
    <>
      <FieldDetailsScreen
        field={field}
        isPreview={true}
        showReviews={false}
        showOwnerInfo={false}
        showClaimField={false}
        headerContent={headerContent}
      />

      {/* Toggle Field Status Modal */}
      <ToggleFieldStatusModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        field={{
          id: formData?.id || '',
          name: formData?.fieldName || '',
          isActive: !!isActive,
        }}
        onConfirm={handleConfirmToggle}
        isLoading={isToggling}
      />
    </>
  );
}