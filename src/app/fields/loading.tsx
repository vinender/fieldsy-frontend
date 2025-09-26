import { GridSkeleton } from '@/components/skeletons/SkeletonComponents';

export default function FieldsLoading() {
  return (
    <div className="min-h-screen bg-[#FFFCF3] w-full">
      <div className="px-4 sm:px-6 lg:px-20 py-6 lg:py-10">
        <div className="animate-pulse space-y-6">
          {/* Search bar skeleton */}
          <div className="h-14 bg-gray-200 rounded-full" />
          
          {/* Filters skeleton */}
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
          </div>
          
          {/* Grid skeleton */}
          <GridSkeleton columns={3} items={9} />
        </div>
      </div>
    </div>
  );
}