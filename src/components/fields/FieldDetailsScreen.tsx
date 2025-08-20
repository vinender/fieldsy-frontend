import React from 'react';
import FieldDetailsLegacy from '@/components/fields/FieldDetailsLegacy';
import { useFieldDetails } from '@/hooks';
import { FieldDetailsSkeleton } from '@/components/skeletons/FieldDetailsSkeleton';

interface FieldDetailsScreenProps {
  field?: any;
  fieldId?: string;
  isPreview?: boolean;
  showReviews?: boolean;
  showOwnerInfo?: boolean;
  showClaimField?: boolean;
  headerContent?: React.ReactNode;
}

export default function FieldDetailsScreen({
  field: providedField,
  fieldId,
  isPreview = false,
  showReviews,
  showOwnerInfo,
  showClaimField,
  headerContent,
}: FieldDetailsScreenProps) {
  const shouldFetch = !providedField && !!fieldId;
  const { data: fetchedField, isLoading, error } = useFieldDetails(shouldFetch ? (fieldId as string) : undefined as any);

  const field = providedField || fetchedField?.data || fetchedField;

  if (shouldFetch && isLoading) {
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

  const resolvedShowReviews = typeof showReviews === 'boolean' ? showReviews : !isPreview;
  const resolvedShowOwnerInfo = typeof showOwnerInfo === 'boolean' ? showOwnerInfo : !isPreview;
  const resolvedShowClaimField = typeof showClaimField === 'boolean' ? showClaimField : !isPreview;

  return (
    <FieldDetailsLegacy 
      field={field}
      isPreview={isPreview}
      headerContent={headerContent}
      showReviews={resolvedShowReviews}
    />
  );
}


