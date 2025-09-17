import React, { Suspense } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useOwnerField } from '@/hooks';
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
  const router = useRouter();
  const isEditMode = router.query.edit === 'true';

  // Debug logging
  console.log('FieldOwnerHome - field data:', field);
  console.log('FieldOwnerHome - isSubmitted:', field?.isSubmitted);
  console.log('FieldOwnerHome - showAddForm:', showAddForm);
  console.log('FieldOwnerHome - isEditMode:', isEditMode);

  if (isLoading) {
    // Show appropriate skeleton based on what we expect to load
    if (!field || showAddForm || isEditMode) {
      return <FieldOwnerDashboardPageSkeleton />;
    }
    return <BookingHistoryPageSkeleton />;
  }

  // If no field exists or showAddForm is true, show add-field flow
  if (!field || showAddForm) {
    console.log('Showing FieldOwnerDashboard - no field or showAddForm');
    return (
      <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
        <FieldOwnerDashboard />
      </Suspense>
    );
  }
  
  // If edit mode is explicitly set, show the dashboard form for editing
  if (isEditMode) {
    console.log('Showing FieldOwnerDashboard - edit mode');
    return (
      <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
        <FieldOwnerDashboard />
      </Suspense>
    );
  }
  
  // If field submitted, show quick stats dashboard
  if (field?.isSubmitted) {
    console.log('Showing BookingHistory - field is submitted');
    return (
      <Suspense fallback={<BookingHistoryPageSkeleton />}>
        <BookingHistory />
      </Suspense>
    );
  }
  
  // Otherwise show add-field flow for incomplete fields
  console.log('Showing FieldOwnerDashboard - field not submitted');
  return (
    <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
      <FieldOwnerDashboard />
    </Suspense>
  );
}