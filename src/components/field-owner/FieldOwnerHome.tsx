import React from 'react';
import FieldOwnerDashboard from './FieldOwnerDashboard';

export default function FieldOwnerHome() {
  // Always show the same field form for field owners (same design for create and edit)
  return <FieldOwnerDashboard />;
}