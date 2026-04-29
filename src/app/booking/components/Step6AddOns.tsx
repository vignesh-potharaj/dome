'use client';

import { motion } from 'framer-motion';

export const addOnsList = [
  {
    id: 'photo-booth',
    name: 'Photo Booth Props',
    desc: 'Curated prop box: signs, frames, hats, hearts',
    price: 199,
    icon: '📸',
  },
  {
    id: 'fog-machine',
    name: 'Fog Machine Entry',
    desc: 'Low-lying fog as you enter the dome — cinematic',
    price: 299,
    icon: '🌫️',
  },
  {
    id: 'petal-shower',
    name: 'Rose Petal Shower',
    desc: 'Petals rain from the dome ceiling at your signal',
    price: 249,
    icon: '🌹',
  },
  {
    id: 'guitarist',
    name: 'Live Guitarist (30 min)',
    desc: 'Acoustic performance inside the dome',
    price: 799,
    icon: '🎸',
  },
  {
    id: 'polaroid',
    name: 'Polaroid Prints ×20',
    desc: 'Instant printed memories, delivered before you leave',
    price: 349,
    icon: '🖼️',
  },
  {
    id: 'message-bottle',
    name: 'Message in a Bottle',
    desc: 'A handwritten note sealed in a vintage glass bottle',
    price: 199,
    icon: '💌',
  },
  {
    id: 'mocktail',
    name: 'Signature Mocktail Set',
    desc: 'Two themed mocktails served in special glasses',
    price: 299,
    icon: '🥂',
  },
  {
    id: 'video-reel',
    name: 'Cinematic Video Reel',
    desc: '60-sec edited reel of your session — shared in 48hrs',
    price: 599,
    icon: '🎬',
  },
];

interface Step6AddOnsProps {
  selectedAddOns: string[];
  totalPrice: number;
  onUpdate: (key: string, value: string[]) => void;
  onNext: () => void;
}

export default function Step6AddOns({ selectedAddOns, totalPrice, onUpdate, onNext }: Step6AddOnsProps) {
  
  const handleToggle = (id: string) => {
    if (selectedAddOns.includes(id)) {
      onUpdate('addOns', selectedAddOns.filter(a => a !== id));
    } else {
      onUpdate('addOns', [...selectedAddOns, id]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[100vh] w-full pt-[100px] px-6 pb-[140px] overflow-y-auto">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#F5EDD8] text-center mb-3">
        MAKE IT UNFORGETTABLE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#B8A882] text-center mb-16">
        Select as many as you like — all added to your booking
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl">
        {addOnsList.map((addon) => {
          const isSelected = selectedAddOns.includes(addon.id);

          return (
            <div
              key={addon.id}
              onClick={() => handleToggle(addon.id)}
              className="relative w-full p-6 rounded-[2px] cursor-pointer transition-all duration-300 flex flex-col"
              style={{
                border: isSelected ? '1px solid #C9973A' : '1px solid rgba(201,151,58,0.15)',
                background: isSelected ? 'rgba(201,151,58,0.10)' : 'rgba(201,151,58,0.03)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.border = '1px solid rgba(201,151,58,0.35)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.border = '1px solid rgba(201,151,58,0.15)';
              }}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-[#080604] bg-[#C9973A] w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">
                  ✓
                </div>
              )}

              <span className="text-[28px]">{addon.icon}</span>
              <h3 className="font-sans font-medium text-[14px] text-[#F5EDD8] mt-3">
                {addon.name}
              </h3>
              <p className="font-sans font-light text-[12px] text-[#B8A882] mt-1 flex-grow">
                {addon.desc}
              </p>
              <p className="font-display font-normal text-[18px] text-[#C9973A] mt-3">
                +₹{addon.price}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '80px', zIndex: 50,
        background: 'rgba(8,6,4,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(201,151,58,0.15)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5%',
      }}>
        <div className="flex flex-col">
          <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#B8A882', marginBottom: '2px' }}>
            {selectedAddOns.length} add-on{selectedAddOns.length !== 1 ? 's' : ''} selected
          </span>
          <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', color: '#C9973A', lineHeight: 1 }}>
            ₹{totalPrice}
          </span>
        </div>
        <button 
          onClick={onNext}
          className="hover:bg-[#E8B96A] transition-colors"
          style={{
            padding: '14px 48px',
            background: '#C9973A', color: '#080604',
            fontFamily: 'Inter', fontWeight: 500, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            border: 'none', borderRadius: '2px', cursor: 'pointer',
          }}
        >
          Continue →
        </button>
      </div>

    </div>
  );
}
