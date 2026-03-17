import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { X } from 'lucide-react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';
import { stripePromise } from '@/lib/stripe';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CARD_OPTIONS = {
  disableLink: true,
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

// Isolated CardElement wrapper — never re-renders after mount
const StableCardElement = memo(({ onReady }: { onReady: () => void }) => (
  <div className="p-3 border border-gray-300 rounded-2xl">
    <CardElement onReady={onReady} options={CARD_OPTIONS} />
  </div>
));
StableCardElement.displayName = 'StableCardElement';

const CardForm: React.FC<{ onSuccess: () => void; onClose: () => void }> = ({ onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [cardReady, setCardReady] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const formReady = !!stripe && !!clientSecret && cardReady;

  useEffect(() => {
    let cancelled = false;

    const createSetupIntent = async () => {
      try {
        const response = await axiosClient.post('/payment-methods/setup-intent');
        if (!cancelled) {
          setClientSecret(response.data.clientSecret);
        }
      } catch (error) {
        console.error('Error creating setup intent:', error);
        if (!cancelled) {
          toast.error('Failed to initialize card setup');
        }
      }
    };

    createSetupIntent();
    return () => { cancelled = true; };
  }, []);

  const handleCardReady = useCallback(() => {
    setCardReady(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: nameRef.current?.value || '',
          },
        },
      });

      if (error) {
        let userMessage = 'Failed to add card. Please try again.';
        if (error.code === 'resource_missing') {
          userMessage = 'Card setup session expired. Please close and try again.';
        } else if (error.type === 'card_error' || error.type === 'validation_error') {
          userMessage = error.message || 'Invalid card details. Please check and try again.';
        } else if (error.message) {
          userMessage = error.message;
        }
        toast.error(userMessage);
        setIsLoading(false);
        return;
      }

      if (setupIntent && setupIntent.payment_method) {
        await axiosClient.post('/payment-methods/save', {
          paymentMethodId: setupIntent.payment_method,
          isDefault,
        });

        toast.success('Card added successfully', { id: 'card-added' });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error adding card:', error);
      toast.error(error.response?.data?.error || 'Failed to add card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!formReady && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-green rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Preparing card form...</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        style={!formReady ? { height: 0, overflow: 'hidden', opacity: 0 } : undefined}
      >
        {/* Cardholder Name — uncontrolled to avoid re-renders */}
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            id="cardholderName"
            ref={nameRef}
            defaultValue=""
            className="w-full px-3 py-3 border border-gray-300 bg-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-green/20 focus:border-green"
            placeholder="John Doe"
            required
          />
        </div>

        {/* Card Element — memoized, won't re-render */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Details
          </label>
          <StableCardElement onReady={handleCardReady} />
        </div>

        {/* Set as Default */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 text-green border-gray-300 rounded focus:ring-green"
          />
          <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
            Set as default payment method
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border-2 border-green text-green rounded-full font-semibold hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-green text-white rounded-full font-semibold hover:bg-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!stripe || isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Card'}
          </button>
        </div>
      </form>
    </>
  );
};

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Preconnect to Stripe for faster iframe load */}
      <link rel="preconnect" href="https://js.stripe.com" />
      <link rel="preconnect" href="https://api.stripe.com" />

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -right-4 -top-4 sm:-right-3 sm:-top-3 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Card</h2>

        {/* Stripe Elements Provider */}
        <Elements stripe={stripePromise}>
          <CardForm onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
};

export default AddCardModal;
