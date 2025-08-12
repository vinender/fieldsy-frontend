import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FilterSectionProps {
  onFiltersChange?: (filters: any) => void
}

export function FilterSection({ onFiltersChange }: FilterSectionProps) {
  const [expandedSections, setExpandedSections] = useState({
    fieldSize: true,
    amenities: true,
    price: true,
    distance: true,
    rating: true,
    date: true,
    availability: true
  })

  const [filters, setFilters] = useState({
    fieldSize: "",
    amenities: [] as string[],
    priceMin: 100,
    priceMax: 300,
    distance: 10,
    rating: 0,
    date: "",
    availability: ""
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange?.(updated)
  }

  const handleAmenityToggle = (amenity: string) => {
    const updated = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity]
    handleFilterChange({ amenities: updated })
  }

  return (
    <div className="bg-white rounded-[12px] p-5 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[18px] font-semibold text-dark-green">Filters</h2>
        <button className="text-[12px] text-red-500 hover:text-red-600 font-medium">
          Reset All
        </button>
      </div>

      {/* Field Size */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          onClick={() => toggleSection('fieldSize')}
          className="flex justify-between items-center w-full text-left"
        >
          <h3 className="text-[14px] font-medium text-dark-green">Field Size</h3>
          {expandedSections.fieldSize ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.fieldSize && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-gray-600">Small (Under 1 Acre)</span>
              <span className="text-gray-400"></span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-gray-600">Medium (1-3 Acres)</span>
              <span className="text-gray-400"></span>
            </div>
            <div className="bg-[#3a6b22] text-white px-3 py-1.5 rounded-full text-[12px] inline-block">
              Large (3+ Acres)
            </div>
          </div>
        )}
      </div>

      {/* Amenities */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          onClick={() => toggleSection('amenities')}
          className="flex justify-between items-center w-full text-left"
        >
          <h3 className="text-[14px] font-medium text-dark-green">Amenities</h3>
          {expandedSections.amenities ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.amenities && (
          <div className="mt-3 space-y-2">
            {['Secure fencing', 'Water Access', 'Toilet', 'Parking', 'Shelter', 'Waste Disposal'].map(amenity => (
              <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-3.5 h-3.5 text-[#3a6b22] rounded border-gray-300 focus:ring-[#3a6b22] focus:ring-1"
                />
                <span className="text-[12px] text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full text-left"
        >
          <h3 className="text-[14px] font-medium text-dark-green">Price</h3>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.price && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-gray-500 mb-2">
              <span>$100 to $110</span>
            </div>
            
            <div className="relative">
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div className="h-1.5 bg-[#3a6b22] rounded-full w-1/3"></div>
              </div>
              <div className="absolute top-[-3px] left-0 w-2 h-2 bg-[#3a6b22] rounded-full"></div>
              <div className="absolute top-[-3px] left-[33%] w-2 h-2 bg-[#3a6b22] rounded-full"></div>
            </div>
            
            <div className="flex justify-between text-[10px] text-gray-400 mt-2">
              <span>$60</span>
              <span>$300</span>
            </div>
          </div>
        )}
      </div>

      {/* Distance */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          onClick={() => toggleSection('distance')}
          className="flex justify-between items-center w-full text-left"
        >
          <h3 className="text-[14px] font-medium text-dark-green">Distance away</h3>
          {expandedSections.distance ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.distance && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-gray-500 mb-2">
              <span>0 mile to 13 Miles</span>
            </div>
            
            <div className="relative">
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div className="h-1.5 bg-[#3a6b22] rounded-full w-1/4"></div>
              </div>
              <div className="absolute top-[-3px] left-0 w-2 h-2 bg-[#3a6b22] rounded-full"></div>
              <div className="absolute top-[-3px] left-[25%] w-2 h-2 bg-[#3a6b22] rounded-full"></div>
            </div>
            
            <div className="flex justify-between text-[10px] text-gray-400 mt-2">
              <span>0 mile</span>
              <span>60 miles</span>
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          onClick={() => toggleSection('rating')}
          className="flex justify-between items-center w-full text-left"
        >
          <h3 className="text-[14px] font-medium text-dark-green">Rating</h3>
          {expandedSections.rating ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.rating && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-600">Any Rating</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`text-[16px] ${star <= 2 ? 'text-[#3a6b22]' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
              <span className="text-[11px] text-gray-500 ml-1">2.5+</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`text-[16px] ${star <= 3 ? 'text-gray-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
              <span className="text-[11px] text-gray-500 ml-1">3+</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`text-[16px] ${star <= 3.5 ? 'text-gray-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
              <span className="text-[11px] text-gray-500 ml-1">3.5+</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`text-[16px] ${star <= 4 ? 'text-gray-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
              <span className="text-[11px] text-gray-500 ml-1">4+</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`text-[16px] ${star <= 4.5 ? 'text-gray-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
              <span className="text-[11px] text-gray-500 ml-1">4.5+</span>
            </div>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <h3 className="text-[14px] font-medium text-dark-green mb-3">Date</h3>
        <input
          type="date"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#3a6b22]"
          onChange={(e) => handleFilterChange({ date: e.target.value })}
        />
      </div>

      {/* Availability */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection('availability')}
          className="flex justify-between items-center w-full text-left"
        >
          <h3 className="text-[14px] font-medium text-dark-green">Availability</h3>
          {expandedSections.availability ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.availability && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button className="px-2 py-1 text-[11px] border border-gray-300 rounded-full hover:bg-gray-50">
                Morning
              </button>
              <button className="px-2 py-1 text-[11px] border border-gray-300 rounded-full hover:bg-gray-50">
                Afternoon
              </button>
              <button className="px-2 py-1 text-[11px] border border-gray-300 rounded-full hover:bg-gray-50">
                Evening
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Apply Filters Button */}
      <button className="w-full py-2.5 bg-[#3a6b22] text-white text-[13px] font-medium rounded-full hover:bg-[#2a5b12] transition-colors">
        Apply Filters
      </button>
    </div>
  )
}