import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import axiosClient from '@/lib/api/axios-client';
import { useRouter } from 'next/router';
import { UserLayout } from '@/components/layout/UserLayout';
import AddCardModal from '@/components/payment/AddCardModal';
import { DeleteCardConfirmationModal } from '@/components/modal/DeleteCardConfirmationModal';
import { Trash2 } from 'lucide-react';


// Helper function to get card brand icon
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

// Credit Card Component
function CreditCard({ card, onToggleDefault, onDelete }) {
  const { brand, last4, expiryMonth, expiryYear, isDefault, cardholderName } = card;
  return (
    <div className="space-y-6">
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
            {getCardBrandIcon(brand)}
          </div>
          
          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="absolute top-3 right-14 sm:top-4 sm:right-16 text-white/80 hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          {/* Card Number */}
          <div className="absolute top-1/2 -translate-y-2 sm:-translate-y-4 left-3 right-3 sm:left-4 sm:right-4">
            <p className="text-white text-[14px] sm:text-[18px] font-bold tracking-[1px] sm:tracking-[2px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.24)]">
              XXXX  XXXX  XXXX  {last4}
            </p>
          </div>
          
          {/* Card Holder */}
          <div className="absolute bottom-10 sm:bottom-12 left-3 sm:left-4">
            <p className="text-white text-[11px] sm:text-[14px] font-semibold uppercase drop-shadow-[0px_0px_1px_rgba(0,0,0,0.4)]">
              {cardholderName || 'CARD HOLDER'}
            </p>
          </div>
          
          {/* Valid Thru */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
            <p className="text-white text-[10px] sm:text-[13px] font-medium drop-shadow-[0px_0px_1px_rgba(0,0,0,0.4)]">
              Valid thru: {expiryMonth?.toString().padStart(2, '0')}/{expiryYear}
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

      {/* Default Card Checkbox */}
      <div className="flex items-center justify-between px-2">
        <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={onToggleDefault}
            className="w-5 h-5 sm:w-6 sm:h-6 accent-green"
          />
          <span className="text-[12px] sm:text-[14px] font-medium text-[#192215]">
            {isDefault ? 'Default card' : 'Make default'}
          </span>
        </label>
      </div>
    </div>
  );
}



export default function SavedCards() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingCard, setSavingCard] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<any>(null);

  // Remove the form state as we'll use the modal instead

  // Fetch saved payment methods on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/payment-methods');
      if (response.data.success) {
        setCards(response.data.paymentMethods || response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load saved cards');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDefault = async (stripePaymentMethodId) => {
    try {
      // Find the card by stripePaymentMethodId to get the database ID
      const card = cards.find(c => c.stripePaymentMethodId === stripePaymentMethodId);
      if (!card) {
        toast.error('Card not found');
        return;
      }
      
      const response = await axiosClient.put(`/payment-methods/${card.id}/set-default`);
      if (response.data.success) {
        toast.success('Default card updated');
        fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error setting default card:', error);
      toast.error('Failed to update default card');
    }
  };

  const handleDeleteCard = async (stripePaymentMethodId) => {
    const card = cards.find(c => c.stripePaymentMethodId === stripePaymentMethodId);
    if (!card) {
      toast.error('Card not found');
      return;
    }
    
    // Show the delete confirmation modal
    setCardToDelete(card);
    setShowDeleteModal(true);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;
    
    try {
      const response = await axiosClient.delete(`/payment-methods/${cardToDelete.id}`);
      if (response.data.success) {
        toast.success('Card deleted successfully');
        fetchPaymentMethods();
        setShowDeleteModal(false);
        setCardToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card');
    }
  };

  const handleAddCardSuccess = () => {
    setShowAddCardModal(false);
    fetchPaymentMethods(); // Refresh the list of cards
    toast.success('Card added successfully!');
  };

  return (
    <UserLayout requireRole="DOG_OWNER">
      <div className="min-h-screen bg-light xl:mt-32 mt-16 pb-16">
        <div className="container mx-auto px-20">
        {/* Page Title */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 bg-cream rounded-full flex items-center justify-center hover:bg-[#e8ddb5] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-dark-green"/>
            </svg>
          </button>
          <h1 
            className="text-3xl font-semibold text-dark-green font-sans"
          >
            Saved Cards
          </h1>
        </div>

        <div className="flex gap-8">
          {/* Left Column - Saved Cards */}
          <div className="w-[408px]">
            <div className="bg-white rounded-3xl p-10 border border-black/5">
              <h2 
                className="text-lg font-bold mb-6"
                style={{ 
                  color: '#192215',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Credit/Debit card
              </h2>
              
              <div className="space-y-8">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
                    <p className="mt-2 text-gray-600">Loading saved cards...</p>
                  </div>
                ) : cards.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p>No saved cards yet</p>
                    <p className="text-sm mt-2">Add a card to make checkout faster</p>
                  </div>
                ) : (
                  cards.map(card => (
                    <CreditCard
                      key={card.id}
                      card={card}
                      onToggleDefault={() => handleToggleDefault(card.stripePaymentMethodId)}
                      onDelete={() => handleDeleteCard(card.stripePaymentMethodId)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Add New Card */}
          <div className="flex-1">
            <h2 
              className="text-3xl font-semibold mb-6"
              style={{ 
                color: '#192215',
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              Add New Card
            </h2>

            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <p className="text-gray-600 mb-6">
                Add a new payment method to your account for faster checkout.
              </p>
              <button
                onClick={() => setShowAddCardModal(true)}
                className="px-12 py-3 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: '#3A6B22',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Add New Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Add Card Modal */}
    <AddCardModal
      isOpen={showAddCardModal}
      onClose={() => setShowAddCardModal(false)}
      onSuccess={handleAddCardSuccess}
    />
    
    {/* Delete Card Confirmation Modal */}
    <DeleteCardConfirmationModal
      isOpen={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false);
        setCardToDelete(null);
      }}
      onConfirm={confirmDeleteCard}
      cardLast4={cardToDelete?.last4}
      cardBrand={cardToDelete?.brand}
    />
    </UserLayout>
  );
}