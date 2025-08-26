import React from 'react';
import dynamic from 'next/dynamic';
import FieldMapEmbed from './FieldMapEmbed';

// Dynamically import Google Maps component to avoid SSR issues
const FieldMap = dynamic(() => import('./FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center" style={{ height: '384px' }}>
      <div className="text-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  )
});

interface FieldMapWrapperProps {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  fieldName?: string;
  height?: string;
  className?: string;
  latitude?: number;
  longitude?: number;
}

export default function FieldMapWrapper(props: FieldMapWrapperProps) {
  // Check if Google Maps API key is available
  const hasGoogleMapsKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Use Google Maps if API key is available, otherwise use OpenStreetMap embed
  if (hasGoogleMapsKey) {
    return <FieldMap {...props} />;
  }

  return <FieldMapEmbed {...props} />;
}