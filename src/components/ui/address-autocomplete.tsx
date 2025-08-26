'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

interface AddressComponents {
  streetAddress: string;
  city: string;
  county: string;
  postalCode: string;
  country: string;
  lat: number | null;
  lng: number | null;
  formatted_address: string;
}

interface AddressAutocompleteProps {
  value?: string;
  onAddressSelect?: (components: AddressComponents) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

export function AddressAutocomplete({
  value = "",
  onAddressSelect,
  onChange,
  placeholder = "42 Meadowcroft Lane",
  className = "",
  name = "streetAddress"
}: AddressAutocompleteProps) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
    
    // Configure autocomplete to get detailed address components
    autocompleteInstance.setOptions({
      componentRestrictions: { country: ['gb', 'ie', 'us'] }, // UK, Ireland, US
      types: ['address'], // Only show address results
      fields: ['address_components', 'formatted_address', 'geometry']
    });
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place && place.address_components && onAddressSelect) {
        const addressComponents: AddressComponents = {
          streetAddress: '',
          city: '',
          county: '',
          postalCode: '',
          country: '',
          lat: place.geometry?.location?.lat() || null,
          lng: place.geometry?.location?.lng() || null,
          formatted_address: place.formatted_address || ''
        };

        // Parse address components
        let streetNumber = '';
        let route = '';
        
        place.address_components.forEach((component) => {
          const types = component.types;
          
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (types.includes('route')) {
            route = component.long_name;
          }
          if (types.includes('locality') || types.includes('postal_town')) {
            addressComponents.city = component.long_name;
          }
          if (types.includes('administrative_area_level_2')) {
            addressComponents.county = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            // For US states or other regions
            if (!addressComponents.county) {
              addressComponents.county = component.long_name;
            }
          }
          if (types.includes('postal_code')) {
            addressComponents.postalCode = component.long_name;
          }
          if (types.includes('country')) {
            addressComponents.country = component.long_name;
          }
        });

        // Combine street number and route
        addressComponents.streetAddress = streetNumber ? `${streetNumber} ${route}` : route;

        // Update the input field with the street address
        if (inputRef.current) {
          inputRef.current.value = addressComponents.streetAddress;
          // Trigger the onChange event to update form state
          const event = new Event('input', { bubbles: true });
          Object.defineProperty(event, 'target', {
            writable: false,
            value: {
              name: name,
              value: addressComponents.streetAddress
            }
          });
          if (onChange) {
            onChange(event as any);
          }
        }

        // Call the callback to update all address fields
        onAddressSelect(addressComponents);
      }
    }
  };

  useEffect(() => {
    // Apply custom styling to the autocomplete dropdown when it appears
    if (isLoaded) {
      const style = document.createElement('style');
      style.innerHTML = `
        /* Override default Google Places dropdown with Fieldsy theme */
        .pac-container {
          font-family: 'DM Sans', sans-serif !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
          border: 1px solid #e5e7eb !important;
          overflow: hidden !important;
          margin-top: 8px !important;
          z-index: 10000 !important;
        }
        
        .pac-container::after {
          display: none !important;
        }
        
        .pac-item {
          padding: 14px 20px 14px 48px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          color: #192215 !important;
          cursor: pointer;
          position: relative;
          line-height: 1.5 !important;
          font-size: 14px !important;
        }
        
        .pac-item:hover {
          background-color: #F8F1D7 !important;
        }
        
        .pac-item-selected, .pac-item-selected:hover {
          background-color: #F8F1D7 !important;
        }
        
        .pac-item:last-child {
          border-bottom: 0 !important;
        }
        
        .pac-item-query {
          font-weight: 600 !important;
          color: #192215 !important;
          font-size: 14px !important;
        }
        
        .pac-matched {
          font-weight: 600 !important;
          color: #3A6B22 !important;
        }
        
        .pac-icon {
          display: none !important;
        }
        
        .pac-icon-marker {
          display: none !important;
        }
        
        .pac-item::before {
          content: "";
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          background-image: url('/location.svg');
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.9;
        }
        
        .pac-logo::after {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [isLoaded]);

  if (loadError) {
    // Fall back to regular input if Google Maps fails to load
    return (
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
    );
  }

  if (!isLoaded) {
    return (
      <input
        type="text"
        placeholder="Loading..."
        className={className}
        disabled
      />
    );
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
    >
      <input
        ref={inputRef}
        type="text"
        name={name}
        defaultValue={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
    </Autocomplete>
  );
}