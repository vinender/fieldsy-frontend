import React from 'react';
import { Check } from 'lucide-react';

interface FieldsSortFilterProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onClose?: () => void;
}

export default function FieldsSortFilter({ 
  sortBy, 
  sortOrder, 
  onSortChange,
  onClose 
}: FieldsSortFilterProps) {
  
  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    onSortChange(newSortBy, newSortOrder);
    if (onClose) {
      onClose();
    }
  };

  const isSelected = (type: string, order: 'asc' | 'desc') => {
    return sortBy === type && sortOrder === order;
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0px_4px_10px_3px_rgba(0,0,0,0.1)] p-4" style={{ width: '300px' }}>
      <div className="flex flex-col gap-6">
        
        {/* Ratings Section */}
        <div className="flex flex-col gap-2">
          {/* Ratings Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-[#3A6B22] rounded flex items-center justify-center">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <h3 className="text-[#192215] text-[15px] font-semibold font-['DM_Sans']">
              Ratings
            </h3>
          </div>
          
          {/* Ratings Options */}
          <div className="flex flex-col gap-2 pl-7">
            {/* High to Low */}
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-1 -mx-1"
              onClick={() => handleSortChange('rating', 'desc')}
            >
              <span className={`text-[14px] font-['DM_Sans'] ${isSelected('rating', 'desc') ? 'text-[#192215] font-medium' : 'text-[#192215] font-normal'}`}>
                High to Low
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
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
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-1 -mx-1"
              onClick={() => handleSortChange('rating', 'asc')}
            >
              <span className={`text-[14px] font-['DM_Sans'] ${isSelected('rating', 'asc') ? 'text-[#192215] font-medium' : 'text-[#192215] font-normal'}`}>
                Low to High
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
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
          {/* Pricing Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-[#3A6B22] rounded flex items-center justify-center">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <h3 className="text-[#192215] text-[15px] font-semibold font-['DM_Sans']">
              Pricing
            </h3>
          </div>
          
          {/* Pricing Options */}
          <div className="flex flex-col gap-2 pl-7">
            {/* High to Low */}
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-1 -mx-1"
              onClick={() => handleSortChange('price', 'desc')}
            >
              <span className={`text-[14px] font-['DM_Sans'] ${isSelected('price', 'desc') ? 'text-[#192215] font-medium' : 'text-[#192215] font-normal'}`}>
                High to Low
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
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
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-1 -mx-1"
              onClick={() => handleSortChange('price', 'asc')}
            >
              <span className={`text-[14px] font-['DM_Sans'] ${isSelected('price', 'asc') ? 'text-[#192215] font-medium' : 'text-[#192215] font-normal'}`}>
                Low to High
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
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