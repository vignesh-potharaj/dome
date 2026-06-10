'use client';

import { motion } from 'framer-motion';
import ToggleSwitch from './ToggleSwitch';

const cakeOptions = [
  {
    id: 'none',
    name: 'No Cake',
    desc: 'Skip the cake — we\'ll handle the rest',
    emoji: '✦',
    addon: null,
  },
  {
    id: 'chocolate',
    name: 'Dark Chocolate',
    desc: 'Rich Belgian chocolate with gold dust finish',
    emoji: '🍫',
    addon: '+₹349',
  },
  {
    id: 'red-velvet',
    name: 'Red Velvet',
    desc: 'Classic red velvet with cream cheese frosting',
    emoji: '🎂',
    addon: '+₹349',
  },
  {
    id: 'custom',
    name: 'Custom Message Cake',
    desc: 'We write your personal message on top',
    emoji: '✍️',
    addon: '+₹499',
  },
];

interface Step5CakeProps {
  selectedCake: string | null;
  sparklers: boolean;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
}

export default function Step5Cake({ selectedCake, sparklers, onUpdate, onNext }: Step5CakeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[64px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#F5EDD8] text-center mb-16">
        ADD A CAKE TO YOUR CELEBRATION
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {cakeOptions.map((cake) => {
          const isSelected = selectedCake === cake.id;

          return (
            <div
              key={cake.id}
              onClick={() => onUpdate('cakeOption', cake.id)}
              className="relative w-full p-6 md:p-8 rounded-[2px] cursor-pointer transition-all duration-300 flex flex-col items-start"
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
              {isSelected && (
                <div className="absolute top-4 right-4 text-[#080604] bg-[#C9973A] w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">
                  ✓
                </div>
              )}

              {cake.addon && !isSelected && (
                <div className="absolute top-6 right-6 font-sans font-medium text-[11px] tracking-[0.1em] text-[#C9973A]">
                  {cake.addon}
                </div>
              )}

              <span className="text-[24px] mb-4">{cake.emoji}</span>
              <h3 className="font-display font-light text-[22px] text-[#F5EDD8] mb-2 leading-snug">
                {cake.name}
              </h3>
              <p className="font-sans font-light text-[13px] text-[#B8A882]">
                {cake.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '48px' }}>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#B8A882' }}>
          Add sparklers to the cake
        </span>
        <ToggleSwitch
          value={sparklers}
          onChange={v => onUpdate('sparklers', v)}
        />
        <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#C9973A' }}>
          +₹149
        </span>
      </div>

      {selectedCake && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNext}
          style={{
            marginTop: '56px',
            padding: '14px 56px',
            background: '#C9973A', color: '#080604',
            fontFamily: 'Inter', fontWeight: 500, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            border: 'none', borderRadius: '2px', cursor: 'pointer',
          }}
          className="hover:bg-[#E8B96A] transition-colors"
        >
          Continue →
        </motion.button>
      )}

    </div>
  );
}
