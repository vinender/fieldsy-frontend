import React from 'react';
import { useRouter } from 'next/router';
import FieldOwnerDashboard from './FieldOwnerDashboard';
import { useOwnerField } from '@/hooks';
import BookingHistory from '@/components/field-owner/BookingHistory';

export default function FieldOwnerHome() {
  const { data: field, isLoading, showAddForm } = useOwnerField();
  const router = useRouter();
  const isEditMode = router.query.edit === 'true';

  if (isLoading) return null;

  // If no field exists or showAddForm is true, show add-field flow
  if (!field || showAddForm) {
    return <FieldOwnerDashboard />;
  }
  
  // If edit mode is explicitly set, show the dashboard form for editing
  if (isEditMode) {
    return <FieldOwnerDashboard />;
  }
  
  // If field submitted, show quick stats dashboard
  if (field?.isSubmitted) {
    return <BookingHistory />;
  }
  
  // Otherwise show add-field flow for incomplete fields
  return <FieldOwnerDashboard />;
}