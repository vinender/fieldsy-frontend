import React, { useState, useEffect, useRef } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { bookingQueryKeys } from '@/hooks/queries/useBookingQueries';
import { BookingSuccessModal } from '../modal/BookingSuccessModal';
import { toast } from 'sonner';
import Spinner from '@/components/ui/Spinner';

interface CheckoutFormProps {
  amount: number;
  fieldId: string;
  numberOfDogs: number;
  date: string;
  timeSlots: string[]; // Array of selected time slots
  repeatBooking: string;
  paymentMethodId?: string | null; // Add saved payment method
  duration?: string; // '30min' or '60min' - booking duration
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onProcessingChange?: (isProcessing: boolean) => void; // Callback for processing state
}

// Component for saved card payment (doesn't need Stripe Elements)
const SavedCardCheckout: React.FC<CheckoutFormProps> = ({
  amount,
  fieldId,
  numberOfDogs,
  date,
  timeSlots,
  repeatBooking,
  paymentMethodId,
  duration,
  onSuccess,
  onError,
  onProcessingChange
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [apiCallInProgress, setApiCallInProgress] = useState(false);

  // Use useRef to track if we've already initiated payment for this specific booking
  const paymentInitiatedRef = useRef(false);
  const bookingKeyRef = useRef(`${fieldId}_${date}_${JSON.stringify(timeSlots)}_${paymentMethodId}`);

  // Notify parent of processing state changes
  useEffect(() => {
    onProcessingChange?.(processing);
  }, [processing, onProcessingChange]);

  useEffect(() => {
    const currentBookingKey = `${fieldId}_${date}_${JSON.stringify(timeSlots)}_${paymentMethodId}`;

    // Check if this is a different booking (props changed)
    if (bookingKeyRef.current !== currentBookingKey) {
      paymentInitiatedRef.current = false;
      bookingKeyRef.current = currentBookingKey;
    }

    // Prevent duplicate payment attempts for the same booking
    if (paymentInitiatedRef.current || apiCallInProgress) {
      return;
    }

    // Create PaymentIntent with saved card
    const createPaymentIntent = async () => {
      // Mark payment as initiated to prevent duplicate calls
      paymentInitiatedRef.current = true;
      setApiCallInProgress(true);

      try {
        const token = (session as any)?.accessToken || localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          setError('Please log in to continue with payment');
          onError?.('Authentication required');
          setApiCallInProgress(false);
          return;
        }

        setProcessing(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fieldId,
            numberOfDogs,
            date,
            timeSlots, // Array of selected time slots
            repeatBooking,
            amount,
            paymentMethodId, // Include saved payment method
            duration // Include booking duration (30min or 60min)
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();

          // Check if it's a duplicate booking
          if (errorData.isDuplicate) {
            setSucceeded(true);
            setBookingId(errorData.bookingId);
            setProcessing(false);
            onSuccess?.();
            setShowSuccessModal(true);
            return;
          }

          // Check if it's a recurring booking conflict error
          const isRecurringConflict = errorData.error?.includes('recurring booking') ||
                                       errorData.error?.includes('existing bookings on');

          // Handle specific error codes from backend
          if (errorData.code === 'PAYMENT_METHOD_EXPIRED') {
            toast.error('This payment method is no longer valid. Please select a different payment method.');
            onError?.('PAYMENT_METHOD_EXPIRED');
          } else if (errorData.code === 'PAYMENT_METHOD_NOT_FOUND') {
            toast.error('Payment method not found. Please select a different payment method.');
            onError?.('PAYMENT_METHOD_NOT_FOUND');
          } else if (errorData.code === 'PAYMENT_METHOD_ERROR') {
            toast.error(errorData.error || 'Unable to process payment method. Please try again.');
          } else if (errorData.code === 'SLOT_UNAVAILABLE') {
            // Slot is no longer available - another user booked it
            toast.error(errorData.message || 'The selected time slot is no longer available. Please select a different time.', {
              duration: 6000,
            });
            onError?.('SLOT_UNAVAILABLE');
          } else if (errorData.code === 'RECURRING_SLOT_CONFLICT') {
            // Recurring booking conflict
            toast.error(errorData.message || 'This slot is reserved by a recurring booking.', {
              duration: 6000,
            });
            onError?.('RECURRING_SLOT_CONFLICT');
          } else if (isRecurringConflict) {
            // Handle recurring booking conflict gracefully
            toast.error(errorData.error || 'This time slot conflicts with existing bookings.', {
              duration: 6000,
            });
            onError?.('RECURRING_CONFLICT');
          } else {
            toast.error(errorData.error || 'Failed to create payment. Please try again.');
          }

          // Set error state and return gracefully instead of throwing
          setError(errorData.error || 'Failed to create payment intent');
          setProcessing(false);
          setApiCallInProgress(false);
          paymentInitiatedRef.current = false; // Allow retry
          onError?.(errorData.error || 'Failed to create payment intent');
          return;
        }

        const data = await response.json();
        
        // Check if it's a duplicate booking (from 200 response)
        if (data.isDuplicate) {
          if (data.isPending) {
            // There's a pending booking, inform the user
            setError('A booking for this time slot is already being processed. Please wait a moment and check your bookings.');
            setProcessing(false);
            setApiCallInProgress(false);
            return;
          }
          // Existing confirmed booking - show success immediately
          setSucceeded(true);
          setBookingId(data.bookingId);
          setProcessing(false);
          setApiCallInProgress(false);
          onSuccess?.();
          setShowSuccessModal(true);
          return;
        }

        // Check if payment was already successful (saved card was used)
        if (data.paymentSucceeded) {
          // Payment completed - show success modal immediately
          setSucceeded(true);
          setBookingId(data.bookingId);
          setProcessing(false);
          setApiCallInProgress(false);
          onSuccess?.();
          setShowSuccessModal(true);
        } else if (data.requiresAction && data.clientSecret) {
          // 3DS/OTP required — use Stripe SDK to handle authentication
          try {
            const stripeInstance = await stripePromise;
            if (!stripeInstance) {
              throw new Error('Stripe not loaded');
            }

            const { error: confirmError, paymentIntent } = await stripeInstance.confirmCardPayment(data.clientSecret);

            if (confirmError) {
              setError(confirmError.message || 'Payment authentication failed. Please try again.');
              setProcessing(false);
              setApiCallInProgress(false);
              paymentInitiatedRef.current = false;
              onError?.(confirmError.message || 'Authentication failed');
              return;
            }

            if (paymentIntent?.status === 'succeeded') {
              // 3DS passed — confirm on backend
              const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payments/confirm-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  paymentIntentId: paymentIntent.id,
                  bookingId: data.bookingId
                }),
              });

              if (!confirmResponse.ok) {
                throw new Error('Failed to confirm payment after authentication');
              }

              setSucceeded(true);
              setBookingId(data.bookingId);
              setProcessing(false);
              setApiCallInProgress(false);
              onSuccess?.();
              setShowSuccessModal(true);
            } else {
              setError('Payment could not be completed. Please try again.');
              setProcessing(false);
              setApiCallInProgress(false);
              paymentInitiatedRef.current = false;
            }
          } catch (authErr) {
            console.error('3DS authentication error:', authErr);
            setError('Payment authentication failed. Please try again.');
            setProcessing(false);
            setApiCallInProgress(false);
            paymentInitiatedRef.current = false;
            onError?.('Authentication failed');
          }
        } else {
          // Payment failed or unknown status
          setError('Payment could not be processed. Please try again.');
          setProcessing(false);
          setApiCallInProgress(false);
          paymentInitiatedRef.current = false;
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        onError?.(err instanceof Error ? err.message : 'Failed to initialize payment');
        setProcessing(false);
        setApiCallInProgress(false);
        // Reset payment initiated flag on error to allow retry
        paymentInitiatedRef.current = false;
      } finally {
        setApiCallInProgress(false);
      }
    };

    if (amount > 0 && paymentMethodId && (session || typeof window !== 'undefined')) {
      createPaymentIntent();
    }
  }, [fieldId, date, timeSlots, paymentMethodId, amount, numberOfDogs, repeatBooking, session, onSuccess, onError]); // Include all dependencies but use ref to prevent duplicate calls

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    queryClient.invalidateQueries({ queryKey: bookingQueryKeys.userBookings() });
    router.push('/user/my-bookings');
  };

  const handleCheckHistory = () => {
    setShowSuccessModal(false);
    queryClient.invalidateQueries({ queryKey: bookingQueryKeys.userBookings() });
    router.push('/user/my-bookings');
  };

  const handleGoHome = () => {
    setShowSuccessModal(false);
    queryClient.invalidateQueries({ queryKey: bookingQueryKeys.userBookings() });
    router.push('/');
  };

  // Don't show inline loader - parent component handles the full-page processing overlay
  // Just return null while processing, the parent's isProcessingPayment state shows the overlay
  if (succeeded && !showSuccessModal) {
    return null; // Parent shows processing overlay
  }

  if (processing) {
    return null; // Parent shows processing overlay via onProcessingChange callback
  }

  if (error) {
    const isRecurringConflict = error.includes('recurring booking') || error.includes('existing bookings on');

    return (
      <div className="space-y-4">
        <div className={`px-4 py-3 rounded-md ${
          isRecurringConflict
            ? 'bg-amber-50 border border-amber-200 text-amber-800'
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          <div className="flex items-start">
            <svg className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${isRecurringConflict ? 'text-amber-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">{isRecurringConflict ? 'Booking Conflict' : 'Payment Error'}</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="w-full py-3 px-4 rounded-full font-semibold text-white bg-[#3A6B22] hover:bg-[#2D5A1B] transition-colors"
        >
          {isRecurringConflict ? 'Choose Different Time Slot' : 'Go Back'}
        </button>
      </div>
    );
  }

  return (
    <BookingSuccessModal
      isOpen={showSuccessModal}
      onClose={handleCloseSuccessModal}
      onCheckHistory={handleCheckHistory}
      onGoHome={handleGoHome}
    />
  );
};

// Component for new card payment (needs Stripe Elements)
const NewCardCheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  fieldId,
  numberOfDogs,
  date,
  timeSlots,
  repeatBooking,
  duration,
  onSuccess,
  onError,
  onProcessingChange
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [apiCallInProgress, setApiCallInProgress] = useState(false);

  // Use useRef to track if we've already initiated payment for this specific booking
  const paymentInitiatedRef = useRef(false);
  const bookingKeyRef = useRef(`${fieldId}_${date}_${JSON.stringify(timeSlots)}_new_card`);

  // Notify parent of processing state changes
  useEffect(() => {
    onProcessingChange?.(processing);
  }, [processing, onProcessingChange]);

  useEffect(() => {
    const currentBookingKey = `${fieldId}_${date}_${JSON.stringify(timeSlots)}_new_card`;

    // Check if this is a different booking (props changed)
    if (bookingKeyRef.current !== currentBookingKey) {
      paymentInitiatedRef.current = false;
      bookingKeyRef.current = currentBookingKey;
    }

    // Prevent duplicate payment attempts for the same booking
    if (paymentInitiatedRef.current || apiCallInProgress) {
      return;
    }

    // Create PaymentIntent as soon as the component loads
    const createPaymentIntent = async () => {
      paymentInitiatedRef.current = true;
      setApiCallInProgress(true);

      try {
        const token = (session as any)?.accessToken || localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          setError('Please log in to continue with payment');
          onError?.('Authentication required');
          setApiCallInProgress(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fieldId,
            numberOfDogs,
            date,
            timeSlots, // Array of selected time slots
            repeatBooking,
            amount,
            duration // Include booking duration (30min or 60min)
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();

          // Check if it's a duplicate booking
          if (errorData.isDuplicate) {
            setSucceeded(true);
            setBookingId(errorData.bookingId);
            onSuccess?.();
            setShowSuccessModal(true);
            return;
          }

          // Check if it's a recurring booking conflict error
          const isRecurringConflict = errorData.error?.includes('recurring booking') ||
                                       errorData.error?.includes('existing bookings on');

          // Handle specific error codes from backend
          if (errorData.code === 'PAYMENT_PROCESSING_ERROR') {
            toast.error('Unable to process payment. Please try again.');
          } else if (errorData.code === 'SLOT_UNAVAILABLE') {
            // Slot is no longer available - another user booked it
            toast.error(errorData.message || 'The selected time slot is no longer available. Please select a different time.', {
              duration: 6000,
            });
            onError?.('SLOT_UNAVAILABLE');
          } else if (errorData.code === 'RECURRING_SLOT_CONFLICT') {
            // Recurring booking conflict
            toast.error(errorData.message || 'This slot is reserved by a recurring booking.', {
              duration: 6000,
            });
            onError?.('RECURRING_SLOT_CONFLICT');
          } else if (isRecurringConflict) {
            // Handle recurring booking conflict gracefully
            toast.error(errorData.error || 'This time slot conflicts with existing bookings.', {
              duration: 6000,
            });
            onError?.('RECURRING_CONFLICT');
          } else {
            toast.error(errorData.error || 'Failed to create payment. Please try again.');
          }

          // Set error state and return gracefully instead of throwing
          setError(errorData.error || 'Failed to create payment intent');
          setApiCallInProgress(false);
          paymentInitiatedRef.current = false; // Allow retry
          onError?.(errorData.error || 'Failed to create payment intent');
          return;
        }

        const data = await response.json();
        
        // Check if it's a duplicate booking (from 200 response)
        if (data.isDuplicate) {
          if (data.isPending) {
            // There's a pending booking, inform the user
            setError('A booking for this time slot is already being processed. Please wait a moment and check your bookings.');
            setApiCallInProgress(false);
            return;
          }
          // Existing confirmed booking - show success immediately
          setSucceeded(true);
          setBookingId(data.bookingId);
          setApiCallInProgress(false);
          onSuccess?.();
          setShowSuccessModal(true);
          return;
        }

        setClientSecret(data.clientSecret);
        setBookingId(data.bookingId);
        setApiCallInProgress(false);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        onError?.(err instanceof Error ? err.message : 'Failed to initialize payment');
        setApiCallInProgress(false);
        // Reset flag on error to allow retry
        paymentInitiatedRef.current = false;
      }
    };

    if (amount > 0 && (session || typeof window !== 'undefined')) {
      createPaymentIntent();
    }
  }, [fieldId, date, timeSlots, amount, numberOfDogs, repeatBooking, session, onSuccess, onError]); // Include all dependencies but use ref to prevent duplicate calls

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }
    
    // Prevent double submission
    if (processing || succeeded) {
      return;
    }

    setProcessing(true);
    setError(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    // Confirm the payment
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      },
    });

    if (stripeError) {
      let userMessage = 'Payment failed. Please try again.';
      if (stripeError.code === 'resource_missing') {
        userMessage = 'Payment session expired. Please refresh and try again.';
      } else if (stripeError.type === 'card_error' || stripeError.type === 'validation_error') {
        userMessage = stripeError.message || 'Invalid card details. Please check and try again.';
      } else if (stripeError.message) {
        userMessage = stripeError.message;
      }
      setError(userMessage);
      setProcessing(false);
      onError?.(userMessage);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // Confirm payment on backend
      try {
        const token = (session as any)?.accessToken || localStorage.getItem('authToken') || localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payments/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingId
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to confirm payment');
        }

        setSucceeded(true);
        setProcessing(false);
        onSuccess?.();
        
        // Show success modal instead of redirecting
        setShowSuccessModal(true);
      } catch (err) {
        console.error('Error confirming payment:', err);
        setError('Payment processed but confirmation failed. Please contact support.');
        setProcessing(false);
      }
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    queryClient.invalidateQueries({ queryKey: bookingQueryKeys.userBookings() });
    router.push('/user/my-bookings');
  };

  const handleCheckHistory = () => {
    setShowSuccessModal(false);
    queryClient.invalidateQueries({ queryKey: bookingQueryKeys.userBookings() });
    router.push('/user/my-bookings');
  };

  const handleGoHome = () => {
    setShowSuccessModal(false);
    queryClient.invalidateQueries({ queryKey: bookingQueryKeys.userBookings() });
    router.push('/');
  };

  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Card Details
          </label>
          <div className="p-3 border border-gray-300 rounded-md">
            <CardElement options={cardStyle} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {succeeded && (
          <div className="bg-green-50 border border-green-200 text-green px-4 py-3 rounded-md">
            Payment successful! Redirecting to your booking confirmation...
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || processing || succeeded || !clientSecret}
          className={`w-full py-3 px-4 rounded-full font-semibold text-white transition-colors ${
            processing || !stripe || succeeded || !clientSecret
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#3A6B22] hover:bg-[#2D5A1B]'
          }`}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" inline className="!border-gray-200 !border-t-white" />
              Processing...
            </span>
          ) : succeeded ? (
            'Payment Successful!'
          ) : (
            `Pay £${amount.toFixed(2)}`
          )}
        </button>

        <div className="text-xs text-gray-500 text-center">
          <p>Your payment information is secure and encrypted.</p>
          <p className="mt-1">Powered by Stripe</p>
        </div>
      </form>

      {/* Booking Success Modal */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onCheckHistory={handleCheckHistory}
        onGoHome={handleGoHome}
      />
    </>
  );
};

interface StripeCheckoutProps extends CheckoutFormProps {}

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  const { data: session, status } = useSession();

  // Don't show inline loader - parent component handles the full-page processing overlay
  if (status === 'loading') {
    return null; // Parent shows loading state
  }
  
  if (status === 'unauthenticated' && typeof window !== 'undefined' && !localStorage.getItem('authToken')) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
        Please log in to continue with payment.
      </div>
    );
  }
  
  // If a saved payment method is selected, use SavedCardCheckout (no Elements needed)
  if (props.paymentMethodId) {
    return <SavedCardCheckout {...props} />;
  }
  
  // For new card input, wrap with Elements
  return (
    <Elements stripe={stripePromise}>
      <NewCardCheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;