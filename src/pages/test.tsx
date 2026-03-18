import React, { useState } from 'react';
import { Star, ChevronDown, ChevronRight, BadgeCheck } from 'lucide-react';

const fieldImages = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1504826260979-242151ee45b7?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=800&fit=crop',
];

const amenities = [
  { label: 'Dog Agility', icon: '/field-details/fence.svg' },
  { label: 'Fresh Water', icon: '/field-details/drop.svg' },
  { label: 'Pond/Swimming', icon: '/field-details/drop.svg' },
  { label: 'Woodland', icon: '/field-details/home.svg' },
];

const specifications = [
  { label: 'Field Size', value: '1.5 acres' },
  { label: 'Fence type & size', value: '6 ft steel mesh, fully enclosed' },
  { label: 'Terrain Type', value: 'Soft grass + walking path' },
  { label: 'Surface type', value: 'Flat with gentle slopes' },
  { label: 'Max Dogs', value: '4 dogs Allowed' },
  { label: 'Opening Hours', value: 'Monday to Friday (6:00 AM - 8:00 PM)' },
];

const communityRules = [
  'Dogs must be leashed when entering and exiting the spot.',
  'Make sure the area is safe and secure before bringing your dog in.',
  'Never enter a spot before your booking start time and never leave late.',
  'Pick up after your dogs. Leave the spot as it was when you arrived.',
  'Always review and abide by spot specific rules.',
  'Unless otherwise stated, restrooms are not available on site.',
];

