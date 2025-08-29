import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';

interface BookingFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filter: FilterOptions) => void;
}

interface FilterOptions {
  dateRange: string;
  status?: string[];
  sortBy?: string;
}

const BookingFilter: React.FC<BookingFilterProps> = ({ isOpen, onClose, onApplyFilter }) => {
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState('newest');

  const dateRangeOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'customDate', label: 'Custom Date Range' }
  ];

  const statusOptions = [
    { id: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-700' },
    { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
    { id: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
    { id: 'expired', label: 'Expired', color: 'bg-gray-100 text-gray-700' }
  ];

  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'price-low', label: 'Price: Low to High' }
  ];

  const handleStatusToggle = (statusId: string) => {
    setSelectedStatuses(prev =>
      prev.includes(statusId)
        ? prev.filter(id => id !== statusId)
        : [...prev, statusId]
    );
  };

  const handleApply = () => {
    onApplyFilter({
      dateRange: selectedDateRange,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      sortBy: selectedSort
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedDateRange('all');
    setSelectedStatuses([]);
    setSelectedSort('newest');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-white p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-[24px] font-semibold text-[#192215]">Filter Bookings</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Date Range */}
            <div>
              <h3 className="text-[16px] font-semibold text-[#192215] mb-3">Date Range</h3>
              <div className="space-y-2">
                {dateRangeOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-[#f8f1d7] transition-colors"
                  >
                    <span className="text-[14px] text-[#192215]">{option.label}</span>
                    
                    <div className="relative">
                      <input
                        type="radio"
                        name="dateFilter"
                        value={option.id}
                        checked={selectedDateRange === option.id}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`
                        w-5 h-5 rounded-full border-2 transition-all duration-200
                        ${selectedDateRange === option.id 
                          ? 'border-[#3a6b22] bg-[#3a6b22]' 
                          : 'border-gray-300 bg-white'
                        }
                      `}>
                        {selectedDateRange === option.id && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="text-[16px] font-semibold text-[#192215] mb-3">Booking Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => handleStatusToggle(status.id)}
                    className={`
                      px-4 py-2 rounded-full text-[13px] font-medium border transition-all
                      ${selectedStatuses.includes(status.id)
                        ? `${status.color} border-current`
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }
                    `}
                  >
                    {selectedStatuses.includes(status.id) && (
                      <Check className="w-3 h-3 inline mr-1" />
                    )}
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <h3 className="text-[16px] font-semibold text-[#192215] mb-3">Sort By</h3>
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-[#f8f1d7] transition-colors"
                  >
                    <span className="text-[14px] text-[#192215]">{option.label}</span>
                    
                    <div className="relative">
                      <input
                        type="radio"
                        name="sortFilter"
                        value={option.id}
                        checked={selectedSort === option.id}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`
                        w-5 h-5 rounded-full border-2 transition-all duration-200
                        ${selectedSort === option.id 
                          ? 'border-[#3a6b22] bg-[#3a6b22]' 
                          : 'border-gray-300 bg-white'
                        }
                      `}>
                        {selectedSort === option.id && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-gray-100 text-[#192215] rounded-full text-[14px] font-semibold hover:bg-gray-200 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 px-4 bg-[#3a6b22] text-white rounded-full text-[14px] font-semibold hover:bg-[#2d5319] transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingFilter;