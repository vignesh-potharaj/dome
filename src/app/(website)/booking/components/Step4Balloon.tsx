'use client';

import { motion } from 'framer-motion';

const balloonColors = [
  { id: 'rose-gold',  label: 'Rose Gold',   colors: ['#B76E79', '#00A7FA', '#E8C4B8'] },
  { id: 'red-hearts', label: 'Classic Red', colors: ['#8B0000', '#CC0000', '#FF4444'] },
  { id: 'blush-pink', label: 'Blush Pink',  colors: ['#FFB6C1', '#FF69B4', '#FFC0CB'] },
  { id: 'gold-white', label: 'Gold & White',colors: ['#00A7FA', '#89D0FF', '#FFFFFF'] },
  { id: 'purple',     label: 'Royal Purple',colors: ['#4B0082', '#7B2FBE', '#9B59B6'] },
  { id: 'custom',     label: 'Surprise Me', colors: ['#00A7FA', '#09090E', '#FFFFFF'] },
];

interface Step4BalloonProps {
  selectedColor: string | null;
  onUpdate: (key: string, value: string) => void;
  onNext: () => void;
}

export default function Step4Balloon({ selectedColor, onUpdate, onNext }: Step4BalloonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[64px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#FFFFFF] text-center mb-3">
        CHOOSE YOUR BALLOON PALETTE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#94A3B8] text-center mb-16">
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
                  outline: isSelected ? '3px solid #00A7FA' : 'none',
                  outlineOffset: '4px',
                }}
              />
              <span className={`font-sans font-light text-[12px] transition-colors
                ${isSelected ? 'text-[#FFFFFF] font-medium' : 'text-[#94A3B8]'}
              `}>
                {palette.label}
              </span>
            </div>
          );
        })}
      </div>

      {selectedColor && (
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            style={{
              padding: '16px 64px',
              background: 'linear-gradient(135deg, #00A7FA, #0090d6)',
              color: '#FFFFFF',
              fontFamily: 'Inter', fontWeight: 600, fontSize: '13px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              border: 'none', borderRadius: '4px', cursor: 'pointer',
              boxShadow: '0 0 30px rgba(0,167,250,0.4), 0 4px 15px rgba(0,0,0,0.3)',
            }}
            className="hover:shadow-[0_0_40px_rgba(0,167,250,0.6)] transition-all duration-300"
          >
            Continue →
          </motion.button>
        </motion.div>
      )}

    </div>
  );
}
