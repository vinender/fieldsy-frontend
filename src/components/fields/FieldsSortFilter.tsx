import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface SortConfig {
  rating?: 'asc' | 'desc';
  price?: 'asc' | 'desc';
}

interface FieldsSortFilterProps {
  sortConfig: SortConfig;
  onSortChange: (sortConfig: SortConfig) => void;
  onClose?: () => void;
}

export default function FieldsSortFilter({
  sortConfig: initialSortConfig,
  onSortChange,
  onClose
}: FieldsSortFilterProps) {

  // Track both rating and price sort configurations independently
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);

  // Update local state when props change (when dropdown reopens)
  // This ensures the checkboxes reflect the current state
  useEffect(() => {
    setSortConfig(initialSortConfig);
  }, [initialSortConfig]);

  const handleSectionToggle = (section: 'rating' | 'price') => {
    const newSortConfig = { ...sortConfig };

    if (newSortConfig[section]) {
      // Uncheck this section
      delete newSortConfig[section];
    } else {
      // Check this section with default 'desc' order
      newSortConfig[section] = 'desc';
    }

    setSortConfig(newSortConfig);
    // Immediately notify parent of the change
    onSortChange(newSortConfig);
  };

  const handleSortOrderChange = (section: 'rating' | 'price', order: 'asc' | 'desc') => {
    const newSortConfig = {
      ...sortConfig,
      [section]: order
    };
    setSortConfig(newSortConfig);

    // Notify parent of the change
    onSortChange(newSortConfig);

    if (onClose) {
      onClose();
    }
  };

  const isSelected = (type: string, order: 'asc' | 'desc') => {
    return sortConfig[type as 'rating' | 'price'] === order;
  };

  const isSectionEnabled = (section: 'rating' | 'price') => {
    return sortConfig[section] !== undefined;
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0px_4px_10px_3px_rgba(0,0,0,0.1)] p-4" style={{ width: '300px', minWidth: '300px' }}>
      <div className="flex flex-col gap-6">

        {/* Ratings Section */}
        <div className="flex flex-col gap-2">
          {/* Ratings Header with Checkbox */}
          <div
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-1 -mx-1"
            onClick={() => handleSectionToggle('rating')}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                isSectionEnabled('rating')
                  ? 'bg-[#3A6B22] border-[#3A6B22]'
                  : 'border-gray-300'
              }`}>
                {isSectionEnabled('rating') && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>
              <h3 className="text-[#192215]  text-[15px] font-semibold font-['DM_Sans']">
                Ratings
              </h3>
            </div>
          </div>

          {/* Ratings Options - Only enabled when section is checked */}
          <div className={`flex flex-col gap-2 pl-7 ${!isSectionEnabled('rating') ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* High to Low */}
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-1"
              onClick={() => handleSortOrderChange('rating', 'desc')}
            >
              <span className={`text-[14px] font-['DM_Sans'] ${isSelected('rating', 'desc') ? 'text-[#192215] font-medium' : 'text-[#192215] font-normal'}`}>
                High to Low
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected('rating', 'desc')
                  ? 'border-[#3A6B22]'
                  : 'border-gray-300'
              }`}>
                {isSelected('rating', 'desc') && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3A6B22]" />
                )}
              </div>
            </div>

            {/* Low to High */}
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-1"
              onClick={() => handleSortOrderChange('rating', 'asc')}
            >
              <span className={`text-[14px] font-['DM_Sans'] ${isSelected('rating', 'asc') ? 'text-[#192215] font-medium' : 'text-[#192215] font-normal'}`}>
                Low to High
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected('rating', 'asc')
                  ? 'border-[#3A6B22]'
                  : 'border-gray-300'
              }`}>
                {isSelected('rating', 'asc') && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3A6B22]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="flex flex-col gap-2">
          {/* Pricing Header with Checkbox */}
          <div
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-1 -mx-1"
            onClick={() => handleSectionToggle('price')}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                isSectionEnabled('price')
                  ? 'bg-[#3A6B22] border-[#3A6B22]'
                  : 'border-gray-300'
              }`}>
                {isSectionEnabled('price') && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>
              <h3 className="text-[#192215] text-[15px] font-semibold font-['DM_Sans']">
                Pricing
              </h3>
            </div>
          </div>

          {/* Pricing Options - Only enabled when section is enabled */}
          <div className={`flex flex-col gap-2 pl-7 ${!isSectionEnabled('price') ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* High to Low */}
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-1"
              onClick={() => handleSortOrderChange('price', 'desc')}
            >
              <span className={`text-[14px] font-['DM_Sans'] ${isSelected('price', 'desc') ? 'text-[#192215] font-medium' : 'text-[#192215] font-normal'}`}>
                High to Low
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected('price', 'desc')
                  ? 'border-[#3A6B22]'
                  : 'border-gray-300'
              }`}>
                {isSelected('price', 'desc') && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3A6B22]" />
                )}
              </div>
            </div>

            {/* Low to High */}
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-1"
              onClick={() => handleSortOrderChange('price', 'asc')}
            >
              <span className={`text-[14px] font-['DM_Sans'] ${isSelected('price', 'asc') ? 'text-[#192215] font-medium' : 'text-[#192215] font-normal'}`}>
                Low to High
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected('price', 'asc')
                  ? 'border-[#3A6B22]'
                  : 'border-gray-300'
              }`}>
                {isSelected('price', 'asc') && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3A6B22]" />
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}