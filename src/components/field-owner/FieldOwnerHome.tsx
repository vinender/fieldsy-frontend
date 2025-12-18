import React, { Suspense } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useOwnerField, useOwnerFields } from '@/hooks';
import {
  BookingHistoryPageSkeleton,
  FieldOwnerDashboardPageSkeleton
} from '@/components/skeletons/FieldOwnerSkeletons';

// Lazy load the dashboard components
const FieldOwnerDashboard = dynamic(
  () => import('./FieldOwnerDashboard'),
  {
    loading: () => <FieldOwnerDashboardPageSkeleton />,
    ssr: false
  }
);

const BookingHistory = dynamic(
  () => import('./BookingHistory'),
  {
    loading: () => <BookingHistoryPageSkeleton />,
    ssr: false
  }
);

export default function FieldOwnerHome() {
  const { data: field, isLoading, showAddForm } = useOwnerField();
  const { data: allFields, isLoading: isLoadingAllFields } = useOwnerFields();
  const router = useRouter();
  const isEditMode = router.query.edit === 'true';
  const isAddNewMode = router.query.addNew === 'true';

  // Check if at least one submitted field exists
  const hasSubmittedField = allFields?.some((f: any) => f.isSubmitted) || false;

  if (isLoading || isLoadingAllFields) {
    // Show appropriate skeleton based on what we expect to load
    if (!field || showAddForm || isEditMode || isAddNewMode) {
      return <FieldOwnerDashboardPageSkeleton />;
    }
    return <BookingHistoryPageSkeleton />;
  }

  // If addNew mode is explicitly set, show fresh form for adding new field
  if (isAddNewMode) {
    return (
      <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
        <FieldOwnerDashboard />
      </Suspense>
    );
  }

  // If edit mode is explicitly set, show the dashboard form for editing
  if (isEditMode) {
    return (
      <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
        <FieldOwnerDashboard />
      </Suspense>
    );
  }

  // If at least one submitted field exists, show the dashboard (BookingHistory)
  // This ensures that after submission, clicking "Go to Home" shows the dashboard
  if (hasSubmittedField) {
    return (
      <Suspense fallback={<BookingHistoryPageSkeleton />}>
        <BookingHistory />
      </Suspense>
    );
  }

  // If no field exists or showAddForm is true, show add-field flow
  if (!field || showAddForm) {
    return (
      <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
        <FieldOwnerDashboard />
      </Suspense>
    );
  }

  // Otherwise show add-field flow for incomplete fields
  return (
    <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
      <FieldOwnerDashboard />
    </Suspense>
  );
}