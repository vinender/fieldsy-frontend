import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for the stats cards at the top of BookingHistory
export const StatsCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for the booking tabs section
export const BookingTabsSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Tab headers */}
      <div className="flex border-b border-gray-200">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-32 m-2" />
        ))}
      </div>
      
      {/* Tab content */}
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton for the sidebar in FieldOwnerDashboard
export const AddFieldSidebarSkeleton = () => {
  return (
    <div className="w-full lg:w-[432px] bg-white rounded-2xl p-4 sm:p-6 lg:p-8 h-fit">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-8" />
      
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="flex items-center justify-between p-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            {i < 4 && <Skeleton className="h-px w-full mt-2" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// Skeleton for form content in FieldOwnerDashboard
export const AddFieldFormSkeleton = () => {
  return (
    <div className="flex-1 bg-white rounded-2xl p-4 sm:p-6 lg:p-10">
      <Skeleton className="h-8 w-48 mb-6" />
      
      <div className="space-y-6">
        {/* Form fields */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        
        {/* Textarea */}
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-4 mt-10">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <Skeleton className="h-12 flex-1 rounded-full" />
      </div>
    </div>
  );
};

// Skeleton for the earnings dashboard
export const EarningsDashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
      
      {/* Transactions table */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b">
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Combined skeleton for the entire BookingHistory page
export const BookingHistoryPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-light py-4 sm:py-6 lg:py-8 mt-20 sm:mt-24 lg:mt-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        {/* Page header */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        {/* View toggle */}
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        
        {/* Stats cards */}
        <StatsCardsSkeleton />
        
        {/* Booking tabs */}
        <BookingTabsSkeleton />
      </div>
    </div>
  );
};

// Combined skeleton for FieldOwnerDashboard (Add Field)
export const FieldOwnerDashboardPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-light py-4 sm:py-6 lg:py-8 mt-20 sm:mt-24 lg:mt-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6 lg:mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          <AddFieldSidebarSkeleton />
          <AddFieldFormSkeleton />
        </div>
      </div>
    </div>
  );
};