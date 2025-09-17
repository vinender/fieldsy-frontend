import React from 'react';
import { useRouter } from 'next/router';
import FieldOwnerDashboard from './FieldOwnerDashboard';
import { useOwnerField } from '@/hooks';
import BookingHistory from '@/components/field-owner/BookingHistory';

export default function FieldOwnerHome() {
  const { data: field, isLoading, showAddForm } = useOwnerField();
  const router = useRouter();
  const isEditMode = router.query.edit === 'true';

  // Debug logging
  console.log('FieldOwnerHome - field data:', field);
  console.log('FieldOwnerHome - isSubmitted:', field?.isSubmitted);
  console.log('FieldOwnerHome - showAddForm:', showAddForm);
  console.log('FieldOwnerHome - isEditMode:', isEditMode);

  if (isLoading) return null;

  // If no field exists or showAddForm is true, show add-field flow
  if (!field || showAddForm) {
    console.log('Showing FieldOwnerDashboard - no field or showAddForm');
    return <FieldOwnerDashboard />;
  }
  
  // If edit mode is explicitly set, show the dashboard form for editing
  if (isEditMode) {
    console.log('Showing FieldOwnerDashboard - edit mode');
    return <FieldOwnerDashboard />;
  }
  
  // If field submitted, show quick stats dashboard
  if (field?.isSubmitted) {
    console.log('Showing BookingHistory - field is submitted');
    return <BookingHistory />;
  }
  
  // Otherwise show add-field flow for incomplete fields
  console.log('Showing FieldOwnerDashboard - field not submitted');
  return <FieldOwnerDashboard />;
}