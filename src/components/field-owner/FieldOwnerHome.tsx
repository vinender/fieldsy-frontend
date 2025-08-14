import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FieldOwnerDashboard from './FieldOwnerDashboard';
import BookingHistory from './BookingHistory';
import PageLoader from '@/components/common/PageLoader';
import axiosClient from '@/lib/api/axios-client';

export default function FieldOwnerHome() {
  const { user } = useAuth();
  const [hasField, setHasField] = useState<boolean | null>(() => {
    // Check if we have cached field status in sessionStorage
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('fieldOwnerHasField');
      if (cached !== null) {
        return cached === 'true';
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => hasField === null);

  useEffect(() => {
    // Only check field status if we don't have cached data
    if (hasField === null) {
      checkFieldStatus();
    } else {
      // Validate cached data in background
      validateCachedStatus();
    }
  }, [user]);

  const validateCachedStatus = async () => {
    // Silently validate cached status in background
    try {
      const response = await axiosClient.get('/fields/owner/field');
      const data = response.data;
      // Check if all steps are completed to show booking history
      const isFieldComplete = data.field?.allStepsCompleted || false;
      if (isFieldComplete !== hasField) {
        setHasField(isFieldComplete);
        sessionStorage.setItem('fieldOwnerHasField', String(isFieldComplete));
      }
    } catch (error) {
      console.error('Error validating field status:', error);
    }
  };

  const checkFieldStatus = async () => {
    try {
      // Check if field owner has already added a field
      const response = await axiosClient.get('/fields/owner/field');
      const data = response.data;
      
      // Check if all steps are completed to show booking history
      const isFieldComplete = data.field?.allStepsCompleted || false;
      setHasField(isFieldComplete);
      sessionStorage.setItem('fieldOwnerHasField', String(isFieldComplete));
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No field found for this owner - should not happen as we create empty field on signup
        setHasField(false);
        sessionStorage.setItem('fieldOwnerHasField', 'false');
      } else {
        console.error('Error checking field status:', error);
        setHasField(false);
        sessionStorage.setItem('fieldOwnerHasField', 'false');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to switch to add field form
  const handleAddField = () => {
    setHasField(false);
    sessionStorage.setItem('fieldOwnerHasField', 'false');
  };

  // Function to switch to booking history
  const handleViewBookings = () => {
    setHasField(true);
    sessionStorage.setItem('fieldOwnerHasField', 'true');
  };

  if (loading) {
    return <PageLoader />;
  }

  // Show booking history if field is complete, otherwise show add field form
  return hasField ? (
    <BookingHistory onAddField={handleAddField} />
  ) : (
    <FieldOwnerDashboard />
  );
}