import React from 'react';
import { MapPin, Code } from 'lucide-react';
import { PlacesAutocomplete } from '@/components/ui/places-autocomplete';
import Image from 'next/image';

export function HeroSection() {
  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/green-field.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 min-h-screen  flex flex-col">
        {/* Hero Text - positioned 123px from top */}
        <div className="px-4 sm:px-8 md:px-12 xl:px-20 pt-[150px] sm:pt-32 md:pt-40 xl:pt-[211px]">
          <div className="w-full max-w-[626px] text-left">
            <h1 className="text-5xl md:text-5xl xl:text-[68px] font-semibold sm:font-bold xl:font-[700] leading-tight sm:leading-tight md:leading-tight xl:leading-[76px] text-white mb-4 sm:mb-6">
              Find Safe, Private Dog
              Walking Fields <span className='text-cream'> Near You</span> 
            </h1>
            {/* <p className="text-xl text-white/90 w-full">
              Discover safe and private dog walking fields designed for peaceful, off-lead
              adventures. Easily find and book your ideal spot in just a few clicks.
            </p> */}
          </div>
        </div>

        {/* Spacer to push search card to bottom */}
        <div className="flex-grow"></div>

        {/* Search Container - positioned at bottom with 52px margin */}
        <div className="relative px-4 sm:px-8 md:px-12 xl:px-20 pb-6 sm:pb-8 md:pb-10 xl:pb-[52px]">
          {/* Dog Image - Positioned absolutely */}
          <div className="hidden xl:block absolute -top-[160px] xl:left-[40%] 2xl:left-[20%]  z-30  ">
            <img 
              src="/dog.png" 
              alt="Happy Golden Retriever"
              className="w-72 h-auto object-contain"
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.1))'
              }}
            />
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl xl:rounded-[38px] shadow-2xl relative z-20">
  <div className="grid grid-cols-1 xl:grid-cols-[65%_35%] rounded-[90px] gap-0">
    {/* Left Section - 65% */}
    <div className='p-6 sm:p-8 xl:pr-8 xl:border-r'>
      <h2 style={{ fontWeight: 600 }} className="text-xl sm:text-2xl xl:text-[32px] leading-tight sm:leading-snug xl:leading-[40px] text-gray-900 mb-3 sm:mb-4">
        Find Your Nearest Dog Field
      </h2>
      <p className="text-gray-600 font-normal xl:font-[400] text-sm sm:text-base xl:text-[18px] leading-relaxed sm:leading-relaxed xl:leading-[32px] mb-4 sm:mb-6">
        Use your location or enter a postcode to explore secure, private dog walking fields nearby.
      </p>
      {/* Search Form */}
      <div className="relative">
        <PlacesAutocomplete
          placeholder="Enter postcode or location"
          className="w-full pl-4 pr-4 sm:pr-40 py-3 sm:py-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-fieldsy-green focus:border-transparent"
          recentSearches={[
            { title: 'Sunny Paws Reserve', subtitle: 'South London · 4 km away' },
            { title: 'Whispering Pines', subtitle: 'Northfield · 6 km away' },
            { title: 'The Bark Yard', subtitle: 'East Kent · 2.5 km away' },
            { title: 'Green Meadows Field', subtitle: 'Kent TN25 · 3.1 km away' },
            { title: 'Doggie Dunes', subtitle: 'Coastal Downs · 7 km away' },
            { title: 'Muddy Tails Trail', subtitle: 'Riverbank · 5.5 km away' },
          ]}
        />
        {/* Buttons container inside input - hidden on mobile, shown on larger screens */}
        <div className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-2">
          {/* Use My Location button */}
          <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition">
            <MapPin className="w-4 h-4" />
            <span className="text-xs sm:text-sm whitespace-nowrap hidden md:inline">Use My Location</span>
          </button>
          {/* Divider */}
          <div className="h-6 w-px bg-gray-300"></div>
          {/* Search button */}
          <button className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-green text-white rounded-full hover:bg-light-green transition font-semibold text-sm sm:text-base">
            Search
          </button>
        </div>
      </div>
      {/* Mobile search button - shown only on mobile */}
      <div className="flex sm:hidden gap-2 mt-3">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">Use My Location</span>
        </button>
        <button className="flex-1 px-4 py-3 bg-green text-white rounded-full hover:bg-light-green transition font-semibold text-sm">
          Search
        </button>
      </div>
    </div>
    {/* Right Section - 35% */}
    <div className="flex w-full flex-col justify-center items-center text-center p-6 sm:p-8 border-t xl:border-t-0 xl:border-l">
      <h3 className="text-lg sm:text-xl xl:text-[24px] leading-snug xl:leading-[32px] font-semibold xl:font-[700] text-light-green mb-2 sm:mb-3">
        Also Available on Mobile
      </h3>
      <p className="text-gray-600 text-sm xl:text-[16px] text-center leading-relaxed xl:leading-[20px] font-normal xl:font-[400] mb-4 sm:mb-6 max-w-sm">
        Book safe dog fields on the go. Search, reserve, and check in all from your phone.
      </p>
      {/* App Store Buttons */}
      <div className="flex  gap-2 sm:gap-3 w-full max-w-sm">
        <Image alt='android' src='/android.png' className='w-32 sm:w-40 xl:w-48 object-contain mx-auto sm:mx-0' height={500} width={500} />
         
        <Image alt='ios' src='/ios.png' className='w-32 sm:w-40 xl:w-48 object-contain mx-auto sm:mx-0' height={500} width={500} />

      </div>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
};