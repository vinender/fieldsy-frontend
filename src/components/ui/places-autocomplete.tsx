'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const libraries: ("places")[] = ["places"];

interface PlacesAutocompleteProps {
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  onLocationSearch?: () => void;
}

export function PlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Enter postcode or location",
  className = "",
  defaultValue = "",
  onLocationSearch
}: PlacesAutocompleteProps) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
    
    // Configure autocomplete options
    autocompleteInstance.setOptions({
      componentRestrictions: { country: ['gb', 'ie'] }, // Restrict to UK and Ireland
      types: ['geocode', 'establishment'], // Include both addresses and places
    });
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place && onPlaceSelect) {
        onPlaceSelect(place);
        setInputValue(place.formatted_address || place.name || '');
      }
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder();
          const response = await geocoder.geocode({
            location: { lat: latitude, lng: longitude }
          });
          
          if (response.results[0]) {
            const place = response.results[0];
            setInputValue(place.formatted_address);
            if (onPlaceSelect) {
              onPlaceSelect(place as google.maps.places.PlaceResult);
            }
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter it manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleSearch = () => {
    if (onLocationSearch) {
      onLocationSearch();
    }
  };

  if (loadError) {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className={className}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-2">
          <button 
            type="button"
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            onClick={handleUseMyLocation}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-xs sm:text-sm whitespace-nowrap hidden md:inline">Use My Location</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <button 
            type="button"
            onClick={handleSearch}
            className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-green text-white rounded-full hover:bg-light-green transition font-semibold text-sm sm:text-base"
          >
            Search
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder="Loading..."
          className={className}
          disabled
        />
      </div>
    );
  }

  return (
    <>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className={className}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </Autocomplete>
      
      {/* Buttons container inside input - hidden on mobile, shown on larger screens */}
      <div className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-2">
        <button 
          type="button"
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          onClick={handleUseMyLocation}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-xs sm:text-sm whitespace-nowrap hidden md:inline">Use My Location</span>
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <button 
          type="button"
          onClick={handleSearch}
          className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-green text-white rounded-full hover:bg-light-green transition font-semibold text-sm sm:text-base"
        >
          Search
        </button>
      </div>
    </>
  );
}