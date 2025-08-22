import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronDown, ChevronUp, Star, MapPin, Calendar, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { UserLayout } from '@/components/layout/UserLayout';
import { useFieldDetails } from '@/hooks';
import { FieldDetailsSkeleton } from '@/components/skeletons/FieldDetailsSkeleton';

const BookFieldPage = () => {
  const router = useRouter();
  const { id, field_id } = router.query;
  const fieldIdToUse = id ; // Support both query parameters
  console.log('id', router.query?.id)
  const [numberOfDogs, setNumberOfDogs] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('8:00AM - 9:00AM');
  const [repeatBooking, setRepeatBooking] = useState('None');
  const [expandedSection, setExpandedSection] = useState('morning');

  // Fetch field details using the hook
  const { data: fieldData, isLoading, error } = useFieldDetails(fieldIdToUse as string);
  const field = fieldData?.data || fieldData;

  // Calculate min date (today) and max date (e.g., 3 months from now)
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  
  if (isLoading) {
    return (
      <UserLayout requireRole="DOG_OWNER">
        <FieldDetailsSkeleton />
      </UserLayout>
    );
  }

  if (!field || error) {
    return (
      <UserLayout requireRole="DOG_OWNER">
        <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">Field Not Found</h3>
              <p className="text-gray-600">The field you are looking for does not exist.</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  const timeSlots = {
    morning: [
      { time: '6:00AM - 7:00AM', available: false },
      { time: '7:00AM - 8:00AM', available: true },
      { time: '8:00AM - 9:00AM', available: true, selected: true },
      { time: '9:00AM - 10:00AM', available: true },
      { time: '10:00AM - 11:00AM', available: true },
      { time: '11:00AM - 12:00PM', available: true }
    ],
    afternoon: [
      { time: '12:00PM - 1:00PM', available: true },
      { time: '1:00PM - 2:00PM', available: true },
      { time: '2:00PM - 3:00PM', available: false },
      { time: '3:00PM - 4:00PM', available: true },
      { time: '4:00PM - 5:00PM', available: true },
      { time: '5:00PM - 6:00PM', available: true }
    ],
    evening: [
      { time: '6:00PM - 7:00PM', available: true },
      { time: '7:00PM - 8:00PM', available: false },
      { time: '8:00PM - 9:00PM', available: false }
    ]
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const selectTimeSlot = (time) => {
    setSelectedTimeSlot(time);
  };

  return (
    <UserLayout requireRole="DOG_OWNER">
      <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3]">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        
        {/* Back Button and Title */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button 
            onClick={() => router.push(`/fields/${fieldIdToUse}`)}
            className="flex items-center hover:border-cream hover:border-2 justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#F8F1D7] rounded-full hover:bg-light transition-colors">
            <img src='/cream-back.svg' className="w-10 h-10 sm:w-12 sm:h-12 cursor-pointer text-dark-green" />
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-[29px] font-semibold text-dark-green">
            Book Field
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          
          {/* Left Column - Field Details Card */}
          <div className="bg-white rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 shadow-sm border border-black/5">
            {/* Field Image */}
            <div 
              className="w-full h-[200px] sm:h-[240px] md:h-[263px] rounded-[10px] bg-cover bg-center mb-4 sm:mb-5"
              style={{
                backgroundImage: `url('${field.images?.[0] || '/green-field.png'}')`
              }}
            />

            {/* Field Info */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <h2 className="text-xl sm:text-2xl lg:text-[29px] font-semibold text-dark-green">
                    {field.name}
                  </h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl lg:text-[24px] font-bold text-[#3A6B22]">${field.pricePerHour || field.price || 0}</span>
                    <span className="text-sm sm:text-[16px] text-dark-green/70">/hour</span>
                  </div>
                </div>
                
                {/* Location and Rating */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                  <div className="flex items-center gap-1">
                    <img src='/location.svg' className="w-4 h-4 sm:w-5 sm:h-5 text-[#3A6B22]" />
                    <span className="text-sm sm:text-[16px] text-dark-green truncate">
                      {field.city && field.postalCode ? `${field.city} ${field.postalCode}` : field.address || 'Location not specified'}
                    </span>
                  </div>
                  {field.averageRating && (
                    <div className="bg-dark-green px-1.5 py-1 rounded-md flex items-center gap-0.5">
                      <Star className="w-[18px] h-[18px] text-yellow-400 fill-yellow" />
                      <span className="text-white text-[14px] font-semibold">{field.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Information */}
              {field.owner && (
                <div>
                  <h3 className="text-[18px] font-bold text-dark-green mb-2.5">Owner Information</h3>
                  <div className="bg-[#F8F1D7] rounded-lg p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={field.owner.profileImage || "https://i.pravatar.cc/40?img=8"} 
                        alt={field.owner.name || 'Field Owner'} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[16px] font-medium text-[#090F1F]">
                            {field.owner.name || field.owner.email || 'Field Owner'}
                          </span>
                          {field.owner.isVerified && <Check className="w-4 h-4 text-[#3A6B22]" />}
                        </div>
                        <span className="text-[14px] text-[#545662]/70">
                          Joined {field.owner.createdAt ? new Date(field.owner.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                        </span>
                      </div>
                    </div>
                    <button className="bg-white border border-[#8FB366]/40 rounded-[10px] px-2.5 py-2.5 flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
                      <img src='/msg.svg' className="w-5 h-5" />
                      <span className="text-[12px] font-semibold text-dark-green">Send a Message</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="bg-white rounded-[20px] p-6 border border-dark-green/10">
            <h2 className="text-[24px] font-bold text-dark-green mb-6 leading-[31px]">
              Pick a date and available time slot to book this field for your dog's next adventure.
            </h2>

            <div className="space-y-8">
              {/* Number of Dogs */}
              <div>
                <label className="text-[18px] font-semibold text-dark-green block mb-2">
                  Number of Dogs
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={numberOfDogs}
                    onChange={(e) => setNumberOfDogs(e.target.value)}
                    placeholder="Enter number of dogs"
                    className="h-14 border-[#E3E3E3] focus:border-[#3A6B22] text-[15px]"
                  />
                  {/* <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" /> */}
                </div>
              </div>

              {/* Choose Date */}
              <div>
                <label className="text-[18px] font-semibold text-dark-green block mb-2">
                  Choose Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => setSelectedDate(date)}
                    minDate={minDate}
                    maxDate={maxDate}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select a date"
                    className="h-14 bg-white w-full border-[#E3E3E3] focus:border-[#3A6B22] text-[15px] font-medium cursor-pointer px-4 py-2 border rounded-[70px] focus:outline-none focus:ring-1 focus:ring-[#3A6B22]/20"
                    calendarClassName="fieldsy-calendar"
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                  />
                  <img src='/book-field/calendar.svg' className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#3A6B22] pointer-events-none" />
                </div>
              </div>

              {/* Preferred Time */}
              <div>
                <label className="text-[18px] font-semibold text-dark-green block mb-4">
                  Preffered Time
                </label>
                
                <div className="space-y-[11px]">
                  {/* Morning Section */}
                  <div className={`border rounded-[10px] overflow-hidden ${expandedSection === 'morning' ? 'border-dark-green/10 bg-[#FFFCF3]' : 'border-dark-green/10'}`}>
                    <button
                      onClick={() => toggleSection('morning')}
                      className="w-full p-4 flex justify-between items-center"
                    >
                      <span className="text-[16px] font-medium text-dark-green">Morning</span>
                      {expandedSection === 'morning' ? (
                        <ChevronUp className="w-5 h-5 text-dark-green" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-dark-green" />
                      )}
                    </button>
                    
                    {expandedSection === 'morning' && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-[9px]">
                        {timeSlots.morning.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => slot.available && selectTimeSlot(slot.time)}
                            disabled={!slot.available}
                            className={`w-[132px] h-10 rounded-[14px] text-[12px] font-medium transition-colors ${
                              !slot.available 
                                ? 'bg-[#FFFCF3] text-dark-green opacity-50 border border-dark-green/10 cursor-not-allowed'
                                : selectedTimeSlot === slot.time
                                ? 'bg-[#8FB366] text-white'
                                : 'bg-white text-dark-green border border-dark-green/10 hover:bg-gray-50'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Afternoon Section */}
                  <div className="border border-dark-green/10 rounded-[10px] overflow-hidden">
                    <button
                      onClick={() => toggleSection('afternoon')}
                      className="w-full p-4 flex justify-between items-center"
                    >
                      <span className="text-[16px] font-medium text-dark-green">Afternoon</span>
                      {expandedSection === 'afternoon' ? (
                        <ChevronUp className="w-5 h-5 text-dark-green" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-dark-green" />
                      )}
                    </button>
                    
                    {expandedSection === 'afternoon' && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-[9px]">
                        {timeSlots.afternoon.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => slot.available && selectTimeSlot(slot.time)}
                            disabled={!slot.available}
                            className={`w-[132px] h-10 rounded-[14px] text-[12px] font-medium transition-colors ${
                              !slot.available 
                                ? 'bg-[#FFFCF3] text-dark-green opacity-50 border border-dark-green/10 cursor-not-allowed'
                                : selectedTimeSlot === slot.time
                                ? 'bg-[#8FB366] text-white'
                                : 'bg-white text-dark-green border border-dark-green/10 hover:bg-gray-50'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Evening Section */}
                  <div className="border border-dark-green/10 rounded-[10px] overflow-hidden">
                    <button
                      onClick={() => toggleSection('evening')}
                      className="w-full p-4 flex justify-between items-center"
                    >
                      <span className="text-[16px] font-medium text-dark-green">Evening</span>
                      {expandedSection === 'evening' ? (
                        <ChevronUp className="w-5 h-5 text-dark-green" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-dark-green" />
                      )}
                    </button>
                    
                    {expandedSection === 'evening' && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-[9px]">
                        {timeSlots.evening.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => slot.available && selectTimeSlot(slot.time)}
                            disabled={!slot.available}
                            className={`w-[132px] h-10 rounded-[14px] text-[12px] font-medium transition-colors ${
                              !slot.available 
                                ? 'bg-[#FFFCF3] text-dark-green opacity-50 border border-dark-green/10 cursor-not-allowed'
                                : selectedTimeSlot === slot.time
                                ? 'bg-[#8FB366] text-white'
                                : 'bg-white text-dark-green border border-dark-green/10 hover:bg-gray-50'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Repeat Booking */}
              <div>
                <h3 className="text-base sm:text-[18px] font-bold text-dark-green mb-2.5">Repeat This Booking?</h3>
                <p className="text-sm sm:text-[16px] text-[#8D8D8D] mb-3 sm:mb-4">
                  Need regular access? Set up a weekly or monthly recurring booking.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {['None', 'Daily', 'Weekly', 'Monthly'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setRepeatBooking(option)}
                      className={`w-full py-2 px-3 sm:px-3.5 rounded-[10px] sm:rounded-[14px] text-xs sm:text-[14px] font-medium transition-colors ${
                        repeatBooking === option
                          ? 'bg-[#8FB366] text-white'
                          : 'bg-white text-[#8D8D8D] border border-black/6 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <button 
                onClick={() => {
                  if (!numberOfDogs) {
                    alert('Please enter the number of dogs');
                    return;
                  }
                  router.push({
                    pathname: '/fields/payment',
                    query: {
                      field_id: fieldIdToUse,
                      numberOfDogs: numberOfDogs,
                      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
                      timeSlot: selectedTimeSlot,
                      repeatBooking: repeatBooking,
                      price: field.pricePerHour || field.price || 0
                    }
                  });
                }}
                className="w-full h-14 bg-[#3A6B22] text-white rounded-full font-bold text-[16px] hover:bg-[#2D5A1B] transition-colors">
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </UserLayout>
  );
};

export default BookFieldPage;