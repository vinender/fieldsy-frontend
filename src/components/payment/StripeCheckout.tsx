import React, { useState, useEffect } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BookingSuccessModal } from '../modal/BookingSuccessModal';
import { toast } from 'sonner';

interface CheckoutFormProps {
  amount: number;
  fieldId: string;
  numberOfDogs: number;
  date: string;
  timeSlot: string;
  repeatBooking: string;
  paymentMethodId?: string | null; // Add saved payment method
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Component for saved card payment (doesn't need Stripe Elements)
const SavedCardCheckout: React.FC<CheckoutFormProps> = ({
  amount,
  fieldId,
  numberOfDogs,
  date,
  timeSlot,
  repeatBooking,
  paymentMethodId,
  onSuccess,
  onError
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Create PaymentIntent with saved card
    const createPaymentIntent = async () => {
      try {
        const token = (session as any)?.accessToken || localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          setError('Please log in to continue with payment');
          onError?.('Authentication required');
          return;
        }
        
        setProcessing(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fieldId,
            numberOfDogs,
            date,
            timeSlot,
            repeatBooking,
            amount,
            paymentMethodId // Include saved payment method
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // Handle specific error codes from backend
          if (errorData.code === 'PAYMENT_METHOD_EXPIRED') {
            toast.error('This payment method is no longer valid. Please select a different payment method.');
            // Trigger parent component to refresh payment methods
            onError?.('PAYMENT_METHOD_EXPIRED');
          } else if (errorData.code === 'PAYMENT_METHOD_NOT_FOUND') {
            toast.error('Payment method not found. Please select a different payment method.');
            onError?.('PAYMENT_METHOD_NOT_FOUND');
          } else if (errorData.code === 'PAYMENT_METHOD_ERROR') {
            toast.error(errorData.error || 'Unable to process payment method. Please try again.');
          } else {
            toast.error(errorData.error || 'Failed to create payment. Please try again.');
          }
          
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        
        // Check if payment was already successful (saved card was used)
        if (data.paymentSucceeded) {
          setSucceeded(true);
          setBookingId(data.bookingId);
          setProcessing(false);
          // Show success modal directly
          setTimeout(() => {
            onSuccess?.();
            setShowSuccessModal(true);
          }, 1000);
        } else {
          // Payment requires additional action
          setError('Payment requires additional verification. Please check your banking app.');
          setProcessing(false);
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        onError?.(err instanceof Error ? err.message : 'Failed to initialize payment');
        setProcessing(false);
      }
    };

    if (amount > 0 && paymentMethodId && (session || typeof window !== 'undefined')) {
      createPaymentIntent();
    }
  }, [amount, fieldId, numberOfDogs, date, timeSlot, repeatBooking, paymentMethodId, session]);

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push('/');
  };

  const handleCheckHistory = () => {
    setShowSuccessModal(false);
    router.push('/user/my-bookings');
  };

  const handleGoHome = () => {
    setShowSuccessModal(false);
    router.push('/');
  };

  if (succeeded && !showSuccessModal) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          Payment successful! Booking confirmed.
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A6B22] mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Processing your booking...</p>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A6B22] mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Processing payment with saved card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
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
  timeSlot,
  repeatBooking,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    const createPaymentIntent = async () => {
      try {
        const token = (session as any)?.accessToken || localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          setError('Please log in to continue with payment');
          onError?.('Authentication required');
          return;
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fieldId,
            numberOfDogs,
            date,
            timeSlot,
            repeatBooking,
            amount
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // Handle specific error codes from backend
          if (errorData.code === 'PAYMENT_PROCESSING_ERROR') {
            toast.error('Unable to process payment. Please try again.');
          } else {
            toast.error(errorData.error || 'Failed to create payment. Please try again.');
          }
          
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setBookingId(data.bookingId);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        onError?.(err instanceof Error ? err.message : 'Failed to initialize payment');
      }
    };

    if (amount > 0 && (session || typeof window !== 'undefined')) {
      createPaymentIntent();
    }
  }, [amount, fieldId, numberOfDogs, date, timeSlot, repeatBooking, session]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
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
      setError(stripeError.message || 'Payment failed');
      setProcessing(false);
      onError?.(stripeError.message || 'Payment failed');
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // Confirm payment on backend
      try {
        const token = (session as any)?.accessToken || localStorage.getItem('authToken') || localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/payments/confirm-payment`, {
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
    router.push('/');
  };

  const handleCheckHistory = () => {
    setShowSuccessModal(false);
    router.push('/user/my-bookings');
  };

  const handleGoHome = () => {
    setShowSuccessModal(false);
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
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
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
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : succeeded ? (
            'Payment Successful!'
          ) : (
            `Pay $${amount.toFixed(2)}`
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
  
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A6B22]"></div>
      </div>
    );
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