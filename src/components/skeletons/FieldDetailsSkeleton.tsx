import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function FieldDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFCF3] mt-32 max-w-[1920px] mx-auto">
      <div className="container mx-auto px-4 lg:px-20 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left side - Images and Map */}
          <div className="w-full lg:w-[663px] lg:max-w-[663px] space-y-4">
            {/* Image grid */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
            
            {/* Map skeleton */}
            <Skeleton className="h-64 lg:h-96 rounded-xl" />
          </div>

          {/* Right side - Details */}
          <div className="flex-1 space-y-6">
            {/* Title and price */}
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
              
              {/* Location and rating */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-28 rounded-xl" />
              ))}
            </div>

            {/* Owner info */}
            <div className="bg-[#F8F1D7] rounded-lg p-4">
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>

            {/* Description */}
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Specifications */}
            <div>
              <Skeleton className="h-6 w-40 mb-3" />
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action sections */}
            <div className="space-y-2">
              {/* Availability */}
              <Skeleton className="h-14 w-full rounded-xl" />
              
              {/* Rules */}
              <Skeleton className="h-14 w-full rounded-xl" />
              
              {/* Booking Policies */}
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>

            {/* Book Now button */}
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>

        {/* Reviews section */}
        <div className="mt-12 lg:mt-16">
          <Skeleton className="h-8 w-40 mb-6" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Reviews summary */}
            <Skeleton className="h-48 rounded-2xl" />
            
            {/* Leave a review */}
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}