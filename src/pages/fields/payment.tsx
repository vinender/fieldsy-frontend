import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BackButton from '@/components/common/BackButton';
import { Plus, Star, AlertTriangle } from 'lucide-react';
import { UserLayout } from '@/components/layout/UserLayout';
import { useFieldDetails } from '@/hooks';
import { FieldDetailsSkeleton } from '@/components/skeletons/FieldDetailsSkeleton';
import dynamic from 'next/dynamic';
import AddCardModal from '@/components/payment/AddCardModal';
import { CreditCardDisplay } from '@/components/payment/CreditCardDisplay';
import { usePaymentMethods, useSetDefaultPaymentMethod, useDeletePaymentMethod } from '@/hooks/queries/usePaymentMethodQueries';
import { toast } from 'sonner';
import Spinner from '@/components/ui/Spinner';
import { useSlotAvailability } from '@/hooks/useSlotAvailability';
import FieldLocation from '@/components/fields/FieldLocation';
// import { getUserLocation } from '@/utils/getUserLocation'; // Location request disabled
import { formatDateDDMMYYYY, formatRating } from '@/utils/formatters';
import { useCancellationWindow } from '@/hooks/usePublicSettings';
import { DeleteCardConfirmationModal } from '@/components/modal/DeleteCardConfirmationModal';

// Dynamically import Stripe component to avoid SSR issues
const StripeCheckout = dynamic(
  () => import('@/components/payment/StripeCheckout'),
  { ssr: false }
);

