import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFCF3] py-8">
      <div className="container mx-auto px-4 lg:px-20">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 bg-white rounded-2xl p-6 h-fit">
            {/* Profile section */}
            <div className="text-center mb-6">
              <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-40 mx-auto" />
            </div>

            {/* Menu items */}
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-white rounded-2xl p-8">
            <Skeleton className="h-8 w-48 mb-6" />
            
            {/* Form fields */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <Skeleton className="h-12 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}