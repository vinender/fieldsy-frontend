import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CardForm: React.FC<{ onSuccess: () => void; onClose: () => void }> = ({ onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create setup intent when component mounts
    const createSetupIntent = async () => {
      try {
        const response = await axiosClient.post('/payment-methods/setup-intent');
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Error creating setup intent:', error);
        toast.error('Failed to initialize card setup');
      }
    };

    createSetupIntent();
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
      // Confirm the setup intent with the card details
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Failed to add card');
        setIsLoading(false);
        return;
      }

      if (setupIntent && setupIntent.payment_method) {
        // Save the payment method to our backend
        await axiosClient.post('/payment-methods/save', {
          paymentMethodId: setupIntent.payment_method,
          isDefault,
        });

        toast.success('Card added successfully');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cardholder Name */}
      <div>
        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name
        </label>
        <input
          type="text"
          id="cardholderName"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 bg-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-green/20 focus:border-green"
          placeholder="John Doe"
          required
        />
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 rounded-2xl">
          <CardElement
            options={{
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
            }}
          />
        </div>
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
  );
};

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
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