export default function TestPage() {
  const [rulesOpen, setRulesOpen] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFCF3] mt-32 w-full">
      <div className="max-w-[1920px] mx-auto">
        <main className="px-4 lg:px-20 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-12 lg:items-start">
            {/* Left Column - Images & Map */}
            <div className="w-full lg:w-[45%] xl:w-[50%] 2xl:w-[45%] lg:flex-shrink-0">
              <div className="flex flex-col space-y-4 lg:sticky lg:top-24">
                {/* Image Grid */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  {fieldImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      className="aspect-square rounded-lg overflow-hidden group"
                    >
                      <img
                        src={img}
                        alt={`Field view ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="w-full h-[375px] rounded-2xl overflow-hidden bg-gray-200 relative">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop"
                    alt="Map"
                    className="w-full h-full object-cover"
                  />
                  {/* Map overlay controls */}
                  <div className="absolute right-4 bottom-4 flex flex-col gap-1">
                    <button className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center text-dark-green text-lg font-bold">
                      <img src="/location.svg" className="w-5 h-5" alt="location" />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center text-dark-green text-lg font-bold">+</button>
                    <button className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center text-dark-green text-lg font-bold">-</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="flex-1 space-y-6 lg:min-h-0 lg:min-w-0 overflow-hidden">
              {/* Title & Price */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                  <div className="flex items-baseline flex-wrap gap-2 min-w-0 flex-1">
                    <h1 className="text-2xl lg:text-[29px] font-semibold text-dark-green truncate max-w-full leading-[31px]">
                      Green Meadows Field
                    </h1>
                    <span className="text-xl lg:text-2xl text-dark-green">•</span>
                    <div className="flex items-baseline">
                      <span className="text-xl lg:text-2xl font-bold text-[#3A6B22]">$18</span>
                      <span className="text-base text-dark-green/70 ml-0.5">/dog/hour</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="mt-2 w-[33px] h-[32px] sm:mt-0 p-1.5 bg-white/10 backdrop-blur-[1.5px] rounded-full border border-gray-200/10 flex-shrink-0 flex items-center justify-center"
                  >
                    {isLiked ? (
                      <img src="/field-details/saved-heart.svg" alt="Saved" className="w-5 h-5" />
                    ) : (
                      <img src="/field-details/gray-heart.svg" alt="Save" className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Location & Rating */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center text-base text-dark-green">
                    <img src="/location.svg" className="w-5 h-5 mr-1" alt="location" />
                    <span>Kent TN25, UK • 3km away</span>
                  </div>
                  <div className="flex items-center bg-dark-green text-white px-2 py-1 rounded-md flex-shrink-0 w-fit">
                    <Star className="w-4 h-4 fill-[#FFDD57] text-[#FFDD57] mr-1" />
                    <span className="text-sm font-semibold">4.5</span>
                  </div>
                </div>
              </div>

              {/* Amenity Tags */}
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white border border-black/[0.06] rounded-[14px] px-3.5 py-2 gap-2"
                  >
                    <img src={amenity.icon} alt={amenity.label} className="w-5 h-5" />
                    <span className="text-sm font-medium text-dark-green">{amenity.label}</span>
                  </div>
                ))}
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="font-bold text-lg text-dark-green mb-2.5">Owner Information</h3>
                <div className="bg-cream rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                          alt="Alex Smith"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-[#090F1F] mr-1">Alex Smith</span>
                          <BadgeCheck className="w-4 h-4 text-[#3A6B22]" />
                        </div>
                        <span className="text-sm text-[#545662]/70 tracking-[-0.3px]">Joined on March 2025</span>
                      </div>
                    </div>
                    <button className="flex items-center bg-white border border-light-green/40 rounded-lg px-3 py-2.5 flex-shrink-0 w-full sm:w-auto justify-center hover:bg-light-green/10 transition-colors gap-1.5">
                      <img src="/msg.svg" className="w-5 h-5" alt="message" />
                      <span className="text-xs font-semibold text-dark-green">Send a Message</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-lg text-dark-green mb-2.5">Description</h3>
                <p className="text-base text-dark-green leading-[26px]">
                  A peaceful, green field ideal for off-leash play and zoomies. Fully fenced, with drinking water, shaded rest spots, and safe access. Perfect for morning walks or weekend meetups.{' '}
                  <button className="text-[#3A6B22] font-bold underline">Show more</button>
                </p>
              </div>

              {/* Field Specifications */}
              <div>
                <h3 className="font-bold text-lg text-dark-green mb-2.5">Field Specifications</h3>
                <div className="bg-white border border-black/[0.06] rounded-[14px] p-4 space-y-3">
                  {specifications.map((row) => (
                    <div key={row.label} className="flex items-start justify-between text-base gap-4">
                      <span className="text-dark-green/70">{row.label}</span>
                      <span className="font-medium text-dark-green text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Details */}
              <div>
                <h3 className="font-bold text-lg text-dark-green mb-2.5">Other details</h3>
                <div className="space-y-2.5">
                  {/* Availability Row */}
                  <div className="flex items-center justify-between bg-white border border-black/[0.08] rounded-2xl px-4 py-3 h-[52px]">
                    <div className="flex items-center gap-2.5">
                      <img src="/field-details/availablity.svg" alt="calendar" className="w-6 h-6" />
                      <span className="text-dark-green font-medium">Availability</span>
                    </div>
                    <span className="text-[#3A6B22] font-semibold text-sm">Find Availability Time</span>
                  </div>

                  {/* Rules Collapsible */}
                  <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 h-[52px]"
                      onClick={() => setRulesOpen(!rulesOpen)}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src="/field-details/rules.svg" alt="rules" className="w-6 h-6" />
                        <span className="text-dark-green font-medium">Rules</span>
                      </div>
                      <ChevronDown className={`w-6 h-6 text-dark-green transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {rulesOpen && (
                      <>
                        <div className="border-t border-black/[0.08]" />
                        <div className="px-4 pb-5 pt-4 space-y-6">
                          {/* Host rules */}
                          <div className="space-y-5">
                            <h4 className="font-bold text-dark-green text-2xl leading-5">Host rules</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-12 h-12 rounded-[10px] border border-[#efefef] flex items-center justify-center flex-shrink-0">
                                  <img src="/field-details/clock.svg" alt="clock" className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-bold text-dark-green text-base leading-5">Minimum visit length</p>
                                  <p className="text-sm text-dark-green mt-1">30 min</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <div className="w-12 h-12 rounded-[10px] border border-[#efefef] flex items-center justify-center flex-shrink-0">
                                  <img src="/field-details/pet.svg" alt="pet" className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-bold text-dark-green text-base leading-5">Max dogs per booking</p>
                                  <p className="text-sm text-dark-green mt-1">4 Dogs</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Community safety rules */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-dark-green text-2xl leading-5">Community safety rules</h4>
                            <div className="space-y-4">
                              {communityRules.map((rule, index) => (
                                <div key={index} className="flex items-start gap-2.5">
                                  <img src="/field-details/tick.svg" alt="tick" className="w-6 h-6 mt-0 flex-shrink-0" />
                                  <p className="text-base text-dark-green leading-6">{rule}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Booking Policies */}
                  <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 h-[52px]"
                      onClick={() => setBookingOpen(!bookingOpen)}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src="/field-details/policy.svg" alt="policy" className="w-6 h-6" />
                        <span className="text-dark-green font-medium">Booking Policies</span>
                      </div>
                      <ChevronRight className={`w-6 h-6 text-dark-green transition-transform ${bookingOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {bookingOpen && (
                      <>
                        <div className="border-t border-black/[0.08]" />
                        <div className="px-4 pb-4 pt-3 space-y-3">
                          <div className="flex items-start gap-2.5">
                            <img src="/field-details/tick.svg" alt="tick" className="w-6 h-6 mt-0 flex-shrink-0" />
                            <p className="text-base text-dark-green leading-6">Visits can be moved or cancelled up to 2 hours before a visit.</p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <img src="/field-details/tick.svg" alt="tick" className="w-6 h-6 mt-0 flex-shrink-0" />
                            <p className="text-base text-dark-green leading-6">Only one booking is allowed at a time with a 30 min buffer between all bookings.</p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <img src="/field-details/tick.svg" alt="tick" className="w-6 h-6 mt-0 flex-shrink-0" />
                            <p className="text-base text-dark-green leading-6">Visits can be extended and dogs can be added throughout the visit.</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Book Now Button */}
              <button className="w-full bg-[#3A6B22] text-white font-bold py-4 rounded-[70px] hover:bg-[#2e5519] transition text-base leading-6">
                Book Now
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
