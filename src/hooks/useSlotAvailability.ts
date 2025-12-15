import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface TimeSlot {
  time: string;
  fullEndTime?: string; // Full end time for booking creation
  startHour: number;
  startMinute?: number;
  displayDuration?: number; // 25 or 55 minutes
  actualDuration?: number; // 30 or 60 minutes
  isPast: boolean;
  isFullyBooked: boolean;
  availableSpots: number;
  maxSpots: number;
  bookedDogs: number;
  isAvailable: boolean;
  isBooked?: boolean;
  isBookedByRecurring?: boolean;
  recurringInterval?: string;
}

interface SlotAvailabilityResponse {
  success: boolean;
  data: {
    date: string;
    fieldId: string;
    fieldName: string;
    maxDogsPerSlot: number;
    slots: TimeSlot[];
    bookingDuration?: string; // '30min' or '60min' or '1hour'
    displayDuration?: number; // 25 or 55
    actualDuration?: number; // 30 or 60
    operatingHours: {
      opening: string;
      closing: string;
    };
    operatingDays: string[] | string;
  };
}

export type BookingDuration = '30min' | '60min' | '1hour';

export const useSlotAvailability = (
  fieldId: string | undefined,
  date: string | undefined,
  duration?: BookingDuration
) => {
  return useQuery<SlotAvailabilityResponse>({
    queryKey: ['slot-availability', fieldId, date, duration],
    queryFn: async () => {
      if (!fieldId || !date) {
        throw new Error('Field ID and date are required');
      }

      const params: { date: string; duration?: string } = { date };
      if (duration) {
        params.duration = duration;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/fields/${fieldId}/slot-availability`,
        { params }
      );

      return response.data;
    },
    enabled: !!fieldId && !!date,
    staleTime: 1000 * 60, // Cache for 1 minute
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchInterval: false, // Don't auto-refetch
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't always refetch when component mounts
  });
};
