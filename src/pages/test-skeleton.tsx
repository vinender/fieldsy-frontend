import { useState, useEffect } from 'react';
import { BookingCardSkeleton } from '@/components/skeletons/SkeletonComponents';

export default function TestSkeleton() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<string[]>([]);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(['Item 1', 'Item 2', 'Item 3']);
      setLoading(false);
    }, 3000);
  }, []);
  
  return (
    <div className="min-h-screen bg-light p-8">
      <h1 className="text-2xl font-bold mb-6">Skeleton Test Page</h1>
      
      <div className="bg-white rounded-xl p-6">
        {loading ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Showing skeleton loaders (not green spinner):</p>
            {[1, 2, 3].map((index) => (
              <BookingCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Data loaded:</p>
            {data.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}