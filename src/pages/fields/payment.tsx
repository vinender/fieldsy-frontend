import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BackButton from '@/components/common/BackButton';
import { Plus, Star, MapPin, Trash2 } from 'lucide-react';
import { UserLayout } from '@/components/layout/UserLayout';
import { useFieldDetails } from '@/hooks';
import { FieldDetailsSkeleton } from '@/components/skeletons/FieldDetailsSkeleton';
import dynamic from 'next/dynamic';
import AddCardModal from '@/components/payment/AddCardModal';
import { usePaymentMethods, useSetDefaultPaymentMethod, useDeletePaymentMethod } from '@/hooks/queries/usePaymentMethodQueries';
import { toast } from 'sonner';
import { useSlotAvailability } from '@/hooks/useSlotAvailability';

// Dynamically import Stripe component to avoid SSR issues
const StripeCheckout = dynamic(
  () => import('@/components/payment/StripeCheckout'),
  { ssr: false }
);

const PaymentPage = () => {
  const router = useRouter();
  const { field_id, numberOfDogs: dogsFromQuery, date, timeSlot, repeatBooking, price: priceFromQuery } = router.query;
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [numberOfDogs, setNumberOfDogs] = useState(2);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  
  // Fetch field details using the hook
  const { data: fieldData, isLoading, error } = useFieldDetails(field_id as string);
  const field = fieldData?.data || fieldData;
  
  // Fetch slot availability
  const { data: availabilityData } = useSlotAvailability(
    field_id as string,
    date as string
  );
  
  // Get the specific slot details
  const selectedSlot = availabilityData?.slots?.find(
    (slot: any) => slot.slotTime === timeSlot
  );
  
  // Maximum dogs allowed per booking (from field data or default)
  const maxDogsAllowed = field?.maxDogs || 10;
  
  // Fetch payment methods
  const { data: paymentMethods, isLoading: isLoadingCards, refetch: refetchCards } = usePaymentMethods();
  const setDefaultMutation = useSetDefaultPaymentMethod();
  const deleteMutation = useDeletePaymentMethod();
  
  // Set number of dogs from query params and ensure it doesn't exceed max
  useEffect(() => {
    if (dogsFromQuery) {
      const requested = parseInt(dogsFromQuery as string);
      setNumberOfDogs(Math.min(requested, maxDogsAllowed));
    }
  }, [dogsFromQuery, maxDogsAllowed]);
  
  // Auto-select default card when payment methods load
  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0) {
      const defaultCard = paymentMethods.find(card => card.isDefault);
      if (defaultCard) {
        setSelectedCard(defaultCard.id);
      } else {
        setSelectedCard(paymentMethods[0].id);
      }
    }
  }, [paymentMethods]);
  
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

  const handleIncrement = () => {
    if (numberOfDogs >= maxDogsAllowed) {
      toast.error(`Maximum ${maxDogsAllowed} dogs allowed for this slot`);
      return;
    }
    setNumberOfDogs(prev => Math.min(prev + 1, maxDogsAllowed));
  };

  const handleDecrement = () => {
    setNumberOfDogs(prev => Math.max(prev - 1, 1));
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      await setDefaultMutation.mutateAsync(cardId);
      setSelectedCard(cardId);
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) {
      return;
    }
    
    try {
      await deleteMutation.mutateAsync(cardId);
      if (selectedCard === cardId) {
        setSelectedCard(null);
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const getCardBrandIcon = (brand: string | null) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return (
          <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#1A1F71"/>
            <path d="M20.5 21L17.5 11H14.5L18.5 21H20.5Z" fill="white"/>
            <path d="M30 11L27.5 17L25 11H22L25.5 21H29.5L33 11H30Z" fill="white"/>
          </svg>
        );
      case 'mastercard':
        return (
          <div className="flex">
            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
            <div className="w-6 h-6 bg-yellow-500 rounded-full -ml-3 opacity-80"></div>
          </div>
        );
      case 'amex':
      case 'american express':
        return (
          <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#016FD0"/>
            <path d="M14 16H34" stroke="white" strokeWidth="2"/>
          </svg>
        );
      default:
        return (
          <div className="flex">
            <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
            <div className="w-6 h-6 bg-gray-500 rounded-full -ml-3 opacity-80"></div>
          </div>
        );
    }
  };

  const pricePerDog = priceFromQuery ? parseFloat(priceFromQuery as string) : (field?.pricePerHour || field?.price || 0);
  const subtotal = pricePerDog * numberOfDogs;
  const fieldsyFee = 2.50;
  const total = subtotal + fieldsyFee;

  return (
    <UserLayout requireRole="DOG_OWNER">
      <div className="min-h-screen bg-[#FFFCF3] w-full">
      {/* Main Container */}
      <div className="max-w-[1920px] mx-auto mt-16 xl:mt-24">
        <div className="px-4 sm:px-6 lg:px-20 py-6 sm:py-8 lg:py-10">
        
        {/* Back Button and Title */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <BackButton size="lg" showLabel={true} label='Payment' variant="cream" />
         
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[408px,1fr] gap-6 sm:gap-8 lg:gap-10">
          
          {/* Left Column - Credit Cards */}
          <div className="bg-white rounded-[16px] sm:rounded-[22px] p-4 sm:p-6 lg:p-10 h-fit border border-black/6">
            <h2 className="text-[16px] sm:text-[18px] font-bold text-[#192215] mb-3 sm:mb-4">
              Credit/Debit card
            </h2>

            <div className="space-y-4">
              {/* Loading State */}
              {isLoadingCards && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
                </div>
              )}

              {/* Saved Cards */}
              {!isLoadingCards && paymentMethods && paymentMethods.map((card) => (
                <div key={card.id} className="space-y-6">
                  {/* Card Visual */}
                  <div className="relative">
                    {/* Shadow Card Behind */}
                    <div className="absolute top-10 sm:top-14 left-3 right-3 sm:left-4 sm:right-4 h-[100px] sm:h-[120px] bg-[#D8D8D8] rounded-xl shadow-[0px_4px_24px_0px_rgba(0,0,0,0.2)]" />
                    
                    {/* Main Card */}
                    <div className={`relative h-36 sm:h-44 rounded-xl p-3 sm:p-4 bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden`}>
                      {/* Card Background Pattern */}
                      <div className="absolute inset-0 opacity-15">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'white\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\' /%3E%3C/svg%3E')] bg-repeat" />
                      </div>
                      
                      {/* Chip */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-6 sm:w-10 sm:h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-md">
                        <div className="w-full h-full border border-yellow-600/30 rounded-md"></div>
                      </div>
                      
                      {/* Card Logo */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        {getCardBrandIcon(card.brand)}
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="absolute top-3 right-14 sm:top-4 sm:right-16 text-white/80 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      {/* Card Number */}
                      <div className="absolute top-1/2 -translate-y-2 sm:-translate-y-4 left-3 right-3 sm:left-4 sm:right-4">
                        <p className="text-white text-[14px] sm:text-[18px] font-bold tracking-[1px] sm:tracking-[2px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.24)]">
                          XXXX  XXXX  XXXX  {card.last4}
                        </p>
                      </div>
                      
                      {/* Card Holder */}
                      <div className="absolute bottom-10 sm:bottom-12 left-3 sm:left-4">
                        <p className="text-white text-[11px] sm:text-[14px] font-semibold uppercase drop-shadow-[0px_0px_1px_rgba(0,0,0,0.4)]">
                          {card.cardholderName || 'CARD HOLDER'}
                        </p>
                      </div>
                      
                      {/* Valid Thru */}
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                        <p className="text-white text-[10px] sm:text-[13px] font-medium drop-shadow-[0px_0px_1px_rgba(0,0,0,0.4)]">
                          Valid thru: {card.expiryMonth?.toString().padStart(2, '0')}/{card.expiryYear}
                        </p>
                      </div>
                      
                      {/* CVV */}
                      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
                        <p className="text-white text-[12px] sm:text-[15px] font-bold drop-shadow-[0px_0px_1px_rgba(0,0,0,0.4)]">
                          CVV
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Default Card Checkbox and Radio */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={selectedCard === card.id}
                        onChange={() => setSelectedCard(card.id)}
                        className="w-5 h-5 sm:w-6 sm:h-6 text-green border-gray-300 focus:ring-green"
                      />
                      <span className="text-[12px] sm:text-[14px] font-medium text-[#192215]">
                        Use this card
                      </span>
                    </label>
                    
                    {!card.isDefault && (
                      <button
                        onClick={() => handleSetDefault(card.id)}
                        className="text-[12px] sm:text-[14px] text-green hover:text-green-hover"
                      >
                        Make default
                      </button>
                    )}
                    {card.isDefault && (
                      <span className="text-[12px] sm:text-[14px] text-gray-500">
                        Default card
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* No Cards Message */}
              {!isLoadingCards && (!paymentMethods || paymentMethods.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No payment methods saved</p>
                  <p className="text-sm text-gray-400">Add a card to continue</p>
                </div>
              )}

              {/* Add New Card Button */}
              <button 
                onClick={() => setShowAddCardModal(true)}
                className="flex items-center gap-2 text-[#3A6B22] font-bold text-[13px] sm:text-[15px] hover:opacity-80 transition-opacity pt-3 sm:pt-4"
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Add New Card</span>
              </button>
            </div>
          </div>

          {/* Right Column - Booking Details & Payment Summary */}
          <div className="space-y-6 sm:space-y-8">
            {/* Field Details Card */}
            <div className="bg-white rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 border border-black/8">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                {/* Field Image */}
                <div 
                  className="w-full sm:w-[216px] h-[160px] sm:h-[145px] rounded-[10px] bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: `url('${field?.images?.[0] || '/green-field.png'}')`
                  }}
                />

                {/* Field Info */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                  {/* Title and Price */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2 sm:mb-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-[29px] font-semibold text-[#192215]">
                        {field?.name || 'Field'}
                      </h3>
                      <div className="flex items-baseline gap-1 sm:block sm:text-right">
                        <span className="text-lg sm:text-xl lg:text-[24px] font-bold text-[#3A6B22]">${pricePerDog}</span>
                        <span className="text-sm sm:text-[16px] text-[#192215] opacity-70">/dog/{field?.bookingDuration === '30min' ? '30min' : 'hour'}</span>
                      </div>
                    </div>
                    
                    {/* Location and Rating */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-1">
                        <img src='/location.svg' className="w-4 h-4 sm:w-5 sm:h-5 text-[#3A6B22]" />
                        <span className="text-sm sm:text-[16px] text-[#192215]">
                          {field?.city && field?.postalCode ? `${field.city} ${field.postalCode}` : field?.address || 'Location not specified'}
                        </span>
                      </div>
                      {field?.averageRating && (
                        <div className="bg-[#192215] px-1.5 py-1 rounded-md flex items-center gap-0.5 w-fit">
                          <Star className="w-4 h-4 sm:w-[18px] sm:h-[18px] fill-yellow" />
                          <span className="text-white text-xs sm:text-[14px] font-semibold">{field.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Number of Dogs and Time */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="flex flex-col">
                        <span className="text-base sm:text-[18px] font-bold text-[#192215]">Number of dogs</span>
                        <span className="text-xs sm:text-sm text-[#3A6B22]">
                          Maximum {maxDogsAllowed} dogs per booking
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-[#8FB366]/40 rounded-[10px] p-2 sm:p-2.5 w-fit">
                        <button 
                          onClick={handleDecrement}
                          disabled={numberOfDogs <= 1}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${numberOfDogs <= 1 ? 'opacity-30 cursor-not-allowed' : 'text-[#3A6B22] hover:opacity-70'} transition-opacity`}
                        >
                          <img src='/payment/minus.svg' className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <span className="text-sm sm:text-[16px] font-semibold text-[#192215] w-6 text-center">
                          {numberOfDogs}
                        </span>
                        <button 
                          onClick={handleIncrement}
                          disabled={numberOfDogs >= maxDogsAllowed}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${numberOfDogs >= maxDogsAllowed ? 'opacity-30 cursor-not-allowed' : 'text-[#3A6B22] hover:opacity-70'} transition-opacity`}
                        >
                          <img src='/payment/plus.svg' className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm sm:text-[16px] text-[#192215]">
                      {date ? new Date(date as string).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'No date selected'} • {timeSlot || '8:00AM - 9:00AM'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <h3 className="text-base sm:text-[18px] font-bold text-[#192215] mb-2 sm:mb-2.5">Payment Summary</h3>
              <div className="bg-white rounded-[12px] sm:rounded-[14px] p-3 sm:p-4 border border-black/6">
                <div className="space-y-2 sm:space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between text-sm sm:text-[16px]">
                    <span className="text-[#192215] opacity-70">Subtotal</span>
                    <span className="font-medium text-[#192215]">${subtotal.toFixed(0)}</span>
                  </div>
                  
                  {/* Fieldsy Fee */}
                  <div className="flex justify-between text-sm sm:text-[16px]">
                    <span className="text-[#192215] opacity-70">Fieldsy Fee</span>
                    <span className="font-medium text-[#192215]">${fieldsyFee.toFixed(2)}</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-[#E2E2E2]" />
                  
                  {/* Total */}
                  <div className="flex justify-between font-bold">
                    <span className="text-sm sm:text-[16px] text-[#192215]">Total</span>
                    <span className="text-base sm:text-[18px] text-[#3A6B22]">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pay Now Button */}
                {!showStripeCheckout ? (
                  <div className="flex justify-end mt-4 sm:mt-6">
                    <button 
                      onClick={() => {
                        if (!selectedCard && (!paymentMethods || paymentMethods.length === 0)) {
                          toast.error('Please add a payment method first');
                          setShowAddCardModal(true);
                          return;
                        }
                        setShowStripeCheckout(true);
                      }}
                      className="w-full sm:w-64 h-12 sm:h-14 bg-[#3A6B22] text-white rounded-full font-bold text-sm sm:text-[16px] hover:bg-[#2D5A1B] transition-colors">
                      Pay Now
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 sm:mt-6">
                    <StripeCheckout
                      amount={total}
                      fieldId={field_id as string}
                      numberOfDogs={numberOfDogs}
                      date={date as string}
                      timeSlot={timeSlot as string}
                      repeatBooking={repeatBooking as string}
                      paymentMethodId={selectedCard}
                      onSuccess={() => {
                        console.log('Payment successful!');
                      }}
                      onError={(error) => {
                        console.error('Payment error:', error);
                        
                        // Handle specific error codes
                        if (error === 'PAYMENT_METHOD_EXPIRED' || error === 'PAYMENT_METHOD_NOT_FOUND') {
                          // Reset selection and refresh payment methods
                          setSelectedCard(null);
                          refetchCards();
                          setShowStripeCheckout(false);
                          
                          // Show add card modal if no other cards available
                          if (!paymentMethods || paymentMethods.length <= 1) {
                            setShowAddCardModal(true);
                          }
                        } else if (error === 'Authentication required') {
                          // Handle authentication error
                          setShowStripeCheckout(false);
                          toast.error('Please log in to continue with payment');
                        } else {
                          // Generic error handling
                          setShowStripeCheckout(false);
                          toast.error('Payment failed. Please try again or use a different payment method.');
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="text-sm sm:text-base lg:text-[18px] leading-relaxed sm:leading-[24px] lg:leading-[28px]">
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
    </div>
    
    {/* Add Card Modal */}
    <AddCardModal
      isOpen={showAddCardModal}
      onClose={() => setShowAddCardModal(false)}
      onSuccess={() => {
        setShowAddCardModal(false);
        refetchCards();
      }}
    />
    </UserLayout>
  );
};

export default PaymentPage;