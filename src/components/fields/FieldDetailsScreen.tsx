import React from 'react';
import FieldDetailsLegacy from '@/components/fields/FieldDetailsLegacy';
import { useFieldDetails } from '@/hooks';
import { FieldDetailsSkeleton } from '@/components/skeletons/FieldDetailsSkeleton';


interface FieldDetailsScreenProps {
  field?: any;
  fieldId?: string;
  isSubmitted?: boolean;
  isPreview?: boolean;
  showReviews?: boolean;
  showOwnerInfo?: boolean;
  showClaimField?: boolean;
  headerContent?: React.ReactNode;
  initialData?: any;
}


export default function FieldDetailsScreen({
  field: providedField,
  fieldId,
  isSubmitted = false,
  isPreview = false,
  showReviews,
  showOwnerInfo,
  showClaimField,
  headerContent,
  initialData,
}: FieldDetailsScreenProps) {
  // Always fetch fresh data if fieldId is available and no providedField
  // This ensures we get the latest isClaimed status and other dynamic data
  const shouldFetch = !providedField && !!fieldId;
  const { data: fetchedField, isLoading, error } = useFieldDetails(shouldFetch ? (fieldId as string) : undefined as any);

  // Use fetched data if available, fall back to initialData (from SSG) during loading
  const field = providedField || fetchedField?.data || fetchedField || initialData;

  // Show skeleton only if we're loading AND have no initial data to display
  if (shouldFetch && isLoading && !initialData) {
    return <FieldDetailsSkeleton />;
  }

  if (!field || error) {
    return (
      <div className="min-h-screen bg-[#FFFCF3] mt-32 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">Field Not Found</h3>
            <p className="text-gray-600 mb-2">{typeof error === 'string' ? error : 'The field you are looking for does not exist.'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Field visibility checks (public detail page only - not preview mode, not field-owner provided view)
  // Priority: isBlocked > isActive+isApproved (for discoverability)
  if (!isPreview && !providedField) {
    // 1. Blocked by admin - field is NOT visible at all
    if (field.isBlocked === true) {
      return (
        <div className="min-h-screen bg-[#FFFCF3] mt-32 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">Field Not Available</h3>
              <p className="text-gray-600 mb-4">
                This field is currently not available.
              </p>
              <a
                href="/fields"
                className="inline-block bg-[#3A6B22] text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Browse Other Fields
              </a>
            </div>
          </div>
        </div>
      );
    }

    // 2. Field must be active AND approved to be discoverable on the platform
    if (field.isActive === false || field.isApproved === false) {
      return (
        <div className="min-h-screen bg-[#FFFCF3] mt-32 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">Field Not Available</h3>
              <p className="text-gray-600 mb-4">
                This field is currently not available for viewing. The field owner may have temporarily disabled it.
              </p>
              <a
                href="/fields"
                className="inline-block bg-[#3A6B22] text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Browse Other Fields
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  const resolvedShowReviews = typeof showReviews === 'boolean' ? showReviews : !isSubmitted;
  const resolvedShowOwnerInfo = typeof showOwnerInfo === 'boolean' ? showOwnerInfo : !isSubmitted;
  const resolvedShowClaimField = typeof showClaimField === 'boolean' ? showClaimField : !isSubmitted;

  return (
    <FieldDetailsLegacy
      field={field}
      isSubmitted={isSubmitted}
      isPreview={isPreview}
      headerContent={headerContent}
      showReviews={resolvedShowReviews}
      showOwnerInfo={resolvedShowOwnerInfo}
      showClaimField={resolvedShowClaimField}
    />
  );
}


