import React from 'react';
import FieldOwnerDashboard from './FieldOwnerDashboard';
import { useOwnerField } from '@/hooks';
import BookingHistory from '@/components/field-owner/BookingHistory';

export default function FieldOwnerHome() {
  const { data: field, isLoading, showAddForm } = useOwnerField();

  if (isLoading) return null;

  // If no field exists or showAddForm is true, show add-field flow
  if (!field || showAddForm) {
    return <FieldOwnerDashboard />;
  }
  
  // If field submitted, show quick stats dashboard
  if (field?.isSubmitted) {
    return <BookingHistory />;
  }
  
  // Otherwise show add-field flow for incomplete fields
  return <FieldOwnerDashboard />;
}