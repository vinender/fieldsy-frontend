import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
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

  const dateRangeOptions = [
    { id: 'thisWeek', label: 'This Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'customDate', label: 'Custom Date Range' }
  ];

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
              <h2 className="text-[24px] font-semibold text-[#192215]">Filter by Date</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Date Range */}
            <div>
              <h3 className="text-[16px] font-semibold text-[#192215] mb-3">Select Date Range</h3>
              <div className="space-y-2">
                {dateRangeOptions.map((option) => (
                  <div key={option.id}>
                    <label
                      className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-[#f8f1d7] transition-colors"
                    >
                      <span className="text-[14px] text-[#192215]">{option.label}</span>
                      
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
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </label>

                    {/* Show calendar for custom date range */}
                    {option.id === 'customDate' && selectedDateRange === 'customDate' && (
                      <div className="mt-3 p-4 bg-[#f8f1d7] rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[13px] font-medium text-[#192215] mb-2">
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
                                className="h-12 bg-white w-full border-[#E3E3E3] focus:border-[#3A6B22] text-[14px] font-medium cursor-pointer px-4 py-2 border rounded-[70px] focus:outline-none focus:ring-1 focus:ring-[#3A6B22]/20"
                                calendarClassName="fieldsy-calendar"
                                wrapperClassName="w-full"
                                showPopperArrow={false}
                              />
                              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3A6B22] pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[13px] font-medium text-[#192215] mb-2">
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
                                className="h-12 bg-white w-full border-[#E3E3E3] focus:border-[#3A6B22] text-[14px] font-medium cursor-pointer px-4 py-2 border rounded-[70px] focus:outline-none focus:ring-1 focus:ring-[#3A6B22]/20"
                                calendarClassName="fieldsy-calendar"
                                wrapperClassName="w-full"
                                showPopperArrow={false}
                              />
                              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3A6B22] pointer-events-none" />
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
          <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-gray-100 text-[#192215] rounded-full text-[14px] font-semibold hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                disabled={selectedDateRange === 'customDate' && (!startDate || !endDate)}
                className="flex-1 py-3 px-4 bg-[#3a6b22] text-white rounded-full text-[14px] font-semibold hover:bg-[#2d5319] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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