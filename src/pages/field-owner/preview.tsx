import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import FieldPreview from '@/components/field-owner/FieldPreview';
import { UserLayout } from '@/components/layout/UserLayout';
import { useOwnerField, useSubmitFieldForReview } from '@/hooks';
import { toast } from 'sonner';
import ThankYouModal from '@/components/modal/ThankYouModal';
import axiosClient from '@/lib/api/axios-client';

export default function PreviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showThankYou, setShowThankYou] = useState(false);
  
  // Fetch the field data
  const { data: fieldData, isLoading: fetchingField, refetch } = useOwnerField({
    enabled: !!user && user.role === 'FIELD_OWNER',
  });

  // Submit field mutation
  const submitFieldMutation = useSubmitFieldForReview({
    onSuccess: () => {
      toast.success('Field submitted successfully!');
      setShowThankYou(true);
    }
  });

  useEffect(() => {
    // Redirect if not a field owner
    if (user && user.role !== 'FIELD_OWNER') {
      router.push('/');
    }
  }, [user, router]);

  const handleEdit = () => {
    router.push('/?edit=true');
  };

  const handleSubmit = async () => {
    if (fieldData?.id) {
      await submitFieldMutation.mutateAsync({ fieldId: fieldData.id });
      refetch();
    }
  };

  const handleToggleActive = async () => {
    if (!fieldData?.id) return;
    try {
      await axiosClient.patch(`/fields/${fieldData.id}/toggle-status`);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  // Transform field data to match the formData structure expected by FieldPreview
  const formData = fieldData ? {
    fieldName: fieldData.name || '',
    fieldSize: fieldData.size || '',
    terrainType: fieldData.terrainType || '',
    fenceType: fieldData.fenceType || '',
    fenceSize: fieldData.fenceSize || '',
    surfaceType: fieldData.surfaceType || '',
    maxDogs: fieldData.maxDogs?.toString() || '',
    description: fieldData.description || '',
    openingDays: fieldData.operatingDays?.[0] || '',
    startTime: fieldData.openingTime || '',
    endTime: fieldData.closingTime || '',
    amenities: fieldData.amenities?.reduce((acc: any, amenity: string) => {
      acc[amenity] = true;
      return acc;
    }, {}) || {},
    streetAddress: fieldData.address || '',
    apartment: fieldData.apartment || '',
    city: fieldData.city || '',
    county: fieldData.state || '',
    postalCode: fieldData.zipCode || '',
    country: fieldData.country || '',
    images: fieldData.images || [],
    pricePerHour: fieldData.pricePerHour?.toString() || '',
    bookingDuration: fieldData.bookingDuration || '30min',
    instantBooking: fieldData.instantBooking || false,
    rules: fieldData.rules?.[0] || '',
    policies: fieldData.cancellationPolicy || ''
  } : null;

  if (fetchingField) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </UserLayout>
    );
  }

  if (!formData) {
    return (
      <UserLayout>
        <div className="text-center py-10">
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
        onPreviewListing={() => router.push('/field-owner/preview')}
        onClose={() => setShowThankYou(false)}
      />
      <FieldPreview 
        formData={formData}
        onEdit={handleEdit}
        onSubmit={handleSubmit}
        isLoading={submitFieldMutation.isPending}
        isSubmitted={!!fieldData?.isSubmitted}
        isActive={!!fieldData?.isActive}
        onToggleActive={handleToggleActive}
      />
    </UserLayout>
  );
}