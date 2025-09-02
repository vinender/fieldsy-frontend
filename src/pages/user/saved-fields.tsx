import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { UserLayout } from '@/components/layout/UserLayout';
import { FieldCard } from '@/components/fields/FieldCard';
import { useSavedFields } from '@/hooks/useFavorites';
import { FieldGridSkeleton } from '@/components/skeletons/FieldCardSkeleton';

export default function SavedFieldsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [likedFields, setLikedFields] = useState<string[]>([]);
  
  // Fetch saved fields
  const { data: savedFieldsData, isLoading, error } = useSavedFields(page, 12);
  
  const savedFields = savedFieldsData?.fields || [];
  const pagination = savedFieldsData?.pagination;
  
  // Initialize liked fields when data loads
  useEffect(() => {
    if (savedFields.length > 0) {
      setLikedFields(savedFields.map(field => field.id));
    }
  }, [savedFields]);
  
  const handleLike = (fieldId: string) => {
    // The FieldCard component will handle the actual API call
    // This is just for optimistic UI update
    setLikedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };
  
  const handleViewDetails = (fieldId: string) => {
    router.push(`/fields/${fieldId}`);
  };
  
  const handleBookNow = (fieldId: string) => {
    router.push(`/fields/book-field?id=${fieldId}`);
  };
  
  const handleLoadMore = () => {
    if (pagination && page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <UserLayout requireRole="DOG_OWNER">
      <div className="min-h-screen bg-[#FFFCF3] pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#192215]">Saved Fields</h1>
            <p className="text-gray-600 mt-2">Your favorite fields for quick booking</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <FieldGridSkeleton count={12} />
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Saved Fields</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We couldn't load your saved fields. Please try again later.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#3A6B22] text-white rounded-full font-medium hover:bg-[#2e5519] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && savedFields.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Saved Fields Yet</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start exploring and save your favorite dog walking fields for quick access later.
              </p>
              <Link href="/fields">
                <button className="px-6 py-3 bg-[#3A6B22] text-white rounded-full font-medium hover:bg-[#2e5519] transition-colors">
                  Browse Fields
                </button>
              </Link>
            </div>
          )}

          {/* Saved Fields Grid */}
          {!isLoading && !error && savedFields.length > 0 && (
            <>
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,400px))] gap-4 md:gap-6 justify-center">
                  {savedFields.map((field) => (
                    <FieldCard 
                    key={field.id}
                    id={field.id}
                    name={field.name || 'Unnamed Field'}
                    price={field.pricePerHour || 0}
                    priceUnit="hour"
                    location={field.city ? `${field.city}, ${field.state || ''}` : 'Location'}
                    rating={field.averageRating || 4.5}
                    amenities={field.amenities || []}
                    image={field.images?.[0] || 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=300&fit=crop'}
                    owner={field.owner?.name || 'Field Owner'}
                    variant="expanded"
                    isLiked={likedFields.includes(field.id)}
                    onLike={handleLike}
                    onViewDetails={handleViewDetails}
                    onBookNow={handleBookNow}
                    // Pass location data for distance calculation
                    fieldLocation={field.location}
                    latitude={field.latitude}
                    longitude={field.longitude}
                  />
                  ))}
                </div>
              </div>

              {/* Load More */}
              {pagination && page < pagination.totalPages && (
                <div className="text-center mt-8">
                  <button 
                    onClick={handleLoadMore}
                    className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Load More Fields
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
}