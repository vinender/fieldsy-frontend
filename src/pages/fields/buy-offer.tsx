import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { UserLayout } from '@/components/layout/UserLayout';
import BackButton from '@/components/common/BackButton';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { CreditCardDisplay } from '@/components/payment/CreditCardDisplay';
import AddCardModal from '@/components/payment/AddCardModal';
import { DeleteCardConfirmationModal } from '@/components/modal/DeleteCardConfirmationModal';
import { usePaymentMethods, useSetDefaultPaymentMethod, useDeletePaymentMethod } from '@/hooks/queries/usePaymentMethodQueries';
import Spinner from '@/components/ui/Spinner';
import { stripePromise } from '@/lib/stripe';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Offer {
  id: string;
  purchaseSlots: number;
  freeSlots: number;
  validity: string;
  enabled: boolean;
}

interface FieldInfo {
  id: string;
  name: string;
  price30min: number | null;
  price1hr: number | null;
  images: string[];
  city?: string;
  state?: string;
}

export default function BuyOfferPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { fieldId } = router.query;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [field, setField] = useState<FieldInfo | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<{ id: string; brand: string | null; last4: string } | null>(null);

  // Payment methods
  const { data: paymentMethods, isLoading: isLoadingCards, refetch: refetchCards } = usePaymentMethods();
  const setDefaultMutation = useSetDefaultPaymentMethod();
  const deleteMutation = useDeletePaymentMethod();

  useEffect(() => {
    if (!fieldId) return;
    const fetchData = async () => {
      try {
        const [offersRes, fieldRes] = await Promise.all([
          fetch(`${API_URL}/offers/${fieldId}/offers`),
          fetch(`${API_URL}/fields/${fieldId}`),
        ]);
        const offersData = await offersRes.json();
        const fieldData = await fieldRes.json();

        if (offersData.success) {
          const enabledOffers = offersData.data.filter((o: Offer) => o.enabled);
          setOffers(enabledOffers);
          if (enabledOffers.length > 0) setSelectedOffer(enabledOffers[0].id);
        }
        if (fieldData.success || fieldData.data) {
          setField(fieldData.data || fieldData);
        }
      } catch {
        toast.error('Failed to load offers');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fieldId]);

  const getSlotPrice = (offer: Offer) => {
    const basePrice = field?.price1hr || field?.price30min || 0;
    return offer.purchaseSlots * basePrice;
  };

  const handleSetDefault = (cardId: string) => {
    setDefaultMutation.mutate(cardId, {
      onSuccess: () => {
        toast.success('Default card updated');
        refetchCards();
      },
      onError: () => toast.error('Failed to update default card'),
    });
  };

  const handleDeleteCard = (card: { id: string; brand: string | null; last4: string }) => {
    setCardToDelete(card);
    setShowDeleteCardModal(true);
  };

  const confirmDeleteCard = () => {
    if (!cardToDelete) return;
    deleteMutation.mutate(cardToDelete.id, {
      onSuccess: () => {
        toast.success('Card removed');
        setShowDeleteCardModal(false);
        setCardToDelete(null);
        refetchCards();
      },
      onError: () => toast.error('Failed to remove card'),
    });
  };

  const handleAddCardSuccess = () => {
    setShowAddCardModal(false);
    refetchCards();
    toast.success('Card added successfully');
  };

  const handlePurchase = async () => {
    if (!selectedOffer || !session) {
      if (!session) {
        router.push('/login');
        return;
      }
      return;
    }

    // Check if user has a card
    if (!paymentMethods || paymentMethods.length === 0) {
      setShowAddCardModal(true);
      toast.error('Please add a payment card first');
      return;
    }

    setPurchasing(true);
    try {
      const token = (session as any)?.accessToken || localStorage.getItem('authToken');

      // Step 1: Create payment intent (auto-confirms with saved card if available)
      const res = await fetch(`${API_URL}/offers/${selectedOffer}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || 'Failed to create payment');
        return;
      }

      // Step 2: Handle payment status
      if (data.data.paymentSucceeded) {
        // Auto-confirmed with saved card — go straight to confirm
      } else if (data.data.requiresAction && data.data.clientSecret) {
        // 3DS/OTP required — confirm with Stripe.js
        const stripeInstance = await stripePromise;
        if (!stripeInstance) throw new Error('Stripe not loaded');

        const { error } = await stripeInstance.confirmCardPayment(data.data.clientSecret);
        if (error) {
          toast.error(error.message || 'Payment authentication failed');
          return;
        }
      } else if (data.data.clientSecret) {
        // No saved card used — need to confirm with Stripe.js (shouldn't happen since we check for cards)
        toast.error('Please select a payment card');
        return;
      }

      // Step 3: Confirm on backend to create slot credits
      const confirmRes = await fetch(`${API_URL}/offers/${selectedOffer}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentIntentId: data.data.paymentIntentId }),
      });

      const confirmData = await confirmRes.json();
      if (confirmData.success) {
        toast.success('Offer purchased successfully! Your slots are now available.');
        router.push(`/user/my-credits`);
      } else {
        toast.error(confirmData.message || 'Payment confirmation failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const selected = offers.find((o) => o.id === selectedOffer);

  if (loading) {
    return (
      <UserLayout>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFFCF3]">
          <div className="animate-spin h-8 w-8 border-4 border-[#3A6B22] border-t-transparent rounded-full" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#FFFCF3] mt-32">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <BackButton />

          <h1 className="text-2xl font-bold text-[#192215] mt-6 mb-2">Buy Slots Pack</h1>
          <p className="text-sm text-[#6D6D6D] mb-8">
            Choose an offer and get bonus free slots for your bookings
          </p>

          {offers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6D6D6D]">No offers available for this field right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[408px,1fr] gap-6 sm:gap-8 lg:gap-10">

              {/* Left Column — Credit/Debit Cards */}
              <div className="bg-white rounded-[16px] sm:rounded-[22px] p-4 sm:p-6 lg:p-10 h-fit border border-black/6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-[16px] sm:text-[18px] font-bold text-[#192215]">
                    Credit/Debit card
                  </h2>
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="flex items-center text-[#3A6B22] font-bold text-[13px] sm:text-[15px] hover:opacity-80 transition-opacity"
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Add New Card</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {isLoadingCards && (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" />
                    </div>
                  )}

                  {!isLoadingCards && paymentMethods && paymentMethods.map((card) => (
                    <CreditCardDisplay
                      key={card.id}
                      card={card}
                      onToggleDefault={() => handleSetDefault(card.id)}
                      onDelete={() => handleDeleteCard({ id: card.id, brand: card.brand, last4: card.last4 })}
                      showCheckbox={true}
                    />
                  ))}

                  {!isLoadingCards && (!paymentMethods || paymentMethods.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No payment methods saved</p>
                      <p className="text-sm text-gray-400">Add a card to continue with purchase</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column — Field Info, Offer Cards, Summary, Pay */}
              <div className="space-y-6">
                {/* Field Info Card */}
                {field && (
                  <div className="bg-white border border-black/8 rounded-[16px] sm:rounded-[20px] overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {field.images?.[0] && (
                        <div
                          className="w-full sm:w-[200px] h-[160px] sm:h-[140px] bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url('${field.images[0]}')` }}
                        />
                      )}
                      <div className="p-4 sm:p-5 flex flex-col justify-center">
                        <h3 className="text-lg font-semibold text-[#192215]">{field.name}</h3>
                        {(field.city || field.state) && (
                          <p className="text-sm text-[#6D6D6D] mt-1">
                            {[field.city, field.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-lg font-bold text-[#3A6B22]">
                            From £{field.price30min || field.price1hr || 0}
                          </span>
                          <span className="text-xs text-[#6D6D6D]">/slot</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Offer Cards */}
                <div>
                  <h3 className="text-base sm:text-[18px] font-bold text-[#192215] mb-3">Select an Offer</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {offers.map((offer) => {
                      const isSelected = selectedOffer === offer.id;
                      return (
                        <button
                          key={offer.id}
                          onClick={() => setSelectedOffer(offer.id)}
                          className={`flex-1 text-left p-4 rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] transition-all h-[82px] flex items-center justify-between ${
                            isSelected
                              ? 'bg-[rgba(143,179,102,0.1)] border border-[#3A6B22]'
                              : 'bg-[rgba(255,255,255,0.1)] border border-[#E3E3E3] hover:border-[#8FB366]'
                          }`}
                        >
                          <div className="flex flex-col gap-1.5">
                            <p className="text-lg font-semibold text-[#192215] leading-none">
                              {offer.purchaseSlots} Slots + {offer.freeSlots} FREE Slot{offer.freeSlots > 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-[#6D6D6D] leading-4">
                              {offer.validity}
                            </p>
                          </div>
                          <div className="bg-[#3A6B22] h-8 rounded-[14px] px-3 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-white">
                              £{getSlotPrice(offer)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Summary */}
                {selected && (
                  <div>
                    <h3 className="text-base sm:text-[18px] font-bold text-[#192215] mb-3">Payment Summary</h3>
                    <div className="bg-white rounded-[12px] sm:rounded-[14px] p-4 sm:p-5 border border-black/6">
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#192215] opacity-70">Purchased Slots</span>
                          <span className="font-medium text-[#192215]">{selected.purchaseSlots}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#192215] opacity-70">Free Bonus Slots</span>
                          <span className="font-medium text-[#3A6B22]">+{selected.freeSlots}</span>
                        </div>
                        <div className="h-px bg-[#E2E2E2] my-1" />
                        <div className="flex justify-between">
                          <span className="text-[#192215] opacity-70">Total Slots</span>
                          <span className="font-bold text-[#192215]">{selected.purchaseSlots + selected.freeSlots}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#192215] opacity-70">Validity</span>
                          <span className="font-medium text-[#192215]">{selected.validity}</span>
                        </div>
                        <div className="h-px bg-[#E2E2E2] my-1" />
                        <div className="flex justify-between font-bold">
                          <span className="text-sm sm:text-[16px] text-[#192215]">Total</span>
                          <span className="text-base sm:text-[18px] text-[#3A6B22]">£{getSlotPrice(selected).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Pay Now Button */}
                      <div className="flex justify-end mt-6">
                        <button
                          onClick={handlePurchase}
                          disabled={!selectedOffer || purchasing}
                          className="bg-[#3A6B22] text-white text-base font-bold h-14 w-full sm:w-[256px] rounded-[70px] hover:bg-[#2e5519] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_6px_16px_rgba(0,0,0,0.06)]"
                        >
                          {purchasing ? 'Processing...' : 'Pay Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
        isOpen={showDeleteCardModal}
        onClose={() => {
          setShowDeleteCardModal(false);
          setCardToDelete(null);
        }}
        onConfirm={confirmDeleteCard}
        cardLast4={cardToDelete?.last4}
        cardBrand={cardToDelete?.brand || undefined}
      />
    </UserLayout>
  );
}
