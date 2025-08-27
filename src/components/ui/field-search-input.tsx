'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import axiosClient from '@/lib/api/axios-client';

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


export function FieldSearchInput({
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
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const router = useRouter();

  // Load recent searches from localStorage on mount and when window gets focus
  const loadRecentSearches = useCallback(() => {
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

    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: query.trim(),
      type: /^\d{4,5}$/.test(query.trim()) ? 'postcode' : 'field',
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

    saveSearchToHistory(searchTerm);
    setShowDropdown(false);
    
    // Navigate to fields page with search parameters
    const searchParams = new URLSearchParams();
    
    // Check if it's a postcode (4-5 digits)
    if (/^\d{4,5}$/.test(searchTerm.trim())) {
      searchParams.append('zipCode', searchTerm.trim());
    } else {
      searchParams.append('search', searchTerm.trim());
    }
    
    router.push(`/fields?${searchParams.toString()}`);
    
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Navigate to fields page with location coordinates
          const searchParams = new URLSearchParams();
          searchParams.append('lat', latitude.toString());
          searchParams.append('lng', longitude.toString());
          
          router.push(`/fields?${searchParams.toString()}`);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          // Show dropdown immediately when typing
          if (e.target.value.trim().length >= 2) {
            setShowDropdown(true);
          } else if (e.target.value.trim().length === 0 && showRecentSearches && recentSearches.length > 0) {
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
          onClick={() => handleSearch()}
          className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-green text-white rounded-full hover:bg-light-green transition font-semibold text-sm sm:text-base"
        >
          Search
        </button>
      </div>

      {/* Dropdown for suggestions and recent searches */}
      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border overflow-hidden z-40">
          {/* Show loading state */}
          {isLoadingSuggestions && (
            <div className="px-5 py-8 text-center">
              <div className="inline-flex items-center gap-2 text-dark-green/70">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green"></div>
                <span className="text-[14px]">Searching fields...</span>
              </div>
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
                    router.push(`/fields/${field.id}`);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-5 py-4 hover:bg-cream/40 flex justify-between items-start gap-3 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5">
                      <img src="/search/search.svg" className="w-6 h-6 text-green" />
                    </div>
                    <div>
                      <div className="text-[18px] font-semibold text-dark-green">{field.name || 'Dog Field'}</div>
                      {field.fullAddress && (
                        <div className="text-[14px] text-gray-500 mt-0.5">{field.fullAddress}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Show no results message */}
          {!isLoadingSuggestions && searchQuery.trim().length >= 2 && suggestions.length === 0 && (
            <div className="px-5 py-8 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-[16px] text-dark-green/70">No fields found matching "{searchQuery}"</p>
              <button
                onClick={handleUseMyLocation}
                className="mt-3 text-[14px] text-green hover:text-light-green font-semibold transition"
              >
                Try searching near your location
              </button>
            </div>
          )}

          {/* Show recent searches when not searching */}
          {showRecentSearches && !searchQuery && recentSearches.length > 0 && (
            <>
              <div className="px-5 py-4 border-b">
                <h4 className="text-[20px] font-bold text-dark-green">Recent Search</h4>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {recentSearches.map((search) => (
                  <button
                    key={search.id}
                    onClick={() => {
                      setSearchQuery(search.query);
                      handleSearch(search.query);
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-cream/40 flex justify-between items-start gap-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5">
                        <img src="/location.svg" className="w-6 h-6 text-green" />
                      </div>
                      <div>
                        <div className="text-[18px] font-semibold text-dark-green">{search.query}</div>
                        <div className="text-sm text-dark-green/70">
                          {search.type === 'postcode' ? 'Postcode' : 'Field'} · Recent
                        </div>
                      </div>
                    </div>
                    <div 
                      onClick={(e) => removeRecentSearch(search.id, e)}
                      className="w-6 h-6 rounded-full text-white bg-gray-400 hover:bg-gray-500 flex items-center justify-center text-sm font-medium cursor-pointer transition"
                    >
                      x
                    </div>
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