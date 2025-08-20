import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function FieldOwnerDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-light py-8 mt-32">
      <div className="container mx-auto px-20">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-[432px] bg-white rounded-2xl p-8 h-fit">
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-48 mb-8" />
            
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between p-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                  {i < 3 && <Skeleton className="h-px w-full mt-2" />}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 bg-white rounded-2xl p-10">
            {/* Form title */}
            <Skeleton className="h-7 w-48 mb-6" />
            
            {/* Form fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>

              {/* Amenities section */}
              <div>
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-10">
              <Skeleton className="flex-1 h-12 rounded-full" />
              <Skeleton className="flex-1 h-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}