import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Star, Calendar, X } from 'lucide-react';
import BackButton from '@/components/common/BackButton';
import Spinner from '@/components/ui/Spinner';
import { Input } from '@/components/ui/input';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { UserLayout } from '@/components/layout/UserLayout';
import { useFieldDetails } from '@/hooks';
import { useSlotAvailability, BookingDuration } from '@/hooks/useSlotAvailability';
import { FieldDetailsSkeleton } from '@/components/skeletons/FieldDetailsSkeleton';
import { TimeSlotsSkeleton } from '@/components/skeletons/SkeletonComponents';
import { format } from 'date-fns';
import { useRescheduleBooking } from '@/hooks/useBookingApi';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import OwnerInformation from '@/components/fields/OwnerInformation';
import { LoginPromptModal } from '@/components/modal/LoginPromptModal';
import FieldLocation from '@/components/fields/FieldLocation';
// import { getUserLocation } from '@/utils/getUserLocation'; // Distance calculation disabled
import { useMaxAdvanceBookingDays } from '@/hooks/usePublicSettings';
import { formatRating } from '@/utils/formatters';
import axiosClient from '@/lib/api/axios-client';

interface TimeSlot {
  time: string;
  available: boolean;
  selected: boolean;
  isPast?: boolean;
  isBooked?: boolean;
  isBookedByRecurring?: boolean;
  recurringInterval?: string;
}

interface TimeSlots {
  morning: TimeSlot[];
  afternoon: TimeSlot[];
  evening: TimeSlot[];
}

const BookFieldPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { id, field_id, mode, bookingId, recurring: recurringFromUrl } = router.query;
  const fieldIdToUse = (field_id || id) as string | undefined; // Support both query parameters
  const isRescheduleMode = mode === 'reschedule';

  // Get max advance booking days from system settings
  const maxAdvanceBookingDays = useMaxAdvanceBookingDays();

  const [numberOfDogs, setNumberOfDogs] = useState('1');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Start with null
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]); // Support multiple slots
  const [repeatBooking, setRepeatBooking] = useState('None');
  const [expandedSection, setExpandedSection] = useState<string | null>('morning');
  const [rescheduleData, setRescheduleData] = useState<any>(null);
  // const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null); // Distance calculation disabled
  const [isClient, setIsClient] = useState(false); // Track if we're on client side for timezone
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false); // Loading state for conflict check
  const [selectedDuration, setSelectedDuration] = useState<BookingDuration>('60min'); // Default to 60 minutes
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // Show login prompt for unauthorized users
  const [skippedDates, setSkippedDates] = useState<Array<{ date: string; formattedDate: string; bookedBy: string }>>([]); // Skipped dates for recurring bookings

  // Hook for rescheduling
  const rescheduleBookingMutation = useRescheduleBooking();

  // Set isClient to true once mounted (ensures client-side timezone is used)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get user location on mount - Distance calculation disabled
  // useEffect(() => {
  //   getUserLocation().then(location => {
  //     if (location) {
  //       setUserLocation(location);
  //     }
  //   });
  // }, []);

  // Fetch field details using the hook with optimizations (distance calculation disabled)
  const { data: fieldData, isLoading, error } = useFieldDetails(fieldIdToUse as string, {
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchOnMount: false, // Don't refetch on mount if cached
    refetchOnWindowFocus: true, // Don't refetch on window focus
    // userLocation: userLocation // Distance calculation disabled
  });

  const field = fieldData?.data || fieldData;
  console.log(';; field', field?.images[0]);


  // Load reschedule data from localStorage if in reschedule mode
  useEffect(() => {
    if (isRescheduleMode) {
      const storedData = localStorage.getItem('rescheduleBooking');
      if (storedData) {
        const data = JSON.parse(storedData);
        setRescheduleData(data);
        setNumberOfDogs(data.numberOfDogs?.toString() || '1');
        // Set duration from original booking (duration cannot be changed during reschedule)
        if (data.duration) {
          setSelectedDuration(data.duration as BookingDuration);
        }
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

  // Fetch slot availability for the selected date with duration
  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const {
    data: availabilityData,
    refetch: refetchAvailability,
    isRefetching: isRefetchingSlots,
    isLoading: isLoadingSlots,
    isFetching: isFetchingSlots
  } = useSlotAvailability(
    fieldIdToUse as string,
    dateString,
    selectedDuration
  );

  // Combined loading state for slots
  const isSlotsLoading = isLoadingSlots || isFetchingSlots;

  // Refetch availability when date or duration changes
  useEffect(() => {
    if (dateString && fieldIdToUse) {
      refetchAvailability();
    }
  }, [dateString, fieldIdToUse, selectedDuration, refetchAvailability]);

  // Clear selected time slots when duration changes (since slots will be different)
  useEffect(() => {
    setSelectedTimeSlots([]);
  }, [selectedDuration]);

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
      const isTodaySelected = Boolean(isClient && selectedDate && now && selectedDate.toDateString() === now.toDateString());
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
        const isBookedByRecurring = Boolean(slotData.isBookedByRecurring);
        const available = Boolean(slotData.isAvailable) && !isPast && !isBooked;

        const slot = {
          time: slotData.time,
          available,
          selected: selectedTimeSlots.includes(slotData.time),
          isPast,
          isBooked,
          isBookedByRecurring,
          recurringInterval: slotData.recurringInterval
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
          selected: selectedTimeSlots.includes(slotTime),
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
    selectedTimeSlots,
    field,
    isClient // Re-calculate when client mount completes to get correct timezone
  ]);

  // Conditional returns MUST come after all hooks
  // Note: UserLayout without requireRole allows unauthenticated users to view this page
  // Login prompt is shown when they click "Continue" button
  if (isLoading || !field) {
    return (
      <UserLayout>
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
      <UserLayout>
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

  // Field eligibility checks for booking page
  // Priority: 1. isBlocked (admin) → 2. isActive + isApproved (discoverability) → 3. isClaimed (bookability)

  // 1. Blocked by admin - field is NOT visible at all
  if (field && field.isBlocked === true) {
    return (
      <UserLayout>
        <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">Field Not Available</h3>
              <p className="text-gray-600 mb-4">
                This field is currently not available.
              </p>
              <a
                href="/fields"
                className="inline-block bg-[#3A6B22] text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Browse Other Fields
              </a>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // 2. Field must be active AND approved to be discoverable
  if (field && (field.isActive === false || field.isApproved === false)) {
    return (
      <UserLayout>
        <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">Field Not Available</h3>
              <p className="text-gray-600 mb-4">
                This field is currently not available for bookings. The field owner may have temporarily disabled it.
              </p>
              <a
                href="/fields"
                className="inline-block bg-[#3A6B22] text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Browse Other Fields
              </a>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // 3. Field must be claimed to be bookable
  if (field && field.isClaimed !== true) {
    return (
      <UserLayout>
        <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">Field Not Available for Booking</h3>
              <p className="text-gray-600 mb-6">
                This field has not been claimed by an owner yet and is not available for booking.
                If you are the owner of this field, you can claim it to start accepting bookings.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push(`/fields/${fieldIdToUse}`)}
                  className="px-6 py-2.5 border border-dark-green text-dark-green rounded-full font-medium hover:bg-dark-green/5 transition-colors"
                >
                  View Field Details
                </button>
                <button
                  onClick={() => router.push(`/fields/claim-field-form?field_id=${fieldIdToUse}`)}
                  className="px-6 py-2.5 bg-dark-green text-white rounded-full font-medium hover:bg-dark-green/90 transition-colors"
                >
                  Claim This Field
                </button>
              </div>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  }

  // Toggle time slot selection (add or remove from array)
  // In reschedule mode, only allow single slot selection
  const toggleTimeSlot = (time: string) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(time)) {
        // Remove if already selected
        return prev.filter(t => t !== time);
      } else {
        // In reschedule mode, replace the selection (only 1 slot allowed)
        if (isRescheduleMode) {
          return [time];
        }
        // For new bookings, add to selection (multi-select allowed)
        return [...prev, time];
      }
    });
  };

  // Remove a specific time slot from selection
  const removeTimeSlot = (time: string) => {
    setSelectedTimeSlots(prev => prev.filter(t => t !== time));
  };

  // Helper function to check if any available slots exist
  const hasAvailableSlots = () => {
    const allSlots = [...timeSlots.morning, ...timeSlots.afternoon, ...timeSlots.evening];
    return allSlots.some(slot => slot.available && !slot.isPast && !slot.isBooked);
  };

  // Helper function to check if all selected time slots are valid and available
  const areSelectedSlotsValid = () => {
    if (selectedTimeSlots.length === 0) return false;

    const allSlots = [...timeSlots.morning, ...timeSlots.afternoon, ...timeSlots.evening];

    // Check that every selected slot is still available
    return selectedTimeSlots.every(selectedTime => {
      const slot = allSlots.find(s => s.time === selectedTime);
      return slot && slot.available && !slot.isPast && !slot.isBooked;
    });
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
    <>
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
                      <span className="text-lg sm:text-xl lg:text-[24px] font-bold text-[#3A6B22]">
                        From £{field.price30min || field.price || 0}
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
                      <span className="text-white text-[14px] font-semibold">{formatRating(field.averageRating || 0).toFixed(1)}</span>
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
              <h2 className="text-[18px] sm:text-[20px] lg:text-[24px] font-bold text-dark-green mb-6 leading-[26px] sm:leading-[28px] lg:leading-[31px]">
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
                      <p className="text-red-500text-sm mt-1">
                        This field allows a maximum of {field.maxDogs || 10} dogs
                      </p>
                    )}
                  </div>
                )}

                {/* Session Duration Selector */}
                <div>
                  <label className="text-[18px] font-semibold text-dark-green block mb-2">
                    Session Duration
                  </label>
                  {isRescheduleMode ? (
                    <p className="text-sm text-amber-600 mb-3">
                      Duration cannot be changed when rescheduling. Your original booking duration is preserved.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-3">
                      Select your preferred session length. Includes 5 minutes buffer time for field preparation.
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => !isRescheduleMode && setSelectedDuration('30min')}
                      disabled={isRescheduleMode}
                      className={`py-3 px-4 rounded-[14px] text-[14px] font-medium transition-colors border ${selectedDuration === '30min'
                        ? 'bg-[#8FB366] text-white border-[#8FB366]'
                        : 'bg-white text-dark-green border-dark-green/10 hover:bg-gray-50'
                        } ${isRescheduleMode ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-bold">30 min</span>
                        <span className={`text-sm font-semibold ${selectedDuration === '30min' ? 'text-white' : 'text-[#3A6B22]'}`}>
                          £{field.price30min || field.price || 0}/dog
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => !isRescheduleMode && setSelectedDuration('60min')}
                      disabled={isRescheduleMode}
                      className={`py-3 px-4 rounded-[14px] text-[14px] font-medium transition-colors border ${selectedDuration === '60min'
                        ? 'bg-[#8FB366] text-white border-[#8FB366]'
                        : 'bg-white text-dark-green border-dark-green/10 hover:bg-gray-50'
                        } ${isRescheduleMode ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-bold">60 min</span>
                        <span className={`text-sm font-semibold ${selectedDuration === '60min' ? 'text-white' : 'text-[#3A6B22]'}`}>
                          £{field.price1hr || field.price || 0}/dog
                        </span>
                      </div>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    While you book for {selectedDuration === '60min' ? '1 hr' : '30 min'} you actually get {selectedDuration === '60min' ? '55 mins' : '25 mins'}
                  </p>
                </div>

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
                      Preferred Time {isRescheduleMode && <span className="text-sm font-normal text-gray-500">(Select one)</span>}
                    </label>
                    {selectedDate && (
                      <button
                        onClick={() => refetchAvailability()}
                        disabled={isRefetchingSlots}
                        className="text-[12px] text-[#3A6B22] hover:text-[#2e5519] flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {isRefetchingSlots ? (
                          <>
                            {/* <Spinner size="xs" /> */}
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

                  {/* Show skeleton when loading slots */}
                  {isSlotsLoading && (
                    <TimeSlotsSkeleton />
                  )}

                  {/* Show message if no time slots available (only when not loading) */}
                  {!isSlotsLoading && timeSlots.morning.length === 0 && timeSlots.afternoon.length === 0 && timeSlots.evening.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                      <p className="text-sm font-medium">No time slots available for the selected date.</p>
                      <p className="text-sm mt-1">
                        {field?.operatingDays && field.operatingDays.length > 0
                          ? `This field operates on: ${field.operatingDays.join(', ')}`
                          : 'Please select another date or contact the field owner.'}
                      </p>
                    </div>
                  )}

                  {/* Show time slots when not loading */}
                  {!isSlotsLoading && (
                    <div className={`space-y-[11px] relative ${isRefetchingSlots ? 'opacity-60 pointer-events-none' : ''}`}>
                      {/* Loading overlay for refetching */}
                      {isRefetchingSlots && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="bg-white rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
                            <Spinner size="sm" inline />
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
                                    onClick={() => slot.available && toggleTimeSlot(slot.time)}
                                    disabled={!slot.available}
                                    className={`w-[132px] h-10 rounded-[14px] text-[12px] font-medium transition-colors ${slot.isPast
                                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                      : slot.isBooked || slot.isBookedByRecurring
                                        ? 'bg-red-50 text-red-400 border border-red-200 cursor-not-allowed'
                                        : !slot.available
                                          ? 'bg-[#FFFCF3] text-dark-green opacity-50 border border-dark-green/10 cursor-not-allowed'
                                          : selectedTimeSlots.includes(slot.time)
                                            ? 'bg-[#8FB366] text-white'
                                            : 'bg-white text-dark-green border border-dark-green/10 hover:bg-gray-50'
                                      }`}
                                  >
                                    {slot.time}
                                  </button>
                                  {/* Cross button to deselect - hidden in reschedule mode (single slot auto-replaces) */}
                                  {selectedTimeSlots.includes(slot.time) && !isRescheduleMode && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeTimeSlot(slot.time);
                                      }}
                                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                                      title="Remove slot"
                                    >
                                      <X className="w-3 h-3 text-white" />
                                    </button>
                                  )}
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
                                    onClick={() => slot.available && toggleTimeSlot(slot.time)}
                                    disabled={!slot.available}
                                    className={`w-[132px] h-10 rounded-[14px] text-[12px] font-medium transition-colors ${slot.isPast
                                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                      : slot.isBooked || slot.isBookedByRecurring
                                        ? 'bg-red-50 text-red-400 border border-red-200 cursor-not-allowed'
                                        : !slot.available
                                          ? 'bg-[#FFFCF3] text-dark-green opacity-50 border border-dark-green/10 cursor-not-allowed'
                                          : selectedTimeSlots.includes(slot.time)
                                            ? 'bg-[#8FB366] text-white'
                                            : 'bg-white text-dark-green border border-dark-green/10 hover:bg-gray-50'
                                      }`}
                                  >
                                    {slot.time}
                                  </button>
                                  {/* Cross button to deselect - hidden in reschedule mode (single slot auto-replaces) */}
                                  {selectedTimeSlots.includes(slot.time) && !isRescheduleMode && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeTimeSlot(slot.time);
                                      }}
                                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                                      title="Remove slot"
                                    >
                                      <X className="w-3 h-3 text-white" />
                                    </button>
                                  )}
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
                                    onClick={() => slot.available && toggleTimeSlot(slot.time)}
                                    disabled={!slot.available}
                                    className={`w-[132px] h-10 rounded-[14px] text-[12px] font-medium transition-colors ${slot.isPast
                                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                      : slot.isBooked || slot.isBookedByRecurring
                                        ? 'bg-red-50 text-red-400 border border-red-200 cursor-not-allowed'
                                        : !slot.available
                                          ? 'bg-[#FFFCF3] text-dark-green opacity-50 border border-dark-green/10 cursor-not-allowed'
                                          : selectedTimeSlots.includes(slot.time)
                                            ? 'bg-[#8FB366] text-white'
                                            : 'bg-white text-dark-green border border-dark-green/10 hover:bg-gray-50'
                                      }`}
                                  >
                                    {slot.time}
                                  </button>
                                  {/* Cross button to deselect - hidden in reschedule mode (single slot auto-replaces) */}
                                  {selectedTimeSlots.includes(slot.time) && !isRescheduleMode && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeTimeSlot(slot.time);
                                      }}
                                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                                      title="Remove slot"
                                    >
                                      <X className="w-3 h-3 text-white" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Repeat Booking - Hidden for now */}

                {/* Show recurring info banner in reschedule mode */}
                {isRescheduleMode && rescheduleData?.recurring && rescheduleData.recurring.toLowerCase() !== 'none' && (
                  <div className="bg-[#f4ffef] border border-[#3a6b221a] rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#3a6b22] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#3a6b22] mb-1">Recurring Booking</h4>
                        <p className="text-sm text-[#3a6b22]">
                          This is a <span className="font-bold">{rescheduleData.recurring}</span> recurring booking.
                          The recurring interval cannot be changed during rescheduling.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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

                {selectedDate && hasAvailableSlots() && selectedTimeSlots.length === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">Select Time Slot{isRescheduleMode ? '' : '(s)'}</h4>
                        <p className="text-sm text-blue-700">
                          {isRescheduleMode
                            ? 'Please select an available time slot from the options above to reschedule your booking.'
                            : 'Please select one or more available time slots from the options above to continue with your booking.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDate && hasAvailableSlots() && selectedTimeSlots.length > 0 && !areSelectedSlotsValid() && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-1">Selected Slot(s) Unavailable</h4>
                        <p className="text-sm text-red-700">
                          One or more of your selected time slots are no longer available. Please update your selection or choose a different date.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected slots summary */}
                {selectedTimeSlots.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green mb-2">
                          {isRescheduleMode
                            ? 'New Time Slot Selected'
                            : `${selectedTimeSlots.length} Time Slot${selectedTimeSlots.length > 1 ? 's' : ''} Selected`}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTimeSlots.map((slot) => (
                            <span
                              key={slot}
                              className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-md text-sm text-green border border-green-200"
                            >
                              {slot}
                              {!isRescheduleMode && (
                                <button
                                  onClick={() => removeTimeSlot(slot)}
                                  className="ml-1 hover:bg-green-100 rounded-full p-0.5 transition-colors"
                                  title="Remove slot"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-green mt-2">
                          Total: £{((selectedDuration === '30min' ? (field.price30min || field.price || 0) : (field.price1hr || field.price || 0)) * parseInt(numberOfDogs || '1') * selectedTimeSlots.length).toFixed(2)}
                          {repeatBooking !== 'None' && ` per ${repeatBooking.toLowerCase() === 'everyday' ? 'day' : repeatBooking.toLowerCase() === 'weekly' ? 'week' : 'month'}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Continue Button */}
                <button
                  onClick={async () => {
                    // Check if user is logged in first (for non-reschedule mode)
                    if (!isRescheduleMode && !session) {
                      setShowLoginPrompt(true);
                      return;
                    }

                    // Validate time slot selection FIRST for both modes
                    if (selectedTimeSlots.length === 0) {
                      toast.error(isRescheduleMode ? 'Please select a time slot to reschedule' : 'Please select at least one time slot to continue');
                      return;
                    }

                    // Check if all selected time slots are actually available (local check)
                    if (!areSelectedSlotsValid()) {
                      toast.error('One or more selected time slots are not available. Please update your selection.');
                      return;
                    }

                    // Check if there are any available slots for the selected date
                    if (!hasAvailableSlots()) {
                      toast.error('No available time slots for the selected date. Please choose a different date.');
                      return;
                    }

                    // ============================================================
                    // REAL-TIME AVAILABILITY CHECK - Prevent race conditions
                    // Re-check with server to ensure slots weren't booked by another user
                    // ============================================================
                    if (selectedDate && selectedTimeSlots.length > 0 && fieldIdToUse) {
                      try {
                        setIsCheckingConflicts(true);
                        const formattedDateForCheck = format(selectedDate, 'yyyy-MM-dd');

                        // Check if selected slots are still available using dedicated API
                        const availabilityResponse = await axiosClient.post('/bookings/check-slots-availability', {
                          fieldId: fieldIdToUse,
                          date: formattedDateForCheck,
                          slots: selectedTimeSlots,
                          duration: selectedDuration
                        }, {
                          headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                          }
                        });

                        const { available, message, unavailableSlots } = availabilityResponse.data;

                        console.log('[book-field] Slot availability check:', { available, message, unavailableSlots });

                        if (!available) {
                          toast.error(message || 'Selected slots are no longer available. Please select different times.', { duration: 6000 });
                          setIsCheckingConflicts(false);
                          // Trigger a refetch of availability data
                          router.replace(router.asPath);
                          return;
                        }
                        console.log('[book-field] All selected slots are available, proceeding...');
                      } catch (error) {
                        console.error('Error checking real-time availability:', error);
                        // If the check fails, still allow proceeding - backend will catch conflicts
                      } finally {
                        setIsCheckingConflicts(false);
                      }
                    }
                    // ============================================================

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

                    // Check for recurring booking conflicts if a recurring option is selected
                    // Check conflicts for ALL selected time slots
                    if (repeatBooking && repeatBooking !== 'None' && selectedDate && selectedTimeSlots.length > 0) {
                      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

                      // Helper functions to calculate actual end time
                      const parseTimeToMinutesForConflict = (timeStr: string): number => {
                        const match = timeStr.match(/(\d+):(\d+)(AM|PM)/i);
                        if (!match) return 0;
                        let hours = parseInt(match[1]);
                        const minutes = parseInt(match[2]);
                        const period = match[3].toUpperCase();
                        if (period === 'PM' && hours !== 12) hours += 12;
                        if (period === 'AM' && hours === 12) hours = 0;
                        return hours * 60 + minutes;
                      };

                      const minutesToTimeStrForConflict = (totalMinutes: number): string => {
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        const period = hours >= 12 ? 'PM' : 'AM';
                        const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                        return `${displayHour}:${minutes.toString().padStart(2, '0')}${period}`;
                      };

                      const conflictDurationMinutes = selectedDuration === '30min' ? 30 : 60;

                      try {
                        setIsCheckingConflicts(true);

                        // Check conflicts for each selected slot
                        for (const slot of selectedTimeSlots) {
                          const [startTime, displayEndTime] = slot.split(' - ');
                          // Calculate actual end time for conflict check
                          const slotStartMinutes = parseTimeToMinutesForConflict(startTime.trim());
                          const actualEndMinutes = slotStartMinutes + conflictDurationMinutes;
                          const actualEndTime = minutesToTimeStrForConflict(actualEndMinutes);

                          const response = await axiosClient.get('/bookings/recurring-conflicts', {
                            params: {
                              fieldId: fieldIdToUse,
                              date: formattedDate,
                              startTime: startTime.trim(),
                              endTime: actualEndTime, // Use actual end time, not display time
                              interval: repeatBooking.toLowerCase()
                            },
                            headers: {
                              'Cache-Control': 'no-cache, no-store, must-revalidate',
                              'Pragma': 'no-cache',
                              'Expires': '0'
                            }
                          });

                          if (response.data?.hasConflict) {
                            // Show warning but allow proceeding - dates will be skipped automatically
                            toast.warning(
                              `${response.data.message}`,
                              {
                                duration: 10000,
                                icon: '⚠️'
                              }
                            );
                            // Store skipped dates to pass to payment page
                            if (response.data.skippedDates) {
                              setSkippedDates(response.data.skippedDates);
                            }
                            // Don't return - allow user to proceed with booking
                            // Conflicting dates will be automatically skipped
                          }
                        }
                      } catch (error: any) {
                        console.error('Error checking recurring conflicts:', error);
                        // If the API fails, still allow the user to proceed
                        // The backend payment controller will catch conflicts as a fallback
                      } finally {
                        setIsCheckingConflicts(false);
                      }
                    }

                    if (isRescheduleMode && rescheduleData) {
                      // Handle reschedule confirmation - only use first slot for reschedule
                      if (!selectedDate || selectedTimeSlots.length === 0) {
                        alert('Please select a date and time slot');
                        return;
                      }

                      // For reschedule, use the first selected slot
                      const [startTime, displayEndTime] = selectedTimeSlots[0].split(' - ');

                      // Calculate actual end time based on duration (not display time with 5-min buffer)
                      // Display time shows 25min or 55min, but actual slot is 30min or 60min
                      const parseTimeToMinutes = (timeStr: string): number => {
                        const match = timeStr.match(/(\d+):(\d+)(AM|PM)/i);
                        if (!match) return 0;
                        let hours = parseInt(match[1]);
                        const minutes = parseInt(match[2]);
                        const period = match[3].toUpperCase();
                        if (period === 'PM' && hours !== 12) hours += 12;
                        if (period === 'AM' && hours === 12) hours = 0;
                        return hours * 60 + minutes;
                      };

                      const minutesToTimeStr = (totalMinutes: number): string => {
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        const period = hours >= 12 ? 'PM' : 'AM';
                        const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                        return `${displayHour}:${minutes.toString().padStart(2, '0')}${period}`;
                      };

                      const actualDurationMinutes = selectedDuration === '30min' ? 30 : 60;
                      const startMinutes = parseTimeToMinutes(startTime);
                      const actualEndMinutes = startMinutes + actualDurationMinutes;
                      const endTime = minutesToTimeStr(actualEndMinutes);

                      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

                      // Note: We don't pass recurring here - recurring interval cannot be changed during reschedule
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
                      // Pass timeSlots as JSON string for multiple slots
                      // Use the correct price based on selected duration
                      const priceForDuration = selectedDuration === '30min'
                        ? (field.price30min || field.price || 0)
                        : (field.price1hr || field.price || 0);

                      router.push({
                        pathname: '/fields/payment',
                        query: {
                          field_id: fieldIdToUse,
                          numberOfDogs: numberOfDogs,
                          date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
                          timeSlots: JSON.stringify(selectedTimeSlots),
                          repeatBooking: repeatBooking,
                          price: priceForDuration,
                          duration: selectedDuration, // Pass the selected duration (30min or 60min)
                          ...(skippedDates.length > 0 && { skippedDates: JSON.stringify(skippedDates) }) // Pass skipped dates for recurring bookings
                        }
                      });
                    }
                  }}
                  disabled={selectedTimeSlots.length === 0 || !areSelectedSlotsValid() || !hasAvailableSlots() || rescheduleBookingMutation.isPending || isCheckingConflicts}
                  className={`w-full h-14 rounded-full font-bold text-[16px] transition-colors flex items-center justify-center gap-2 ${selectedTimeSlots.length === 0 || !areSelectedSlotsValid() || !hasAvailableSlots() || rescheduleBookingMutation.isPending || isCheckingConflicts
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#3A6B22] text-white hover:bg-[#2D5A1B]'
                    }`}>
                  {(isRescheduleMode && rescheduleBookingMutation.isPending) || isCheckingConflicts ? <Spinner size="sm" inline /> : null}
                  {isCheckingConflicts
                    ? 'Checking availability...'
                    : isRescheduleMode
                      ? (rescheduleBookingMutation.isPending ? 'Rescheduling...' : 'Confirm Reschedule')
                      : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Login Prompt Modal for unauthorized users */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message="Please login or sign up to book this field"
      />
    </>
  );
};

export default BookFieldPage;
