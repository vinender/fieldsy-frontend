import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Check } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface BookingFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filter: FilterOptions) => void;
}

interface FilterOptions {
  dateRange: string;
  startDate?: Date;
  endDate?: Date;
}

const BookingFilter: React.FC<BookingFilterProps> = ({ isOpen, onClose, onApplyFilter }) => {
  const [selectedDateRange, setSelectedDateRange] = useState('thisWeek');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dateRangeOptions = [
    { id: 'thisWeek', label: 'This Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'customDate', label: 'Custom Date Range' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleDateRangeChange = (value: string) => {
    setSelectedDateRange(value);
    // Reset custom dates when switching away from custom
    if (value !== 'customDate') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleApply = () => {
    const filter: FilterOptions = {
      dateRange: selectedDateRange
    };

    // Add dates if custom range is selected
    if (selectedDateRange === 'customDate' && startDate && endDate) {
      filter.startDate = startDate;
      filter.endDate = endDate;
    }

    onApplyFilter(filter);
    onClose();
  };

  const handleReset = () => {
    setSelectedDateRange('thisWeek');
    setStartDate(null);
    setEndDate(null);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 bg-white rounded-[20px] shadow-lg border border-gray-200 w-[320px] sm:w-[380px] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Date Range */}
        <div>
          <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#192215] mb-3">Select Date Range</h3>
          <div className="space-y-1.5">
            {dateRangeOptions.map((option) => (
              <div key={option.id}>
                <label
                  className="flex items-center justify-between cursor-pointer p-2.5 sm:p-3 rounded-lg hover:bg-[#f8f1d7] transition-colors"
                >
                  <span className="text-[13px] sm:text-[14px] text-[#192215]">{option.label}</span>

                  <div className="relative">
                    <input
                      type="radio"
                      name="dateFilter"
                      value={option.id}
                      checked={selectedDateRange === option.id}
                      onChange={(e) => handleDateRangeChange(e.target.value)}
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
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* Show calendar for custom date range */}
                {option.id === 'customDate' && selectedDateRange === 'customDate' && (
                  <div className="mt-2 p-3 bg-[#f8f1d7] rounded-lg">
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[12px] sm:text-[13px] font-medium text-[#192215] mb-1.5">
                          Start Date
                        </label>
                        <div className="relative">
                          <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            maxDate={endDate || undefined}
                            dateFormat="dd MMM yyyy"
                            placeholderText="Select start date"
                            className="h-10 sm:h-11 bg-white w-full border-[#E3E3E3] focus:border-[#3A6B22] text-[13px] sm:text-[14px] font-medium cursor-pointer px-3 sm:px-4 py-2 border rounded-[70px] focus:outline-none focus:ring-1 focus:ring-[#3A6B22]/20"
                            calendarClassName="fieldsy-calendar"
                            wrapperClassName="w-full"
                            showPopperArrow={false}
                          />
                          <Calendar className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A6B22] pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[12px] sm:text-[13px] font-medium text-[#192215] mb-1.5">
                          End Date
                        </label>
                        <div className="relative">
                          <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate || undefined}
                            dateFormat="dd MMM yyyy"
                            placeholderText="Select end date"
                            className="h-10 sm:h-11 bg-white w-full border-[#E3E3E3] focus:border-[#3A6B22] text-[13px] sm:text-[14px] font-medium cursor-pointer px-3 sm:px-4 py-2 border rounded-[70px] focus:outline-none focus:ring-1 focus:ring-[#3A6B22]/20"
                            calendarClassName="fieldsy-calendar"
                            wrapperClassName="w-full"
                            showPopperArrow={false}
                          />
                          <Calendar className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A6B22] pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 p-3 sm:p-4 border-t border-gray-100 rounded-b-[20px]">
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 bg-white border border-gray-300 text-[#192215] rounded-full text-[12px] sm:text-[14px] font-semibold hover:bg-gray-100 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            disabled={selectedDateRange === 'customDate' && (!startDate || !endDate)}
            className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 bg-[#3a6b22] text-white rounded-full text-[12px] sm:text-[14px] font-semibold hover:bg-[#2d5319] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingFilter;