import React from 'react';
import { Trash2 } from 'lucide-react';

interface CreditCardDisplayProps {
  card: {
    id: string;
    brand: string | null;
    last4: string;
    expiryMonth: number | null;
    expiryYear: number | null;
    cardholderName: string | null;
    isDefault: boolean;
  };
  onToggleDefault?: () => void;
  onDelete?: () => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
}

export function CreditCardDisplay({
  card,
  onToggleDefault,
  onDelete,
  showCheckbox = true,
  isSelected = false,
}: CreditCardDisplayProps) {
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

          {/* Card Logo */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <img src='/chip.svg' className='w-full h-full' alt="chip" />
          </div>

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={onDelete}
              className="absolute top-3 right-14 sm:top-4 sm:right-16 text-white/80 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Card Number */}
          <div className="absolute top-1/2 -translate-y-2 sm:-translate-y-4 left-3 right-3 sm:left-4 sm:right-4">
            <p className="text-white text-[14px] sm:text-[18px] font-bold tracking-[1px] sm:tracking-[2px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.24)]">
              XXXX  XXXX  XXXX  {card.last4}
            </p>
          </div>

          {/* Card Holder */}
          <div className="absolute bottom-10 sm:bottom-12 left-3 sm:left-4">
            <p className="text-white text-[11px] sm:text-[14px] font-semibold uppercase drop-shadow-[0px_0px_1px_rgba(0,0,0,0.4)]">
              {card.cardholderName || 'CARD HOLDER'}
            </p>
          </div>

          {/* Valid Thru */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
            <p className="text-white text-[10px] sm:text-[13px] font-medium drop-shadow-[0px_0px_1px_rgba(0,0,0,0.4)]">
              Valid thru: {card.expiryMonth?.toString().padStart(2, '0')}/{card.expiryYear}
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

      {/* Selection and Default Status */}
      {showCheckbox && onToggleDefault && (
        <div className="flex items-center justify-between">
          {/* Selection Checkbox - Checking makes this card default */}
          <label
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={onToggleDefault}
          >
            {/* Custom Square Checkbox */}
            <div className="relative flex gap-2 items-center">
              <input
                type="radio"
                checked={card.isDefault}
                onChange={onToggleDefault}
                className="sr-only peer"
              />
              <div className={`w-5 h-5 sm:w-[24px] sm:h-[24px] rounded border-2 flex items-center justify-center transition-all ${
                card.isDefault
                  ? 'bg-green border-green'
                  : 'bg-white border-gray-500'
              }`}>
                {card.isDefault && (
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
               {/* Default Status Label - Updates based on card.isDefault */}
          <div>
            {card.isDefault ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full  text-[11px] sm:text-[14px] font-[500] text-dark-green">
               
                Default card
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full  text-[11px] sm:text-[14px] font-[500] text-dark-green">
                Make default
              </span>
            )}
          </div>
            </div>
          </label>

          
        </div>
      )}
    </div>
  );
}