const PaymentPage = () => {
  const router = useRouter();
  const { field_id, numberOfDogs: dogsFromQuery, date, timeSlots: timeSlotsQuery, repeatBooking, price: priceFromQuery, duration: durationFromQuery, skippedDates: skippedDatesQuery } = router.query;

  // Parse duration from query (default to 60min if not provided)
  const bookingDuration = (durationFromQuery as string) || '60min';
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [numberOfDogs, setNumberOfDogs] = useState(2);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  // const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null); // Location request disabled
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [slotsUnavailable, setSlotsUnavailable] = useState(false);
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<{ id: string; brand: string | null; last4: string } | null>(null);

  // Parse time slots from query (JSON string array)
  const timeSlots: string[] = React.useMemo(() => {
    if (!timeSlotsQuery) return [];
    try {
      return JSON.parse(timeSlotsQuery as string);
    } catch {
      // Fallback for single slot (backward compatibility)
      return [timeSlotsQuery as string];
    }
  }, [timeSlotsQuery]);

  // Parse skipped dates from query (for recurring bookings with conflicts)
  const skippedDates: Array<{ date: string; formattedDate: string; bookedBy: string }> = React.useMemo(() => {
    if (!skippedDatesQuery) return [];
    try {
      return JSON.parse(skippedDatesQuery as string);
    } catch {
      return [];
    }
  }, [skippedDatesQuery]);

  // Get cancellation window from settings
  const cancellationWindowHours = useCancellationWindow();

  // Get user location on mount - Location request disabled
  // useEffect(() => {
  //   getUserLocation().then(location => {
  //     if (location) {
  //       setUserLocation(location);
  //     }
  //   });
  // }, []);

  // Fetch field details using the hook (location request disabled)
  const { data: fieldData, isLoading, error } = useFieldDetails(field_id as string);
  const field = fieldData?.data || fieldData;
  
  // Fetch slot availability with duration to match the booking
  const { data: availabilityData, isLoading: isLoadingAvailability } = useSlotAvailability(
    field_id as string,
    date as string,
    bookingDuration as '30min' | '60min' | '1hour'
  );
  
  // Get the first slot details (for availability check)
  const selectedSlot = timeSlots.length > 0 ? availabilityData?.data?.slots?.find(
    (slot: any) => slot.time === timeSlots[0]
  ) : null;
  
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

  // Track if this is a fresh navigation (not a refresh)
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Handle page refresh detection - mark session on first load
  useEffect(() => {
    if (!router.isReady || !field_id || !date || timeSlots.length === 0) return;

    // Use a unique session key based on the booking parameters
    const sessionKey = `payment_session_${field_id}_${date}_${timeSlots.join('_')}`;
    const existingSession = sessionStorage.getItem(sessionKey);

    // Check navigation type using Performance API
    const navigationEntry = window.performance?.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming;
    const navigationType = navigationEntry?.type;

    // A page is refreshed if:
    // 1. Navigation type is 'reload' AND
    // 2. We already have a session marker (meaning user was here before)
    const wasRefreshed = navigationType === 'reload' && existingSession === 'active';

    if (wasRefreshed) {
      // Show warning modal - but don't check availability yet, wait for data
      setShowRefreshWarning(true);
      setIsFirstLoad(false);
    } else {
      // Mark this session as active for future refresh detection
      sessionStorage.setItem(sessionKey, 'active');
      setIsFirstLoad(false);
    }

    // Cleanup: remove session marker when navigating away
    return () => {
      // Clear session marker when component unmounts (user navigated away)
      sessionStorage.removeItem(sessionKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, field_id, date, timeSlots.length]); // Run when params are ready

  // Check slot availability AFTER data loads (only if refresh warning is shown)
  useEffect(() => {
    // Only check availability if:
    // 1. Refresh warning is shown (user refreshed the page)
    // 2. Availability data has loaded
    // 3. We have time slots to check
    if (!showRefreshWarning || !availabilityData?.data?.slots || timeSlots.length === 0) return;

    // Check if ALL selected slots are still available
    const unavailableSlots: string[] = [];

    timeSlots.forEach(selectedTime => {
      const slot = availabilityData.data.slots.find((s: any) => s.time === selectedTime);
      // A slot is unavailable if:
      // 1. It doesn't exist in the API response
      // 2. It exists but isAvailable is false
      // 3. It exists but isBooked is true (already taken by someone else)
      if (!slot || !slot.isAvailable || slot.isBooked) {
        unavailableSlots.push(selectedTime);
      }
    });

    // Only mark as unavailable if we actually found unavailable slots
    if (unavailableSlots.length > 0) {
      console.log('[Payment] Slots no longer available:', unavailableSlots);
      setSlotsUnavailable(true);
    }
  }, [showRefreshWarning, availabilityData, timeSlots]);

  // Add beforeunload warning only when payment is actively being processed
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if payment is currently being processed
      if (isProcessingPayment) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isProcessingPayment]);
  
  if (error || (!field && !isLoading)) {
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
      // Also select this card for the current payment
      setSelectedCard(cardId);
      // Note: No need to manually refetch - invalidateQueries in the mutation hook handles it
    } catch (error) {
      console.error('Error setting default:', error);
      // Note: Don't show error toast here - the mutation hook already handles it
    }
  };

  const handleDeleteCard = (card: { id: string; brand: string | null; last4: string }) => {
    setCardToDelete(card);
    setShowDeleteCardModal(true);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;

    try {
      await deleteMutation.mutateAsync(cardToDelete.id);
      if (selectedCard === cardToDelete.id) {
        setSelectedCard(null);
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    } finally {
      setShowDeleteCardModal(false);
      setCardToDelete(null);
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
  const numberOfSlots = timeSlots.length || 1;
  const total = pricePerDog * numberOfDogs * numberOfSlots;

  // Show unified loader when initial data is loading
  const isInitialLoading = isLoading && isLoadingCards;

  // Full page loading state
  if (isInitialLoading) {
    return (
      <UserLayout requireRole="DOG_OWNER">
        <div className="min-h-screen bg-[#FFFCF3] w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" className="text-[#3A6B22]" />
            <p className="text-gray-600 text-sm">Loading payment details...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout requireRole="DOG_OWNER">
      <div className="min-h-screen bg-[#FFFCF3] w-full">
        {/* Main Container */}
        <div className="max-w-[1920px] mx-auto mt-16 xl:mt-24">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-20 py-6 sm:py-8 lg:py-10">

          {/* Back Button and Title */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <BackButton size="lg" showLabel={true} label='Payment' variant="cream" />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[408px,1fr] gap-6 sm:gap-8 lg:gap-10">

            {/* Left Column - Credit Cards */}
            <div className="bg-white rounded-[16px] sm:rounded-[22px] p-4 sm:p-6 lg:p-10 h-fit border border-black/6">

              <div className='flex items-center justify-between mb-3 sm:mb-4'>
                  <h2 className="text-[16px] sm:text-[18px] font-bold text-[#192215]">
                    Credit/Debit card
                  </h2>

                  {/* Add New Card Button */}
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="flex items-center text-[#3A6B22] font-bold text-[13px] sm:text-[15px] hover:opacity-80 transition-opacity"
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Add New Card</span>
                  </button>
              </div>

              <div className="space-y-4">
                {/* Loading State for cards only (when field is already loaded) */}
                {isLoadingCards && !isLoading && (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                )}

                {/* Saved Cards */}
                {!isLoadingCards && paymentMethods && paymentMethods.map((card) => (
                  <CreditCardDisplay
                    key={card.id}
                    card={card}
                    onToggleDefault={() => handleSetDefault(card.id)}
                    onDelete={() => handleDeleteCard({ id: card.id, brand: card.brand, last4: card.last4 })}
                    showCheckbox={true}
                  />
                ))}

                {/* No Cards Message */}
                {!isLoadingCards && (!paymentMethods || paymentMethods.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No payment methods saved</p>
                    <p className="text-sm text-gray-400">Add a card to continue</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking Details & Payment Summary */}
            <div className="space-y-6 sm:space-y-8">
              {/* Field Details Card */}
              <div className="bg-white rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 border border-black/8">
                {isLoading ? (
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                    {/* Field Image Skeleton */}
                    <div className="w-full sm:w-[216px] h-[160px] sm:h-[145px] rounded-[10px] bg-gray-200 animate-pulse flex-shrink-0" />
                    {/* Field Info Skeleton */}
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                      <div className="h-12 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ) : (
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
                            <span className="text-lg sm:text-xl lg:text-[24px] font-bold text-[#3A6B22]">£{pricePerDog}</span>
                            <span className="text-sm sm:text-[16px] text-[#192215] opacity-70">/dog/{bookingDuration === '30min' ? '30min' : 'hr'}</span>
                          </div>
                        </div>
                        
                        {/* Location and Rating */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <FieldLocation
                            field={field}
                            className="flex items-center gap-1"
                            iconClassName="w-4 h-4 sm:w-5 sm:h-5 text-[#3A6B22]"
                            textClassName="text-sm sm:text-[16px] text-[#192215]"
                            showDistance={true}
                          />
                          {field?.averageRating !== undefined && field?.averageRating !== null && (
                            <div className="bg-[#192215] px-1.5 py-1 rounded-md flex items-center gap-0.5 w-fit">
                              <img src='/star.svg' alt="star rating" className="w-4 h-4 sm:w-[18px] sm:h-[18px] fill-yellow" />
                              <span className="text-white text-xs sm:text-[14px] font-semibold">
                                {field.averageRating === 0 ? '0' : formatRating(field.averageRating).toFixed(1)}
                              </span>
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
                              <img src='/payment/minus.svg' alt="decrease dog count" className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <span className="text-sm sm:text-[16px] font-semibold text-[#192215] w-6 text-center">
                              {numberOfDogs}
                            </span>
                            <button
                              onClick={handleIncrement}
                              disabled={numberOfDogs >= maxDogsAllowed}
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${numberOfDogs >= maxDogsAllowed ? 'opacity-30 cursor-not-allowed' : 'text-[#3A6B22] hover:opacity-70'} transition-opacity`}
                            >
                              <img src='/payment/plus.svg' alt="increase dog count" className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm sm:text-[16px] text-[#192215]">
                          {date ? formatDateDDMMYYYY(new Date(date as string)) : 'No date selected'}
                        </div>
                        {/* Display selected time slots */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {timeSlots.map((slot, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-[#E8F5E0] text-[#3A6B22] rounded-full text-sm font-medium"
                            >
                              {slot}
                            </span>
                          ))}
                        </div>

                        {/* Skipped Dates Warning - Inside booking details for recurring bookings with conflicts */}
                        {skippedDates.length > 0 && repeatBooking && repeatBooking !== 'none' && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs sm:text-sm text-amber-700 font-medium mb-2">
                                  {skippedDates.length} date{skippedDates.length > 1 ? 's' : ''} will be skipped due to existing bookings:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {skippedDates.map((skipped, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
                                    >
                                      {skipped.formattedDate}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="text-base sm:text-[18px] font-bold text-[#192215] mb-2 sm:mb-2.5">Payment Summary</h3>
                <div className="bg-white rounded-[12px] sm:rounded-[14px] p-3 sm:p-4 border border-black/6">
                  <div className="space-y-2 sm:space-y-3">
                    {/* Session duration */}
                    <div className="flex justify-between text-sm sm:text-[16px]">
                      <span className="text-[#192215] opacity-70">Session duration</span>
                      <span className="font-medium text-[#192215]">{bookingDuration === '30min' ? '30 min' : '60 min'}</span>
                    </div>

                    {/* Price per dog per slot */}
                    <div className="flex justify-between text-sm sm:text-[16px]">
                      <span className="text-[#192215] opacity-70">Price per dog per slot</span>
                      <span className="font-medium text-[#192215]">£{pricePerDog.toFixed(2)}</span>
                    </div>

                    {/* Number of dogs */}
                    <div className="flex justify-between text-sm sm:text-[16px]">
                      <span className="text-[#192215] opacity-70">Number of dogs</span>
                      <span className="font-medium text-[#192215]">{numberOfDogs}</span>
                    </div>

                    {/* Number of time slots */}
                    <div className="flex justify-between text-sm sm:text-[16px]">
                      <span className="text-[#192215] opacity-70">Time slots selected</span>
                      <span className="font-medium text-[#192215]">{numberOfSlots}</span>
                    </div>

                    {/* Subtotal calculation */}
                    {numberOfSlots > 1 && (
                      <div className="flex justify-between text-sm sm:text-[16px]">
                        <span className="text-[#192215] opacity-70">Subtotal ({numberOfDogs} dogs × {numberOfSlots} slots)</span>
                        <span className="font-medium text-[#192215]">£{total.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-[#E2E2E2]" />

                    {/* Total */}
                    <div className="flex justify-between font-bold">
                      <span className="text-sm sm:text-[16px] text-[#192215]">Total</span>
                      <span className="text-base sm:text-[18px] text-[#3A6B22]">£{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Recurring Info and Pay Now Button */}
                  {!showStripeCheckout ? (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 sm:mt-6">
                      {/* Recurring Booking Info */}
                      {repeatBooking && repeatBooking !== 'none' && (
                        <div className="flex items-center gap-2 text-sm text-[#192215]">
                          <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="font-medium">
                            Recurring: <span className="text-green capitalize">{repeatBooking}</span>
                          </span>
                        </div>
                      )}

                      {/* Pay Now Button */}
                      <button
                        onClick={() => {
                          if (!selectedCard && (!paymentMethods || paymentMethods.length === 0)) {
                            toast.error('Please add a payment method first');
                            setShowAddCardModal(true);
                            return;
                          }

                          // Check slot availability before proceeding to payment
                          if (availabilityData?.data?.slots && timeSlots.length > 0) {
                            const allSlotsAvailable = timeSlots.every(selectedSlot => {
                              const slot = availabilityData.data.slots.find((s: any) => s.time === selectedSlot);
                              return slot && slot.isAvailable && !slot.isBooked;
                            });

                            if (!allSlotsAvailable) {
                              toast.error('One or more selected time slots are no longer available');
                              setSlotsUnavailable(true);
                              setShowRefreshWarning(true);
                              return;
                            }
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
                        timeSlots={timeSlots}
                        repeatBooking={repeatBooking as string}
                        paymentMethodId={selectedCard}
                        duration={bookingDuration}
                        onProcessingChange={(isProcessing) => {
                          setIsProcessingPayment(isProcessing);
                        }}
                        onSuccess={() => {
                          console.log('Payment successful!');
                          setIsProcessingPayment(false);
                        }}
                        onError={(error) => {
                          console.error('Payment error:', error);
                          setIsProcessingPayment(false);

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
                          } else if (error === 'SLOT_UNAVAILABLE' || error === 'RECURRING_SLOT_CONFLICT') {
                            // Slot is no longer available - redirect back to booking page
                            setShowStripeCheckout(false);
                            setSlotsUnavailable(true);
                            toast.error('The selected time slot is no longer available. Redirecting to select a different time...', { duration: 5000 });
                            // Redirect back to booking page after delay
                            setTimeout(() => {
                              router.push(`/fields/book-field?id=${field_id}`);
                            }, 2000);
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
                  You can cancel your booking up to {cancellationWindowHours} hours in advance for a full refund.
                  Cancellations made within {cancellationWindowHours} hours of the booking time are not eligible for a refund.
                </span>
              </div>
              <div className="text-sm sm:text-base lg:text-[18px] leading-relaxed sm:leading-[24px] lg:leading-[28px] mt-2">
                <span className="font-semibold text-[#0066cc]">Reschedule Policy: </span>
                <span className="font-medium text-[#323232]">
                  You can reschedule your booking up to {cancellationWindowHours} hours before the booking time, with a maximum of 3 reschedules per booking.
                  For recurring bookings, rescheduling is not available once any booking in the subscription has been completed.
                  The recurring interval cannot be changed during rescheduling.
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

    {/* Delete Card Confirmation Modal */}
    <DeleteCardConfirmationModal
      isOpen={showDeleteCardModal}
      onClose={() => {
        setShowDeleteCardModal(false);
        setCardToDelete(null);
      }}
      onConfirm={confirmDeleteCard}
      cardLast4={cardToDelete?.last4}
      cardBrand={cardToDelete?.brand || undefined}
    />

    {/* Page Refresh Warning Modal */}
    {showRefreshWarning && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 ${slotsUnavailable ? 'bg-red-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center mb-4`}>
              <svg
                className={`w-8 h-8 ${slotsUnavailable ? 'text-red-600' : 'text-yellow-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {slotsUnavailable ? 'Time Slots No Longer Available' : 'Page Was Refreshed'}
            </h3>

            <p className="text-gray-600 mb-6">
              {slotsUnavailable
                ? 'The time slots you selected are no longer available. Please go back and select different time slots.'
                : 'Refreshing this page may cause issues with your booking. It\'s recommended to start the booking process again to ensure your selected time slots are still available.'
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {slotsUnavailable ? (
                <button
                  onClick={() => router.push(`/fields/book-field?field_id=${field_id}`)}
                  className="flex-1 bg-[#3A6B22] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#2d5419] transition"
                >
                  Select New Slots
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowRefreshWarning(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition"
                  >
                    Continue Anyway
                  </button>
                  <button
                    onClick={() => router.push(`/fields/book-field?field_id=${field_id}`)}
                    className="flex-1 bg-[#3A6B22] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#2d5419] transition"
                  >
                    Start Over
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Processing Overlay - Disable cursor and interaction during payment */}
    {isProcessingPayment && (
      <div
        className="fixed inset-0 bg-black/50 z-50 cursor-wait"
        style={{ pointerEvents: 'all' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-[#3A6B22]/10 rounded-full flex items-center justify-center">
                <Spinner size="lg" className="text-[#3A6B22]" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Processing Payment
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Please wait while we securely process your payment...
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Please don&apos;t refresh the page
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your payment is being processed. Refreshing may cause issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </UserLayout>
  );
};

export default PaymentPage;