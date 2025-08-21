import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, SortDesc, Calendar, X, Navigation, Filter } from 'lucide-react';
import { FieldCard } from '@/components/fields/FieldCard';
import { Input } from '@/components/ui/input';
import { UserLayout } from '@/components/layout/UserLayout';
import mockData from '@/data/mock-data.json';
import { useRouter } from 'next/router';
import { FieldGridSkeleton } from '@/components/skeletons/FieldCardSkeleton';
import { useSession } from 'next-auth/react';

export default function SearchResults() {
  const router = useRouter();
  const { data: session } = useSession();
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchValue, setSearchValue] = useState(mockData.searchDefaults.location);
  const [selectedSize, setSelectedSize] = useState('Large (3+ Acres)');
  const [selectedAmenities, setSelectedAmenities] = useState(['Secure fencing']);
  const [selectedRating, setSelectedRating] = useState('4.5+');
  const [priceRange, setPriceRange] = useState(mockData.filterOptions.priceRange.default);
  const [distanceRange, setDistanceRange] = useState(mockData.filterOptions.distanceRange.default);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [likedFields, setLikedFields] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    fieldSize: true,
    amenities: true,
    price: true,
    distance: true,
    rating: true,
    date: true,
    availability: true
  });

  // Fetch fields from API with pagination
  useEffect(() => {
    fetchFields();
  }, [currentPage]);

  const fetchFields = async (page = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      if (searchValue && searchValue !== mockData.searchDefaults.location) {
        params.append('search', searchValue);
      }
      // TODO: Add more filter parameters when API supports them

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'}/fields?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFields(data.data || []);
        
        // Update pagination info
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalResults(data.pagination.total || 0);
          setCurrentPage(data.pagination.page || 1);
        }
      } else if (response.status === 404) {
        setFields([]);
        setTotalResults(0);
      } else {
        setError('Failed to fetch fields. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
      setError('Network error. Please check your connection.');
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFields(1);
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
        <div className="bg-white rounded-[30px] md:rounded-[90px] min-h-[50px] md:h-[60px] flex flex-col md:flex-row items-center px-4 md:px-6 py-3 md:py-0 border border-black/10 shadow-[0px_12px_13px_0px_rgba(0,0,0,0.05)] gap-3 md:gap-0">
          <Input 
            type="text" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter location..."
            className="flex-1 border-0 shadow-none px-0 focus:ring-0 rounded-none text-[14px] md:text-[16px]"
          />
          <div className="flex items-center gap-3 w-full md:w-auto">
            {searchValue && (
              <X 
                className="w-[18px] h-[18px] text-dark-green cursor-pointer hover:text-[#3A6B22] transition-colors" 
                onClick={() => setSearchValue('')}
              />
            )}
            <div className="hidden md:block w-px h-5 bg-[#8d8d8d] mx-3" />
            <button className="flex items-center gap-1 text-[#3A6B22]">
              <Navigation className="w-[16px] md:w-[18px] h-[16px] md:h-[18px]" />
              <span className="text-[14px] md:text-[16px] font-medium underline">Use My Location</span>
            </button>
            <button 
              onClick={handleSearch}
              className="ml-auto bg-[#3A6B22] text-white px-4 md:px-6 py-2 md:py-3 rounded-[90px] text-[14px] md:text-[16px] font-semibold whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
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
                <button className="text-[14px] font-semibold text-[#e31c20]">Reset All</button>
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
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium ${
                        selectedSize === size 
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
                        setSelectedAmenities(prev => 
                          prev.includes(amenity) 
                            ? prev.filter(a => a !== amenity)
                            : [...prev, amenity]
                        );
                      }}
                      className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium flex items-center gap-2 ${
                        selectedAmenities.includes(amenity)
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
                  <span className="text-[14px] font-medium text-[#3A6B22]">${priceRange[0]} to ${priceRange[1]}</span>
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
                  <input 
                    type="range" 
                    className="w-full" 
                    min={mockData.filterOptions.priceRange.min} 
                    max={mockData.filterOptions.priceRange.max} 
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  />
                  <div className="flex justify-between text-[12px] text-dark-green mt-2">
                    <span>${mockData.filterOptions.priceRange.min}</span>
                    <span>${mockData.filterOptions.priceRange.max}</span>
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
                  <span className="text-[14px] font-medium text-[#3A6B22]">{distanceRange[0]} mile to {distanceRange[1]} Miles</span>
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
                  <input 
                    type="range" 
                    className="w-full" 
                    min={mockData.filterOptions.distanceRange.min} 
                    max={mockData.filterOptions.distanceRange.max} 
                    value={distanceRange[1]}
                    onChange={(e) => setDistanceRange([distanceRange[0], parseInt(e.target.value)])}
                  />
                  <div className="flex justify-between text-[12px] text-dark-green mt-2">
                    <span>{mockData.filterOptions.distanceRange.min} mile</span>
                    <span>{mockData.filterOptions.distanceRange.max} miles</span>
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
                      onClick={() => setSelectedRating(rating)}
                      className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium ${
                        selectedRating === rating
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
                  <div className="bg-white border border-black/[0.08] rounded-2xl px-5 py-3.5 flex items-center gap-2.5">
                    <Calendar className="w-6 h-6 text-[#3A6B22]" />
                    <span className="text-[14px] text-[#8d8d8d]">Choose Date</span>
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
                        className="px-3.5 py-2 rounded-[14px] text-[14px] font-medium bg-white border border-black/[0.06] text-[#8d8d8d]"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => {
                setFiltersOpen(false);
                fetchFields();
              }}
              className="w-full bg-[#3A6B22] text-white py-4 rounded-[50px] text-[16px] font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Results */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h1 className="text-[20px] md:text-[24px] lg:text-[29px] font-semibold text-dark-green">{loading ? 'Loading...' : `Over ${totalResults} results`}</h1>
              <button className="bg-white rounded-[54px] border border-black/[0.06] px-3 md:px-3.5 py-2 flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                  <SortDesc className="w-4 md:w-5 h-4 md:h-5 text-dark-green" />
                  <span className="text-[13px] md:text-[14px] font-medium text-dark-green">Sort By</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Fields Grid using the refactored FieldCard component */}
            {loading ? (
              <FieldGridSkeleton count={12} />
            ) : error ? (
              <div className="bg-white rounded-2xl p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-500 font-medium mb-2">{error}</p>
                  <button 
                    onClick={fetchFields}
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
                      distance: '2.0 miles',
                      rating: field.rating || 4.5,
                      amenities: field.amenities || [],
                      image: field.images?.[0] || '/fields/field1.jpg',
                      owner: field.owner?.name || 'Field Owner',
                      ownerJoined: 'March 2025',
                      isClaimed: field.isClaimed !== undefined ? field.isClaimed : true
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
            {!loading && !error && fields.length > 0 && totalPages > 1 && (
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