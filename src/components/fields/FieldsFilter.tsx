import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import mockData from '@/data/mock-data.json';
import { getAmenityLabel } from '@/utils/formatters';

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
  // Default filter values
  const defaultFilters: FilterState = {
    size: '',
    amenities: [],
    rating: '',
    priceRange: [mockData.filterOptions.priceRange.min, mockData.filterOptions.priceRange.max],
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
      tempFilters.priceRange[0] !== mockData.filterOptions.priceRange.min ||
      tempFilters.priceRange[1] !== mockData.filterOptions.priceRange.max ||
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
          fixed lg:relative right-0 top-0 h-full w-[85%] max-w-[375px] bg-white overflow-y-auto
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
                  onClick={() => setTempFilters(prev => ({ ...prev, size }))}
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
              {mockData.filterOptions.amenities.slice(0, 6).map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => {
                    setTempFilters(prev => ({
                      ...prev,
                      amenities: prev.amenities.includes(amenity) 
                        ? prev.amenities.filter(a => a !== amenity)
                        : [...prev.amenities, amenity]
                    }));
                  }}
                  className={`px-3.5 py-2 rounded-[14px] text-[14px] font-medium flex items-center gap-2 ${
                    tempFilters.amenities.includes(amenity)
                      ? 'bg-[#8FB366] text-white' 
                      : 'bg-white border border-black/[0.06] text-[#8d8d8d]'
                  }`}
                >
                  {getAmenityLabel(amenity)}
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
              <span className="text-[14px] font-medium text-[#3A6B22]">${tempFilters.priceRange[0]} to ${tempFilters.priceRange[1]}</span>
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
                  border-radius: 0.25rem;
                  height: 0.25rem;
                }
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  background: #3A6B22;
                  border-radius: 50%;
                  border: 0;
                  height: 1rem;
                  width: 1rem;
                  margin-top: -0.375rem;
                }
                input[type="range"]::-moz-range-track {
                  background: #e0e0e0;
                  border-radius: 0.25rem;
                  height: 0.25rem;
                }
                input[type="range"]::-moz-range-thumb {
                  background: #3A6B22;
                  border-radius: 50%;
                  border: 0;
                  height: 1rem;
                  width: 1rem;
                }
                input[type="range"]::-moz-range-progress {
                  background: #3A6B22;
                  border-radius: 0.25rem;
                  height: 0.25rem;
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
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Max Price</label>
                  <input 
                    type="range" 
                    className="w-full" 
                    min={mockData.filterOptions.priceRange.min} 
                    max={mockData.filterOptions.priceRange.max} 
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
              <div className="flex justify-between text-[12px] text-dark-green mt-2">
                <span>${tempFilters.priceRange[0]}</span>
                <span>${tempFilters.priceRange[1]}</span>
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
                input[type="range"] {
                  -webkit-appearance: none;
                  appearance: none;
                  background: transparent;
                  cursor: pointer;
                  width: 100%;
                }
                input[type="range"]::-webkit-slider-track {
                  background: #e0e0e0;
                  border-radius: 0.25rem;
                  height: 0.25rem;
                }
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  background: #3A6B22;
                  border-radius: 50%;
                  border: 0;
                  height: 1rem;
                  width: 1rem;
                  margin-top: -0.375rem;
                }
                input[type="range"]::-moz-range-track {
                  background: #e0e0e0;
                  border-radius: 0.25rem;
                  height: 0.25rem;
                }
                input[type="range"]::-moz-range-thumb {
                  background: #3A6B22;
                  border-radius: 50%;
                  border: 0;
                  height: 1rem;
                  width: 1rem;
                }
                input[type="range"]::-moz-range-progress {
                  background: #3A6B22;
                  border-radius: 0.25rem;
                  height: 0.25rem;
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
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Max Distance</label>
                  <input 
                    type="range" 
                    className="w-full" 
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
              <div className="flex justify-between text-[12px] text-dark-green mt-2">
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
                  onClick={() => setTempFilters(prev => ({ ...prev, rating }))}
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