import React, { useState } from 'react';
import { ChevronDown, ChevronUp, SortDesc, Calendar, X, Navigation, Filter } from 'lucide-react';
import { FieldCard } from '@/components/fields/FieldCard';
import { Input } from '@/components/ui/input';
import { UserLayout } from '@/components/layout/UserLayout';
import mockData from '@/data/mock-data.json';
import { useRouter } from 'next/router';

export default function SearchResults() {
  const router = useRouter();
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
    router.push(`/fields/claim-field?id=${fieldId}`)
  };

  return (
    <UserLayout requireRole="DOG_OWNER">
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
            <button className="ml-auto bg-[#3A6B22] text-white px-4 md:px-6 py-2 md:py-3 rounded-[90px] text-[14px] md:text-[16px] font-semibold whitespace-nowrap">
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
              onClick={() => setFiltersOpen(false)}
              className="w-full bg-[#3A6B22] text-white py-4 rounded-[50px] text-[16px] font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Results */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h1 className="text-[20px] md:text-[24px] lg:text-[29px] font-semibold text-dark-green">Over {mockData.fields.length * 15} results</h1>
              <button className="bg-white rounded-[54px] border border-black/[0.06] px-3 md:px-3.5 py-2 flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                  <SortDesc className="w-4 md:w-5 h-4 md:h-5 text-dark-green" />
                  <span className="text-[13px] md:text-[14px] font-medium text-dark-green">Sort By</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Fields Grid using the refactored FieldCard component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {mockData.fields.map((field) => (
                <FieldCard 
                  key={field.id} 
                  {...field}
                  variant="expanded"
                  isLiked={likedFields.includes(field.id)}
                  onLike={handleLike}
                  onViewDetails={handleViewDetails}
                  onBookNow={handleBookNow}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6 lg:mt-8">
              <span className="text-[12px] md:text-[14px] text-dark-green">Showing 1-{mockData.searchDefaults.resultsPerPage} of {mockData.fields.length * 15}</span>
              <div className="flex gap-1 flex-wrap justify-center">
                <button className="w-7 h-7 md:w-8 md:h-8 rounded bg-[#3A6B22] text-white text-[12px] md:text-[14px] font-medium">1</button>
                <button className="w-7 h-7 md:w-8 md:h-8 rounded text-dark-green text-[12px] md:text-[14px]">2</button>
                <button className="w-7 h-7 md:w-8 md:h-8 rounded text-dark-green text-[12px] md:text-[14px]">3</button>
                <button className="w-7 h-7 md:w-8 md:h-8 rounded text-dark-green text-[12px] md:text-[14px]">4</button>
                <span className="px-2 text-dark-green hidden sm:inline">...</span>
                <button className="w-7 h-7 md:w-8 md:h-8 rounded text-dark-green text-[12px] md:text-[14px]">10</button>
                <button className="px-2 text-dark-green text-[12px] md:text-[14px]">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </UserLayout>
  );
}