import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import mockData from '@/data/mock-data.json';
import { getAmenityLabel } from '@/utils/formatters';
import Image from 'next/image';
import { useAmenities } from '@/hooks/queries/useAmenities';
import { usePriceRange } from '@/hooks/queries/useFieldQueries';

export interface FilterState {
  size: string;
  amenities: string[];
  rating: string;
  priceRange: number[];
  distanceRange: number[];
  date: Date | undefined;
  availability: string[];
}

interface FieldsFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
  initialFilters?: FilterState;
}


const FieldsFilter: React.FC<FieldsFilterProps> = ({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  onResetFilters,
  initialFilters 
}) => {
  // Fetch amenities and price range using React Query
  const { data: amenitiesList = [], isLoading: loadingAmenities } = useAmenities(true);
  const { data: priceRangeData, isLoading: loadingPriceRange } = usePriceRange();

  // Extract min and max price from API or use fallback from mockData
  const minPrice = priceRangeData?.data?.minPrice ?? mockData.filterOptions.priceRange.min;
  const maxPrice = priceRangeData?.data?.maxPrice ?? mockData.filterOptions.priceRange.max;

  // Default filter values - use dynamic price range
  const defaultFilters: FilterState = {
    size: '',
    amenities: [],
    rating: '',
    priceRange: [minPrice, maxPrice],
    distanceRange: [mockData.filterOptions.distanceRange.min, mockData.filterOptions.distanceRange.max],
    date: undefined,
    availability: []
  };

  // Use initial filters if provided, otherwise use defaults
  const [tempFilters, setTempFilters] = useState<FilterState>(initialFilters || defaultFilters);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation timing and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // First render the element off-screen
      setShouldRender(true);
      // Prevent body scroll on mobile
      if (window.innerWidth < 1024) {
        document.body.style.overflow = 'hidden';
      }
      // Use double requestAnimationFrame to ensure the element is rendered before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      // Start exit animation
      setIsAnimating(false);
      // Remove body scroll lock
      document.body.style.overflow = '';
      // Delay unmounting to allow exit animation to complete
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match the duration of the animation
      return () => clearTimeout(timer);
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    fieldSize: true,
    amenities: true,
    price: true,
    distance: true,
    rating: true,
    date: true,
    availability: true
  });

  // Update temp filters when initial filters change
  useEffect(() => {
    if (initialFilters) {
      setTempFilters(initialFilters);
    }
  }, [initialFilters]);

  // Update price range when API data loads
  useEffect(() => {
    if (priceRangeData?.data && !initialFilters) {
      setTempFilters(prev => ({
        ...prev,
        priceRange: [priceRangeData.data.minPrice, priceRangeData.data.maxPrice]
      }));
    }
  }, [priceRangeData, initialFilters]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = () => {
    return (
      tempFilters.size !== '' ||
      tempFilters.amenities.length > 0 ||
      tempFilters.rating !== '' ||
      tempFilters.priceRange[0] !== minPrice ||
      tempFilters.priceRange[1] !== maxPrice ||
      tempFilters.distanceRange[0] !== mockData.filterOptions.distanceRange.min ||
      tempFilters.distanceRange[1] !== mockData.filterOptions.distanceRange.max ||
      tempFilters.date !== undefined ||
      tempFilters.availability.length > 0
    );
  };

  const handleReset = () => {
    setTempFilters(defaultFilters);
    onResetFilters();
  };

  const handleApply = () => {
    onApplyFilters(tempFilters);
  };

  return (
    <>
      {/* Backdrop overlay for mobile - with fade animation */}
      {shouldRender && (
        <div 
          className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
      )}
      
      {/* Filter sidebar - desktop always visible, mobile slides in from right */}
      <div className={`
        ${shouldRender ? 'fixed' : 'hidden'} lg:block lg:relative z-50 lg:z-auto
      `}>
        <div className={`
          lg:w-[280px] min-[1400px]:w-[375px] lg:bg-white lg:rounded-[22px] lg:border lg:border-black/[0.06]
          fixed lg:relative right-0 top-0 h-full lg:h-auto w-[85%] max-w-[375px] bg-white overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isAnimating ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          p-6
        `}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[18px] font-semibold text-dark-green">Filters</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="text-[14px] font-semibold text-blood-red">Reset All</button>
            {isOpen && (
              <button 
                onClick={onClose}
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
                  onClick={() => setTempFilters(prev => ({
                    ...prev,
                    size: prev.size === size ? '' : size
                  }))}
                  className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium ${
                    tempFilters.size === size
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
              {loadingAmenities ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="px-3.5 py-2 rounded-[14px] bg-gray-200 animate-pulse w-24 h-9"></div>
                ))
              ) : (
                amenitiesList.slice(0, 6).map((amenity) => {
                  const isSelected = tempFilters.amenities.includes(amenity.name);
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => {
                        setTempFilters(prev => ({
                          ...prev,
                          amenities: prev.amenities.includes(amenity.name)
                            ? prev.amenities.filter(a => a !== amenity.name)
                            : [...prev.amenities, amenity.name]
                        }));
                      }}
                      className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium flex items-center gap-2 transition-colors ${
                        isSelected
                          ? 'bg-[#8FB366] text-white'
                          : 'bg-white border border-black/[0.06] text-[#8d8d8d]'
                      }`}
                    >
                      {amenity.icon && (
                        <div className={`w-5 h-5 flex items-center justify-center ${isSelected ? '[&_svg]:fill-white' : '[&_svg]:fill-gray-500'}`}>
                          <Image
                            src={amenity.icon}
                            alt={amenity.name}
                            width={20}
                            height={20}
                            className="object-contain"
                            style={{
                              filter: isSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(48%) sepia(0%) saturate(0%) hue-rotate(196deg) brightness(91%) contrast(89%)'
                            }}
                          />
                        </div>
                      )}
                      {amenity.name}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="h-1.5 bg-[#F9F9F9] w-full mb-5" />

         {/* Price */}
         <div className="mb-5">
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-[14px] font-bold text-dark-green">Price</h3>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#3A6B22]">£{tempFilters.priceRange[0]} to £{tempFilters.priceRange[1]}</span>
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
                .range-slider {
                  position: relative;
                  height: 4px;
                  background: #e0e0e0;
                  border-radius: 4px;
                  margin: 20px 0;
                }
                .range-slider-track {
                  position: absolute;
                  height: 4px;
                  background: #3A6B22;
                  border-radius: 4px;
                }
                input[type="range"] {
                  position: absolute;
                  width: 100%;
                  height: 4px;
                  background: transparent;
                  pointer-events: none;
                  -webkit-appearance: none;
                  appearance: none;
                }
                input[type="range"]::-webkit-slider-thumb {
                  pointer-events: all;
                  -webkit-appearance: none;
                  appearance: none;
                  background: #3A6B22;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  height: 20px;
                  width: 20px;
                  cursor: pointer;
                  position: relative;
                  z-index: 2;
                }
                input[type="range"]::-moz-range-thumb {
                  pointer-events: all;
                  background: #3A6B22;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  height: 20px;
                  width: 20px;
                  cursor: pointer;
                  position: relative;
                  z-index: 2;
                }
              `}</style>
              <div className="relative pt-2 pb-4">
                <div className="range-slider">
                  <div
                    className="range-slider-track"
                    style={{
                      left: `${maxPrice > minPrice ? ((tempFilters.priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100 : 0}%`,
                      right: `${maxPrice > minPrice ? 100 - ((tempFilters.priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100 : 0}%`
                    }}
                  />
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={tempFilters.priceRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      if (newMin <= tempFilters.priceRange[1]) {
                        setTempFilters(prev => ({
                          ...prev,
                          priceRange: [newMin, prev.priceRange[1]]
                        }));
                      }
                    }}
                  />
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={tempFilters.priceRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      if (newMax >= tempFilters.priceRange[0]) {
                        setTempFilters(prev => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], newMax]
                        }));
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[12px] text-dark-green">
                <span>£{minPrice}</span>
                <span>£{maxPrice}</span>
              </div>
            </div>
          )}
        </div>  
        {/* END OF CORRECTED SECTION */}

        <div className="h-1.5 bg-[#F9F9F9] w-full mb-5" />

        {/* Distance (Unchanged from original) */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-[14px] font-bold text-dark-green">Distance away</h3>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#3A6B22]">{tempFilters.distanceRange[0]} mile to {tempFilters.distanceRange[1]} Miles</span>
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
                .range-slider-distance {
                  position: relative;
                  height: 4px;
                  background: #e0e0e0;
                  border-radius: 4px;
                  margin: 20px 0;
                }
                .range-slider-track-distance {
                  position: absolute;
                  height: 4px;
                  background: #3A6B22;
                  border-radius: 4px;
                }
                .distance-range input[type="range"] {
                  position: absolute;
                  width: 100%;
                  height: 4px;
                  background: transparent;
                  pointer-events: none;
                  -webkit-appearance: none;
                  appearance: none;
                }
                .distance-range input[type="range"]::-webkit-slider-thumb {
                  pointer-events: all;
                  -webkit-appearance: none;
                  appearance: none;
                  background: #3A6B22;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  height: 20px;
                  width: 20px;
                  cursor: pointer;
                  position: relative;
                  z-index: 2;
                }
                .distance-range input[type="range"]::-moz-range-thumb {
                  pointer-events: all;
                  background: #3A6B22;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  height: 20px;
                  width: 20px;
                  cursor: pointer;
                  position: relative;
                  z-index: 2;
                }
              `}</style>
              <div className="relative pt-2 pb-4 distance-range">
                <div className="range-slider-distance">
                  <div
                    className="range-slider-track-distance"
                    style={{
                      left: `${((tempFilters.distanceRange[0] - mockData.filterOptions.distanceRange.min) / (mockData.filterOptions.distanceRange.max - mockData.filterOptions.distanceRange.min)) * 100}%`,
                      right: `${100 - ((tempFilters.distanceRange[1] - mockData.filterOptions.distanceRange.min) / (mockData.filterOptions.distanceRange.max - mockData.filterOptions.distanceRange.min)) * 100}%`
                    }}
                  />
                  <input
                    type="range"
                    min={mockData.filterOptions.distanceRange.min}
                    max={mockData.filterOptions.distanceRange.max}
                    value={tempFilters.distanceRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      if (newMin <= tempFilters.distanceRange[1]) {
                        setTempFilters(prev => ({
                          ...prev,
                          distanceRange: [newMin, prev.distanceRange[1]]
                        }));
                      }
                    }}
                  />
                  <input
                    type="range"
                    min={mockData.filterOptions.distanceRange.min}
                    max={mockData.filterOptions.distanceRange.max}
                    value={tempFilters.distanceRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      if (newMax >= tempFilters.distanceRange[0]) {
                        setTempFilters(prev => ({
                          ...prev,
                          distanceRange: [prev.distanceRange[0], newMax]
                        }));
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[12px] text-dark-green">
                <span>{tempFilters.distanceRange[0]} mile{tempFilters.distanceRange[0] !== 1 ? 's' : ''}</span>
                <span>{tempFilters.distanceRange[1]} mile{tempFilters.distanceRange[1] !== 1 ? 's' : ''}</span>
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
                  onClick={() => setTempFilters(prev => ({
                    ...prev,
                    rating: prev.rating === rating ? '' : rating
                  }))}
                  className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium ${
                    tempFilters.rating === rating
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
                  selected={tempFilters.date}
                  onChange={(date: Date | null) => setTempFilters(prev => ({ ...prev, date: date || undefined }))}
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
                      setTempFilters(prev => ({
                        ...prev,
                        availability: prev.availability.includes(time) 
                          ? prev.availability.filter(t => t !== time)
                          : [...prev.availability, time]
                      }));
                    }}
                    className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium ${
                      tempFilters.availability.includes(time)
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
            onClick={handleApply}
            className="w-full bg-[#3A6B22] text-white py-4 rounded-[50px] text-[16px] font-semibold hover:bg-[#2d5319] transition-colors"
          >
            Apply Filters
          </button>
        )}
        </div>
      </div>
    </>
  );
};

export default FieldsFilter;