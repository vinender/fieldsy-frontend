import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useFieldActiveDiscount(fieldId: string | undefined) {
  return useQuery({
    queryKey: ['fieldDiscount', fieldId],
    queryFn: async () => {
      if (!fieldId) return null;
      const res = await fetch(`${API_URL}/discounts/${fieldId}/active-discounts`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        // Return the highest active discount
        return Math.max(...data.data.map((d: any) => d.value));
      }
      return null;
    },
    enabled: !!fieldId,
    staleTime: 5 * 60 * 1000,
  });
}

// Batch fetch for multiple fields
export function useFieldsDiscounts(fieldIds: string[]) {
  return useQuery({
    queryKey: ['fieldsDiscounts', fieldIds.sort().join(',')],
    queryFn: async () => {
      const results: Record<string, number> = {};
      // Fetch in parallel
      await Promise.all(fieldIds.map(async (id) => {
        try {
          const res = await fetch(`${API_URL}/discounts/${id}/active-discounts`);
          const data = await res.json();
          if (data.success && data.data?.length > 0) {
            results[id] = Math.max(...data.data.map((d: any) => d.value));
          }
        } catch { /* ignore */ }
      }));
      return results;
    },
    enabled: fieldIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export interface DiscountData {
  value: number;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  enabled: boolean;
}

// Fetch full discount details (for calendar badge generation)
export function useFieldActiveDiscountDetails(fieldId: string | undefined) {
  return useQuery({
    queryKey: ['fieldDiscountDetails', fieldId],
    queryFn: async () => {
      if (!fieldId) return null;
      const res = await fetch(`${API_URL}/discounts/${fieldId}/active-discounts`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        return data.data as DiscountData[];
      }
      return [] as DiscountData[];
    },
    enabled: !!fieldId,
    staleTime: 5 * 60 * 1000,
  });
}
