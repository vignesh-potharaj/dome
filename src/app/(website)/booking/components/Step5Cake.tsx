'use client';

import { motion } from 'framer-motion';
import ToggleSwitch from './ToggleSwitch';

const cakeFlavours = [
  {
    id: 'none',
    name: 'No Cake',
    desc: "Skip the cake — we'll handle the rest",
    emoji: '✦',
    surcharge: 0,
    isPremium: false,
  },
  {
    id: 'chocolate',
    name: 'Dark Chocolate',
    desc: 'Rich chocolate layers decorated with golden accents',
    emoji: '🍫',
    surcharge: 0,
    isPremium: false,
  },
  {
    id: 'black-forest',
    name: 'Black Forest',
    desc: 'Classic blend of chocolate curls, fresh cherries, and cream',
    emoji: '🍒',
    surcharge: 0,
    isPremium: false,
  },
  {
    id: 'white-forest',
    name: 'White Forest',
    desc: 'Soft vanilla sponge layered with white chocolate shavings and cherries',
    emoji: '🍰',
    surcharge: 0,
    isPremium: false,
  },
  {
    id: 'butterscotch',
    name: 'Butterscotch',
    desc: 'Vanilla cake with crunchy butterscotch pearls and caramel drizzle',
    emoji: '🍮',
    surcharge: 0,
    isPremium: false,
  },
  {
    id: 'red-velvet',
    name: 'Premium Red Velvet',
    desc: 'Elegant red velvet cake layered with rich cream cheese frosting',
    emoji: '🎂',
    surcharge: 250,
    isPremium: true,
  },
  {
    id: 'chocolate-truffle',
    name: 'Premium Chocolate Truffle',
    desc: 'Decadent layers of dense chocolate cake and dark chocolate truffle ganache',
    emoji: '🧁',
    surcharge: 250,
    isPremium: true,
  },
];

interface Step5CakeProps {
  selectedCake: string | null;
  sparklers: boolean;
  eggless: boolean;
  cakeMessage: string;
  customer: any;
  selectedPackage: string | null;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
}

export default function Step5Cake({ 
  selectedCake, 
  sparklers, 
  eggless, 
  cakeMessage,
  customer,
  selectedPackage, 
  onUpdate, 
  onNext 
}: Step5CakeProps) {
  const isGrand = selectedPackage === 'grand';
  const hasCakeSelected = selectedCake && selectedCake !== 'none';
  
  const canContinue = selectedCake && (selectedCake === 'none' || cakeMessage.trim() !== '');

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[80px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#F5EDD8] text-center mb-4">
        CELEBRATION CAKE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#B8A882] text-center mb-12 max-w-xl">
        {isGrand 
          ? "Your Grand Package includes a complimentary celebration cake! Select your preferred flavour below (Premium upgrades available)."
          : "Add a delicious cake to complete your experience. Choose from our standard or premium flavours."
        }
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {cakeFlavours.map((cake) => {
          const isSelected = selectedCake === cake.id;
          
          let pricingText = '';
          if (cake.id !== 'none') {
            if (cake.isPremium) {
              pricingText = isGrand ? '+₹250' : '+₹599';
            } else {
              pricingText = isGrand ? 'Included' : '+₹349';
            }
          }

          return (
            <div
              key={cake.id}
              onClick={() => {
                onUpdate('cakeOption', cake.id);
                if (cake.id === 'none') {
                  onUpdate('eggless', false);
                  onUpdate('sparklers', false);
                  onUpdate('customer', { ...customer, cakeMessage: '' });
                }
              }}
              className="relative w-full p-6 rounded-[2px] cursor-pointer transition-all duration-300 flex flex-col justify-between"
              style={{
                border: isSelected ? '1px solid #C9973A' : '1px solid rgba(201,151,58,0.18)',
                background: isSelected ? 'rgba(201,151,58,0.10)' : 'rgba(201,151,58,0.04)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.border = '1px solid rgba(201,151,58,0.4)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.border = '1px solid rgba(201,151,58,0.18)';
              }}
            >
              <div>
                {isSelected && (
                  <div className="absolute top-4 right-4 text-[#080604] bg-[#C9973A] w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">
                    ✓
                  </div>
                )}

                <span className="text-[28px] block mb-4">{cake.emoji}</span>
                <h3 className="font-display font-light text-[20px] text-[#F5EDD8] mb-2 leading-snug">
                  {cake.name}
                </h3>
                <p className="font-sans font-light text-[12px] text-[#B8A882] leading-relaxed mb-4">
                  {cake.desc}
                </p>
              </div>

              {pricingText && (
                <div className="font-sans font-medium text-[12px] tracking-[0.1em] text-[#C9973A] mt-2">
                  {pricingText}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasCakeSelected && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 mt-12 bg-[rgba(201,151,58,0.03)] border border-[rgba(201,151,58,0.15)] px-8 py-6 rounded-[4px] w-full max-w-xl"
        >
          {/* Eggless & Sparklers Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <span className="font-sans text-[13px] text-[#B8A882]">
                Eggless Cake
              </span>
              <ToggleSwitch
                value={eggless}
                onChange={v => onUpdate('eggless', v)}
              />
              <span className="font-sans font-medium text-[12px] text-[#C9973A]">
                +₹250
              </span>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-[rgba(201,151,58,0.2)]" />

            <div className="flex items-center gap-4">
              <span className="font-sans text-[13px] text-[#B8A882]">
                Add Sparkler Candle
              </span>
              <ToggleSwitch
                value={sparklers}
                onChange={v => onUpdate('sparklers', v)}
              />
              <span className="font-sans font-medium text-[12px] text-[#C9973A]">
                {isGrand ? '+₹0 (Included)' : '+₹149'}
              </span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[rgba(201,151,58,0.15)]" />

          {/* Cake Message Input */}
          <div className="flex flex-col">
            <label className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#B8A882] uppercase mb-2">
              Message on Cake *
            </label>
            <input
              type="text"
              value={cakeMessage}
              onChange={e => onUpdate('customer', { ...customer, cakeMessage: e.target.value })}
              placeholder="e.g. Happy Birthday Priya"
              maxLength={50}
              className="w-full bg-[rgba(8,6,4,0.7)] border border-[rgba(201,151,58,0.4)] rounded-[2px] p-3 text-[#F5EDD8] font-sans text-[13px] outline-none focus:border-[#C9973A]"
            />
          </div>
        </motion.div>
      )}

      {selectedCake && (
        <motion.button
          disabled={!canContinue}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNext}
          style={{
            marginTop: '48px',
            padding: '14px 56px',
            background: canContinue ? '#C9973A' : 'rgba(201,151,58,0.2)',
            color: canContinue ? '#080604' : 'rgba(201,151,58,0.4)',
            cursor: canContinue ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter', fontWeight: 500, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            border: 'none', borderRadius: '2px',
            transition: 'all 0.3s ease',
          }}
          className="hover:bg-[#E8B96A] transition-colors"
        >
          Continue →
        </motion.button>
      )}

    </div>
  );
}
