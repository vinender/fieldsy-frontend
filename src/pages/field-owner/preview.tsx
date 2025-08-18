import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import FieldPreview from '@/components/field-owner/FieldPreview';
import { UserLayout } from '@/components/layout/UserLayout';
import { useOwnerField, useSubmitFieldForReview } from '@/hooks';
import { toast } from 'sonner';

export default function PreviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Fetch the field data
  const { data: fieldData, isLoading: fetchingField } = useOwnerField({
    enabled: !!user && user.role === 'FIELD_OWNER',
  });

  // Submit field mutation
  const submitFieldMutation = useSubmitFieldForReview({
    onSuccess: () => {
      toast.success('Field submitted successfully!');
      router.push('/field-owner');
    }
  });

  useEffect(() => {
    // Redirect if not a field owner
    if (user && user.role !== 'FIELD_OWNER') {
      router.push('/');
    }
  }, [user, router]);

  const handleEdit = () => {
    router.push('/');
  };

  const handleSubmit = async () => {
    if (fieldData?.id) {
      await submitFieldMutation.mutateAsync({ fieldId: fieldData.id });
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
    weekendPrice: fieldData.pricePerDay?.toString() || '',
    instantBooking: fieldData.instantBooking || false,
    rules: fieldData.rules?.[0] || '',
    policies: fieldData.cancellationPolicy || ''
  } : null;

  if (fetchingField) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-3 border-green border-t-transparent rounded-full animate-spin" />
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
      <FieldPreview 
        formData={formData}
        onEdit={handleEdit}
        onSubmit={handleSubmit}
        isLoading={submitFieldMutation.isPending}
      />
    </UserLayout>
  );
}