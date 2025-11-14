import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Star, Calendar } from 'lucide-react';
import BackButton from '@/components/common/BackButton';
import Spinner from '@/components/ui/Spinner';
import { Input } from '@/components/ui/input';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { UserLayout } from '@/components/layout/UserLayout';
import { useFieldDetails } from '@/hooks';
import { useSlotAvailability } from '@/hooks/useSlotAvailability';
import { FieldDetailsSkeleton } from '@/components/skeletons/FieldDetailsSkeleton';
import { format } from 'date-fns';
import { useRescheduleBooking } from '@/hooks/useBookingApi';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import OwnerInformation from '@/components/fields/OwnerInformation';
import FieldLocation from '@/components/fields/FieldLocation';
import { getUserLocation } from '@/utils/getUserLocation';
import { useMaxAdvanceBookingDays } from '@/hooks/usePublicSettings';

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
  const { data: session } = useSession();
  const { id, mode, bookingId, recurring: recurringFromUrl } = router.query;
  const fieldIdToUse = id ; // Support both query parameters
  const isRescheduleMode = mode === 'reschedule';

  // Get max advance booking days from system settings
  const maxAdvanceBookingDays = useMaxAdvanceBookingDays();

  const [numberOfDogs, setNumberOfDogs] = useState('1');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Start with null
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(''); // User must explicitly select a slot
  const [repeatBooking, setRepeatBooking] = useState('None');
  const [expandedSection, setExpandedSection] = useState<string | null>('morning');
  const [rescheduleData, setRescheduleData] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isClient, setIsClient] = useState(false); // Track if we're on client side for timezone

  // Hook for rescheduling
  const rescheduleBookingMutation = useRescheduleBooking();

  // Set isClient to true once mounted (ensures client-side timezone is used)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get user location on mount
  useEffect(() => {
    getUserLocation().then(location => {
      if (location) {
        setUserLocation(location);
      }
    });
  }, []);

  // Fetch field details using the hook with optimizations and user location
  const { data: fieldData, isLoading, error } = useFieldDetails(fieldIdToUse as string, {
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchOnMount: false, // Don't refetch on mount if cached
    refetchOnWindowFocus: false, // Don't refetch on window focus
    userLocation: userLocation
  });
  
  const field = fieldData?.data || fieldData;
  console.log(';; field',field?.images[0]);


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


  // Separate useEffect to handle recurring pre-selection from URL
  useEffect(() => {
    // Wait for router to be ready and check if we have recurring param
    if (router.isReady && isRescheduleMode && recurringFromUrl) {
      const recurringValue = recurringFromUrl as string;
      console.log('[Reschedule] Router ready - Pre-selecting recurring from URL:', recurringValue);
      setRepeatBooking(recurringValue);
    }
  }, [router.isReady, isRescheduleMode, recurringFromUrl]);
  
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

  // Calculate min date (today) and max date based on system settings
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxAdvanceBookingDays);

  // Helper function to format time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (timeStr: string): string => {
    if (!timeStr) return '';

    // First, try to match 12-hour format with AM/PM (e.g., "12:15AM", "2:30 PM")
    const time12Match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (time12Match) {
      // Already in 12-hour format, just ensure consistent formatting
      let hour = parseInt(time12Match[1]);
      const minute = time12Match[2];
      const period = time12Match[3].toUpperCase();
      return `${hour}:${minute} ${period}`;
    }

    // Try to match 24-hour format (e.g., "14:30", "02:15")
    const time24Match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (time24Match) {
      let hour = parseInt(time24Match[1]);
      const minute = time24Match[2];
      const period = hour >= 12 ? 'PM' : 'AM';

      // Convert to 12-hour format
      if (hour === 0) {
        hour = 12; // Midnight
      } else if (hour > 12) {
        hour = hour - 12;
      }

      return `${hour}:${minute} ${period}`;
    }

    // If no match, return as-is
    return timeStr;
  };

  const parseTimeString = (timeStr: string): { hour: number; minute: number } => {
    if (!timeStr) return { hour: 0, minute: 0 };

    const time12Match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (time12Match) {
      let hour = parseInt(time12Match[1]);
      const minute = parseInt(time12Match[2]);
      const period = time12Match[3].toUpperCase();

      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }

      return { hour, minute };
    }

    const time24Match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (time24Match) {  
      const hour = parseInt(time24Match[1]);
      const minute = parseInt(time24Match[2]);
      return { hour, minute };
    }

    const hour = parseInt(timeStr.split(':')[0]) || 0;
    return { hour, minute: 0 };
  };

  const isSlotInPast = (date: Date | null, hour: number, minute: number = 0) => {
    if (!date) return false;

    // Only check for past slots on client side to ensure correct timezone
    if (!isClient) return false;

    const now = new Date();
    if (date.toDateString() !== now.toDateString()) {
      return false;
    }

    const slotMinutes = hour * 60 + minute;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return slotMinutes <= currentMinutes;
  };

  // Check if a specific time slot is available
  const checkSlotAvailability = (date: Date | null, hour: number, minute: number = 0) => {
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

    if (isSlotInPast(date, hour, minute)) {
      return false;
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
      // Only calculate current time on client side to ensure correct timezone
      const now = isClient ? new Date() : null;
      const isTodaySelected = isClient && selectedDate && now && selectedDate.toDateString() === now.toDateString();
      const currentMinutes = now ? now.getHours() * 60 + now.getMinutes() : 0;

      const getSlotStartMinutes = (slotData: any): number | null => {
        if (typeof slotData.startHour === 'number') {
          const minute = typeof slotData.startMinute === 'number' ? slotData.startMinute : 0;
          return slotData.startHour * 60 + minute;
        }

        if (slotData.time) {
          const [startPart] = slotData.time.split('-').map((part: string) => part.trim());
          if (startPart) {
            const { hour, minute } = parseTimeString(startPart);
            return hour * 60 + minute;
          }
        }
        return null;
      };

      availabilityData.data.slots.forEach((slotData) => {
        const startMinutes = getSlotStartMinutes(slotData);
        const hour = typeof slotData.startHour === 'number'
          ? slotData.startHour
          : startMinutes !== null
            ? Math.floor(startMinutes / 60)
            : 0;
        const minute = typeof slotData.startMinute === 'number'
          ? slotData.startMinute
          : startMinutes !== null
            ? startMinutes % 60
            : 0;

        // A slot is past if current time is at or after the slot start time
        // This prevents booking slots that have already started or passed
        // IMPORTANT: Always compute isPast on client side, ignore server's isPast value
        // because server uses server timezone, not client timezone
        const computedIsPast = isTodaySelected && startMinutes !== null && startMinutes <= currentMinutes;
        const isPast = computedIsPast; // Always use client-side computation, ignore slotData.isPast
        const isBooked = Boolean(slotData.isBooked);
        const available = Boolean(slotData.isAvailable) && !isPast && !isBooked;

        const slot = {
          time: slotData.time,
          available,
          selected: slotData.time === selectedTimeSlot,
          isPast,
          isBooked
        };

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
      const openingTime = parseTimeString(field?.openingTime || '6:00AM');
      const closingTime = parseTimeString(field?.closingTime || '9:00PM');
      const bookingDuration = field?.bookingDuration || '1hour';

      // Helper function to format time
      const formatTime = (hour: number, minutes: number = 0): string => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHour}:${displayMinutes}${period}`;
      };

      // Convert time to minutes for easier calculation
      const timeToMinutes = (hour: number, minute: number): number => {
        return hour * 60 + minute;
      };

      const openingMinutes = timeToMinutes(openingTime.hour, openingTime.minute);
      const closingMinutes = timeToMinutes(closingTime.hour, closingTime.minute);

      const slotDurationMinutes = bookingDuration === '30min' ? 30 : 60;

      // Generate slots from opening to closing time
      let currentMinutes = openingMinutes;

      while (currentMinutes + slotDurationMinutes <= closingMinutes) {
        // Calculate start time
        const startHour = Math.floor(currentMinutes / 60);
        const startMinute = currentMinutes % 60;

        // Calculate end time
        const endTotalMinutes = currentMinutes + slotDurationMinutes;
        const endHour = Math.floor(endTotalMinutes / 60);
        const endMinute = endTotalMinutes % 60;

        // Format times
        const startTime = formatTime(startHour, startMinute);
        const endTime = formatTime(endHour, endMinute);
        const slotTime = `${startTime} - ${endTime}`;

        // Check availability
        const isPastSlot = isSlotInPast(selectedDate, startHour, startMinute);
        const isAvailable = checkSlotAvailability(selectedDate, startHour, startMinute);

        const slot = {
          time: slotTime,
          available: isAvailable,
          selected: slotTime === selectedTimeSlot,
          isPast: isPastSlot,
          isBooked: false
        };

        // Categorize by time of day
        if (startHour < 12) {
          slots.morning.push(slot);
        } else if (startHour < 18) {
          slots.afternoon.push(slot);
        } else {
          slots.evening.push(slot);
        }

        // Move to next slot
        currentMinutes += slotDurationMinutes;
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
    field,
    isClient // Re-calculate when client mount completes to get correct timezone
  ]);

  // Conditional returns MUST come after all hooks
  if (isLoading || !field) {
    return (
      <UserLayout requireRole="DOG_OWNER">
        <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-lg font-medium text-dark-green">Loading field details...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout requireRole="DOG_OWNER">
        <div className="min-h-screen  mt-16 xl:mt-24 bg-[#FFFCF3] flex items-center justify-center">
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

  // Helper function to check if any available slots exist
  const hasAvailableSlots = () => {
    const allSlots = [...timeSlots.morning, ...timeSlots.afternoon, ...timeSlots.evening];
    return allSlots.some(slot => slot.available && !slot.isPast && !slot.isBooked);
  };

  // Helper function to check if the selected time slot is valid and available
  const isSelectedSlotValid = () => {
    if (!selectedTimeSlot) return false;

    const allSlots = [...timeSlots.morning, ...timeSlots.afternoon, ...timeSlots.evening];
    const slot = allSlots.find(s => s.time === selectedTimeSlot);

    return slot && slot.available && !slot.isPast && !slot.isBooked;
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
      return ['None', 'Everyday', 'Weekly', 'Monthly'];
    }

    // Determine actual operating days count and check if weekend-only
    let daysCount = 0;
    let isWeekendOnly = false;

    if (typeof operatingDays === 'string') {
      const lowerValue = operatingDays.toLowerCase();
      if (lowerValue === 'everyday') {
        daysCount = 7;
      } else if (lowerValue === 'weekend' || lowerValue === 'weekends') {
        daysCount = 2;
        isWeekendOnly = true; // ✅ Mark as weekend-only
      } else if (lowerValue === 'weekdays' || lowerValue === 'weekday') {
        daysCount = 5;
      } else {
        daysCount = 1; // Single day
      }
    } else if (Array.isArray(operatingDays)) {
      if (operatingDays.length === 1 && typeof operatingDays[0] === 'string') {
        const firstValue = operatingDays[0].toLowerCase();
        if (firstValue === 'everyday') {
          daysCount = 7;
        } else if (firstValue === 'weekend' || firstValue === 'weekends') {
          daysCount = 2;
          isWeekendOnly = true; // ✅ Mark as weekend-only
        } else if (firstValue === 'weekdays' || firstValue === 'weekday') {
          daysCount = 5;
        } else {
          daysCount = 1;
        }
      } else {
        daysCount = operatingDays.length;

        // Check if all operating days are Saturday or Sunday (weekend-only)
        const weekendDays = ['saturday', 'sunday'];
        const allWeekend = operatingDays.every(day =>
          weekendDays.includes(day.toLowerCase())
        );
        if (allWeekend && operatingDays.length === 2) {
          isWeekendOnly = true; // ✅ Mark as weekend-only
        }
      }
    }

    // Only show "Everyday" option if field is NOT weekend-only
    if (!isWeekendOnly) {
      options.push('Everyday');
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
      <div className="min-h-screen  mt-16 xl:mt-24 bg-[#FFFCF3]">
      {/* Main Container */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 lg:items-start">

          {/* Left Column - Field Details Card */}
          <div className="bg-white rounded-[16px] sm:rounded-[20px] p-3  shadow-sm border border-black/5 h-auto">
            {/* Field Image */}
            <div className="relative w-full h-[200px] sm:h-[240px] md:h-[263px] rounded-[10px] overflow-hidden mb-4 sm:mb-5">
              <Image
                src={field?.images?.[0] || '/green-field.png'}
                alt={field?.name || 'Field'}
                fill
                priority
                unoptimized
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Field Info */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <h2 className="text-xl sm:text-2xl lg:text-[29px] font-semibold text-dark-green">
                    {field.name}
                  </h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl lg:text-[24px] font-bold text-[#3A6B22]">£{field.pricePerHour || field.price || 0}</span>
                    <span className="text-sm sm:text-[16px] text-dark-green/70">
                      /dog/{field.bookingDuration === '30min' ? '30min' : 'hour'}
                    </span>
                  </div>
                </div>
                
                {/* Location and Rating */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                  <FieldLocation
                    field={field}
                    className="flex items-center gap-1"
                    iconClassName="w-4 h-4 sm:w-5 sm:h-5 text-[#3A6B22]"
                    textClassName="text-sm sm:text-[16px] text-dark-green truncate"
                    showDistance={true}
                  />
                  {/* {field.averageRating && ( */}
                    <div className="bg-dark-green w-16 flex justify-between px-2 py-1 rounded-md flex items-center ">
                      <img src='/star.svg' className="w-[20px] h-[20px] text-yellow-400  fill-yellow" />
                      <span className="text-white text-[14px] font-semibold">{field.averageRating.toFixed(1)}</span>
                    </div>
                  {/* )} */}
                </div>

              </div>  

              {/* Owner Information */}
              {field.owner && (
                <OwnerInformation
                  owner={{
                    id: field.owner.id || field.owner._id || field.ownerId,
                    name: field.owner.name,
                    email: field.owner.email,
                    isVerified: field.owner.isVerified,
                    createdAt: field.owner.createdAt,
                    profileImage: field.owner.image || field.owner.profileImage
                  }}
                  fieldId={field.id || field._id}
                />
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
                      const value = e.target.value;
                      const maxAllowed = field.maxDogs || 10;

                      // Prevent decimal input - only allow integers
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = parseInt(value) || 0;

                        // Validate input range
                        if (value === '') {
                          setNumberOfDogs('');
                        } else if (numValue < 0) {
                          setNumberOfDogs('');
                        } else if (numValue > maxAllowed) {
                          setNumberOfDogs(maxAllowed.toString());
                        } else {
                          setNumberOfDogs(value);
                        }
                      }
                      // If decimal detected, ignore the input
                    }}
                    onKeyDown={(e) => {
                      // Prevent decimal point, minus sign, and 'e' key
                      if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                        e.preventDefault();
                      }
                    }}
                    min="1"
                    max={field.maxDogs || 10}
                    step="1"
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
                    dateFormat="dd/MM/yyyy"
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
                <div className="flex justify-between items-center mb-2">
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
                          <Spinner size="xs" />
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
                  <p className="text-sm text-gray-600 mb-1">
                    Field hours: {formatTimeTo12Hour(field.openingTime)} - {formatTimeTo12Hour(field.closingTime)}
                  </p>
                )}

                {/* Time format indicator */}
                <p className="text-xs text-gray-500 mb-3">
                  All times shown in 12-hour format (AM/PM)
                </p>
                
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
                        <Spinner size="sm" />
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

              {/* Repeat Booking - Now shown in reschedule mode too */}
              <div>
                <h3 className="text-base sm:text-[18px] font-bold text-dark-green mb-2.5">
                  {isRescheduleMode ? 'Update Recurring Booking?' : 'Repeat This Booking?'}
                </h3>
                <p className="text-sm sm:text-[16px] text-[#8D8D8D] mb-3 sm:mb-4">
                  {isRescheduleMode
                    ? 'You can change the recurring schedule for this booking.'
                    : 'Need regular access? Set up a weekly or monthly recurring booking.'}
                </p>
                {/* Debug info */}
                {isRescheduleMode && (
                  <div className="mb-2 text-xs text-gray-500">
                    Current selection: {repeatBooking} | From URL: {recurringFromUrl as string || 'none'}
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {getAvailableRecurringOptions().map((option) => {
                    const isSelected = repeatBooking === option;
                    console.log(`[Recurring Button] Option: "${option}", RepeatBooking: "${repeatBooking}", Selected: ${isSelected}`);
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          console.log('[Recurring] Button clicked, setting to:', option);
                          setRepeatBooking(option);
                        }}
                        className={`w-full py-2 px-3 sm:px-3.5 rounded-[10px] sm:rounded-[14px] text-xs sm:text-[14px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#8FB366] text-white'
                            : 'bg-white text-[#8D8D8D] border border-black/6 hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Warning Messages */}
              {selectedDate && !hasAvailableSlots() && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 mb-1">No Available Time Slots</h4>
                      <p className="text-sm text-amber-700">
                        There are no available time slots for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
                      </p>
                      <p className="text-sm text-amber-700 mt-2 font-medium">
                        Please select a different date to see available slots.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedDate && hasAvailableSlots() && !selectedTimeSlot && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-1">Select a Time Slot</h4>
                      <p className="text-sm text-blue-700">
                        Please select an available time slot from the options above to continue with your booking.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedDate && hasAvailableSlots() && selectedTimeSlot && !isSelectedSlotValid() && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">Selected Slot Unavailable</h4>
                      <p className="text-sm text-red-700">
                        The time slot you selected is no longer available. Please select another available slot or choose a different date.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={() => {
                  // Validate time slot selection FIRST for both modes
                  if (!selectedTimeSlot) {
                    toast.error('Please select a time slot to continue');
                    return;
                  }

                  // Check if the selected time slot is actually available
                  if (!isSelectedSlotValid()) {
                    toast.error('The selected time slot is not available. Please choose another slot or change the date.');
                    return;
                  }

                  // Check if there are any available slots for the selected date
                  if (!hasAvailableSlots()) {
                    toast.error('No available time slots for the selected date. Please choose a different date.');
                    return;
                  }

                  // Only validate dog count if not in reschedule mode
                  if (!isRescheduleMode) {
                    if (!numberOfDogs) {
                      toast.error('Please enter the number of dogs');
                      return;
                    }

                    const numDogs = parseInt(numberOfDogs);
                    const maxAllowed = field.maxDogs || 10;

                    if (numDogs < 1) {
                      toast.error('Please enter at least 1 dog');
                      return;
                    }

                    if (numDogs > maxAllowed) {
                      toast.error(`This field allows a maximum of ${maxAllowed} dogs`);
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
                        endTime,
                        recurring: repeatBooking
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
                disabled={!selectedTimeSlot || !isSelectedSlotValid() || !hasAvailableSlots()}
                className={`w-full h-14 rounded-full font-bold text-[16px] transition-colors ${
                  !selectedTimeSlot || !isSelectedSlotValid() || !hasAvailableSlots()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#3A6B22] text-white hover:bg-[#2D5A1B]'
                }`}>
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
