import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronDown, ChevronUp, Star, MapPin, Calendar, Check, Users } from 'lucide-react';
import BackButton from '@/components/common/BackButton';
import { Input } from '@/components/ui/input';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { UserLayout } from '@/components/layout/UserLayout';
import { useFieldDetails } from '@/hooks';
import { useSlotAvailability } from '@/hooks/useSlotAvailability';
import { FieldDetailsSkeleton } from '@/components/skeletons/FieldDetailsSkeleton';
import { format } from 'date-fns';
import { getUserImage, getUserInitials } from '@/utils/getUserImage';
import { useRescheduleBooking } from '@/hooks/useBookingApi';
import { toast } from 'sonner';

interface TimeSlot {
  time: string;
  available: boolean;
  selected: boolean;
  isPast?: boolean;
  isBooked?: boolean;
}

interface TimeSlots {
  morning: TimeSlot[];
  afternoon: TimeSlot[];
  evening: TimeSlot[];
}

const BookFieldPage = () => {
  const router = useRouter();
  const { id, mode, bookingId } = router.query;
  const fieldIdToUse = id ; // Support both query parameters
  const isRescheduleMode = mode === 'reschedule';
  
  const [numberOfDogs, setNumberOfDogs] = useState('1');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Start with null
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('8:00AM - 9:00AM');
  const [repeatBooking, setRepeatBooking] = useState('None');
  const [expandedSection, setExpandedSection] = useState<string | null>('morning');
  const [rescheduleData, setRescheduleData] = useState<any>(null);
  
  // Hook for rescheduling
  const rescheduleBookingMutation = useRescheduleBooking();

  // Fetch field details using the hook with optimizations
  const { data: fieldData, isLoading, error } = useFieldDetails(fieldIdToUse as string, {
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchOnMount: false, // Don't refetch on mount if cached
    refetchOnWindowFocus: false // Don't refetch on window focus
  });
  const field = fieldData?.data || fieldData;
  
  // Load reschedule data from localStorage if in reschedule mode
  useEffect(() => {
    if (isRescheduleMode) {
      const storedData = localStorage.getItem('rescheduleBooking');
      if (storedData) {
        const data = JSON.parse(storedData);
        setRescheduleData(data);
        setNumberOfDogs(data.numberOfDogs?.toString() || '1');
      }
    }
  }, [isRescheduleMode]);
  
  // Fetch slot availability for the selected date
  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const { 
    data: availabilityData, 
    refetch: refetchAvailability, 
    isRefetching: isRefetchingSlots 
  } = useSlotAvailability(
    fieldIdToUse as string,
    dateString
  );
  
  // Refetch availability when date changes
  useEffect(() => {
    if (dateString && fieldIdToUse) {
      refetchAvailability();
    }
  }, [dateString, fieldIdToUse, refetchAvailability]);

  // Function to find the next available date
  const findNextAvailableDate = (startDate: Date, maxDays: number = 90): Date | null => {
    if (!field || !field.operatingDays) {
      return startDate; // If no operating days specified, return the start date
    }

    // Parse operating days to get allowed days
    let allowedDays: string[] = [];
    const operatingDays = field.operatingDays;
    
    if (typeof operatingDays === 'string') {
      const lowerValue = operatingDays.toLowerCase();
      if (lowerValue === 'everyday') {
        // If everyday, all days are allowed
        return startDate;
      } else if (lowerValue === 'weekend' || lowerValue === 'weekends') {
        allowedDays = ['Saturday', 'Sunday'];
      } else if (lowerValue === 'weekdays' || lowerValue === 'weekday') {
        allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      } else {
        allowedDays = [operatingDays];
      }
    } else if (Array.isArray(operatingDays)) {
      if (operatingDays.length === 1 && typeof operatingDays[0] === 'string') {
        const firstValue = operatingDays[0].toLowerCase();
        if (firstValue === 'everyday') {
          return startDate;
        } else if (firstValue === 'weekend' || firstValue === 'weekends') {
          allowedDays = ['Saturday', 'Sunday'];
        } else if (firstValue === 'weekdays' || firstValue === 'weekday') {
          allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        } else {
          allowedDays = operatingDays;
        }
      } else {
        allowedDays = operatingDays;
      }
    }

    // Check up to maxDays in the future
    let currentDate = new Date(startDate);
    for (let i = 0; i < maxDays; i++) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (allowedDays.includes(dayName)) {
        return currentDate;
      }
      
      // Move to next day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return null; // No available date found
  };

  // Set initial selected date when field data is loaded
  useEffect(() => {
    if (field && !selectedDate) {
      const today = new Date();
      const nextAvailable = findNextAvailableDate(today);
      
      if (nextAvailable) {
        setSelectedDate(nextAvailable);
      } else {
        // If no available date found, still set today as fallback
        setSelectedDate(today);
      }
    }
  }, [field]); // Only run when field data changes

  // Calculate min date (today) and max date (e.g., 3 months from now)
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  // Check if a specific time slot is available
  const checkSlotAvailability = (date: Date | null, hour: number) => {
    if (!date || !field) return true; // Default to available if no date selected

    // Check if the selected date is an operating day
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const operatingDays = field.operatingDays;
    
    if (operatingDays && (operatingDays.length > 0 || typeof operatingDays === 'string')) {
      // Handle special cases for weekend/weekday strings
      let allowedDays: string[] = [];
      
      if (typeof operatingDays === 'string') {
        const lowerValue = operatingDays.toLowerCase();
        if (lowerValue === 'everyday') {
          // All days are allowed, skip the check
          allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        } else if (lowerValue === 'weekend' || lowerValue === 'weekends') {
          allowedDays = ['Saturday', 'Sunday'];
        } else if (lowerValue === 'weekdays' || lowerValue === 'weekday') {
          allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        } else {
          allowedDays = [operatingDays];
        }
      } else if (Array.isArray(operatingDays)) {
        if (operatingDays.length === 1 && typeof operatingDays[0] === 'string') {
          const firstValue = operatingDays[0].toLowerCase();
          if (firstValue === 'everyday') {
            allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          } else if (firstValue === 'weekend' || firstValue === 'weekends') {
            allowedDays = ['Saturday', 'Sunday'];
          } else if (firstValue === 'weekdays' || firstValue === 'weekday') {
            allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          } else {
            allowedDays = operatingDays;
          }
        } else {
          allowedDays = operatingDays;
        }
      }
      
      if (!allowedDays.includes(dayName)) {
        return false;
      }
    }

    // Check if slot is in the past for today
    const now = new Date();
    if (date && date.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      if (hour <= currentHour) {
        return false; // Past time slots are not available
      }
    }
    
    // If we don't have availability data yet, assume available
    return true;
  };

  // Function to generate time slots with availability data
  const generateTimeSlots = (): TimeSlots => {
    const slots: TimeSlots = {
      morning: [],
      afternoon: [],
      evening: []
    };

    // Use availability data if available, otherwise generate basic slots
    if (availabilityData?.data?.slots) {
      availabilityData.data.slots.forEach((slotData) => {
        const slot = {
          time: slotData.time,
          available: slotData.isAvailable,
          selected: slotData.time === selectedTimeSlot,
          isPast: slotData.isPast,
          isBooked: slotData.isBooked
        };

        // Categorize into morning, afternoon, or evening
        const hour = slotData.startHour;
        if (hour < 12) {
          slots.morning.push(slot);
        } else if (hour < 18) {
          slots.afternoon.push(slot);
        } else {
          slots.evening.push(slot);
        }
      });
    } else {
      // Fallback to basic time slot generation if no availability data
      const openingHour = field?.openingTime ? parseInt(field.openingTime.split(':')[0]) : 6;
      const closingHour = field?.closingTime ? parseInt(field.closingTime.split(':')[0]) : 21;
      const bookingDuration = field?.bookingDuration || '1hour';
      
      // Helper function to format time
      const formatTime = (hour: number, minutes: number = 0): string => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHour}:${displayMinutes}${period}`;
      };

      if (bookingDuration === '30min') {
        // Generate 30-minute slots
        for (let hour = openingHour; hour < closingHour; hour++) {
          for (let minutes = 0; minutes < 60; minutes += 30) {
            const endMinutes = minutes + 30;
            const endHour = endMinutes === 60 ? hour + 1 : hour;
            const actualEndMinutes = endMinutes === 60 ? 0 : endMinutes;
            
            // Don't create slots that go beyond closing time
            if (endHour > closingHour || (endHour === closingHour && actualEndMinutes > 0)) {
              break;
            }
            
            const startTime = formatTime(hour, minutes);
            const endTime = formatTime(endHour, actualEndMinutes);
            const slotTime = `${startTime} - ${endTime}`;

            const isAvailable = checkSlotAvailability(selectedDate, hour);

            const slot = {
              time: slotTime,
              available: isAvailable,
              selected: slotTime === selectedTimeSlot
            };

            if (hour < 12) {
              slots.morning.push(slot);
            } else if (hour < 18) {
              slots.afternoon.push(slot);
            } else {
              slots.evening.push(slot);
            }
          }
        }
      } else {
        // Generate 1-hour slots
        for (let hour = openingHour; hour < closingHour; hour++) {
          const startTime = formatTime(hour);
          const endTime = formatTime(hour + 1);
          const slotTime = `${startTime} - ${endTime}`;

          const isAvailable = checkSlotAvailability(selectedDate, hour);

          const slot = {
            time: slotTime,
            available: isAvailable,
            selected: slotTime === selectedTimeSlot
          };

          if (hour < 12) {
            slots.morning.push(slot);
          } else if (hour < 18) {
            slots.afternoon.push(slot);
          } else {
            slots.evening.push(slot);
          }
        }
      }
    }

    return slots;
  };

  // Memoize time slots to recalculate when dependencies change
  // This MUST be called before any conditional returns for React hooks rules
  const timeSlots = useMemo(() => generateTimeSlots(), [
    availabilityData,
    numberOfDogs,
    selectedDate,
    selectedTimeSlot,
    field
  ]);

  // Conditional returns MUST come after all hooks
  if (isLoading) {
    return (
      <UserLayout requireRole="DOG_OWNER">
        <FieldDetailsSkeleton />
      </UserLayout>
    );
  }

  if (!field || error) {
    return (
      <UserLayout requireRole="DOG_OWNER">
        <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">Field Not Found</h3>
              <p className="text-gray-600">The field you are looking for does not exist.</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  }

  const selectTimeSlot = (time: string) => {
    setSelectedTimeSlot(time);
  };

  // Function to check if a date should be disabled in the date picker
  const isDateDisabled = (date: Date) => {
    if (!field || !field.operatingDays || field.operatingDays.length === 0) {
      return false; // If no operating days specified, all days are available
    }

    // Handle special cases for weekend/weekday strings
    const operatingDays = field.operatingDays;
    let allowedDays: string[] = [];

    // Check if operatingDays is a string (single value) or array
    if (typeof operatingDays === 'string') {
      // Single string value
      const lowerValue = operatingDays.toLowerCase();
      if (lowerValue === 'everyday') {
        return false; // All days are enabled
      } else if (lowerValue === 'weekend' || lowerValue === 'weekends') {
        allowedDays = ['Saturday', 'Sunday'];
      } else if (lowerValue === 'weekdays' || lowerValue === 'weekday') {
        allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      } else {
        // Treat as a single day name
        allowedDays = [operatingDays];
      }
    } else if (Array.isArray(operatingDays)) {
      // Array of values
      if (operatingDays.length === 1 && typeof operatingDays[0] === 'string') {
        const firstValue = operatingDays[0].toLowerCase();
        if (firstValue === 'everyday') {
          return false; // All days are enabled
        } else if (firstValue === 'weekend' || firstValue === 'weekends') {
          allowedDays = ['Saturday', 'Sunday'];
        } else if (firstValue === 'weekdays' || firstValue === 'weekday') {
          allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        } else {
          allowedDays = operatingDays;
        }
      } else {
        // Check if array contains weekend/weekday strings
        const hasWeekend = operatingDays.some(day => 
          typeof day === 'string' && (day.toLowerCase() === 'weekend' || day.toLowerCase() === 'weekends')
        );
        const hasWeekday = operatingDays.some(day => 
          typeof day === 'string' && (day.toLowerCase() === 'weekday' || day.toLowerCase() === 'weekdays')
        );
        
        if (hasWeekend && !hasWeekday) {
          allowedDays = ['Saturday', 'Sunday'];
        } else if (hasWeekday && !hasWeekend) {
          allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        } else if (hasWeekend && hasWeekday) {
          // Both weekend and weekday = all days
          allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        } else {
          // Use the array as-is (should be day names)
          allowedDays = operatingDays;
        }
      }
    }

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const isDisabled = !allowedDays.includes(dayName);
    
    return isDisabled;
  };

  // Function to get available recurring options based on operating days
  const getAvailableRecurringOptions = () => {
    const options = ['None'];
    const operatingDays = field?.operatingDays;
    
    if (!field || !operatingDays || (Array.isArray(operatingDays) && operatingDays.length === 0)) {
      return ['None', 'Daily', 'Weekly', 'Monthly'];
    }

    // Determine actual operating days count
    let daysCount = 0;
    
    if (typeof operatingDays === 'string') {
      const lowerValue = operatingDays.toLowerCase();
      if (lowerValue === 'weekend' || lowerValue === 'weekends') {
        daysCount = 2;
      } else if (lowerValue === 'weekdays' || lowerValue === 'weekday') {
        daysCount = 5;
      } else {
        daysCount = 1; // Single day
      }
    } else if (Array.isArray(operatingDays)) {
      if (operatingDays.length === 1 && typeof operatingDays[0] === 'string') {
        const firstValue = operatingDays[0].toLowerCase();
        if (firstValue === 'weekend' || firstValue === 'weekends') {
          daysCount = 2;
        } else if (firstValue === 'weekdays' || firstValue === 'weekday') {
          daysCount = 5;
        } else {
          daysCount = 1;
        }
      } else {
        daysCount = operatingDays.length;
      }
    }

    // Only show Daily if field operates every day
    if (daysCount === 7) {
      options.push('Daily');
    }

    // Always show Weekly if at least one day is available
    if (daysCount > 0) {
      options.push('Weekly');
    }

    // Always show Monthly
    options.push('Monthly');

    return options;
  };

  return (
    <UserLayout requireRole="DOG_OWNER">
      <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3]">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        
        {/* Back Button and Title */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <BackButton 
            variant="cream"
            showLabel={true}
            label={isRescheduleMode ? "Reschedule Booking" : "Book Field"}
            size="lg"
            onClick={() => isRescheduleMode ? router.push('/user/my-bookings') : router.push(`/fields/${fieldIdToUse}`)} 
          />
        </div>
        
        {/* Reschedule Mode Banner */}
        {isRescheduleMode && rescheduleData && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Rescheduling Your Booking</h3>
                <p className="text-sm text-blue-700">
                  Original booking: {rescheduleData.originalTime}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Select a new date and time slot below, then click "Confirm Reschedule" to update your booking.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          
          {/* Left Column - Field Details Card */}
          <div className="bg-white rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 shadow-sm border border-black/5">
            {/* Field Image */}
            <div 
              className="w-full h-[200px] sm:h-[240px] md:h-[263px] rounded-[10px] bg-cover bg-center mb-4 sm:mb-5"
              style={{
                backgroundImage: `url('${field.images?.[0] || '/green-field.png'}')`
              }}
            />

            {/* Field Info */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <h2 className="text-xl sm:text-2xl lg:text-[29px] font-semibold text-dark-green">
                    {field.name}
                  </h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl lg:text-[24px] font-bold text-[#3A6B22]">${field.pricePerHour || field.price || 0}</span>
                    <span className="text-sm sm:text-[16px] text-dark-green/70">
                      /{field.bookingDuration === '30min' ? '30min' : 'hour'}
                    </span>
                  </div>
                </div>
                
                {/* Location and Rating */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                  <div className="flex items-center gap-1">
                    <img src='/location.svg' className="w-4 h-4 sm:w-5 sm:h-5 text-[#3A6B22]" />
                    <span className="text-sm sm:text-[16px] text-dark-green truncate">
                      {field.city && field.postalCode ? `${field.city} ${field.postalCode}` : field.address || 'Location not specified'}
                    </span>
                  </div>
                  {field.averageRating && (
                    <div className="bg-dark-green w-16 px-1.5 py-1 rounded-md flex items-center gap-0.5">
                      <Star className="w-[18px] h-[18px] text-yellow-400 fill-yellow" />
                      <span className="text-white text-[14px] font-semibold">{field.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>  

              {/* Owner Information */}
              {field.owner && (
                <div>
                  <h3 className="text-[18px] font-bold text-dark-green mb-2.5">Owner Information</h3>
                  <div className="bg-[#F8F1D7] rounded-lg p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={getUserImage(field.owner)} 
                        alt={field.owner.name || 'Field Owner'} 
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${getUserInitials(field.owner)}&background=3A6B22&color=fff&size=200`;
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[16px] font-medium text-[#090F1F]">
                            {field.owner.name || field.owner.email || 'Field Owner'}
                          </span>
                          {field.owner.isVerified && <Check className="w-4 h-4 text-[#3A6B22]" />}
                        </div>
                        <span className="text-[14px] text-[#545662]/70">
                          Joined {field.owner.createdAt ? new Date(field.owner.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                        </span>
                      </div>
                    </div>
                    <button className="bg-white border border-[#8FB366]/40 rounded-[10px] px-2.5 py-2.5 flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
                      <img src='/msg.svg' className="w-5 h-5" />
                      <span className="text-[12px] font-semibold text-dark-green">Send a Message</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="bg-white rounded-[20px] p-6 border border-dark-green/10">
            <h2 className="text-[24px] font-bold text-dark-green mb-6 leading-[31px]">
              Pick a date and available time slot to book this field for your dog's next adventure.
            </h2>

            <div className="space-y-8">
              {/* Number of Dogs - Only show for new bookings, not reschedule */}
              {!isRescheduleMode && (
              <div>
                <label className="text-[18px] font-semibold text-dark-green block mb-2">
                  Number of Dogs
                  {field.maxDogs && (
                    <span className="text-[14px] font-normal text-gray-500 ml-2">
                      (Maximum: {field.maxDogs})
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={numberOfDogs}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const maxAllowed = field.maxDogs || 10;
                      
                      // Validate input
                      if (value < 0) {
                        setNumberOfDogs('');
                      } else if (value > maxAllowed) {
                        setNumberOfDogs(maxAllowed.toString());
                      } else {
                        setNumberOfDogs(e.target.value);
                      }
                    }}
                    min="1"
                    max={field.maxDogs || 10}
                    placeholder={`Enter number of dogs (1-${field.maxDogs || 10})`}
                    className="h-14 border-[#E3E3E3] focus:border-[#3A6B22] text-[15px]"
                  />
                  {/* <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" /> */}
                </div>
                {numberOfDogs && parseInt(numberOfDogs) > (field.maxDogs || 10) && (
                  <p className="text-red text-sm mt-1">
                    This field allows a maximum of {field.maxDogs || 10} dogs
                  </p>
                )}
              </div>
              )}

              {/* Choose Date */}
              <div>
                <label className="text-[18px] font-semibold text-dark-green block mb-2">
                  Choose Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => setSelectedDate(date)}
                    minDate={minDate}
                    maxDate={maxDate}
                    filterDate={(date) => !isDateDisabled(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select a date"
                    className="h-14 bg-white w-full border-[#E3E3E3] focus:border-[#3A6B22] text-[15px] font-medium cursor-pointer px-4 py-2 border rounded-[70px] focus:outline-none focus:ring-1 focus:ring-[#3A6B22]/20"
                    calendarClassName="fieldsy-calendar"
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                  />
                  <img src='/book-field/calendar.svg' className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#3A6B22] pointer-events-none" />
                </div>
              </div>

              {/* Preferred Time */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[18px] font-semibold text-dark-green block">
                    Preferred Time
                  </label>
                  {selectedDate && (
                    <button
                      onClick={() => refetchAvailability()}
                      disabled={isRefetchingSlots}
                      className="text-[12px] text-[#3A6B22] hover:text-[#2e5519] flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {isRefetchingSlots ? (
                        <>
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Refreshing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Refresh Availability</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {/* Show field operating hours if available */}
                {field?.openingTime && field?.closingTime && (
                  <p className="text-sm text-gray-600 mb-3">
                    Field hours: {field.openingTime} - {field.closingTime}
                  </p>
                )}
                
                {/* Show message if no time slots available */}
                {timeSlots.morning.length === 0 && timeSlots.afternoon.length === 0 && timeSlots.evening.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                    <p className="text-sm font-medium">No time slots available for the selected date.</p>
                    <p className="text-sm mt-1">
                      {field?.operatingDays && field.operatingDays.length > 0 
                        ? `This field operates on: ${field.operatingDays.join(', ')}`
                        : 'Please select another date or contact the field owner.'}
                    </p>
                  </div>
                )}
                
                <div className={`space-y-[11px] relative ${isRefetchingSlots ? 'opacity-60 pointer-events-none' : ''}`}>
                  {/* Loading overlay */}
                  {isRefetchingSlots && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-white rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-[#3A6B22]" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm text-[#3A6B22]">Updating availability...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Morning Section */}
                  {timeSlots.morning.length > 0 && (
                  <div className={`border rounded-[10px] overflow-hidden ${expandedSection === 'morning' ? 'border-dark-green/10 bg-[#FFFCF3]' : 'border-dark-green/10'}`}>
                    <button
                      onClick={() => toggleSection('morning')}
                      className="w-full p-4 flex justify-between items-center"
                    >
                      <span className="text-[16px] font-medium text-dark-green">Morning</span>
                      {expandedSection === 'morning' ? (
                        <ChevronUp className="w-5 h-5 text-dark-green" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-dark-green" />
                      )}
                    </button>
                    
                    {expandedSection === 'morning' && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-[9px]">
                        {timeSlots.morning.map((slot, index) => (
                          <div key={index} className="relative group">
                            <button
                              onClick={() => slot.available && selectTimeSlot(slot.time)}
                              disabled={!slot.available}
                              className={`w-[132px] h-10 rounded-[14px] text-[12px] font-medium transition-colors ${
                                slot.isPast
                                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                  : slot.isBooked
                                  ? 'bg-red-50 text-red-400 border border-red-200 cursor-not-allowed'
                                  : !slot.available 
                                  ? 'bg-[#FFFCF3] text-dark-green opacity-50 border border-dark-green/10 cursor-not-allowed'
                                  : selectedTimeSlot === slot.time
                                  ? 'bg-[#8FB366] text-white'
                                  : 'bg-white text-dark-green border border-dark-green/10 hover:bg-gray-50'
                              }`}
                            >
                              {slot.time}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  )}

                  {/* Afternoon Section */}
                  {timeSlots.afternoon.length > 0 && (
                  <div className="border border-dark-green/10 rounded-[10px] overflow-hidden">
                    <button
                      onClick={() => toggleSection('afternoon')}
                      className="w-full p-4 flex justify-between items-center"
                    >
                      <span className="text-[16px] font-medium text-dark-green">Afternoon</span>
                      {expandedSection === 'afternoon' ? (
                        <ChevronUp className="w-5 h-5 text-dark-green" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-dark-green" />
                      )}
                    </button>
                    
                    {expandedSection === 'afternoon' && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-[9px]">
                        {timeSlots.afternoon.map((slot, index) => (
                          <div key={index} className="relative group">
                            <button
                              onClick={() => slot.available && selectTimeSlot(slot.time)}
                              disabled={!slot.available}
                              className={`w-[132px] h-10 rounded-[14px] text-[12px] font-medium transition-colors ${
                                slot.isPast
                                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                  : slot.isBooked
                                  ? 'bg-red-50 text-red-400 border border-red-200 cursor-not-allowed'
                                  : !slot.available 
                                  ? 'bg-[#FFFCF3] text-dark-green opacity-50 border border-dark-green/10 cursor-not-allowed'
                                  : selectedTimeSlot === slot.time
                                  ? 'bg-[#8FB366] text-white'
                                  : 'bg-white text-dark-green border border-dark-green/10 hover:bg-gray-50'
                              }`}
                            >
                              {slot.time}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  )}

                  {/* Evening Section */}
                  {timeSlots.evening.length > 0 && (
                  <div className="border border-dark-green/10 rounded-[10px] overflow-hidden">
                    <button
                      onClick={() => toggleSection('evening')}
                      className="w-full p-4 flex justify-between items-center"
                    >
                      <span className="text-[16px] font-medium text-dark-green">Evening</span>
                      {expandedSection === 'evening' ? (
                        <ChevronUp className="w-5 h-5 text-dark-green" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-dark-green" />
                      )}
                    </button>
                    
                    {expandedSection === 'evening' && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-[9px]">
                        {timeSlots.evening.map((slot, index) => (
                          <div key={index} className="relative group">
                            <button
                              onClick={() => slot.available && selectTimeSlot(slot.time)}
                              disabled={!slot.available}
                              className={`w-[132px] h-10 rounded-[14px] text-[12px] font-medium transition-colors ${
                                slot.isPast
                                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                  : slot.isBooked
                                  ? 'bg-red-50 text-red-400 border border-red-200 cursor-not-allowed'
                                  : !slot.available 
                                  ? 'bg-[#FFFCF3] text-dark-green opacity-50 border border-dark-green/10 cursor-not-allowed'
                                  : selectedTimeSlot === slot.time
                                  ? 'bg-[#8FB366] text-white'
                                  : 'bg-white text-dark-green border border-dark-green/10 hover:bg-gray-50'
                              }`}
                            >
                              {slot.time}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  )}
                </div>
              </div>

              {/* Repeat Booking - Hidden in reschedule mode */}
              {!isRescheduleMode && (
              <div>
                <h3 className="text-base sm:text-[18px] font-bold text-dark-green mb-2.5">Repeat This Booking?</h3>
                <p className="text-sm sm:text-[16px] text-[#8D8D8D] mb-3 sm:mb-4">
                  Need regular access? Set up a weekly or monthly recurring booking.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {getAvailableRecurringOptions().map((option) => (
                    <button
                      key={option}
                      onClick={() => setRepeatBooking(option)}
                      className={`w-full py-2 px-3 sm:px-3.5 rounded-[10px] sm:rounded-[14px] text-xs sm:text-[14px] font-medium transition-colors ${
                        repeatBooking === option
                          ? 'bg-[#8FB366] text-white'
                          : 'bg-white text-[#8D8D8D] border border-black/6 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* Continue Button */}
              <button 
                onClick={() => {
                  // Only validate dog count if not in reschedule mode
                  if (!isRescheduleMode) {
                    if (!numberOfDogs) {
                      alert('Please enter the number of dogs');
                      return;
                    }
                    
                    const numDogs = parseInt(numberOfDogs);
                    const maxAllowed = field.maxDogs || 10;
                    
                    if (numDogs < 1) {
                      alert('Please enter at least 1 dog');
                      return;
                    }
                    
                    if (numDogs > maxAllowed) {
                      alert(`This field allows a maximum of ${maxAllowed} dogs`);
                      return;
                    }
                  }
                  
                  if (isRescheduleMode && rescheduleData) {
                    // Handle reschedule confirmation
                    if (!selectedDate || !selectedTimeSlot) {
                      alert('Please select a date and time slot');
                      return;
                    }
                    
                    const [startTime, endTime] = selectedTimeSlot.split(' - ');
                    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                    
                    rescheduleBookingMutation.mutate(
                      {
                        bookingId: rescheduleData.bookingId,
                        date: formattedDate,
                        startTime,
                        endTime
                      },
                      {
                        onSuccess: () => {
                          toast.success('Booking rescheduled successfully!');
                          
                          // Clear reschedule data
                          localStorage.removeItem('rescheduleBooking');
                          
                          // Redirect to bookings page
                          router.push('/user/my-bookings');
                        },
                        onError: (error: any) => {
                          toast.error(error.response?.data?.message || 'Failed to reschedule booking');
                        }
                      }
                    );
                  } else {
                    // Normal booking flow - continue to payment
                    router.push({
                      pathname: '/fields/payment',
                      query: {
                        field_id: fieldIdToUse,
                        numberOfDogs: numberOfDogs,
                        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
                        timeSlot: selectedTimeSlot,
                        repeatBooking: repeatBooking,
                        price: field.pricePerHour || field.price || 0
                      }
                    });
                  }
                }}
                className="w-full h-14 bg-[#3A6B22] text-white rounded-full font-bold text-[16px] hover:bg-[#2D5A1B] transition-colors">
                {isRescheduleMode ? 'Confirm Reschedule' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </UserLayout>
  );
};

export default BookFieldPage;