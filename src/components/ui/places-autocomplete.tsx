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
  recentSearches?: { title: string; subtitle: string }[];
}

export function PlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Enter postcode or location",
  className = "",
  defaultValue = "",
  onLocationSearch,
  recentSearches = []
}: PlacesAutocompleteProps) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false)

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
        const nextValue = place.formatted_address || place.name || ''
        setInputValue(nextValue);
        if (inputRef.current) {
          inputRef.current.value = nextValue
        }
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
    <div className="relative">
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className={`${className} text-gray-600 placeholder-gray-400`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          autoComplete="off"
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

      {/* Recent searches dropdown */}
      {isFocused && inputValue.trim().length === 0 && recentSearches.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border overflow-hidden z-40">
          <div className="px-5 py-4 border-b">
            <h4 className="text-[20px] font-bold text-dark-green">Recent Search</h4>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {recentSearches.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputValue(item.title)
                  if (onPlaceSelect) onPlaceSelect({ name: item.title, formatted_address: item.subtitle } as any)
                }}
                className="w-full text-left px-5 py-4 hover:bg-cream/40 flex justify-between   items-start gap-3 border-b last:border-b-0"
              >
                <div className='flex items-center gap-3'> 
                  <div className="w-8 h-8 rounded-full  flex items-center justify-center mt-0.5">
                    <img src='/location.svg' className="w-6 h-6 text-green" />
                  </div>
                  <div>
                    <div className="text-[18px] font-semibold text-dark-green">{item.title}</div>
                    <div className="text-sm text-dark-green/70">{item.subtitle}</div>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full text-white   bg-gray-400 flex items-center justify-center text-sm font-medium">
                  x
                </div>

              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}