import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

// Image imports (these would be your actual image paths)
const imgChip = '/tmp/f1b998b054ed1c8d78c778006f40226242b6fdcc.svg';
const imgTickSquare = '/tmp/ba4c1d99e53b28a69b0b484362a52fcbfeafe4d3.svg';
const imgTickCircle = '/tmp/30ad3d297ffb465eac6411b93ad6769845bd7bdd.svg';
const imgVuesaxBoldTrash = '/tmp/6f2cb1407e19975d4c20b873c5b68c84053e7063.svg';

// Trash Icon Component
function TrashIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 5.98C17.67 5.65 14.32 5.48 10.98 5.48C9 5.48 7.02 5.58 5.04 5.78L3 5.98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-red"/>
      <path d="M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-red"/>
      <path d="M18.85 9.14L18.2 19.21C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-red"/>
    </svg>
  );
}

// Credit Card Component
function CreditCard({ cardNumber, isDefault, onToggleDefault, onDelete }) {
  return (
    <div className="relative bg-light ">
      {/* Card Shadow */}
      <div className="absolute bg h-[120px] ml-4 mt-14 rounded-xl shadow-lg w-[296px]" />
      
      {/* Card */}
      <div className="relative h-44 w-[328px] overflow-hidden rounded-xl bg-green-light">
        {/* Card Background Pattern */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        
        {/* Chip */}
        <div className="absolute top-4 left-4 w-12 h-10">
          <div className="w-full h-full bg-yellow-400 rounded" />
        </div>
        
        {/* Card Logo */}
        <div className="absolute top-4 right-4 w-10 h-6">
          <div className="flex gap-1">
            <div className="w-5 h-5 bg-red-500 rounded-full opacity-80" />
            <div className="w-5 h-5 bg-yellow-500 rounded-full opacity-80 -ml-2" />
          </div>
        </div>
        
        {/* Card Number */}
        <div 
          className="absolute left-4 text-white text-lg font-bold tracking-wider"
          style={{ 
            top: '50%',
            transform: 'translateY(-20px)',
            textShadow: '0px 1px 2px rgba(0,0,0,0.24)',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          XXXX  XXXX  XXXX  {cardNumber}
        </div>
        
        {/* Card Holder Name */}
        <div 
          className="absolute left-4 text-white text-sm font-semibold uppercase"
          style={{ 
            top: '50%',
            transform: 'translateY(20px)',
            textShadow: '0px 0px 1px rgba(0,0,0,0.4)',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          DAVID WOOD
        </div>
        
        {/* Valid Thru */}
        <div 
          className="absolute left-4 text-white text-xs font-medium"
          style={{ 
            top: '50%',
            transform: 'translateY(60px)',
            textShadow: '0px 0px 1px rgba(0,0,0,0.4)',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          Valid thru: MM/YYYY
        </div>
        
        {/* CVV */}
        <div 
          className="absolute right-4 text-white text-sm font-bold"
          style={{ 
            top: '50%',
            transform: 'translateY(60px)',
            textShadow: '0px 0px 1px rgba(0,0,0,0.4)',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          CVV
        </div>
      </div>
      
      {/* Card Controls */}
      <div className="flex items-center justify-between mt-4 px-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={onToggleDefault}
            className="w-5 h-5 bg-white accent-green appearance-none border-2 border-gray-300 rounded checked:bg-green checked:border-green focus:outline-none focus:ring-1 focus:ring-green/20"
          />
          <span 
            className="text-sm font-medium text-dark-green font-sans"
          >
            {isDefault ? 'Default card' : 'Make default'}
          </span>
        </label>
        <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default function SavedCards() {
  const [cards, setCards] = useState([
    { id: 1, number: '8456', isDefault: true },
    { id: 2, number: '2546', isDefault: false }
  ]);

  const [formData, setFormData] = useState({
    cardNumber: '',
    nameOnCard: '',
    validThru: '',
    cvv: '',
    makeDefault: false
  });

  const handleToggleDefault = (cardId) => {
    setCards(cards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
  };

  const handleDeleteCard = (cardId) => {
    setCards(cards.filter(card => card.id !== cardId));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveCard = () => {
    // Add validation and save logic here
    console.log('Saving card:', formData);
    // Reset form after save
    setFormData({
      cardNumber: '',
      nameOnCard: '',
      validThru: '',
      cvv: '',
      makeDefault: false
    });
  };

  return (
    <div className="min-h-screen bg-light xl:mt-32 mt-16 pb-16">
      <div className="container mx-auto px-20">
        {/* Page Title */}
        <div className="flex items-center gap-4 mb-8">
          <button className="w-12 h-12 bg-cream rounded-full flex items-center justify-center">
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
                {cards.map(card => (
                  <CreditCard
                    key={card.id}
                    cardNumber={card.number}
                    isDefault={card.isDefault}
                    onToggleDefault={() => handleToggleDefault(card.id)}
                    onDelete={() => handleDeleteCard(card.id)}
                  />
                ))}
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

            <div className="space-y-6">
              {/* Card Number and Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ 
                      color: '#192215',
                      fontFamily: "'DM Sans', sans-serif"
                    }}
                  >
                    Card Number
                  </label>
                  <Input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="Enter card number"
                    className="py-3 border-[#e3e3e3] focus:border-green font-sans"
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ 
                      color: '#192215',
                      fontFamily: "'DM Sans', sans-serif"
                    }}
                  >
                    Name on Card
                  </label>
                  <Input
                    type="text"
                    name="nameOnCard"
                    value={formData.nameOnCard}
                    onChange={handleInputChange}
                    placeholder="Enter name on card"
                    className="py-3 border-[#e3e3e3] focus:border-green font-sans"
                  />
                </div>
              </div>

              {/* Valid Thru and CVV Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ 
                      color: '#192215',
                      fontFamily: "'DM Sans', sans-serif"
                    }}
                  >
                    Valid Thru
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="validThru"
                      value={formData.validThru}
                      onChange={handleInputChange}
                      placeholder="Valid thru: MM/YYYY"
                      className="py-3 pr-12 border-[#e3e3e3] focus:border-green font-sans"
                    />
                    {formData.validThru && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="9" fill="#3A6B22"/>
                          <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ 
                      color: '#192215',
                      fontFamily: "'DM Sans', sans-serif"
                    }}
                  >
                    CVV
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="Enter CVV"
                      className="py-3 pr-12 border-[#e3e3e3] focus:border-green font-sans"
                    />
                    {formData.cvv && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="9" fill="#3A6B22"/>
                          <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Make Default Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="makeDefault"
                  checked={formData.makeDefault}
                  onChange={handleInputChange}
                  className="w-5 h-5 bg-white accent-green appearance-none border-2 border-gray-300 rounded checked:bg-green checked:border-green focus:outline-none focus:ring-1 focus:ring-green/20"
                />
                <span 
                  className="text-sm font-medium"
                  style={{ 
                    color: '#192215',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                >
                  Make default
                </span>
              </label>

              {/* Save Button */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleSaveCard}
                  className="px-12 py-3 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: '#3A6B22',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                >
                  Save Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}