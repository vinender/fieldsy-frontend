import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';


// Field Card Skeleton
export const FieldCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-10 w-28 rounded-lg" />
    </div>
  </div>
);

// Booking Card Skeleton
export const BookingCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
    <div className="flex justify-between">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <Skeleton className="h-6 w-3/4" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
  </div>
);


// Table Row Skeleton
export const TableRowSkeleton: React.FC = () => (
  <tr className="border-b">
    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
    <td className="p-4"><Skeleton className="h-4 w-28" /></td>
    <td className="p-4"><Skeleton className="h-8 w-20 rounded-md" /></td>
  </tr>
);


// Profile Skeleton
export const ProfileSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6 space-y-6">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
    <Skeleton className="h-10 w-32 rounded-md" />
  </div>
);



// List Skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);    



// Grid Skeleton
export const GridSkeleton: React.FC<{ columns?: number; items?: number }> = ({ 
  columns = 3, 
  items = 6 
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
    {Array.from({ length: items }).map((_, index) => (
      <FieldCardSkeleton key={index} />
    ))}
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
    <Skeleton className="h-10 w-32 rounded-md" />
  </div>
);


// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6 space-y-2">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
);


// Chat Message Skeleton
export const ChatMessageSkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-start space-x-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-64 rounded-lg" />
      </div>
    </div>
    <div className="flex items-start space-x-2 justify-end">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 ml-auto" />
        <Skeleton className="h-16 w-64 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);


// Review Skeleton
export const ReviewSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC = () => (
  <div className="space-y-4 mb-8">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-4 w-96" />
    <div className="flex gap-4">
      <Skeleton className="h-10 w-32 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  </div>
);
// 
// Loading Wrapper Component
export const LoadingWrapper: React.FC<{
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}> = ({ isLoading, skeleton, children }) => {
  return isLoading ? <>{skeleton}</> : <>{children}</>;
};
