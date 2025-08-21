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
// import BookingSuccessModal from '@/components/modal/BookingSuccessModal';

interface CheckoutFormProps {
  amount: number;
  fieldId: string;
  numberOfDogs: number;
  date: string;
  timeSlot: string;
  repeatBooking: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
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
        const token = (session as any)?.accessToken || localStorage.getItem('token');
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
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setBookingId(data.bookingId);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
        onError?.('Failed to initialize payment');
      }
    };

    if (amount > 0 && session) {
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
        const token = (session as any)?.accessToken || localStorage.getItem('token');
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
    router.push('/'); // Go to home page
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
  
  if (status === 'unauthenticated') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
        Please log in to continue with payment.
      </div>
    );
  }
  
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;