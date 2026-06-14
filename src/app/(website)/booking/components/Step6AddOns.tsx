'use client';

import { motion } from 'framer-motion';

export const addOnsList = [
  {
    id: 'led-name',
    name: 'Custom LED Name Sign',
    desc: 'Light-up letters customized with your name or message (₹49 per letter)',
    price: 49,
    icon: '💡',
  },
  {
    id: 'sparkling-candle',
    name: 'Sparkling Candle',
    desc: 'High-sparkle pyrotechnic candle for cake cutting ceremony',
    price: 70,
    icon: '✨',
  },
  {
    id: 'blindfold',
    name: 'Satin Blindfold',
    desc: 'Premium satin blindfold for a perfect surprise entry experience',
    price: 100,
    icon: '🙈',
  },
  {
    id: 'personalised-letter',
    name: 'Personalised Letter',
    desc: 'A beautifully written message printed on premium parchment paper',
    price: 100,
    icon: '✉️',
  },
  {
    id: 'sash-tiara',
    name: 'Celebration Sash & Tiara',
    desc: 'Elegant satin sash and crystal tiara for the guest of honour',
    price: 200,
    icon: '👑',
  },
  {
    id: 'photo-frame',
    name: 'Memory Photo Frame',
    desc: 'Keep the memory alive with a beautifully designed tabletop photo frame',
    price: 200,
    icon: '🖼️',
  },
  {
    id: 'foil-balloon',
    name: '1 Foil Balloon',
    desc: 'Single premium helium-filled metallic foil balloon (Heart or Star)',
    price: 200,
    icon: '🎈',
  },
  {
    id: 'photo-prints',
    name: '5 Photo Prints',
    desc: 'Five high-gloss instant prints of your special moments',
    price: 200,
    icon: '📸',
  },
  {
    id: 'balloon-stands',
    name: 'Balloon Stands (x2)',
    desc: 'Two elegant multi-balloon stands matching your colour theme',
    price: 400,
    icon: '📍',
  },
  {
    id: 'heart-balloons',
    name: 'Heart-Shaped Balloons',
    desc: 'A beautiful bouquet of helium heart-shaped balloons',
    price: 500,
    icon: '💖',
  },
  {
    id: 'rose-bouquet',
    name: 'Premium Rose Bouquet',
    desc: 'A hand-tied bouquet of fresh, selected red roses',
    price: 600,
    icon: '💐',
  },
  {
    id: 'flower-entrance',
    name: 'Rose Petals Entrance',
    desc: 'Pathway carpeted with fresh, fragrant rose petals',
    price: 750,
    icon: '🌹',
  },
  {
    id: 'chrome-balloons',
    name: 'Chrome Balloons Upgrade',
    desc: 'Upgrade standard balloons to premium high-shine metallic chrome balloons',
    price: 1000,
    icon: '✨',
  },
  {
    id: 'coldfire-2',
    name: '2 Coldfire Entry',
    desc: 'Two cold-spark pyrotechnic launchers for a dramatic entrance',
    price: 1000,
    icon: '🎆',
  },
  {
    id: 'coldfire-4',
    name: '4 Coldfire Entry',
    desc: 'Four cold-spark pyrotechnic launchers for a spectacular entrance',
    price: 1500,
    icon: '🎆',
  },
  {
    id: 'coldfire-6',
    name: '6 Coldfire Entry',
    desc: 'Six cold-spark pyrotechnic launchers for the ultimate grand entrance',
    price: 2000,
    icon: '🎆',
  },
  {
    id: 'fog-entry',
    name: 'Heavy Fog Entry',
    desc: 'Low-lying dry ice heavy fog effect creating a walking-on-clouds feeling',
    price: 1500,
    icon: '🌫️',
  },
  {
    id: 'photographer',
    name: 'Professional Photographer',
    desc: 'Dedicated photographer for 1 hour, including digital delivery of edited photos',
    price: 2500,
    icon: '📷',
  },
  {
    id: 'guitarist',
    name: 'Acoustic Guitarist',
    desc: 'Live musician playing romantic acoustic melodies inside your dome',
    price: 5000,
    icon: '🎸',
  },
];

interface Step6AddOnsProps {
  selectedAddOns: string[];
  ledName: string;
  totalPrice: number;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
}

export default function Step6AddOns({ selectedAddOns, ledName, totalPrice, onUpdate, onNext }: Step6AddOnsProps) {
  
  const handleToggle = (id: string) => {
    let newAddOns = [...selectedAddOns];
    
    if (newAddOns.includes(id)) {
      newAddOns = newAddOns.filter(a => a !== id);
      if (id === 'led-name') {
        onUpdate('ledName', '');
      }
    } else {
      // Mutual exclusion for Coldfire entry options
      if (id === 'coldfire-2') {
        newAddOns = newAddOns.filter(a => a !== 'coldfire-4' && a !== 'coldfire-6');
      } else if (id === 'coldfire-4') {
        newAddOns = newAddOns.filter(a => a !== 'coldfire-2' && a !== 'coldfire-6');
      } else if (id === 'coldfire-6') {
        newAddOns = newAddOns.filter(a => a !== 'coldfire-2' && a !== 'coldfire-4');
      }
      newAddOns.push(id);
    }
    
    onUpdate('addOns', newAddOns);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[100vh] w-full pt-[100px] px-6 pb-[140px] overflow-y-auto">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#F5EDD8] text-center mb-3">
        MAKE IT UNFORGETTABLE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#B8A882] text-center mb-16">
        Select as many as you like — all added to your booking
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {addOnsList.map((addon) => {
          const isSelected = selectedAddOns.includes(addon.id);

          return (
            <div
              key={addon.id}
              onClick={() => handleToggle(addon.id)}
              className="relative w-full p-6 rounded-[2px] cursor-pointer transition-all duration-300 flex flex-col justify-between"
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
              <div>
                {isSelected && (
                  <div className="absolute top-4 right-4 text-[#080604] bg-[#C9973A] w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold z-10">
                    ✓
                  </div>
                )}

                <span className="text-[28px]">{addon.icon}</span>
                <h3 className="font-sans font-medium text-[14px] text-[#F5EDD8] mt-3">
                  {addon.name}
                </h3>
                <p className="font-sans font-light text-[12px] text-[#B8A882] mt-1 mb-4 leading-relaxed">
                  {addon.desc}
                </p>
              </div>

              <div>
                <p className="font-display font-normal text-[18px] text-[#C9973A] mt-2 mb-2">
                  {addon.id === 'led-name' ? '₹49 / letter' : `+₹${addon.price}`}
                </p>
              </div>
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
