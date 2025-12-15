'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useResponsiveRouter } from '@/hooks/useResponsiveRouter';
import { useLocation } from '@/contexts/LocationContext';
import axiosClient from '@/lib/api/axios-client';
import { detectPostcodeInQuery, getPostcodeDisplay } from '@/utils/postcode';
interface RecentSearch {
  id: string;
  query: string;
  type: 'field' | 'postcode';
  timestamp: number;
}

interface FieldSearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  showRecentSearches?: boolean;
}

interface FieldSuggestion {
  id: string;
  name: string;
  location: string;
  address?: string;
  fullAddress?: string;
  price?: number;
  rating?: number;
  reviews?: number;
  image?: string | null;
}


function FieldSearchInputComponent({
  placeholder = "Search by field name, location, or postal code",
  className = "",
  onSearch,
  showRecentSearches = true
}: FieldSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [suggestions, setSuggestions] = useState<FieldSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousSearchQuery = useRef<string>('');
  const nextRouter = useRouter(); // Direct Next.js router (no loader)
  const router = useResponsiveRouter(); // Router with loader for search navigation

  // Get location context
  const { requestLocation, isLoadingLocation } = useLocation();

  // Load recent searches from localStorage on mount and when window gets focus
  const loadRecentSearches = useCallback(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('fieldsy_recent_searches');
      if (stored) {
        const searches = JSON.parse(stored);
        // Sort by timestamp and take only the latest 6
        setRecentSearches(
          searches
            .sort((a: RecentSearch, b: RecentSearch) => b.timestamp - a.timestamp)
            .slice(0, 6)
        );
      } else {
        setRecentSearches([]);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    loadRecentSearches();

    // Reload recent searches when window gets focus (in case they were updated in another tab)
    const handleFocus = () => loadRecentSearches();
    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);
  }, [loadRecentSearches]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch field suggestions with debouncing
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await axiosClient.get('/fields/suggestions', {
        params: { query }
      });
      setSuggestions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Debounced search query change handler
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for fetching suggestions
    if (searchQuery.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery.trim());
      }, 300); // 300ms debounce delay
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, fetchSuggestions]);

  // Show dropdown when suggestions are available
  useEffect(() => {
    if (suggestions.length > 0 && searchQuery.trim().length >= 2) {
      setShowDropdown(true);
    }
  }, [suggestions, searchQuery]);

  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return;

    const postcodeInfo = detectPostcodeInQuery(query);
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: postcodeInfo.formatted || query.trim(),
      type: postcodeInfo.isPostcode ? 'postcode' : 'field',
      timestamp: Date.now()
    };

    try {
      const stored = localStorage.getItem('fieldsy_recent_searches');
      const searches = stored ? JSON.parse(stored) : [];

      // Remove duplicates and add new search at the beginning
      const filtered = searches.filter((s: RecentSearch) =>
        s.query.toLowerCase() !== query.toLowerCase()
      );

      const updated = [newSearch, ...filtered].slice(0, 10); // Keep max 10 searches
      localStorage.setItem('fieldsy_recent_searches', JSON.stringify(updated));
      setRecentSearches(updated.slice(0, 6)); // Update state immediately
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const removeRecentSearch = (searchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const filtered = recentSearches.filter(s => s.id !== searchId);
      setRecentSearches(filtered);
      localStorage.setItem('fieldsy_recent_searches', JSON.stringify(filtered));
      if (filtered.length === 0) {
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error removing search:', error);
    }
  };

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    const postcodeInfo = detectPostcodeInQuery(searchTerm);

    // Cancel any pending suggestion requests
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Clear suggestions and stop loading
    setSuggestions([]);
    setIsLoadingSuggestions(false);

    saveSearchToHistory(searchTerm);
    setShowDropdown(false);

    // Check if we're already on the /fields page
    const isOnFieldsPage = nextRouter.pathname === '/fields';

    if (isOnFieldsPage && onSearch) {
      // If already on fields page, just call onSearch callback to update the list
      onSearch(postcodeInfo.formatted || searchTerm);
    } else {
      // Navigate to fields page with search parameters
      const searchParams = new URLSearchParams();

      // Check if it's a UK postcode
      if (postcodeInfo.isPostcode) {
        // Use formatted postcode for search
        searchParams.append('zipCode', postcodeInfo.formatted || searchTerm.trim());
      } else {
        searchParams.append('search', searchTerm.trim());
      }

      router.push(`/fields?${searchParams.toString()}`);

      if (onSearch) {
        onSearch(postcodeInfo.formatted || searchTerm);
      }
    }
  };

  const handleUseMyLocation = async () => {
    try {
      await requestLocation();

      // The location will be available in the context after request
      // Navigate to fields page to trigger distance calculations
      const searchParams = new URLSearchParams();
      searchParams.append('useLocation', 'true');

      router.push(`/fields?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error getting location:', error);
      // Error is already handled in the context
    }
  };

  const shouldShowDropdown = showDropdown || (searchQuery.trim().length >= 2 && isLoadingSuggestions);

  return (
    <div className="relative" ref={dropdownRef}>
      <style jsx>{`
        .custom-loader {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid rgba(9, 103, 45, 0.15);
          border-top-color: #3A6B22;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          const newValue = e.target.value;
          const previousValue = previousSearchQuery.current;

          setSearchQuery(newValue);

          // If user cleared the input (was not empty, now is empty) and on fields page
          if (previousValue && !newValue.trim() && nextRouter.pathname === '/fields' && onSearch) {
            onSearch(''); // Reset search
          }

          // Update ref for next comparison
          previousSearchQuery.current = newValue;

          // Show dropdown immediately when typing
          if (newValue.trim().length >= 2) {
            setShowDropdown(true);
          } else if (newValue.trim().length === 0 && showRecentSearches && recentSearches.length > 0) {
            setShowDropdown(true);
          } else {
            setShowDropdown(false);
          }
        }}
        onFocus={() => {
          // Reload recent searches when input gets focus
          loadRecentSearches();
          if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
            setShowDropdown(true);
          } else if (showRecentSearches && recentSearches.length > 0 && !searchQuery) {
            setShowDropdown(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
        placeholder={placeholder}
        className={className}
      />

      {/* Buttons inside input - only visible on desktop */}
      <div className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 items-center gap-1">
        {/* Clear button - only show when there's text */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSuggestions([]);
              setShowDropdown(false);
              // Call onSearch with empty string to reset search when on fields page
              if (nextRouter.pathname === '/fields' && onSearch) {
                onSearch('');
              }
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            aria-label="Clear search"
          >
            <X className="w-5 h-5 bg-black rounded-full text-white p-0.5" />
          </button>
        )}
        <button
          type="button"
          className="flex items-center border-l border-gray-300 gap-1 sm:gap-2 px-2 sm:px-4 text-gray-600 hover:text-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleUseMyLocation}
          disabled={isLoadingLocation}
        >
          <MapPin className="w-4 h-4 text-green" />
          <span className="text-xs text-green underline font-[500] sm:text-sm whitespace-nowrap hidden md:inline">
            {isLoadingLocation ? 'Getting location...' : 'Use My Location'}
          </span>
        </button>
        {/* <div className="h-6 w-px bg-gray-300"></div> */}
        <button
          type="button"
          onClick={() => handleSearch()}
          className="px-4 sm:px-8 py-2.5 sm:py-3.5 bg-green text-white rounded-[90px] hover:bg-light-green transition font-semibold text-sm sm:text-base"
        >
          Search
        </button>
      </div>

      {/* Dropdown for suggestions and recent searches */}
      {shouldShowDropdown && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border overflow-hidden z-40 transition-opacity duration-150">
          {/* Show loading state */}
          {isLoadingSuggestions && (
            <div className="px-4 sm:px-5 py-6 sm:py-8 text-center min-h-[110px] flex flex-col items-center justify-center gap-3 text-dark-green/70">
              <span className="custom-loader" aria-hidden="true"></span>
              <span className="text-xs sm:text-sm">Searching fields...</span>
            </div>
          )}

          {/* Show field suggestions when searching */}
          {!isLoadingSuggestions && searchQuery.trim().length >= 2 && suggestions.length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto">
              {suggestions.map((field) => (
                <button
                  key={field.id}
                  onClick={() => {
                    // Save field name to search history before navigating
                    saveSearchToHistory(field.name || 'Dog Field');
                    setShowDropdown(false);
                    // Use direct Next.js router to avoid showing full page loader
                    nextRouter.push(`/fields/${field.id}`);
                  }}
                  className="w-full text-left px-4 sm:px-5 py-3 sm:py-4 hover:bg-cream/40 flex justify-between items-start gap-2 sm:gap-3 border-b last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mt-0.5">
                      <img src="/search/search.svg" className="w-4 h-4 sm:w-6 sm:h-6 text-green" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-base lg:text-lg font-semibold text-dark-green">{field.name || 'Dog Field'}</div>
                      {field.fullAddress && (
                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{field.fullAddress}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Show no results message */}
          {!isLoadingSuggestions && searchQuery.trim().length >= 2 && suggestions.length === 0 && (
            <div className="px-4 sm:px-5 py-6 sm:py-8 text-center min-h-[110px] flex flex-col items-center justify-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              {(() => {
                const postcodeInfo = detectPostcodeInQuery(searchQuery);
                if (postcodeInfo.isPostcode) {
                  return (
                    <>
                      <p className="text-sm sm:text-base text-dark-green/70">
                        No fields found in postcode "{getPostcodeDisplay(searchQuery)}"
                      </p>
                      {postcodeInfo.isPartial && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                          Try entering a full postcode (e.g., SW1A 1AA)
                        </p>
                      )}
                    </>
                  );
                }
                return (
                  <p className="text-sm sm:text-base text-dark-green/70">No fields found matching "{searchQuery}"</p>
                );
              })()}
              <button
                onClick={handleUseMyLocation}
                className="mt-3 text-xs sm:text-sm text-green hover:text-light-green font-semibold transition"
              >
                Try searching near your location
              </button>
            </div>
          )}

          {/* Show recent searches when not searching */}
          {showRecentSearches && !searchQuery && recentSearches.length > 0 && (
            <>
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b">
                <h4 className="text-base sm:text-lg lg:text-xl font-bold text-dark-green">Recent Search</h4>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {recentSearches.map((search) => (
                  <button
                    key={search.id}
                    onClick={() => {
                      setSearchQuery(search.query);
                      handleSearch(search.query);
                    }}
                    className="w-full text-left px-4 sm:px-5 py-3 sm:py-4 hover:bg-cream/40 flex justify-between items-center gap-2 sm:gap-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
                        <img src="/location.svg" className="w-4 h-4 sm:w-6 sm:h-6 text-green" />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base lg:text-lg font-semibold text-dark-green">
                          {search.type === 'postcode' ? getPostcodeDisplay(search.query) : search.query}
                        </div>
                        <div className="text-xs sm:text-sm text-dark-green/70">
                          {search.type === 'postcode' ? 'UK Postcode' : 'Field Search'} · Recent
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => removeRecentSearch(search.id, e)}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center cursor-pointer transition flex-shrink-0"
                      aria-label="Remove recent search"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    </button>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export const FieldSearchInput = React.memo(FieldSearchInputComponent);
FieldSearchInput.displayName = 'FieldSearchInput';
