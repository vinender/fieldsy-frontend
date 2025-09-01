import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, SortDesc, X, Filter, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FieldCard } from '@/components/fields/FieldCard';
import FieldsSortFilter from '@/components/fields/FieldsSortFilter';
import { FieldSearchInput } from '@/components/ui/field-search-input';
import { UserLayout } from '@/components/layout/UserLayout';
import mockData from '@/data/mock-data.json';
import { useRouter } from 'next/router';
import { FieldGridSkeleton } from '@/components/skeletons/FieldCardSkeleton';
import { useSession } from 'next-auth/react';
import { useFields, FieldsParams } from '@/hooks/queries/useFieldQueries';

export default function SearchResults() {
  const router = useRouter();
  const { } = useSession();
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  
  // Parse query parameters on mount and when router.query changes
  useEffect(() => {
    const { search, zipCode: zip, lat: latitude, lng: longitude } = router.query;
    
    if (search) {
      setSearchValue(search as string);
    }
    if (zip) {
      setZipCode(zip as string);
    }
    if (latitude && longitude) {
      setLat(parseFloat(latitude as string));
      setLng(parseFloat(longitude as string));
    }
  }, [router.query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Default filter values - all empty to show all fields
  const defaultFilters = {
    size: '',
    amenities: [] as string[],
    rating: '',
    priceRange: [mockData.filterOptions.priceRange.min, mockData.filterOptions.priceRange.max],
    distanceRange: [mockData.filterOptions.distanceRange.min, mockData.filterOptions.distanceRange.max],
    date: undefined as Date | undefined,
    availability: [] as string[]
  };

  // Temporary filter state (for UI)
  const [tempSize, setTempSize] = useState(defaultFilters.size);
  const [tempAmenities, setTempAmenities] = useState<string[]>(defaultFilters.amenities);
  const [tempRating, setTempRating] = useState(defaultFilters.rating);
  const [tempPriceRange, setTempPriceRange] = useState(defaultFilters.priceRange);
  const [tempDistanceRange, setTempDistanceRange] = useState(defaultFilters.distanceRange);
  const [tempDate, setTempDate] = useState<Date | undefined>(defaultFilters.date);
  const [tempAvailability, setTempAvailability] = useState<string[]>(defaultFilters.availability);

  // Applied filter state (for API)
  const [appliedSize, setAppliedSize] = useState(defaultFilters.size);
  const [appliedAmenities, setAppliedAmenities] = useState<string[]>(defaultFilters.amenities);
  const [appliedRating, setAppliedRating] = useState(defaultFilters.rating);
  const [appliedPriceRange, setAppliedPriceRange] = useState(defaultFilters.priceRange);
  const [appliedDistanceRange, setAppliedDistanceRange] = useState(defaultFilters.distanceRange);
  const [appliedDate, setAppliedDate] = useState<Date | undefined>(defaultFilters.date);
  const [appliedAvailability, setAppliedAvailability] = useState<string[]>(defaultFilters.availability);
  
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [likedFields, setLikedFields] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    fieldSize: true,
    amenities: true,
    price: true,
    distance: true,
    rating: true,
    date: true,
    availability: true
  });

  // Check if any filter has been selected or changed from default
  const hasActiveFilters = () => {
    return (
      tempSize !== defaultFilters.size ||
      tempAmenities.length > 0 ||
      tempRating !== defaultFilters.rating ||
      tempPriceRange[0] !== defaultFilters.priceRange[0] ||
      tempPriceRange[1] !== defaultFilters.priceRange[1] ||
      tempDistanceRange[0] !== defaultFilters.distanceRange[0] ||
      tempDistanceRange[1] !== defaultFilters.distanceRange[1] ||
      tempDate !== undefined ||
      tempAvailability.length > 0
    );
  };

  // Function to apply filters
  const applyFilters = () => {
    setAppliedSize(tempSize);
    setAppliedAmenities(tempAmenities);
    setAppliedRating(tempRating);
    setAppliedPriceRange(tempPriceRange);
    setAppliedDistanceRange(tempDistanceRange);
    setAppliedDate(tempDate);
    setAppliedAvailability(tempAvailability);
    setCurrentPage(1); // Reset to first page
    setFiltersOpen(false); // Close mobile filters
  };

  // Function to reset filters
  const resetFilters = () => {
    // Reset temporary states to defaults
    setTempSize(defaultFilters.size);
    setTempAmenities(defaultFilters.amenities);
    setTempRating(defaultFilters.rating);
    setTempPriceRange(defaultFilters.priceRange);
    setTempDistanceRange(defaultFilters.distanceRange);
    setTempDate(defaultFilters.date);
    setTempAvailability(defaultFilters.availability);
    
    // Reset applied states to defaults
    setAppliedSize(defaultFilters.size);
    setAppliedAmenities(defaultFilters.amenities);
    setAppliedRating(defaultFilters.rating);
    setAppliedPriceRange(defaultFilters.priceRange);
    setAppliedDistanceRange(defaultFilters.distanceRange);
    setAppliedDate(defaultFilters.date);
    setAppliedAvailability(defaultFilters.availability);
    setCurrentPage(1); // Reset to first page
  };

  // Build query parameters for React Query - use applied filters
  const queryParams: FieldsParams = {
    page: currentPage,
    limit: 12,
    ...(searchValue && { search: searchValue }),
    ...(zipCode && { zipCode }),
    ...(lat && lng && { lat, lng }),
    ...(appliedSize && appliedSize !== 'All' && appliedSize !== '' && { size: appliedSize }),
    ...(appliedAmenities.length > 0 && { amenities: appliedAmenities }),
    ...(appliedRating && appliedRating !== '' && { minRating: parseFloat(appliedRating.replace('+', '')) }),
    // Only apply price filter if it's not the full range
    ...(appliedPriceRange && 
        (appliedPriceRange[0] !== mockData.filterOptions.priceRange.min || 
         appliedPriceRange[1] !== mockData.filterOptions.priceRange.max) && { 
      minPrice: appliedPriceRange[0], 
      maxPrice: appliedPriceRange[1] 
    }),
    // Only apply distance filter if it's not the full range
    ...(appliedDistanceRange && 
        (appliedDistanceRange[0] !== mockData.filterOptions.distanceRange.min || 
         appliedDistanceRange[1] !== mockData.filterOptions.distanceRange.max) && { 
      maxDistance: appliedDistanceRange[1] 
    }),
    ...(appliedDate && { date: appliedDate.toISOString() }),
    ...(appliedAvailability.length > 0 && { availability: appliedAvailability }),
    sortBy,
    sortOrder
  };

  // Use React Query hook to fetch fields
  const { 
    data: fieldsData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useFields(queryParams);

  // Extract data from response
  const fields = fieldsData?.data || [];
  const totalPages = fieldsData?.pagination?.totalPages || 1;
  const totalResults = fieldsData?.pagination?.total || 0;

  const handleSearch = () => {
    setCurrentPage(1);
    // React Query will automatically refetch with new params
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLike = (fieldId: string) => {
    setLikedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleViewDetails = (fieldId: string) => {
    router.push(`/fields/${fieldId}`);
  };

  const handleBookNow = (fieldId: string) => {
    // The FieldCard component now handles authentication check and shows modal
    // This function is called only when user is authenticated
    router.push(`/fields/book-field?id=${fieldId}`);
  };
  
  const handleClaimField = (fieldId: string) => {
    // Redirect to claim field form - no authentication required
    router.push(`/fields/claim-field-form?field_id=${fieldId}`);
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#FFFCF3] w-full">
      {/* Search Bar - Sticky below header */}
      <div className="bg-light-cream my-10 sticky top-[80px] md:top-[120px] z-30 px-4 sm:px-6 lg:px-20 py-4">
        <FieldSearchInput
          placeholder="Search by field name, location, or postal code"
          className="w-full pl-4 pr-48 sm:pr-72 py-3 sm:py-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-fieldsy-green focus:border-transparent"
          onSearch={(query) => {
            setSearchValue(query);
            handleSearch();
          }}
          showRecentSearches={true}
        />
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-20 py-6 lg:py-10">

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="bg-[#3A6B22] text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-[31px]">
          {/* Filters Sidebar */}
          <div className={`${
            filtersOpen ? 'fixed inset-0 bg-black/50 z-50 lg:relative lg:inset-auto lg:bg-transparent' : 'hidden lg:block'
          }`}>
            <div className={`${
              filtersOpen ? 'fixed left-0 top-0 h-full w-[85%] max-w-[375px] bg-white overflow-y-auto' : 'w-full lg:w-[375px] bg-white rounded-[22px] border border-black/[0.06]'
            } p-6`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[18px] font-semibold text-dark-green">Filters</h2>
              <div className="flex items-center gap-3">
                <button onClick={resetFilters} className="text-[14px] font-semibold text-[#e31c20]">Reset All</button>
                {filtersOpen && (
                  <button 
                    onClick={() => setFiltersOpen(false)}
                    className="lg:hidden p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Field Size */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-[14px] font-bold text-dark-green">Field Size</h3>
                <button onClick={() => toggleSection('fieldSize')}>
                  {expandedSections.fieldSize ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </button>
              </div>
              {expandedSections.fieldSize && (
                <div className="flex flex-wrap gap-2.5">
                  {mockData.filterOptions.fieldSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setTempSize(size)}
                      className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium ${
                        tempSize === size 
                          ? 'bg-[#8FB366] text-white' 
                          : 'bg-white border border-black/[0.06] text-[#8d8d8d]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-1.5 bg-[#F9F9F9] w-full mb-5" />

            {/* Amenities */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-[14px] font-bold text-dark-green">Amenities</h3>
                <button onClick={() => toggleSection('amenities')}>
                  {expandedSections.amenities ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </button>
              </div>  
              {expandedSections.amenities && (
                <div className="flex flex-wrap gap-2">
                  {mockData.filterOptions.amenities.slice(0, 6).map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => {
                        setTempAmenities((prev: string[]) => 
                          prev.includes(amenity) 
                            ? prev.filter((a: string) => a !== amenity)
                            : [...prev, amenity]
                        );
                      }}
                      className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium flex items-center gap-2 ${
                        tempAmenities.includes(amenity)
                          ? 'bg-[#8FB366] text-white' 
                          : 'bg-white border border-black/[0.06] text-[#8d8d8d]'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-1.5 bg-[#F9F9F9] w-full mb-5" />

            {/* Price */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-[14px] font-bold text-dark-green">Price</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[#3A6B22]">${tempPriceRange[0]} to ${tempPriceRange[1]}</span>
                  <button onClick={() => toggleSection('price')}>
                    {expandedSections.price ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {expandedSections.price && (
                <div className="bg-white border border-black/[0.06] rounded-[14px] p-4">
                  <style jsx>{`
                    input[type="range"] {
                      -webkit-appearance: none;
                      appearance: none;
                      background: transparent;
                      cursor: pointer;
                      width: 100%;
                    }
                    input[type="range"]::-webkit-slider-track {
                      background: #e0e0e0;
                      border-radius: 0.5rem;
                      height: 0.5rem;
                    }
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      background: #8FB366;
                      border-radius: 50%;
                      border: 0;
                      height: 1.5rem;
                      width: 1.5rem;
                      margin-top: -0.5rem;
                    }
                    input[type="range"]::-moz-range-track {
                      background: #e0e0e0;
                      border-radius: 0.5rem;
                      height: 0.5rem;
                    }
                    input[type="range"]::-moz-range-thumb {
                      background: #8FB366;
                      border-radius: 50%;
                      border: 0;
                      height: 1.5rem;
                      width: 1.5rem;
                    }
                    input[type="range"]::-moz-range-progress {
                      background: #8FB366;
                      border-radius: 0.5rem;
                      height: 0.5rem;
                    }
                  `}</style>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Min Price</label>
                      <input 
                        type="range" 
                        className="w-full" 
                        min={mockData.filterOptions.priceRange.min} 
                        max={mockData.filterOptions.priceRange.max} 
                        value={tempPriceRange[0]}
                        onChange={(e) => {
                          const newMin = parseInt(e.target.value);
                          if (newMin <= tempPriceRange[1]) {
                            setTempPriceRange([newMin, tempPriceRange[1]]);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Max Price</label>
                      <input 
                        type="range" 
                        className="w-full" 
                        min={mockData.filterOptions.priceRange.min} 
                        max={mockData.filterOptions.priceRange.max} 
                        value={tempPriceRange[1]}
                        onChange={(e) => {
                          const newMax = parseInt(e.target.value);
                          if (newMax >= tempPriceRange[0]) {
                            setTempPriceRange([tempPriceRange[0], newMax]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[12px] text-dark-green mt-2">
                    <span>${tempPriceRange[0]}</span>
                    <span>${tempPriceRange[1]}</span>
                  </div>
                </div>
              )}
            </div>  

            <div className="h-1.5 bg-[#F9F9F9] w-full mb-5" />

            {/* Distance */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-[14px] font-bold text-dark-green">Distance away</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[#3A6B22]">{tempDistanceRange[0]} mile to {tempDistanceRange[1]} Miles</span>
                  <button onClick={() => toggleSection('distance')}>
                    {expandedSections.distance ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
              {expandedSections.distance && (
                <div className="bg-white border border-black/[0.06] rounded-[14px] p-4">
                  <style jsx>{`
                    input[type="range"] {
                      -webkit-appearance: none;
                      appearance: none;
                      background: transparent;
                      cursor: pointer;
                      width: 100%;
                    }
                    input[type="range"]::-webkit-slider-track {
                      background: #e0e0e0;
                      border-radius: 0.5rem;
                      height: 0.5rem;
                    }
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      background: #8FB366;
                      border-radius: 50%;
                      border: 0;
                      height: 1.5rem;
                      width: 1.5rem;
                      margin-top: -0.5rem;
                    }
                    input[type="range"]::-moz-range-track {
                      background: #e0e0e0;
                      border-radius: 0.5rem;
                      height: 0.5rem;
                    }
                    input[type="range"]::-moz-range-thumb {
                      background: #8FB366;
                      border-radius: 50%;
                      border: 0;
                      height: 1.5rem;
                      width: 1.5rem;
                    }
                    input[type="range"]::-moz-range-progress {
                      background: #8FB366;
                      border-radius: 0.5rem;
                      height: 0.5rem;
                    }
                  `}</style>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Min Distance</label>
                      <input 
                        type="range" 
                        className="w-full" 
                        min={mockData.filterOptions.distanceRange.min} 
                        max={mockData.filterOptions.distanceRange.max} 
                        value={tempDistanceRange[0]}
                        onChange={(e) => {
                          const newMin = parseInt(e.target.value);
                          if (newMin <= tempDistanceRange[1]) {
                            setTempDistanceRange([newMin, tempDistanceRange[1]]);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Max Distance</label>
                      <input 
                        type="range" 
                        className="w-full" 
                        min={mockData.filterOptions.distanceRange.min} 
                        max={mockData.filterOptions.distanceRange.max} 
                        value={tempDistanceRange[1]}
                        onChange={(e) => {
                          const newMax = parseInt(e.target.value);
                          if (newMax >= tempDistanceRange[0]) {
                            setTempDistanceRange([tempDistanceRange[0], newMax]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[12px] text-dark-green mt-2">
                    <span>{tempDistanceRange[0]} mile{tempDistanceRange[0] !== 1 ? 's' : ''}</span>
                    <span>{tempDistanceRange[1]} mile{tempDistanceRange[1] !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="h-1.5 bg-[#F9F9F9] w-full mb-5" />

            {/* Rating */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-[14px] font-bold text-dark-green">Rating</h3>
                <button onClick={() => toggleSection('rating')}>
                  {expandedSections.rating ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </button>
              </div>
              {expandedSections.rating && (
                <div className="flex flex-wrap gap-2.5">
                  {mockData.filterOptions.ratings.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setTempRating(rating)}
                      className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium ${
                        tempRating === rating
                          ? 'bg-[#8FB366] text-white' 
                          : 'bg-white border border-black/[0.06] text-[#8d8d8d]'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-1.5 bg-[#F9F9F9] w-full mb-5" />

            {/* Date & Availability */}
            <div className="mb-5">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="text-[14px] font-bold text-dark-green">Date</h3>
                  <button onClick={() => toggleSection('date')}>
                    {expandedSections.date ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </div>
                {expandedSections.date && (
                  <div className="relative">
                    <DatePicker
                      selected={tempDate}
                      onChange={(date: Date | null) => setTempDate(date || undefined)}
                      minDate={new Date()}
                      maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Choose Date"
                      className="bg-white border border-black/[0.08] rounded-2xl px-5 py-3.5 w-full text-[14px] text-dark-green cursor-pointer focus:outline-none focus:border-green"
                      calendarClassName="fieldsy-calendar"
                      wrapperClassName="w-full"
                      showPopperArrow={false}
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3A6B22] pointer-events-none" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="text-[14px] font-bold text-dark-green">Availability</h3>
                  <button onClick={() => toggleSection('availability')}>
                    {expandedSections.availability ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </div>
                {expandedSections.availability && (
                  <div className="flex flex-wrap gap-2.5">
                    {mockData.filterOptions.availability.map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setTempAvailability((prev: string[]) => 
                            prev.includes(time) 
                              ? prev.filter((t: string) => t !== time)
                              : [...prev, time]
                          );
                        }}
                        className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium ${
                          tempAvailability.includes(time)
                            ? 'bg-[#8FB366] text-white' 
                            : 'bg-white border border-black/[0.06] text-[#8d8d8d]'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {hasActiveFilters() && (
              <button 
                onClick={applyFilters}
                className="w-full bg-[#3A6B22] text-white py-4 rounded-[50px] text-[16px] font-semibold hover:bg-[#2d5319] transition-colors"
              >
                Apply Filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h1 className="text-[20px] md:text-[24px] lg:text-[29px] font-semibold text-dark-green">{isLoading ? 'Loading...' : `Over ${totalResults} results`}</h1>
              <div className="relative" ref={sortDropdownRef}>
                <button 
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="bg-white rounded-[54px] border border-black/[0.06] px-3 md:px-3.5 py-2 flex items-center gap-2 md:gap-4"
                >
                  <div className="flex items-center gap-2">
                    <SortDesc className="w-4 md:w-5 h-4 md:h-5 text-dark-green" />
                    <span className="text-[13px] md:text-[14px] font-medium text-dark-green">
                      {sortBy === 'price' && sortOrder === 'asc' ? 'Price: Low to High' : 
                       sortBy === 'price' && sortOrder === 'desc' ? 'Price: High to Low' :
                       sortBy === 'rating' && sortOrder === 'asc' ? 'Rating: Low to High' : 
                       sortBy === 'rating' && sortOrder === 'desc' ? 'Rating: High to Low' : 
                       'Sort By'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {sortDropdownOpen && (
                  <div className="absolute right-0 mt-2 z-20">
                    <FieldsSortFilter
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSortChange={(newSortBy, newSortOrder) => {
                        setSortBy(newSortBy);
                        setSortOrder(newSortOrder);
                        setCurrentPage(1); // Reset to first page when sorting changes
                        setSortDropdownOpen(false);
                      }}
                      onClose={() => setSortDropdownOpen(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Fields Grid using the refactored FieldCard component */}
            {isLoading ? (
              <FieldGridSkeleton count={12} />
            ) : isError ? (
              <div className="bg-white rounded-2xl p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-500 font-medium mb-2">{error?.message || 'Failed to fetch fields. Please try again.'}</p>
                  <button 
                    onClick={() => refetch()}
                    className="text-[#3A6B22] font-medium hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : fields.length === 0 ? (
              <div className="bg-white rounded-2xl p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">No fields found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any fields matching your criteria.
                  </p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your filters or search in a different area.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {(fields.length > 0 ? fields : mockData.fields).map((field: any) => (
                  <FieldCard 
                    key={field.id} 
                    {...(fields.length > 0 ? {
                      id: field.id,
                      name: field.name,
                      price: field.pricePerHour,
                      priceUnit: 'hour',
                      location: field.city ? `${field.city}, ${field.state}` : 'Location',
                      fullLocation: field.address,
                      rating: field.averageRating || 0,
                      amenities: field.amenities || [],
                      image: field.images?.[0] || '/fields/field1.jpg',
                      owner: field.owner?.name || 'Field Owner',
                      ownerJoined: 'March 2025',
                      isClaimed: field.isClaimed !== undefined ? field.isClaimed : true,
                      // Pass location data for distance calculation
                      fieldLocation: field.location,
                      latitude: field.latitude,
                      longitude: field.longitude
                    } : field)}
                    variant="expanded"
                    isLiked={likedFields.includes(field.id)}
                    onLike={handleLike}
                    onViewDetails={handleViewDetails}
                    onBookNow={handleBookNow}
                    onClaimField={handleClaimField}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !isError && fields.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6 lg:mt-8">
                <span className="text-[12px] md:text-[14px] text-dark-green">
                  Showing {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalResults)} of {totalResults}
                </span>
                <div className="flex gap-1 flex-wrap justify-center">
                  {currentPage > 1 && (
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-2 text-dark-green text-[12px] md:text-[14px] hover:text-[#3A6B22]"
                    >
                      Previous
                    </button>
                  )}
                  
                  {/* Show first page */}
                  <button 
                    onClick={() => handlePageChange(1)}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded text-[12px] md:text-[14px] font-medium ${
                      currentPage === 1 ? 'bg-[#3A6B22] text-white' : 'text-dark-green hover:bg-gray-100'
                    }`}
                  >
                    1
                  </button>
                  
                  {/* Show dots if needed */}
                  {currentPage > 3 && <span className="px-2 text-dark-green">...</span>}
                  
                  {/* Show current page and nearby pages */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 2;
                    if (pageNum > 1 && pageNum < totalPages && pageNum <= totalPages) {
                      return (
                        <button 
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-7 h-7 md:w-8 md:h-8 rounded text-[12px] md:text-[14px] font-medium ${
                            currentPage === pageNum ? 'bg-[#3A6B22] text-white' : 'text-dark-green hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  }).filter(Boolean)}
                  
                  {/* Show dots if needed */}
                  {currentPage < totalPages - 2 && <span className="px-2 text-dark-green">...</span>}
                  
                  {/* Show last page */}
                  {totalPages > 1 && (
                    <button 
                      onClick={() => handlePageChange(totalPages)}
                      className={`w-7 h-7 md:w-8 md:h-8 rounded text-[12px] md:text-[14px] font-medium ${
                        currentPage === totalPages ? 'bg-[#3A6B22] text-white' : 'text-dark-green hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                  
                  {currentPage < totalPages && (
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-2 text-dark-green text-[12px] md:text-[14px] hover:text-[#3A6B22]"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </UserLayout>
  );
}