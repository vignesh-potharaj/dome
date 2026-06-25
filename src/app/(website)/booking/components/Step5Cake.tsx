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
  const isCakeIncluded = true; // All new packages include cake
  const isSparklerFree = selectedPackage ? ['vibe', 'magic', 'elite', 'luxury'].includes(selectedPackage) : false;
  const hasCakeSelected = selectedCake && selectedCake !== 'none';
  
  const canContinue = selectedCake && (selectedCake === 'none' || cakeMessage.trim() !== '');

  // Get package specific cake size for the message
  const cakeSizeText = selectedPackage && ['elite', 'luxury'].includes(selectedPackage) ? '1 Kg' : '500g';

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[80px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#FFFFFF] text-center mb-4">
        CELEBRATION CAKE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#94A3B8] text-center mb-12 max-w-xl">
        Your package includes a complimentary {cakeSizeText} celebration cake! Select your preferred flavour below (Premium upgrades available).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {cakeFlavours.map((cake) => {
          const isSelected = selectedCake === cake.id;
          
          let pricingText = '';
          if (cake.id !== 'none') {
            if (cake.isPremium) {
              pricingText = '+₹250';
            } else {
              pricingText = 'Included';
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
                border: isSelected ? '1px solid #00A7FA' : '1px solid rgba(0,167,250,0.18)',
                background: isSelected ? 'rgba(0,167,250,0.10)' : 'rgba(0,167,250,0.04)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.border = '1px solid rgba(0,167,250,0.4)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.border = '1px solid rgba(0,167,250,0.18)';
              }}
            >
              <div>
                {isSelected && (
                  <div className="absolute top-4 right-4 text-[#09090E] bg-[#00A7FA] w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">
                    ✓
                  </div>
                )}

                <span className="text-[28px] block mb-4">{cake.emoji}</span>
                <h3 className="font-display font-light text-[20px] text-[#FFFFFF] mb-2 leading-snug">
                  {cake.name}
                </h3>
                <p className="font-sans font-light text-[12px] text-[#94A3B8] leading-relaxed mb-4">
                  {cake.desc}
                </p>
              </div>

              {pricingText && (
                <div className="font-sans font-medium text-[12px] tracking-[0.1em] text-[#00A7FA] mt-2">
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
          className="flex flex-col gap-6 mt-12 bg-[rgba(0,167,250,0.03)] border border-[rgba(0,167,250,0.15)] px-8 py-6 rounded-[4px] w-full max-w-xl"
        >
          {/* Eggless & Sparklers Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <span className="font-sans text-[13px] text-[#94A3B8]">
                Eggless Cake
              </span>
              <ToggleSwitch
                value={eggless}
                onChange={v => onUpdate('eggless', v)}
              />
              <span className="font-sans font-medium text-[12px] text-[#00A7FA]">
                +₹250
              </span>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-[rgba(0,167,250,0.2)]" />

            <div className="flex items-center gap-4">
              <span className="font-sans text-[13px] text-[#94A3B8]">
                Add Sparkler Candle
              </span>
              <ToggleSwitch
                value={sparklers}
                onChange={v => onUpdate('sparklers', v)}
              />
              <span className="font-sans font-medium text-[12px] text-[#00A7FA]">
                {isSparklerFree ? '+₹0 (Included)' : '+₹149'}
              </span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[rgba(0,167,250,0.15)]" />

          {/* Cake Message Input */}
          <div className="flex flex-col">
            <label className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#94A3B8] uppercase mb-2">
              Message on Cake *
            </label>
            <input
              type="text"
              value={cakeMessage}
              onChange={e => onUpdate('customer', { ...customer, cakeMessage: e.target.value })}
              placeholder="e.g. Happy Birthday Priya"
              maxLength={50}
              className="w-full bg-[rgba(9,9,14,0.7)] border border-[rgba(0,167,250,0.4)] rounded-[2px] p-3 text-[#FFFFFF] font-sans text-[13px] outline-none focus:border-[#00A7FA]"
            />
          </div>
        </motion.div>
      )}

      {selectedCake && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center py-5 px-6"
          style={{
            background: 'linear-gradient(to top, rgba(9,9,14,0.95) 60%, rgba(9,9,14,0))',
            backdropFilter: 'blur(12px)',
          }}
        >
          <motion.button
            whileHover={canContinue ? { scale: 1.03 } : {}}
            whileTap={canContinue ? { scale: 0.97 } : {}}
            disabled={!canContinue}
            onClick={onNext}
            style={{
              padding: '16px 64px',
              background: canContinue
                ? 'linear-gradient(135deg, #00A7FA, #0090d6)'
                : 'rgba(0,167,250,0.15)',
              color: canContinue ? '#FFFFFF' : 'rgba(0,167,250,0.4)',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              fontFamily: 'Inter', fontWeight: 600, fontSize: '13px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              border: 'none', borderRadius: '4px',
              boxShadow: canContinue
                ? '0 0 30px rgba(0,167,250,0.4), 0 4px 15px rgba(0,0,0,0.3)'
                : 'none',
              transition: 'all 0.3s ease',
            }}
            className={canContinue ? "hover:shadow-[0_0_40px_rgba(0,167,250,0.6)] transition-all duration-300" : "transition-all duration-300"}
          >
            Continue →
          </motion.button>
        </motion.div>
      )}

    </div>
  );
}
