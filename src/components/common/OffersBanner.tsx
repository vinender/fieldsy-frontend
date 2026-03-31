import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/router';

interface FieldOffer {
  id: string;
  purchaseSlots: number;
  freeSlots: number;
  validity: string;
  enabled: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface OffersBannerProps {
  fieldId?: string;
  title?: string;
  buttonText?: string;
  className?: string;
  dogImage?: string;
  onBuyClick?: (offerId: string) => void;
}

export const OffersBanner: React.FC<OffersBannerProps> = ({
  fieldId,
  title = 'More space & freedom. More moments to enjoy.',
  buttonText = 'Buy Slots Pack',
  className = '',
  dogImage = '/offers/dog-toy.png',
  onBuyClick,
}) => {
  const router = useRouter();
  const [offers, setOffers] = useState<FieldOffer[]>([]);

  useEffect(() => {
    if (!fieldId) {
      console.log('[OffersBanner] No fieldId provided');
      return;
    }
    console.log('[OffersBanner] Fetching offers for fieldId:', fieldId);
    const fetchOffers = async () => {
      try {
        const url = `${API_URL}/offers/${fieldId}/offers`;
        console.log('[OffersBanner] Fetching:', url);
        const res = await fetch(url);
        const data = await res.json();
        console.log('[OffersBanner] Response:', data);
        if (data.success) {
          const enabledOffers = data.data.filter((o: FieldOffer) => o.enabled);
          console.log('[OffersBanner] Enabled offers:', enabledOffers.length);
          setOffers(enabledOffers);
        }
      } catch (err) {
        console.error('[OffersBanner] Fetch error:', err);
      }
    };
    fetchOffers();
  }, [fieldId]);

  if (!offers.length) return null;

  return (
    <div className={className}>
      <h3 className="text-lg font-bold text-[#192215] mb-4">Offers</h3>
      <div className="bg-[#3A6B22] rounded-2xl overflow-hidden relative min-h-[164px]">
        {/* Dog image */}
        <div className="absolute left-0 top-0 w-[180px] h-full hidden sm:block">
          <img
            src={dogImage}
            alt=""
            className="absolute -left-3 w-[200px] h-[190px] object-cover rounded-2xl"
            style={{
              maskImage: 'linear-gradient(to right, black 40%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 40%, transparent 100%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch">
          <div className="hidden sm:block w-[150px] flex-shrink-0" />

          <div className="flex-1 p-5 sm:py-3 sm:pr-5">
            <h4 className="text-white font-bold text-base sm:text-lg leading-tight mb-3">
              {title}
            </h4>

            <div className="backdrop-blur-md bg-white/20 border border-white/20 rounded-lg p-3 space-y-2.5">
              {offers.slice(0, 2).map((offer) => (
                <div key={offer.id} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F8F1D7] flex-shrink-0 mt-0.5" />
                  <p className="text-white text-xs leading-4">
                    <span>Grab </span>
                    <span className="font-bold">
                      {offer.purchaseSlots} Slots + {offer.freeSlots} FREE Slot{offer.freeSlots > 1 ? 's' : ''}
                    </span>
                    <span> for the {offer.validity === '1 Week' ? 'week' : 'month'}.</span>
                  </p>
                </div>
              ))}

              <button
                onClick={() => {
                  if (onBuyClick && offers[0]?.id) {
                    onBuyClick(offers[0].id);
                  } else {
                    router.push(`/fields/buy-offer?fieldId=${fieldId}`);
                  }
                }}
                className="mt-1 bg-[#192215] text-white text-xs font-semibold px-5 py-2 rounded-full hover:bg-[#0f1510] transition-colors"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersBanner;
