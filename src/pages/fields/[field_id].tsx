import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MapPin, Star, Shield, Heart, MessageSquare, ChevronLeft, ChevronRight, ArrowLeft, BadgeCheck, ChevronDown, PawPrint, Clock, RotateCcw } from 'lucide-react';
import mockData from '@/data/mock-data.json';
import Link from 'next/link';

const FieldDetailsScreen = () => {
  const router = useRouter();
  const { field_id } = router.query;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Find the field from mock data - default to first field if not found
  const field = mockData.fields.find(f => f.id === field_id) || mockData.fields[0];
  const spec = (field as any).specifications || {};
  const specifications: { label: string; value: string }[] = [
    { label: 'Field Size', value: spec.fieldSize || '1.5 acres' },
    { label: 'Fence type & size', value: spec.fenceType || '6 ft steel mesh, fully enclosed' },
    { label: 'Terrain Type', value: spec.terrainType || spec.surfaceType || 'Soft grass + walking path' },
    { label: 'Surface type', value: spec.surfaceType2 || 'Flat with gentle slopes' },
    { label: 'Max Dogs', value: spec.maxDogs || '4 dogs Allowed' },
    { label: 'Opening Hours', value: spec.openingHours || spec.bookingType || 'Monday to Friday (6:00 AM – 8:00 PM)' },
  ];

  const fieldImages = field.images || [
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504826260979-242151ee45b7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'
  ];

  const mapImage = '/field-details/map.svg';

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? fieldImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === fieldImages.length - 1 ? 0 : prev + 1));
  };

  const amenityIconPaths: Record<string, string> = {
    'Secure fencing': '/field-details/fence.svg',
    'Water Access': '/field-details/drop.svg',
    'Shelter': '/field-details/home.svg',
    'Waste Disposal': '/field-details/bin.svg',
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
        {/* <div className="container mx-auto bg-transparent px-4 lg:px-20 py-4">
          <Link href="/fields" className="inline-flex items-center text-gray-600 hover:text-[#3A6B22] transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Search</span>
          </Link>
        </div> */}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-20 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-stretch">
          {/* Left Column - Images */}
          <div className="w-full lg:w-[663px] lg:max-w-[663px] lg:flex-shrink-0">
            <div className="h-full flex flex-col space-y-4 lg:sticky lg:top-24">
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
              <div className="relative h-64 lg:h-96 rounded-xl overflow-hidden flex-grow">
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
          </div>

          {/* Right Column - Details */}
          <div className="flex-1 space-y-6 lg:min-h-0">
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
                const iconPath = amenityIconPaths[amenity];
                return (
                  <div key={index} className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
                    {iconPath ? (
                      <img src={iconPath} alt={amenity} className="w-4 h-4 mr-2" />
                    ) : (
                      <Shield className="w-4 h-4 text-[#3A6B22] mr-2" />
                    )}
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
                      <BadgeCheck className="w-4 h-4 text-[#3A6B22]" />
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
                {specifications.map((row) => (
                  <div key={row.label} className="flex items-start justify-between text-sm">
                    <span className="text-gray-600">{row.label}</span>
                    <span className="font-medium text-[#192215] text-right ml-4">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Other details and actions */}
            <div className="space-y-2">
              {/* Availability Row */}
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-[#192215] font-medium">Availability</span>
                <button className="inline-flex items-center text-[#3A6B22] font-medium">
                  <span className="mr-2">Find Availability Time</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Rules Collapsible */}
              <div className="bg-white border border-gray-200 rounded-xl">
                <button
                  className="w-full flex items-center justify-between px-4 py-3"
                  onClick={() => setRulesOpen(!rulesOpen)}
                >
                  <span className="text-[#192215] font-medium">Rules</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
                </button>

                {rulesOpen && (
                  <div className="px-4 pb-4">
                    {/* Host rules cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F3F7ED] flex items-center justify-center">
                          <Clock className="w-5 h-5 text-[#3A6B22]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Minimum visit length</p>
                          <p className="text-sm font-medium text-[#192215]">30 min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F3F7ED] flex items-center justify-center">
                          <PawPrint className="w-5 h-5 text-[#3A6B22]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Max dogs per booking</p>
                          <p className="text-sm font-medium text-[#192215]">4 Dogs</p>
                        </div>
                      </div>
                    </div>

                    {/* Community safety rules list */}
                    <h4 className="font-semibold text-[#192215] mb-2">Community safety rules</h4>
                    <div className="space-y-3">
                      {communityRules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <img src="/field-details/tick.svg" alt="tick" className="w-5 h-5 mt-0.5" />
                          <p className="text-sm text-[#192215] leading-relaxed">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Policies (Collapsible) */}
              <div className="bg-white border border-gray-200 rounded-xl">
                <button
                  className="w-full flex items-center justify-between px-4 py-3"
                  onClick={() => setBookingOpen(!bookingOpen)}
                >
                  <span className="text-[#192215] font-medium">Booking Policies</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${bookingOpen ? 'rotate-180' : ''}`} />
                </button>
                {bookingOpen && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <img src="/field-details/tick.svg" alt="tick" className="w-5 h-5 mt-0.5" />
                      <p className="text-sm text-[#192215] leading-relaxed">
                        Only one booking is allowed at a time at any sniff spot and there is an enforced 30 min buffer between all bookings to ensure dogs in separate bookings do not meet.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <img src="/field-details/tick.svg" alt="tick" className="w-5 h-5 mt-0.5" />
                      <p className="text-sm text-[#192215] leading-relaxed">
                        This sniff spot is set for Booking, which means you will be instantly confirmed for any booking you request. You will receive the address and access instruction immediately following booking.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <img src="/field-details/tick.svg" alt="tick" className="w-5 h-5 mt-0.5" />
                      <p className="text-sm text-[#192215] leading-relaxed">
                        Visits can be moved or cancelled up to 2 hours before a visit.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <img src="/field-details/tick.svg" alt="tick" className="w-5 h-5 mt-0.5" />
                      <p className="text-sm text-[#192215] leading-relaxed">
                        Visits can be extended and dogs can be added throughout the visit.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Book Now Button */}
            <button className="w-full bg-[#3A6B22] text-white font-semibold py-4 rounded-xl hover:bg-[#2e5519] transition">
              Book Now
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 lg:mt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#192215]">Reviews & Ratings ({field.reviewCount || 273} Reviews)</h2>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left: Reviews summary box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="text-[#192215] font-semibold text-sm mb-4">Reviews</div>
              <div className="flex gap-6">
                {/* Average score */}
                <div className="w-36 bg-black flex flex-col items-center justify-center rounded-xl  p-4">
                  <div className="text-4xl font-bold text-white">{field.rating}</div>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 mr-1 ${i < Math.round(field.rating) ? 'fill-[#FFDD57] text-[#FFDD57]' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="text-xs text-gray-200 mt-2">{field.reviewCount || 273} Reviews</div>
                </div>
                {/* Rating bars */}
                <div className="flex-1">
                  {[
                    { stars: 5, percentage: 90 },
                    { stars: 4, percentage: 75 },
                    { stars: 3, percentage: 45 },
                    { stars: 2, percentage: 20 },
                    { stars: 1, percentage: 10 },
                  ].map((rating) => (
                    <div key={rating.stars} className="flex items-center mb-2">
                      <span className="text-sm text-gray-600 w-10">{rating.stars} Star</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3 overflow-hidden">
                        <div className="bg-[#FFDD57] h-full rounded-full" style={{ width: `${rating.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Leave a review */}
            <div className="bg-white border flex flex-col justify-between  border-gray-200 rounded-2xl p-6">
              <h3 className="text-[#192215] font-semibold mb-4">Leave a Review</h3>
                 <span className="text-gray-600 text-sm max-w-md mb-4">
                  Share your experience and help other dog owners choose the perfect field.
                  </span>
                 
                <button className="px-5 py-2 border border-[#8FB366] flex justify-center items-center text-center rounded-full bg-white w-full text-green hover:text-white font-semibold hover:bg-[#2e5519] transition">
                  Write A Review
                </button>
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-6 bg-transparent">
            {reviews.map((review, index) => (
              <div key={index} className="bg-transparent rounded-xl p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center w-full">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                    <div className='flex justify-between w-full'>
                      <h4 className="font-semibold text-[#090F1F]">{review.name}</h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(review.rating) ? 'fill-[#FFDD57] text-[#FFDD57]' : 'text-gray-300'}`} 
                          />
                        ))}
                        {/* <span className="text-xs text-gray-500 ml-2">{review.date}</span> */}
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