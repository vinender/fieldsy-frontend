import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronDown, ChevronUp, Star, MapPin, Calendar, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import mockData from '@/data/mock-data.json';
import { UserLayout } from '@/components/layout/UserLayout';

const BookFieldPage = () => {
  const router = useRouter();
  const { field_id } = router.query;
  const [numberOfDogs, setNumberOfDogs] = useState('');
  const [selectedDate, setSelectedDate] = useState('July 02');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('8:00AM - 9:00AM');
  const [repeatBooking, setRepeatBooking] = useState('Weekly');
  const [expandedSection, setExpandedSection] = useState('morning');

  // Find the field from mock data
  const field = field_id ? mockData.fields.find(f => f.id === field_id) : mockData.fields[0];
  
  if (!field) {
    return (
      <UserLayout requireRole="DOG_OWNER">
        <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3] flex items-center justify-center">
          <p className="text-xl text-dark-green">Field not found</p>
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
      <div className="container mx-auto px-4 lg:px-20 py-8 lg:py-10">
        
        {/* Back Button and Title */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push(`/fields/${field_id}`)}
            className="flex items-center hover:border-cream hover:border-2 justify-center w-12 h-12 bg-[#F8F1D7] rounded-full hover:bg-light transition-colors">
            <img src='/cream-back.svg' className="w-12 h-12 cursor-pointer text-dark-green" />
          </button>
          <h1 className="text-2xl lg:text-[29px] font-semibold text-dark-green">
            Book Field
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Left Column - Field Details Card */}
          <div className="bg-white rounded-[20px] p-4 shadow-sm border border-black/5">
            {/* Field Image */}
            <div 
              className="w-full h-[263px] rounded-[10px] bg-cover bg-center mb-5"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=800&h=400&fit=crop')`
              }}
            />

            {/* Field Info */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-start">
                  <h2 className="text-[29px] font-semibold text-dark-green">
                    {field.name || 'Green Meadows Field'}
                  </h2>
                  <div className="text-right">
                    <span className="text-[24px] font-bold text-[#3A6B22]">${field.pricePerDog || 18}</span>
                    <span className="text-[16px] text-dark-green/70">/dog/hour</span>
                  </div>
                </div>
                
                {/* Location and Rating */}
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-1">
                    <img src='/location.svg' className="w-5 h-5 text-[#3A6B22]" />
                    <span className="text-[16px] text-dark-green">{field.location || 'Kent TN25, UK'} • {field.distance || '3km away'}</span>
                  </div>
                  <div className="bg-dark-green px-1.5 py-1 rounded-md flex items-center gap-0.5">
                    <Star className="w-[18px] h-[18px] text-yellow-400 fill-yellow" />
                    <span className="text-white text-[14px] font-semibold">{field.rating || 4.5}</span>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="text-[18px] font-bold text-dark-green mb-2.5">Owner Information</h3>
                <div className="bg-[#F8F1D7] rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src="https://i.pravatar.cc/40?img=8" 
                      alt="Alex Smith" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-[16px] font-medium text-[#090F1F]">{field.owner || 'Alex Smith'}</span>
                        <Check className="w-4 h-4 text-[#3A6B22]" />
                      </div>
                      <span className="text-[14px] text-[#545662]/70">Joined on {field.ownerJoined || 'March 2025'}</span>
                    </div>
                  </div>
                  <button className="bg-white border border-[#8FB366]/40 rounded-[10px] px-2.5 py-2.5 flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
                    <img src='/msg.svg' className="w-5 h-5" />
                    <span className="text-[12px] font-semibold text-dark-green">Send a Message</span>
                  </button>
                </div>
              </div>
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
                  <Input
                    type="date"
                    value={selectedDate}
                    readOnly
                    className="h-14 border-[#E3E3E3] focus:border-[#3A6B22] text-[15px] font-medium cursor-pointer"
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
                      <div className="px-4 pb-4 flex flex-wrap gap-[9px]">
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
                      <div className="px-4 pb-4 flex flex-wrap gap-[9px]">
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
                      <div className="px-4 pb-4 flex flex-wrap gap-[9px]">
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
                <h3 className="text-[18px] font-bold text-dark-green mb-2.5">Repeat This Booking?</h3>
                <p className="text-[16px] text-[#8D8D8D] mb-4">
                  Need regular access? Set up a weekly or monthly recurring booking.
                </p>
                <div className="flex gap-4">
                  {['None', 'Daily', 'Weekly', 'Monthly'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setRepeatBooking(option)}
                      className={`w-[120px] py-2 px-3.5 rounded-[14px] text-[14px] font-medium transition-colors ${
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
                      field_id: field_id,
                      numberOfDogs: numberOfDogs,
                      date: selectedDate,
                      timeSlot: selectedTimeSlot,
                      repeatBooking: repeatBooking
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