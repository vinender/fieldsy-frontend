import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface TimeSlot {
  time: string;
  startHour: number;
  isPast: boolean;
  isFullyBooked: boolean;
  availableSpots: number;
  maxSpots: number;
  bookedDogs: number;
  isAvailable: boolean;
}

interface SlotAvailabilityResponse {
  success: boolean;
  data: {
    date: string;
    fieldId: string;
    fieldName: string;
    maxDogsPerSlot: number;
    slots: TimeSlot[];
    operatingHours: {
      opening: string;
      closing: string;
    };
    operatingDays: string[] | string;
  };
}

export const useSlotAvailability = (fieldId: string | undefined, date: string | undefined) => {
  return useQuery<SlotAvailabilityResponse>({
    queryKey: ['slot-availability', fieldId, date],
    queryFn: async () => {
      if (!fieldId || !date) {
        throw new Error('Field ID and date are required');
      }
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/fields/${fieldId}/slot-availability`,
        {
          params: { date }
        }
      );
      
      return response.data;
    },
    enabled: !!fieldId && !!date,
    staleTime: 1000 * 30, // Cache for 30 seconds only
    refetchInterval: 1000 * 30, // Refetch every 30 seconds to get updated availability
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
  });
};