import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, Plus, Minus, Star, MapPin, Check } from 'lucide-react';
import mockData from '@/data/mock-data.json';

const PaymentPage = () => {
  const router = useRouter();
  const { field_id, numberOfDogs: dogsFromQuery, date, timeSlot, repeatBooking } = router.query;
  const [selectedCard, setSelectedCard] = useState(0);
  const [numberOfDogs, setNumberOfDogs] = useState(2);
  
  // Find the field from mock data
  const field = field_id ? mockData.fields.find(f => f.id === field_id) : mockData.fields[0];
  
  // Set number of dogs from query params
  useEffect(() => {
    if (dogsFromQuery) {
      setNumberOfDogs(parseInt(dogsFromQuery as string));
    }
  }, [dogsFromQuery]);
  
  if (!field) {
    return (
      <UserLayout requireRole="DOG_OWNER">
        <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3] flex items-center justify-center">
          <p className="text-xl text-dark-green">Field not found</p>
        </div>
      </UserLayout>
    );
  }
  
  const cards = [
    {
      id: 0,
      lastFour: '8456',
      cardHolder: 'DAVID WOOD',
      validThru: 'MM/YYYY',
      isDefault: true,
      color: 'bg-gradient-to-br from-gray-700 to-gray-900'
    },
    {
      id: 1,
      lastFour: '2546',
      cardHolder: 'DAVID WOOD',
      validThru: 'MM/YYYY',
      isDefault: false,
      color: 'bg-gradient-to-br from-gray-700 to-gray-900'
    }
  ];

  const handleIncrement = () => {
    setNumberOfDogs(prev => Math.min(prev + 1, 10));
  };

  const handleDecrement = () => {
    setNumberOfDogs(prev => Math.max(prev - 1, 1));
  };

  const pricePerDog = field.pricing?.perDogPerHour || field.price || 18;
  const subtotal = pricePerDog * numberOfDogs;
  const fieldsyFee = 2.50;
  const total = subtotal + fieldsyFee;

  return (
    <UserLayout requireRole="DOG_OWNER">
      <div className="min-h-screen bg-[#FFFCF3]">
      {/* Main Container */}
      <div className="container mx-auto mt-16 xl:mt-24 px-4 lg:px-20 py-8 lg:py-10">
        
        {/* Back Button and Title */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center hover:border-cream hover:border-2 justify-center w-12 h-12 bg-[#F8F1D7] rounded-full hover:bg-light transition-colors">
            <img src='/cream-back.svg' className="w-12 h-12 cursor-pointer text-[#192215]" />
          </button>
          <h1 className="text-2xl lg:text-[29px] font-semibold text-[#192215]">
            Payment
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-[408px,1fr] gap-8 lg:gap-10">
          
          {/* Left Column - Credit Cards */}
          <div className="bg-white rounded-[22px] p-6 lg:p-10 h-fit border border-black/6">
            <h2 className="text-[18px] font-bold text-[#192215] mb-4">
              Credit/Debit card
            </h2>

            <div className="space-y-4">
              {/* Credit Cards */}
              {cards.map((card, index) => (
                <div key={card.id} className="space-y-6">
                  {/* Card Visual */}
                  <div className="relative">
                    {/* Shadow Card Behind */}
                    <div className="absolute top-14 left-4 right-4 h-[120px] bg-[#D8D8D8] rounded-xl shadow-[0px_4px_24px_0px_rgba(0,0,0,0.2)]" />
                    
                    {/* Main Card */}
                    <div className={`relative h-44 rounded-xl p-4 ${card.color} overflow-hidden`}>
                      {/* Card Background Pattern */}
                      <div className="absolute inset-0 opacity-15">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'white\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\' /%3E%3C/svg%3E')] bg-repeat" />
                      </div>
                      
                      {/* Chip */}
                      <div className="absolute top-4 left-4 w-10 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-md">
                        <div className="w-full h-full border border-yellow-600/30 rounded-md"></div>
                      </div>
                      
                      {/* Card Logo */}
                      <div className="absolute top-4 right-4 flex">
                        <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                        <div className="w-8 h-8 bg-yellow-500 rounded-full -ml-3 opacity-80"></div>
                      </div>
                      
                      {/* Card Number */}
                      <div className="absolute top-1/2 -translate-y-4 left-4 right-4">
                        <p className="text-white text-[18px] font-bold tracking-[2px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.24)]">
                          XXXX  XXXX  XXXX  {card.lastFour}
                        </p>
                      </div>
                      
                      {/* Card Holder */}
                      <div className="absolute bottom-12 left-4">
                        <p className="text-white text-[14px] font-semibold uppercase drop-shadow-[0px_0px_1px_rgba(0,0,0,0.4)]">
                          {card.cardHolder}
                        </p>
                      </div>
                      
                      {/* Valid Thru */}
                      <div className="absolute bottom-4 left-4">
                        <p className="text-white text-[13px] font-medium drop-shadow-[0px_0px_1px_rgba(0,0,0,0.4)]">
                          Valid thru: {card.validThru}
                        </p>
                      </div>
                      
                      {/* CVV */}
                      <div className="absolute bottom-4 right-4">
                        <p className="text-white text-[15px] font-bold drop-shadow-[0px_0px_1px_rgba(0,0,0,0.4)]">
                          CVV
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Default Card Checkbox */}
                  <label className="flex items-center  gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={card.isDefault}
                      onChange={() => {}}
                      className="w-6 h-6 bg-white accent-green appearance-none border-2 border-gray-300 rounded checked:bg-green checked:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
                    />
                    <span className="text-[14px] font-medium text-[#192215]">
                      {card.isDefault ? 'Default card' : 'Make default'}
                    </span>
                  </label>
                </div>
              ))}

              {/* Add New Card Button */}
              <button className="flex items-center gap-2 text-[#3A6B22] font-bold text-[15px] hover:opacity-80 transition-opacity pt-4">
                <Plus className="w-6 h-6" />
                <span>Add New Card</span>
              </button>
            </div>
          </div>

          {/* Right Column - Booking Details & Payment Summary */}
          <div className="space-y-8">
            {/* Field Details Card */}
            <div className="bg-white rounded-[20px] p-4 border border-black/8">
              <div className="flex gap-5">
                {/* Field Image */}
                <div 
                  className="w-[216px] h-[145px] rounded-[10px] bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=400&h=300&fit=crop')`
                  }}
                />

                {/* Field Info */}
                <div className="flex-1 space-y-4">
                  {/* Title and Price */}
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <h3 className="text-[29px] font-semibold text-[#192215]">
                        {field.name || 'Green Meadows Field'}
                      </h3>
                      <div className="text-right">
                        <span className="text-[24px] font-bold text-[#3A6B22]">${pricePerDog}</span>
                        <span className="text-[16px] text-[#192215] opacity-70">/dog/hour</span>
                      </div>
                    </div>
                    
                    {/* Location and Rating */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <img src='/location.svg' className="w-5 h-5 text-[#3A6B22]" />
                        <span className="text-[16px] text-[#192215]">{field.location || 'Kent TN25, UK'} • {field.distance || '3km away'}</span>
                      </div>
                      <div className="bg-[#192215] px-1.5 py-1 rounded-md flex items-center gap-0.5">
                        <Star className="w-[18px] h-[18px]  fill-yellow" />
                        <span className="text-white text-[14px] font-semibold">{field.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>

                  {/* Number of Dogs and Time */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[18px] font-bold text-[#192215]">Number of dogs</span>
                      <div className="flex items-center gap-1.5 bg-white border border-[#8FB366]/40 rounded-[10px] p-2.5">
                        <button 
                          onClick={handleDecrement}
                          className="w-5 h-5 text-[#3A6B22] hover:opacity-70 transition-opacity"
                        >
                          <img src='/payment/minus.svg' className="w-5 h-5" />
                        </button>
                        <span className="text-[16px] font-semibold text-[#192215] w-6 text-center">
                          {numberOfDogs}
                        </span>
                        <button 
                          onClick={handleIncrement}
                          className="w-5 h-5 text-[#3A6B22] hover:opacity-70 transition-opacity"
                        >
                          <img src='/payment/plus.svg' className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[16px] text-[#192215]">
                      {date || 'Jul 02'} • {timeSlot || '8:00AM - 9:00AM'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <h3 className="text-[18px] font-bold text-[#192215] mb-2.5">Payment Summary</h3>
              <div className="bg-white rounded-[14px] p-4 border border-black/6">
                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between text-[16px]">
                    <span className="text-[#192215] opacity-70">Subtotal</span>
                    <span className="font-medium text-[#192215]">${subtotal.toFixed(0)}</span>
                  </div>
                  
                  {/* Fieldsy Fee */}
                  <div className="flex justify-between text-[16px]">
                    <span className="text-[#192215] opacity-70">Fieldsy Fee</span>
                    <span className="font-medium text-[#192215]">${fieldsyFee.toFixed(2)}</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-[#E2E2E2]" />
                  
                  {/* Total */}
                  <div className="flex justify-between font-bold">
                    <span className="text-[16px] text-[#192215]">Total</span>
                    <span className="text-[18px] text-[#3A6B22]">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pay Now Button */}
                <button 
                  onClick={() => {
                    // Here you would integrate with payment processing
                    alert(`Payment of $${total.toFixed(2)} for ${field.name} has been initiated`);
                    // After successful payment, redirect to confirmation or booking success page
                    // router.push('/fields/booking-success');
                  }}
                  className="w-64 h-14 bg-[#3A6B22] text-white rounded-full font-bold text-[16px] hover:bg-[#2D5A1B] transition-colors mt-6 mx-auto block">
                  Pay Now
                </button>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="text-[18px] leading-[28px]">
              <span className="font-semibold text-[#D21A00]">Cancellation & Refund Policy: </span>
              <span className="font-medium text-[#323232]">
                You can cancel or reschedule your booking up to 24 hours in advance for a full refund. 
                Cancellations made after 24 hours of the booking time may not be eligible for a refund. 
                Please check individual field listings for specific cancellation terms set by the field owner.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </UserLayout>
  );
};

export default PaymentPage;