import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, SortDesc, Filter } from 'lucide-react';
import { FieldCard } from '@/components/fields/FieldCard';
import FieldsSortFilter from '@/components/fields/FieldsSortFilter';
import FieldsFilter, { FilterState } from '@/components/fields/FieldsFilter';
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
  const defaultFilters: FilterState = {
    size: '',
    amenities: [],
    rating: '',
    priceRange: [mockData.filterOptions.priceRange.min, mockData.filterOptions.priceRange.max],
    distanceRange: [mockData.filterOptions.distanceRange.min, mockData.filterOptions.distanceRange.max],
    date: undefined,
    availability: []
  };

  // Applied filter state (for API)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);
  
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [likedFields, setLikedFields] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Function to handle filter changes
  const handleApplyFilters = (filters: FilterState) => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page
    setFiltersOpen(false); // Close mobile filters
  };

  // Function to reset filters
  const handleResetFilters = () => {
    setAppliedFilters(defaultFilters);
    setCurrentPage(1); // Reset to first page
  };

  // Build query parameters for React Query - use applied filters
  const queryParams: FieldsParams = {
    page: currentPage,
    limit: 12,
    ...(searchValue && { search: searchValue }),
    ...(zipCode && { zipCode }),
    ...(lat && lng && { lat, lng }),
    ...(appliedFilters.size && appliedFilters.size !== 'All' && appliedFilters.size !== '' && { size: appliedFilters.size }),
    ...(appliedFilters.amenities.length > 0 && { amenities: appliedFilters.amenities }),
    ...(appliedFilters.rating && appliedFilters.rating !== '' && { minRating: parseFloat(appliedFilters.rating.replace('+', '')) }),
    // Only apply price filter if it's not the full range
    ...(appliedFilters.priceRange && 
        (appliedFilters.priceRange[0] !== mockData.filterOptions.priceRange.min || 
         appliedFilters.priceRange[1] !== mockData.filterOptions.priceRange.max) && { 
      minPrice: appliedFilters.priceRange[0], 
      maxPrice: appliedFilters.priceRange[1] 
    }),
    // Only apply distance filter if it's not the full range
    ...(appliedFilters.distanceRange && 
        (appliedFilters.distanceRange[0] !== mockData.filterOptions.distanceRange.min || 
         appliedFilters.distanceRange[1] !== mockData.filterOptions.distanceRange.max) && { 
      maxDistance: appliedFilters.distanceRange[1] 
    }),
    ...(appliedFilters.date && { date: appliedFilters.date.toISOString() }),
    ...(appliedFilters.availability.length > 0 && { availability: appliedFilters.availability }),
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
          <FieldsFilter
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            initialFilters={appliedFilters}
          />

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
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2  xl:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-6 justify-center">
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