'use client';

import { motion } from 'framer-motion';

const balloonColors = [
  { id: 'rose-gold',  label: 'Rose Gold',   colors: ['#B76E79', '#C9973A', '#E8C4B8'] },
  { id: 'red-hearts', label: 'Classic Red', colors: ['#8B0000', '#CC0000', '#FF4444'] },
  { id: 'blush-pink', label: 'Blush Pink',  colors: ['#FFB6C1', '#FF69B4', '#FFC0CB'] },
  { id: 'gold-white', label: 'Gold & White',colors: ['#C9973A', '#E8B96A', '#FFFFFF'] },
  { id: 'purple',     label: 'Royal Purple',colors: ['#4B0082', '#7B2FBE', '#9B59B6'] },
  { id: 'custom',     label: 'Surprise Me', colors: ['#C9973A', '#080604', '#F5EDD8'] },
];

interface Step4BalloonProps {
  selectedColor: string | null;
  onUpdate: (key: string, value: string) => void;
  onNext: () => void;
}

export default function Step4Balloon({ selectedColor, onUpdate, onNext }: Step4BalloonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[64px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#F5EDD8] text-center mb-3">
        CHOOSE YOUR BALLOON PALETTE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#B8A882] text-center mb-16">
        Your dome will be decorated in your chosen colour theme
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-16 max-w-3xl">
        {balloonColors.map((palette) => {
          const isSelected = selectedColor === palette.id;
          const isSurprise = palette.id === 'custom';

          return (
            <div 
              key={palette.id}
              className="flex flex-col items-center gap-6 cursor-pointer group"
              onClick={() => onUpdate('balloonColor', palette.id)}
            >
              <div 
                className={`w-[100px] h-[100px] rounded-full transition-all duration-300 relative
                  ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                  ${isSurprise ? 'animate-[spin_6s_linear_infinite]' : ''}
                `}
                style={{
                  background: `conic-gradient(
                    ${palette.colors[0]} 0% 33%,
                    ${palette.colors[1]} 33% 66%,
                    ${palette.colors[2]} 66% 100%
                  )`,
                  outline: isSelected ? '3px solid #C9973A' : 'none',
                  outlineOffset: '4px',
                }}
              />
              <span className={`font-sans font-light text-[12px] transition-colors
                ${isSelected ? 'text-[#F5EDD8] font-medium' : 'text-[#B8A882]'}
              `}>
                {palette.label}
              </span>
            </div>
          );
        })}
      </div>

      {selectedColor && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNext}
          style={{
            marginTop: '64px',
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
