import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import FieldPreview from '@/components/field-owner/FieldPreview';
import { UserLayout } from '@/components/layout/UserLayout';
import { useOwnerField, useOwnerFields, useSubmitFieldForReview } from '@/hooks';
import { toast } from 'sonner';
import ThankYouModal from '@/components/modal/ThankYouModal';
import axiosClient from '@/lib/api/axios-client';
import { FieldData } from '@/hooks/queries/useFieldQueries';
import Spinner from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { GridSkeleton } from '@/components/skeletons/SkeletonComponents';
import { Loader } from 'lucide-react';



export default function PreviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showThankYou, setShowThankYou] = useState(false);
  const { fieldId } = router.query;

  // If fieldId is provided in query, fetch that specific field from the list
  const { data: fields, isLoading: fetchingFields, refetch, isFetching: isFetchingFields, isSuccess: fieldsSuccess } = useOwnerFields({
    enabled: !!user && user.role === 'FIELD_OWNER' && !!fieldId,
  });

  // Also support legacy behavior - fetch single field if no fieldId in query
  const { data: legacyField, isLoading: fetchingLegacyField, refetch: refetchLegacy, isFetching: isFetchingLegacy, isSuccess: legacySuccess } = useOwnerField({
    enabled: !!user && user.role === 'FIELD_OWNER' && !fieldId,
  });

  // Determine which field to show
  const fieldData = fieldId
    ? fields?.find((f: FieldData) => f.id === fieldId)
    : legacyField;

  // Check if we're still waiting for data
  const isQueryEnabled = !!user && user.role === 'FIELD_OWNER';
  const isWaitingForData = isQueryEnabled && (
    (fieldId && !fieldsSuccess) || // Waiting for fields query
    (!fieldId && !legacySuccess)   // Waiting for legacy query
  );

  // Include all loading states: initial load, fetching, and waiting for user/router/data
  const isLoading = fetchingFields || fetchingLegacyField || isFetchingFields || isFetchingLegacy || !router.isReady || !user || isWaitingForData;

  // Debug: Log field data to verify isSubmitted is being fetched
  useEffect(() => {
    if (fieldData) {
      console.log('📊 Field Data:', {
        id: fieldData.id,
        name: fieldData.name,
        isSubmitted: fieldData.isSubmitted,
        isActive: fieldData.isActive,
        timestamp: new Date().toISOString(),
      });
    }
  }, [fieldData]);

  // Submit field mutation
  const submitFieldMutation = useSubmitFieldForReview({
    onSuccess: () => {
      toast.success('Field submitted successfully!');
      // Refetch is handled in mutationFn, data should be fresh now
      setShowThankYou(true);
    }
  });

  useEffect(() => {
    // Redirect if not a field owner
    if (user && user.role !== 'FIELD_OWNER') {
      router.replace('/');
    }
  }, [user]);

  const handleEdit = () => {
    const editFieldId = fieldData?.id;
    if (editFieldId) {
      router.push(`/?edit=true&fieldId=${editFieldId}&step=booking-rules`);
    } else {
      router.push('/?edit=true&step=booking-rules');
    }
  };

  const handleSubmit = async () => {
    if (fieldData?.id) {
      await submitFieldMutation.mutateAsync({ fieldId: fieldData.id });
    }
  };

  const handleToggleActive = async () => {
    if (!fieldData?.id) return;
    try {
      await axiosClient.patch(`/fields/${fieldData.id}/toggle-status`);
      fieldId ? refetch() : refetchLegacy();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackToList = () => {
    router.push('/field-owner/my-fields');
  };

  // Transform field data to match the formData structure expected by FieldPreview
  const transformFieldToFormData = (fieldData: FieldData) => {
    console.log('Raw fieldData.amenities from API:', fieldData.amenities);
    return {
      fieldName: fieldData.name || '',
      fieldSize: fieldData.size || '',
      customFieldSize: fieldData.customFieldSize || '',
      terrainType: fieldData.terrainType || '',
      fenceType: fieldData.fenceType || '',
      fenceSize: fieldData.fenceSize || '',
      surfaceType: fieldData.surfaceType || '',
      maxDogs: fieldData.maxDogs?.toString() || '',
      description: fieldData.description || '',
      openingDays: fieldData.operatingDays?.[0] || '',
      startTime: fieldData.openingTime || '',
      endTime: fieldData.closingTime || '',
      // Keep amenities in their original format from API (array of objects or array of IDs)
      // Don't transform to object format - FieldPreview will handle the transformation
      amenities: fieldData.amenities || [],
      streetAddress: fieldData.address || '',
      apartment: (fieldData as any).apartment || '',
      city: fieldData.city || '',
      county: fieldData.state || '',
      postalCode: fieldData.zipCode || '',
      country: fieldData.country || '',
      images: fieldData.images || [],
      pricePerHour: fieldData.price?.toString() || '',
      price: fieldData.price,
      price30min: fieldData.price30min,
      price1hr: fieldData.price1hr,
      bookingDuration: fieldData.bookingDuration || '30min',
      instantBooking: fieldData.instantBooking || false,
      rules: fieldData.rules?.[0] || '',
      policies: fieldData.cancellationPolicy || '',
      // Add missing fields for preview sections
      bufferTime: fieldData.bufferTime || 30,
      bookingPolicies: fieldData.bookingPolicies || [],
      latitude: fieldData.latitude,
      longitude: fieldData.longitude
    };
  };

  const formData = fieldData ? transformFieldToFormData(fieldData) : null;

  // Show spinner while loading (user not ready, router not ready, or fetching data)
  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-[400px] mt-24">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-gray-600 mt-4">Loading preview...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Only show "no field data" after loading is complete and still no data
  if (!formData) {
    return (
      <UserLayout>
        <div className="text-center py-10 mt-60">
          <p className="text-gray-text">No field data found. Please complete the field setup first.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-green text-white rounded-full font-semibold"
          >
            Go to Setup
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <ThankYouModal
        isOpen={showThankYou}
        onGoHome={() => router.push('/')}
        onPreviewListing={() => {
          setShowThankYou(false);
          if (fieldId) {
            handleBackToList();
          } else {
            router.push('/field-owner/preview');
          }
        }}
        onClose={() => setShowThankYou(false)}
      />
      <FieldPreview
        formData={formData}
        onEdit={handleEdit}
        onSubmit={handleSubmit}
        isLoading={submitFieldMutation.isPending}
        isSubmitted={!!fieldData?.isSubmitted}
        isActive={!!fieldData?.isActive}
        isClaimed={!!fieldData?.isClaimed}
        onToggleActive={handleToggleActive}
        onBack={fieldId ? handleBackToList : undefined}
      />
    </UserLayout>
  );
}

// Force SSR for this authenticated page - prevents _next/data routing issues
export async function getServerSideProps() {
  return {
    props: {},
  };
}