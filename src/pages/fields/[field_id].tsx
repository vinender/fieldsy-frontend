import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MapPin, Star, Shield, Droplets, Home, Trash2, Heart, MessageSquare, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import mockData from '@/data/mock-data.json';
import Link from 'next/link';

const FieldDetailsScreen = () => {
  const router = useRouter();
  const { field_id } = router.query;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Find the field from mock data - default to first field if not found
  const field = mockData.fields.find(f => f.id === field_id) || mockData.fields[0];

  const fieldImages = field.images || [
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504826260979-242151ee45b7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'
  ];

  const mapImage = 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+FF4A4A(-0.118092,51.509865)/-0.118092,51.509865,14,0/600x375@2x?access_token=pk.eyJ1IjoiZGVtb21hcCIsImEiOiJjbGJzaXJ5cXYwMDZrM3ZvYW14dXpxNjZnIn0.placeholder';

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? fieldImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === fieldImages.length - 1 ? 0 : prev + 1));
  };

  const amenityIcons: Record<string, any> = {
    'Secure fencing': Shield,
    'Water Access': Droplets,
    'Shelter': Home,
    'Waste Disposal': Trash2
  };

  const reviews = [
    {
      name: "Amelia Joseph",
      rating: 4.5,
      date: "273 Reviews",
      text: "Absolutely love this secure! The entire booking process was quick and easy, and the field itself was spotless, fully secure, and ideal for my reactive dog who needs space away from other pets. It gave us both peace of mind and a truly enjoyable time."
    },
    {
      name: "Natalia Pérez",
      rating: 4.5,
      date: "Last month",
      text: "So convenient and easy to use! I found a secure field just 5 minutes from home, and it made all the difference. My two dogs had plenty of space to run off-lead without distractions, and I could relax knowing they were safe. Highly rated fields like these out of our daily walks!"
    },
    {
      name: "Carlos Sánchez",
      rating: 4.5,
      date: "2 weeks ago",
      text: "Booking through Fieldsy was incredibly simple and hassle-free. Within minutes, I found a fully fenced field nearby and secured a time slot that fit my schedule. The space was clean, private, and completely secure, giving my pup the freedom to run, explore, and play safely off-lead."
    }
  ];

  const communityRules = [
    "Dogs must be leashed when entering and exiting the park",
    "Make sure the gate is safe and secure before bringing your dog in",
    "Never enter a park before your booking starts/after it finishes",
    "Leave less",
    "Pick up after your dogs! Leave the spot as it was when you arrived",
    "Always review and abide by spot specific rules",
    "Prices attendant should restrooms are not available on site"
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF3] mt-32 max-w-[1920px] mx-auto">
      {/* Back Button */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto bg-transparent px-4 lg:px-20 py-4">
          <Link href="/fields" className="inline-flex items-center text-gray-600 hover:text-[#3A6B22] transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Search</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-20 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {fieldImages.slice(0, 6).map((img, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={img} 
                    alt={`Field view ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="relative h-64 lg:h-96 rounded-xl overflow-hidden">
              <img 
                src={mapImage} 
                alt="Field location map" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-white rounded-lg p-2 shadow-lg">
                <button className="flex items-center space-x-2 p-2">
                  <div className="w-5 h-5 bg-[#395ADC] rounded-full"></div>
                  <span className="text-sm">Zoom</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                <div className="flex items-baseline flex-wrap gap-2">
                  <h1 className="text-2xl lg:text-3xl font-semibold text-[#192215]">
                    {field.name}
                  </h1>
                  <span className="text-xl lg:text-2xl text-[#192215]">•</span>
                  <div className="flex items-baseline">
                    <span className="text-xl lg:text-2xl font-bold text-[#3A6B22]">${field.price}</span>
                    <span className="text-sm lg:text-base text-gray-500 ml-1">/{field.priceUnit}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className="mt-2 sm:mt-0 p-2 bg-white/20 backdrop-blur rounded-full border border-gray-200"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Location and Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center text-sm lg:text-base text-[#192215]">
                  <MapPin className="w-5 h-5 text-[#8FB366] mr-1" />
                  <span>{field.fullLocation || field.location} • {field.distance}</span>
                </div>
                <div className="flex items-center bg-[#192215] text-white px-2 py-1 rounded-md">
                  <Star className="w-4 h-4 fill-[#FFDD57] text-[#FFDD57] mr-1" />
                  <span className="text-sm font-semibold">{field.rating}</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {field.amenities.map((amenity, index) => {
                const Icon = amenityIcons[amenity] || Shield;
                return (
                  <div key={index} className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
                    <Icon className="w-4 h-4 text-[#3A6B22] mr-2" />
                    <span className="text-sm text-[#192215]">{amenity}</span>
                  </div>
                );
              })}
            </div>

            {/* Owner Information */}
            <div className="bg-[#F8F1D7] rounded-lg p-4">
              <h3 className="font-bold text-lg text-[#192215] mb-3">Owner Information</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-[#090F1F] mr-1">{field.owner}</span>
                      <Shield className="w-4 h-4 text-[#3A6B22]" />
                    </div>
                    <span className="text-xs text-gray-500">Joined on {field.ownerJoined || 'March 2025'}</span>
                  </div>
                </div>
                <button className="flex items-center bg-white border border-[#8FB366]/40 rounded-lg px-3 py-2">
                  <MessageSquare className="w-4 h-4 text-[#8FB366] mr-1" />
                  <span className="text-xs font-semibold text-[#192215]">Send a Message</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold text-lg text-[#192215] mb-2">Description</h3>
              <p className="text-[#192215] leading-relaxed">
                {field.description || "A peaceful, green field ideal for off-leash play and zoomies. Fully fenced, with drinking water, shaded rest spots, and safe access. Perfect for morning walks or weekend meetups."}
                <button className="text-[#3A6B22] font-bold underline ml-1">Show more</button>
              </p>
            </div>

            {/* Field Specifications */}
            <div>
              <h3 className="font-bold text-lg text-[#192215] mb-3">Field Specifications</h3>
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                {field.specifications && Object.entries(field.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium text-[#192215]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Details */}
            <div>
              <h3 className="font-bold text-lg text-[#192215] mb-3">Other details</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
                  <p className="text-sm text-gray-600">Availability</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
                  <p className="text-sm text-gray-600">30 min</p>
                </div>
              </div>
            </div>

            {/* Host Rules */}
            <div>
              <h3 className="font-bold text-lg text-[#192215] mb-3">Host rules</h3>
              <div className="space-y-2">
                {(field.hostRules || ["Minimum visit length: 30 min", "Max dogs per booking: 3 dogs"]).map((rule, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#3A6B22] rounded-full mt-2 mr-3"></div>
                    <p className="text-sm text-[#192215]">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Safety Rules */}
            <div>
              <h3 className="font-bold text-lg text-[#192215] mb-3">Community safety rules</h3>
              <div className="space-y-2">
                {communityRules.map((rule, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#3A6B22] rounded-full mt-2 mr-3"></div>
                    <p className="text-sm text-[#192215]">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Policies */}
            <div>
              <h3 className="font-bold text-lg text-[#192215] mb-3">Booking Policies</h3>
              <button className="flex items-center text-[#3A6B22] font-medium">
                <ChevronRight className="w-5 h-5 mr-1" />
                <span>View policies</span>
              </button>
            </div>

            {/* Book Now Button */}
            <button className="w-full bg-[#3A6B22] text-white font-semibold py-4 rounded-xl hover:bg-[#2e5519] transition">
              Book Now
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 lg:mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#192215]">Reviews & Ratings ({field.reviewCount || 273} Reviews)</h2>
            </div>
            <div className="flex items-center bg-[#192215] text-white px-3 py-1.5 rounded-lg">
              <Star className="w-5 h-5 fill-[#FFDD57] text-[#FFDD57] mr-1" />
              <span className="font-bold">{field.rating}</span>
              <span className="text-xs ml-1">{field.reviewCount || 273} Reviews</span>
            </div>
          </div>

          {/* Rating Bars */}
          <div className="mb-8">
            {[
              { stars: 5, percentage: 70 },
              { stars: 4, percentage: 85 },
              { stars: 3, percentage: 45 },
              { stars: 2, percentage: 20 },
              { stars: 1, percentage: 10 }
            ].map((rating) => (
              <div key={rating.stars} className="flex items-center mb-2">
                <span className="text-sm text-gray-600 w-8">{rating.stars}</span>
                <Star className="w-4 h-4 fill-[#FFDD57] text-[#FFDD57] mr-2" />
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#FFDD57] h-full rounded-full"
                    style={{ width: `${rating.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Review Cards */}
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <h4 className="font-semibold text-[#090F1F]">{review.name}</h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(review.rating) ? 'fill-[#FFDD57] text-[#FFDD57]' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-2">{review.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="text-[#3A6B22] font-medium hover:underline">
              Load More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FieldDetailsScreen;