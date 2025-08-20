import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function BookingCardSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-8" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-12" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-16" />
      </td>
    </tr>
  );
}

export function BookingHistorySkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFCF3] py-8">
      <div className="container mx-auto px-4 lg:px-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-lg" />
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}