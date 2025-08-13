import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Star, Clock, Users, Trash2 } from 'lucide-react';

export default function SavedFieldsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedFields, setSavedFields] = useState<any[]>([]);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Mock data for saved fields
  useEffect(() => {
    setSavedFields([
      {
        id: 1,
        name: 'Sunny Meadow Field',
        location: 'Manchester, UK',
        distance: '3.2 km away',
        price: '£25/hour',
        rating: 4.9,
        reviews: 128,
        image: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=300&fit=crop',
        size: 'Large',
        maxDogs: 6,
        amenities: ['Water bowls', 'Agility equipment', 'Shade areas'],
        availability: 'Available today',
      },
      {
        id: 2,
        name: 'Riverside Dog Park',
        location: 'Liverpool, UK',
        distance: '5.8 km away',
        price: '£30/hour',
        rating: 4.7,
        reviews: 89,
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
        size: 'Medium',
        maxDogs: 4,
        amenities: ['Water bowls', 'Seating area', 'Secure fencing'],
        availability: 'Available tomorrow',
      },
      {
        id: 3,
        name: 'Green Valley Field',
        location: 'Leeds, UK',
        distance: '8.1 km away',
        price: '£20/hour',
        rating: 4.8,
        reviews: 156,
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
        size: 'Extra Large',
        maxDogs: 10,
        amenities: ['Water bowls', 'Agility equipment', 'Parking', 'Toilets'],
        availability: 'Available today',
      },
    ]);
  }, []);

  const handleRemoveSaved = (fieldId: number) => {
    setSavedFields(prev => prev.filter(field => field.id !== fieldId));
    // In production, make API call to remove from saved
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Fields</h1>
          <p className="text-gray-600 mt-2">Your favorite fields for quick booking</p>
        </div>

        {/* Saved Fields Grid */}
        {savedFields.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Saved Fields Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start exploring and save your favorite dog walking fields for quick access later.
            </p>
            <Link href="/fields/search">
              <button className="px-6 py-3 bg-green text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                Browse Fields
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedFields.map((field) => (
              <div key={field.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                {/* Field Image */}
                <div className="relative h-48">
                  <img 
                    src={field.image} 
                    alt={field.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveSaved(field.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    title="Remove from saved"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-gray-900">{field.availability}</span>
                  </div>
                </div>

                {/* Field Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                    <span className="text-lg font-bold text-green">{field.price}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{field.location}</span>
                    <span className="text-gray-400">•</span>
                    <span>{field.distance}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 ml-1">{field.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">({field.reviews} reviews)</span>
                  </div>

                  {/* Field Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Max {field.maxDogs} dogs</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span>{field.size}</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {field.amenities.slice(0, 2).map((amenity, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {amenity}
                      </span>
                    ))}
                    {field.amenities.length > 2 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        +{field.amenities.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/fields/${field.id}`} className="flex-1">
                      <button className="w-full py-2 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </Link>
                    <Link href={`/fields/book/${field.id}`} className="flex-1">
                      <button className="w-full py-2 bg-green text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {savedFields.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Load More Fields
            </button>
          </div>
        )}
      </div>
    </div>
  );
}