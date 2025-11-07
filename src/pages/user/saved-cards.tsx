import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import axiosClient from '@/lib/api/axios-client';
import { useRouter } from 'next/router';
import { UserLayout } from '@/components/layout/UserLayout';
import AddCardModal from '@/components/payment/AddCardModal';
import { CreditCardDisplay } from '@/components/payment/CreditCardDisplay';
import { DeleteCardConfirmationModal } from '@/components/modal/DeleteCardConfirmationModal';
import Spinner from '@/components/ui/Spinner';



interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: string;
  brand: string | null;
  last4: string;
  expiryMonth: number | null;
  expiryYear: number | null;
  cardholderName: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SavedCards() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCard, setSavingCard] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<PaymentMethod | null>(null);

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
      
      // Optimistic update - immediately update the UI
      const previousCards = [...cards];
      const updatedCards = cards.map(c => ({
        ...c,
        isDefault: c.stripePaymentMethodId === stripePaymentMethodId
      }));
      setCards(updatedCards);
      
      try {
        const response = await axiosClient.put(`/payment-methods/${card.id}/set-default`);
        if (response.data.success) {
          toast.success('Default card updated');
          // Optionally fetch to ensure sync with server
          // fetchPaymentMethods();
        }
      } catch (error) {
        // Revert on error
        console.error('Error setting default card:', error);
        toast.error('Failed to update default card');
        setCards(previousCards);
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
    
    // Close modal immediately for better UX
    setShowDeleteModal(false);
    
    // Optimistic update - immediately remove from UI
    const previousCards = [...cards];
    const updatedCards = cards.filter(c => c.id !== cardToDelete.id);
    setCards(updatedCards);
    
    try {
      const response = await axiosClient.delete(`/payment-methods/${cardToDelete.id}`);
      if (response.data.success) {
        toast.success('Card deleted successfully');
        setCardToDelete(null);
        // Optionally fetch to ensure sync with server
        // fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card');
      // Revert on error
      setCards(previousCards);
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
        <div className="w-full max-w-[1400px]  px-4 sm:px-6 lg:px-8 xl:px-12">
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
            className="text-2xl sm:text-3xl font-semibold text-dark-green font-sans"
          >
            Saved Cards
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Saved Cards */}
          <div className="w-full lg:w-[408px] xl:w-[450px] lg:flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-black/5">
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
                    <Spinner size="lg" className="mx-auto" />
                    <p className="mt-2 text-gray-600">Loading saved cards...</p>
                  </div>
                ) : cards.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p>No saved cards yet</p>
                    <p className="text-sm mt-2">Add a card to make checkout faster</p>
                  </div>
                ) : (
                  cards.map(card => (
                    <CreditCardDisplay
                      key={card.id}
                      card={card}
                      onToggleDefault={() => handleToggleDefault(card.stripePaymentMethodId)}
                      onDelete={() => handleDeleteCard(card.stripePaymentMethodId)}
                      showCheckbox={true}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Add New Card */}
          <div className="flex-1 w-full min-w-0">
            <h2
              className="text-2xl sm:text-3xl font-semibold mb-6"
              style={{
                color: '#192215',
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              Add New Card
            </h2>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 w-full">
              <p className="text-gray-600 mb-6">
                Add a new payment method to your account for faster checkout.
              </p>
              <button
                onClick={() => setShowAddCardModal(true)}
                className="w-full sm:w-auto px-8 sm:px-12 py-3 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
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
      cardBrand={cardToDelete?.brand || undefined}
    />
    </UserLayout>
  );
}
// Force SSR for this authenticated page - prevents _next/data routing issues
export async function getServerSideProps() {
  return {
    props: {},
  };
}
