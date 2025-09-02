import React, { useState } from 'react';
import { MapPin, Star, Shield, Heart, ChevronDown, BadgeCheck, CheckCircle } from 'lucide-react';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/router';
import { getAmenityLabel } from '@/utils/formatters';

interface FieldDetailsDisplayProps {
  field: any;
  isPreview?: boolean;
  showReviews?: boolean;
  showOwnerInfo?: boolean;
  showClaimField?: boolean;
  headerContent?: React.ReactNode;
}

export default function FieldDetailsDisplay({ 
  field, 
  isPreview = false,
  showReviews = true,
  showOwnerInfo = true,
  showClaimField = true,
  headerContent
}: FieldDetailsDisplayProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(true);

  const isClaimed = !isPreview && (field?.isActive || false);

  const specifications: { label: string; value: string }[] = [
    { label: 'Field Size', value: field?.size || 'Not specified' },
    { label: 'Fence type & size', value: field?.fenceType || '6 ft steel mesh, fully enclosed' },
    { label: 'Terrain Type', value: field?.type || 'Soft grass + walking path' },
    { label: 'Surface type', value: field?.surfaceType || 'Flat with gentle slopes' },
    { label: 'Max Dogs', value: field?.maxDogs ? `${field.maxDogs} dogs allowed` : '4 dogs allowed' },
    { label: 'Opening Hours', value: field?.openingTime && field?.closingTime ? `${field.openingTime} - ${field.closingTime}` : 'Monday to Friday (6:00 AM – 8:00 PM)' },
  ];

  const fieldImages = field?.images && field.images.length > 0 ? field.images : [ 
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504826260979-242151ee45b7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'
  ];

  const mapImage = '/field-details/map.svg';

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
    <div className="min-h-screen bg-[#FFFCF3] pt-8 max-w-[1920px] mx-auto">
      {/* Optional Header Content (for Edit/Submit buttons in preview) */}
      {headerContent && (
        <div className="container mx-auto px-4 lg:px-20 pb-4">
          {headerContent}
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-20 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-stretch">
          {/* Left Column - Images */}
          <div className="w-full lg:w-[663px] lg:max-w-[663px] lg:flex-shrink-0">
            <div className="h-full flex flex-col space-y-4 lg:sticky lg:top-24">
              {/* Image Grid */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {fieldImages.slice(0, 6).map((img: string, index: number) => (
                  <button
                    key={index}
                    type="button"
                    className="aspect-square rounded-lg overflow-hidden group"
                    onClick={() => { setCurrentImageIndex(index); setLightboxOpen(true); }}
                    aria-label={`Open image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Field view ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>

              {/* Map - Show in left column only for claimed fields or preview */}
              {(isClaimed || isPreview) && (
                <div className="relative h-64 lg:h-96 rounded-xl overflow-hidden flex-grow">
                  {isPreview ? (
                    <div className="bg-gray-100 h-full flex items-center justify-center">
                      <p className="text-gray-500">Map will be displayed here</p>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="flex-1 space-y-6 lg:min-h-0">
            {/* Title and Price */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                <div className="flex items-baseline flex-wrap gap-2">
                  <h1 className="text-2xl lg:text-3xl font-semibold text-dark-green">
                    {field?.name || field?.fieldName || 'Field'}
                  </h1>
                  <span className="text-xl lg:text-2xl text-dark-green">•</span>
                  <div className="flex items-baseline">
                    <span className="text-xl lg:text-2xl font-bold text-[#3A6B22]">${field?.pricePerHour || 0}</span>
                    <span className="text-sm lg:text-base text-gray-500 ml-1">/hour</span>
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
                <div className="flex items-center text-sm lg:text-base text-dark-green">
                  <img src='/location.svg' className="w-5 h-5 text-[#8FB366] mr-1" />
                  <span>{field?.city ? `${field.city}, ${field.state || field.county}` : 'Location not specified'} • {field?.distance || '0 miles'}</span>
                </div>
                <div className="flex items-center bg-dark-green text-white px-2 py-1 rounded-md">
                  <Star className="w-4 h-4 fill-yellow text-yellow mr-1" />
                  <span className="text-sm font-semibold">{field?.rating || 4.5}</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {(field?.amenities || []).map((amenity: string, index: number) => {
                const formattedAmenity = getAmenityLabel(amenity);
                const iconPath = amenityIconPaths[formattedAmenity] || amenityIconPaths[amenity];
                return (
                  <div key={index} className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
                    {iconPath ? (
                      <img src={iconPath} alt={formattedAmenity} className="w-4 h-4 mr-2" />
                    ) : (
                      <Shield className="w-4 h-4 text-[#3A6B22] mr-2" />
                    )}
                    <span className="text-sm text-dark-green">{formattedAmenity}</span>
                  </div>
                );
              })}
            </div>

            {/* Owner Information - Only show for claimed fields and if enabled */}
            {isClaimed && showOwnerInfo && !isPreview && (
              <div className="bg-[#F8F1D7] rounded-lg p-4">
                <h3 className="font-bold text-lg text-dark-green mb-3">Owner Information</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-[#090F1F] mr-1">{field?.owner?.name || 'Field Owner'}</span>
                        <BadgeCheck className="w-4 h-4 text-[#3A6B22]" />
                      </div>
                      <span className="text-xs text-gray-500">Joined on {field?.owner?.createdAt ? new Date(field.owner.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2025'}</span>
                    </div>
                  </div>
                  <button className="flex items-center bg-white border border-[#8FB366]/40 rounded-lg px-3 py-2">
                   <img src='/msg.svg' className="w-4 h-4 text-[#8FB366] mr-1" />
                    <span className="text-xs font-semibold text-dark-green">Send a Message</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Claim Field CTA - Only show for unclaimed fields and if enabled */}
            {!isClaimed && showClaimField && !isPreview && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push(`/fields/claim-field-form?field_id=${field?.id}`)}
                  className="flex-1 w-full bg-[#3A6B22] text-white font-semibold py-4 rounded-xl hover:bg-[#2e5519] transition"
                >
                  Claim This Field
                </button>
                <Dialog>
                  <DialogTrigger asChild>
                    <button aria-label="What does claim mean" className="w-12 h-12 rounded-full border border-[#8FB366] text-green bg-white flex items-center justify-center">
                      <img src="/field-details/info.svg" alt="Info" className="w-5 h-5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl rounded-2xl p-8 bg-white">
                    <DialogTitle className="text-2xl md:text-3xl font-bold text-dark-green mb-2">What Does "Claim This Field" Mean?</DialogTitle>
                    <p className="text-dark-green/80 mb-6">If you're the rightful owner or manager of a field already listed on Fieldsy, "Claim This Field" allows you to take control of the listing. Once claimed and verified, you'll be able to:</p>
                    <div className="space-y-4">
                      {["Edit field details and photos","Manage bookings and messages","Track earnings from your dashboard","Set availability and pricing"].map((text)=> (
                        <div key={text} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green mt-0.5" />
                          <span className="text-dark-green text-base">{text}</span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-bold text-lg text-dark-green mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {field?.description || 'Welcome to our secure dog field, the perfect space for your furry friend to run, play, and explore freely! Our fully enclosed field offers a safe environment where dogs can enjoy off-leash time without any worries.'}
              </p>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="font-bold text-lg text-dark-green mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {specifications.map((spec, index) => (
                  <div key={index} className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                    <p className="text-sm font-medium text-[#090F1F]">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible Rules */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setRulesOpen(!rulesOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition"
              >
                <h3 className="font-bold text-lg text-dark-green">Community Rules</h3>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
              </button>
              {rulesOpen && (
                <div className="px-4 pb-4 bg-white">
                  {isPreview && field?.rules ? (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{field.rules}</p>
                  ) : (
                    <ul className="space-y-2">
                      {communityRules.map((rule, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <span className="mr-2">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Collapsible Booking Policies */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setBookingOpen(!bookingOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition"
              >
                <h3 className="font-bold text-lg text-dark-green">Booking & Cancellation</h3>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${bookingOpen ? 'rotate-180' : ''}`} />
              </button>
              {bookingOpen && (
                <div className="px-4 pb-4 bg-white">
                  {isPreview && field?.policies ? (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{field.policies}</p>
                  ) : (
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>• Free cancellation up to 24 hours before your booking</p>
                      <p>• 50% refund for cancellations made 12-24 hours in advance</p>
                      <p>• No refund for cancellations made less than 12 hours before booking</p>
                      <p>• Weather-related cancellations may be rescheduled at no extra cost</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Book Now Button */}
            {isPreview ? (
              <button 
                disabled
                className="w-full bg-gray-300 text-white font-semibold py-4 rounded-xl cursor-not-allowed"
              >
                Book Now (Preview Mode)
              </button>
            ) : (
              <button 
                onClick={() => router.push(`/fields/${field?.id}/book`)}
                className="w-full bg-[#3A6B22] text-white font-semibold py-4 rounded-xl hover:bg-[#2e5519] transition"
              >
                Book Now
              </button>
            )}

            {/* Reviews Section - Only show if enabled */}
            {showReviews && !isPreview && (
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-lg text-dark-green">Reviews</h3>
                {reviews.map((review, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-[#090F1F]">{review.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(review.rating) ? 'fill-yellow text-yellow' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={fieldImages}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}
    </div>
  );
}