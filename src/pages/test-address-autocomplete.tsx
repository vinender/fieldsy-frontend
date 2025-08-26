import React, { useState } from 'react';
import FieldDetails from '@/components/field-owner/forms/FieldDetails';

export default function TestAddressAutocomplete() {
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldSize: '',
    terrainType: '',
    fenceType: '',
    fenceSize: '',
    surfaceType: '',
    maxDogs: '',
    description: '',
    openingDays: '',
    startTime: '',
    endTime: '',
    amenities: {
      secureFencing: false,
      waterAccess: false,
      parking: false,
      toilet: false,
      shelter: false,
      wasteDisposal: false,
      dogAgility: false,
      swimming: false,
      playArea: false,
      cctv: false,
      shadeAreas: false,
      lighting: false
    },
    streetAddress: '',
    city: '',
    county: '',
    postalCode: '',
    country: '',
    location: null
  });

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8">
        <h1 className="text-2xl font-bold mb-4 text-dark-green">Test Address Autocomplete</h1>
        <p className="text-gray-600 mb-8">
          Try typing an address in the Street Address field. The autocomplete should appear with custom styling matching the Fieldsy theme.
        </p>
        
        <FieldDetails 
          formData={formData}
          setFormData={setFormData}
        />
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Current Form Data (Address Fields):</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify({
              streetAddress: formData.streetAddress,
              city: formData.city,
              county: formData.county,
              postalCode: formData.postalCode,
              country: formData.country
            }, null, 2)}
          </pre>
        </div>
        
        {formData.location && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-bold mb-2 text-green-800">Location Object (with Coordinates):</h3>
            <pre className="text-sm overflow-auto text-green-700">
              {JSON.stringify(formData.location, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}