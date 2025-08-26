import React, { useState } from 'react';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';

export default function TestLocationSave() {
  const [addressData, setAddressData] = useState({
    streetAddress: '',
    city: '',
    county: '',
    postalCode: '',
    country: '',
    location: null as any
  });

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8">
        <h1 className="text-2xl font-bold mb-4 text-dark-green">Test Location with Coordinates</h1>
        <p className="text-gray-600 mb-8">
          Type an address and select from autocomplete. It will capture both address components and GPS coordinates.
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Street Address (with Google Autocomplete)
            </label>
            <AddressAutocomplete
              name="streetAddress"
              value={addressData.streetAddress}
              onChange={(e) => {
                setAddressData(prev => ({
                  ...prev,
                  streetAddress: (e.target as any).value
                }));
              }}
              placeholder="Start typing an address..."
              className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-border focus:outline-none focus:border-green font-sans text-gray-input placeholder:text-gray-400"
              onAddressSelect={(components) => {
                console.log('Selected address components:', components);
                setAddressData({
                  streetAddress: components.streetAddress,
                  city: components.city,
                  county: components.county,
                  postalCode: components.postalCode,
                  country: components.country,
                  location: {
                    streetAddress: components.streetAddress,
                    city: components.city,
                    county: components.county,
                    postalCode: components.postalCode,
                    country: components.country,
                    lat: components.lat,
                    lng: components.lng,
                    formatted_address: components.formatted_address
                  }
                });
              }}
            />
          </div>

          {/* Display auto-filled fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green">City</label>
              <input
                type="text"
                value={addressData.city}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green">County/State</label>
              <input
                type="text"
                value={addressData.county}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green">Postal Code</label>
              <input
                type="text"
                value={addressData.postalCode}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green">Country</label>
              <input
                type="text"
                value={addressData.country}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-600"
              />
            </div>
          </div>
        </div>
        
        {/* Show location object with coordinates */}
        {addressData.location && (
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-bold mb-2 text-green-800">✅ Location Object (Ready to Save)</h3>
              <pre className="text-sm overflow-auto text-green-700">
                {JSON.stringify(addressData.location, null, 2)}
              </pre>
            </div>
            
            {addressData.location.lat && addressData.location.lng && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold mb-2 text-blue-800">📍 GPS Coordinates</h3>
                <div className="grid grid-cols-2 gap-4 text-blue-700">
                  <div>
                    <span className="font-medium">Latitude:</span> {addressData.location.lat}
                  </div>
                  <div>
                    <span className="font-medium">Longitude:</span> {addressData.location.lng}
                  </div>
                </div>
                <div className="mt-2">
                  <a
                    href={`https://www.google.com/maps?q=${addressData.location.lat},${addressData.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">📝 Schema Information</h4>
          <p className="text-sm text-yellow-700">
            This location object is saved in the MongoDB <code className="bg-yellow-100 px-1 py-0.5 rounded">location</code> field as JSON.
            The lat/lng are also saved separately in <code className="bg-yellow-100 px-1 py-0.5 rounded">latitude</code> and <code className="bg-yellow-100 px-1 py-0.5 rounded">longitude</code> fields for backward compatibility.
          </p>
        </div>
      </div>
    </div>
  );
}