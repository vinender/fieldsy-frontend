import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Star, Shield, BadgeCheck, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { useFieldReviews } from '@/hooks/useReviews';
import { format } from 'date-fns';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { AddReviewModal } from '@/components/modal/AddReviewModal';
import { useSession } from 'next-auth/react';
import FieldMapWrapper from '@/components/common/FieldMapWrapper';

interface FieldDetailsLegacyProps {
  field: any;
  isPreview?: boolean;
  headerContent?: React.ReactNode;
  showReviews?: boolean;
}

export default function FieldDetailsLegacy({ field, isPreview = false, headerContent, showReviews = true }: FieldDetailsLegacyProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(true);  // Expanded by default
  const [bookingOpen, setBookingOpen] = useState(false);  // Collapsed by default
  console.log('field', field)
  const isClaimed = field?.isActive || isPreview || false;

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

  const amenityIconPaths: Record<string, string> = {
    'Secure fencing': '/field-details/fence.svg',
    'Water Access': '/field-details/drop.svg',
    'Shelter': '/field-details/home.svg',
    'Waste Disposal': '/field-details/bin.svg',
  };

  const communityRules = [
    'Dogs must be leashed when entering and exiting the park',
    'Make sure the gate is safe and secure before bringing your dog in',
    'Never enter a park before your booking starts/after it finishes',
    'Leave less',
    'Pick up after your dogs! Leave the spot as it was when you arrived',
    'Always review and abide by spot specific rules',
    'Prices attendant should restrooms are not available on site',
  ];  

  return (
    <div className="min-h-screen bg-[#FFFCF3] mt-32 max-w-[1920px] mx-auto">
      {headerContent && (
        <div className="container mx-auto px-4 lg:px-20 pb-2">{headerContent}</div>
      )}

      <main className="container  mx-auto px-4 lg:px-20 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-stretch">
          <div className="w-full lg:w-[663px] lg:max-w-[663px] lg:flex-shrink-0">
            <div className="h-full flex flex-col space-y-4 lg:sticky lg:top-24">
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

              {isClaimed && (
                <FieldMapWrapper
                  address={field?.address || field?.streetAddress}
                  city={field?.city}
                  state={field?.state || field?.county}
                  zipCode={field?.zipCode || field?.postalCode}
                  country={field?.country}
                  fieldName={field?.name || field?.fieldName || 'Field Location'}
                  latitude={field?.latitude}
                  longitude={field?.longitude}
                  height="384px"
                  className="flex-grow"
                />
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6 lg:min-h-0">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                <div className="flex items-baseline flex-wrap gap-2">
                  <h1 className="text-2xl lg:text-3xl font-semibold text-dark-green">
                    {field?.name || field?.fieldName || 'Field'}
                  </h1>
                  <span className="text-xl lg:text-2xl text-dark-green">•</span>
                  <div className="flex items-baseline">
                    <span className="text-xl lg:text-2xl font-bold text-[#3A6B22]">£{field?.pricePerHour || 0}</span>
                    <span className="text-sm lg:text-base text-gray-500 ml-1">/hour</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className="mt-2 sm:mt-0 p-2 bg-white/20 backdrop-blur rounded-full border border-gray-200"
                >
                  <svg viewBox="0 0 24 24" className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.13 2.44C11.09 5 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center text-sm lg:text-base text-dark-green">
                  <img src='/location.svg' className="w-5 h-5 text-[#8FB366] mr-1" />
                  <span>{field?.city ? `${field.city}, ${field.state || field.county}` : 'Location not specified'} • {field?.distance || '0 miles'}</span>
                </div>
                <div className="flex items-center bg-dark-green text-white px-2 py-1 rounded-md">
                  <Star className="w-4 h-4 fill-[#FFDD57] text-[#FFDD57] mr-1" />
                  <span className="text-sm font-semibold">{field?.rating || 4.5}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(field?.amenities || []).map((amenity: string, index: number) => {
                const iconPath = amenityIconPaths[amenity];
                return (
                  <div key={index} className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
                    {iconPath ? (
                      <img src={iconPath} alt={amenity} className="w-4 h-4 mr-2" />
                    ) : (
                      <Shield className="w-4 h-4 text-[#3A6B22] mr-2" />
                    )}
                    <span className="text-sm text-dark-green">{amenity}</span>
                  </div>
                );
              })}
            </div>

            {isClaimed && (
              <div className="bg-[#F8F1D7] rounded-lg p-4">
                <h3 className="font-bold text-lg text-dark-green mb-3">Owner Information</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-[#090F1F] mr-1">{field?.ownerName || field?.owner?.name || 'Field Owner'}</span>
                        <BadgeCheck className="w-4 h-4 text-[#3A6B22]" />
                      </div>
                      <span className="text-xs text-gray-500">Joined on {field?.joinedOn || (field?.owner?.createdAt ? new Date(field.owner.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2025')}</span>
                    </div>
                  </div>
                  <button className="flex items-center bg-white border border-[#8FB366]/40 rounded-lg px-3 py-2">
                   <img src='/msg.svg' className="w-4 h-4 text-[#8FB366] mr-1" />
                    <span className="text-xs font-semibold text-dark-green">Send a Message</span>
                  </button>
                </div>
              </div>
            )}
            
            {!isClaimed && !isPreview && (
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

            <div>
              <h3 className="font-bold text-lg text-dark-green mb-2">Description</h3>
              <p className="text-dark-green leading-relaxed">
                {field?.description || "A peaceful, green field ideal for off-leash play and zoomies. Fully fenced, with drinking water, shaded rest spots, and safe access. Perfect for morning walks or weekend meetups."}
                {field?.description && field.description.length > 200 && (
                  <button className="text-[#3A6B22] font-bold underline ml-1">Show more</button>
                )}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-dark-green mb-3">Field Specifications</h3>
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                {specifications.map((row) => (
                  <div key={row.label} className="flex items-start justify-between text-sm">
                    <span className="text-gray-600">{row.label}</span>
                    <span className="font-medium text-dark-green text-right ml-4">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {!isClaimed && (
              <FieldMapWrapper
                address={field?.address || field?.streetAddress}
                city={field?.city}
                state={field?.state || field?.county}
                zipCode={field?.zipCode || field?.postalCode}
                country={field?.country}
                fieldName={field?.name || field?.fieldName || 'Field Location'}
                latitude={field?.latitude}
                longitude={field?.longitude}
                height="300px"
                className=""
              />
            )}

            {/* Other details and actions - Only show for claimed fields */}
            {isClaimed && (
              <div className="space-y-2">
                {/* Availability Row */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src="/field-details/availablity.svg" alt="availability" className="w-5 h-5" />
                    <span className="text-dark-green font-medium">Availability</span>
                  </div>
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
                    <div className="flex items-center gap-2">
                      <img src="/field-details/rules.svg" alt="rules" className="w-5 h-5" />
                      <span className="text-dark-green font-medium">Rules</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {rulesOpen && (
                    <div className="px-4 pb-4">
                      {/* Host rules cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F3F7ED] flex items-center justify-center">
                            <img src="/field-details/clock.svg" alt="clock" className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Minimum visit length</p>
                            <p className="text-sm font-medium text-dark-green">{field?.minBookingDuration || '30'} min</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F3F7ED] flex items-center justify-center">
                            <img src="/field-details/pet.svg" alt="pet" className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Max dogs per booking</p>
                            <p className="text-sm font-medium text-dark-green">{field?.maxDogs || 4} Dogs</p>
                          </div>
                        </div>
                      </div>

                      {/* Community safety rules list */}
                      <h4 className="font-semibold text-dark-green mb-2">
                        {field?.rules ? 'Field Rules' : 'Community safety rules'}
                      </h4>
                      <div className="space-y-3">
                        {(() => {
                          let rulesToDisplay: string[] = [];
                          
                          if (field?.rules) {
                            // If rules is an array
                            if (Array.isArray(field.rules)) {
                              // Check if array has a single string element that needs splitting
                              if (field.rules.length === 1 && typeof field.rules[0] === 'string' && field.rules[0].includes('.')) {
                                // Split the single string by periods
                                rulesToDisplay = field.rules[0]
                                  .split(/\.(?:\s+|$)/)  // Split by period followed by whitespace or end
                                  .filter((rule: string) => rule.trim().length > 0)
                                  .map((rule: string) => {
                                    // Clean up the rule text and ensure proper formatting
                                    let cleanRule = rule.trim();
                                    // Add period back if it doesn't end with punctuation
                                    if (!/[.!?]$/.test(cleanRule)) {
                                      cleanRule += '.';
                                    }
                                    return cleanRule;
                                  });
                              } else {
                                // Use array as is, but still check each element
                                rulesToDisplay = field.rules.flatMap((rule: any) => {
                                  if (typeof rule === 'string' && rule.includes('.')) {
                                    // If this array element contains multiple sentences, split it
                                    return rule
                                      .split(/\.(?:\s+|$)/)
                                      .filter((r: string) => r.trim().length > 0)
                                      .map((r: string) => {
                                        let cleanRule = r.trim();
                                        if (!/[.!?]$/.test(cleanRule)) {
                                          cleanRule += '.';
                                        }
                                        return cleanRule;
                                      });
                                  }
                                  return rule;
                                });
                              }
                            } 
                            // If rules is a string, split by periods
                            else if (typeof field.rules === 'string') {
                              rulesToDisplay = field.rules
                                .split(/\.(?:\s+|$)/)  // Split by period followed by whitespace or end
                                .filter((rule: string) => rule.trim().length > 0)
                                .map((rule: string) => {
                                  let cleanRule = rule.trim();
                                  // Add period back if it doesn't end with punctuation
                                  if (!/[.!?]$/.test(cleanRule)) {
                                    cleanRule += '.';
                                  }
                                  return cleanRule;
                                });
                            }
                          }
                          
                          // Use community rules as fallback if no field rules
                          if (rulesToDisplay.length === 0) {
                            rulesToDisplay = communityRules;
                          }
                          
                          return rulesToDisplay.map((rule: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <img src="/field-details/tick.svg" alt="tick" className="w-5 h-5 mt-0.5" />
                              <p className="text-sm text-dark-green leading-relaxed">{rule}</p>
                            </div>
                          ));
                        })()}
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
                    <div className="flex items-center gap-2">
                      <img src="/field-details/policy.svg" alt="policy" className="w-5 h-5" />
                      <span className="text-dark-green font-medium">Booking Policies</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${bookingOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {bookingOpen && (
                    <div className="px-4 pb-4 space-y-3">
                      {(() => {
                        let policiesToDisplay: string[] = [];
                        
                        // Parse cancellation policy if available
                        if (field?.cancellationPolicy) {
                          if (typeof field.cancellationPolicy === 'string') {
                            // Split by periods to get individual policies
                            const policies = field.cancellationPolicy
                              .split(/\.(?:\s+|$)/)
                              .filter((policy: string) => policy.trim().length > 0)
                              .map((policy: string) => {
                                let cleanPolicy = policy.trim();
                                if (!/[.!?]$/.test(cleanPolicy)) {
                                  cleanPolicy += '.';
                                }
                                return cleanPolicy;
                              });
                            policiesToDisplay.push(...policies);
                          }
                        }
                        
                        // Add instant booking policy if defined
                        if (field?.instantBooking !== undefined) {
                          policiesToDisplay.push(
                            field.instantBooking 
                              ? 'Instant booking is enabled. You will be instantly confirmed for any booking you request.'
                              : 'Booking requires host approval. You will receive confirmation once the host approves your request.'
                          );
                        }
                        
                        // Add buffer time policy
                        policiesToDisplay.push(
                          `Only one booking is allowed at a time with a ${field?.bufferTime || 30} min buffer between all bookings to ensure dogs in separate bookings do not meet.`
                        );
                        
                        // Add booking policies if field has them
                        if (field?.bookingPolicies) {
                          if (Array.isArray(field.bookingPolicies)) {
                            // Handle array of policies
                            field.bookingPolicies.forEach((policy: any) => {
                              if (typeof policy === 'string' && policy.includes('.')) {
                                // Split if contains multiple sentences
                                const splitPolicies = policy
                                  .split(/\.(?:\s+|$)/)
                                  .filter((p: string) => p.trim().length > 0)
                                  .map((p: string) => {
                                    let cleanPolicy = p.trim();
                                    if (!/[.!?]$/.test(cleanPolicy)) {
                                      cleanPolicy += '.';
                                    }
                                    return cleanPolicy;
                                  });
                                policiesToDisplay.push(...splitPolicies);
                              } else if (typeof policy === 'string') {
                                policiesToDisplay.push(policy);
                              }
                            });
                          } else if (typeof field.bookingPolicies === 'string') {
                            // Split string by periods
                            const policies = field.bookingPolicies
                              .split(/\.(?:\s+|$)/)
                              .filter((policy: string) => policy.trim().length > 0)
                              .map((policy: string) => {
                                let cleanPolicy = policy.trim();
                                if (!/[.!?]$/.test(cleanPolicy)) {
                                  cleanPolicy += '.';
                                }
                                return cleanPolicy;
                              });
                            policiesToDisplay.push(...policies);
                          }
                        }
                        
                        // Add default policies if no specific field data
                        if (policiesToDisplay.length <= 1) {
                          policiesToDisplay.push(
                            'Visits can be moved or cancelled up to 2 hours before a visit.',
                            'Visits can be extended and dogs can be added throughout the visit.'
                          );
                        }
                        
                        // Remove duplicates while preserving order
                        const uniquePolicies = [...new Set(policiesToDisplay)];
                        
                        return uniquePolicies.map((policy: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <img src="/field-details/tick.svg" alt="tick" className="w-5 h-5 mt-0.5" />
                            <p className="text-sm text-dark-green leading-relaxed">{policy}</p>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isClaimed && !isPreview && (
              <button 
                onClick={() => router.push(`/fields/book-field?id=${field?.id}`)}
                className="w-full bg-[#3A6B22] text-white font-semibold py-4 rounded-xl hover:bg-[#2e5519] transition"
              >
                Book Now
              </button>
            )}

        
          </div>
          
        </div>
        {/* keep this section here for now */}
        {showReviews && !isPreview && (
              <div className="mt-12 lg:mt-16">
                {/* Reviews & Ratings Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-dark-green">Reviews & Ratings</h2>
                </div>

                {/* Fetch dynamic reviews */}
                {(() => {
                  const { data: reviewsResp } = useFieldReviews(field?.id);
                  const reviewsData = reviewsResp?.data || { reviews: [], stats: { averageRating: 0, totalReviews: 0, ratingDistribution: {} } };
                  const reviews = reviewsData.reviews || [];
                  const stats = reviewsData.stats || { averageRating: 0, totalReviews: 0, ratingDistribution: {} };

                  return (
                    <>
                      {/* Summary row: only if there are reviews */}
                      {stats.totalReviews > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                          {/* Left: Reviews summary box (legacy style) */}
                          <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="text-dark-green font-semibold text-sm mb-4">Reviews</div>
                            <div className="flex gap-6">
                              {/* Average score */}
                              <div className="w-36 bg-black flex flex-col items-center justify-center rounded-xl p-4">
                                <div className="text-4xl font-bold text-white">{(stats.averageRating || 0).toFixed(1)}</div>
                                <div className="flex items-center mt-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 mr-1 ${i < Math.round(stats.averageRating || 0) ? 'fill-[#FFDD57] text-[#FFDD57]' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <div className="text-xs text-gray-200 mt-2">{stats.totalReviews} Reviews</div>
                              </div>
                              {/* Rating bars */}
                              <div className="flex-1">
                                {[5,4,3,2,1].map(stars => {
                                  const dist = (stats.ratingDistribution as Record<number, number>) || {} as Record<number, number>;
                                  const count = dist[stars] || 0;
                                  const percentage = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
                                  return (
                                    <div key={stars} className="flex items-center mb-2">
                                      <span className="text-sm text-gray-600 w-10">{stars} Star</span>
                                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3 overflow-hidden">
                                        <div className="bg-[#FFDD57] h-full rounded-full" style={{ width: `${percentage}%` }} />
                                      </div>
                                      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Right: Leave a review (legacy style) */}
                          <div className="bg-white border flex flex-col justify-between border-gray-200 rounded-2xl p-6">
                            <h3 className="text-dark-green font-semibold mb-4">Leave a Review</h3>
                            <span className="text-gray-600 text-sm max-w-md mb-4">Share your experience and help other dog owners choose the perfect field.</span>
                            <button 
                              onClick={() => {
                                if (!session) {
                                  router.push('/login');
                                } else {
                                  setShowReviewModal(true);
                                }
                              }}
                              className="px-5 py-2 border border-[#8FB366] flex justify-center items-center text-center rounded-full bg-white w-full text-green hover:text-white font-semibold hover:bg-[#2e5519] transition"
                            >
                              Write A Review
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Review Cards or only leave-review when none */}
                      {reviews.length > 0 ? (
                        <div className="space-y-6 bg-transparent">
                          {reviews.map((review: any, index: number) => (
                            <div key={review.id || index} className="bg-transparent rounded-xl p-6 border border-gray-200">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center w-full">
                                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 overflow-hidden">
                                    {review.user?.image ? (
                                      <img src={review.user.image} alt={review.user?.name || 'User'} className="w-full h-full object-cover" />
                                    ) : null}
                                  </div>
                                  <div className='flex justify-between w-full'>
                                    <h4 className="font-semibold text-[#090F1F]">{review.user?.name || 'User'}</h4>
                                    <div className="flex items-center mt-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-4 h-4 ${i < Math.floor(review.rating || 0) ? 'fill-[#FFDD57] text-[#FFDD57]' : 'text-gray-300'}`} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                              {review.createdAt && (
                                <div className="text-xs text-gray-500 mt-2">{format(new Date(review.createdAt), 'MMM d, yyyy')}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white border flex flex-col justify-between border-gray-200 rounded-2xl p-6">
                          <h3 className="text-dark-green font-semibold mb-4">Leave a Review</h3>
                          <span className="text-gray-600 text-sm max-w-md mb-4">Share your experience and help other dog owners choose the perfect field.</span>
                          <button 
                            onClick={() => {
                              if (!session) {
                                router.push('/login');
                              } else {
                                setShowReviewModal(true);
                              }
                            }}
                            className="px-5 py-2 border border-[#8FB366] flex justify-center items-center text-center rounded-full bg-white w-full text-green hover:text-white font-semibold hover:bg-[#2e5519] transition"
                          >
                            Write A Review
                          </button>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
      </main>

      {lightboxOpen && (
        <ImageLightbox images={fieldImages} open={lightboxOpen} initialIndex={currentImageIndex} onOpenChange={setLightboxOpen} />
      )}

      {/* Add Review Modal */}
      <AddReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        fieldId={field?.id || ''}
        fieldName={field?.name || 'Field'}
        onReviewAdded={() => {
          // Refresh reviews after adding
          window.location.reload();
        }}
      />
    </div>
  );
}


