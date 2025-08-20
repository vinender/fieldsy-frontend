import React from 'react';
import { useRouter } from 'next/router';
import { UserLayout } from '@/components/layout/UserLayout';
import FieldDetailsScreen from '@/components/fields/FieldDetailsScreen';

export default function FieldDetailsPage() {
  const router = useRouter();
  const { field_id } = router.query;

  return (
    <UserLayout requireRole="DOG_OWNER">
      <FieldDetailsScreen fieldId={typeof field_id === 'string' ? field_id : undefined} />
    </UserLayout>
  );
}

