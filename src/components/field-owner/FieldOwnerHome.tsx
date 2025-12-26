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
  const router = useRouter();

  // Parse query params from asPath to ensure we always have the latest values
  // This is more reliable than router.query during navigation transitions
  const getQueryFromPath = () => {
    if (typeof window === 'undefined') return { edit: false, addNew: false, fieldId: null };

    const url = new URL(window.location.href);
    return {
      edit: url.searchParams.get('edit') === 'true',
      addNew: url.searchParams.get('addNew') === 'true',
      fieldId: url.searchParams.get('fieldId')
    };
  };

  // Use router.query when ready, but verify against URL for accuracy
  const isEditMode = router.isReady ? router.query.edit === 'true' : false;
  const isAddNewMode = router.isReady ? router.query.addNew === 'true' : false;

  // Double-check using window.location for edit/addNew modes during transitions
  const urlParams = typeof window !== 'undefined' ? getQueryFromPath() : { edit: false, addNew: false, fieldId: null };
  const effectiveEditMode = isEditMode || urlParams.edit;
  const effectiveAddNewMode = isAddNewMode || urlParams.addNew;

  // Only fetch data when NOT in edit/addNew mode
  // This prevents unnecessary API calls and potential race conditions
  const shouldFetchData = router.isReady && !effectiveEditMode && !effectiveAddNewMode;

  const { data: field, isLoading, showAddForm } = useOwnerField({
    enabled: shouldFetchData,
  });
  const { data: allFields, isLoading: isLoadingAllFields } = useOwnerFields({
    enabled: shouldFetchData,
  });

  // Check if at least one submitted field exists - only when we should be fetching data
  const hasSubmittedField = shouldFetchData && allFields?.some((f: any) => f.isSubmitted);

  // Debug logging
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const params = Object.fromEntries(url.searchParams.entries());
      console.log('[FieldOwnerHome] State Debug:', {
        routerIsReady: router.isReady,
        routerQuery: router.query,
        windowLocation: window.location.href,
        urlParams: params,
        routerAsPath: router.asPath,
        effectiveEditMode,
        effectiveAddNewMode,
        shouldFetchData,
        fieldData: field,
        showAddForm
      });
    }
  }, [router.isReady, router.query, router.asPath, effectiveEditMode, effectiveAddNewMode, shouldFetchData, field, showAddForm]);

  // Wait for router to be ready before making routing decisions
  // But if we detect edit/addNew in URL, proceed immediately
  if (!router.isReady && !effectiveEditMode && !effectiveAddNewMode) {
    console.log('[FieldOwnerHome] Router not ready and no effective mode - showing skeleton');
    return <FieldOwnerDashboardPageSkeleton />;
  }

  // IMPORTANT: Check edit/addNew mode FIRST before anything else
  // This ensures that when user clicks edit/add from my-fields, they see the form immediately
  // Use effective modes which include URL-based detection for reliability
  if (effectiveAddNewMode) {
    console.log('[FieldOwnerHome] Rendering Dashboard (Add New Mode)');
    return (
      <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
        <FieldOwnerDashboard initialAddNewMode={true} />
      </Suspense>
    );
  }

  if (effectiveEditMode) {
    console.log('[FieldOwnerHome] Rendering Dashboard (Edit Mode)');
    return (
      <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
        <FieldOwnerDashboard initialEditMode={true} initialFieldId={(router.query.fieldId as string) || (urlParams.fieldId as string)} />
      </Suspense>
    );
  }

  // Only check loading state when we're actually fetching data
  if (shouldFetchData && (isLoading || isLoadingAllFields)) {
    if (!field || showAddForm) {
      return <FieldOwnerDashboardPageSkeleton />;
    }
    return <BookingHistoryPageSkeleton />;
  }

  // If at least one submitted field exists, show the dashboard (BookingHistory)
  if (hasSubmittedField) {
    console.log('[FieldOwnerHome] Rendering BookingHistory');
    return (
      <Suspense fallback={<BookingHistoryPageSkeleton />}>
        <BookingHistory />
      </Suspense>
    );
  }

  // If no field exists or showAddForm is true, show add-field flow
  if (!field || showAddForm) {
    console.log('[FieldOwnerHome] Rendering Dashboard (No field/Show Add Form)');
    return (
      <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
        <FieldOwnerDashboard />
      </Suspense>
    );
  }

  // Otherwise show add-field flow for incomplete fields
  console.log('[FieldOwnerHome] Rendering Dashboard (Fallback)');
  return (
    <Suspense fallback={<FieldOwnerDashboardPageSkeleton />}>
      <FieldOwnerDashboard />
    </Suspense>
  );
}