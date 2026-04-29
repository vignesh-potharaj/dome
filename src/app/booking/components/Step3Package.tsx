'use client';

import { useRef, MouseEvent } from 'react';
import { motion } from 'framer-motion';

const packages = [
  {
    id: 'classic',
    name: 'CLASSIC',
    price: 999,
    duration: '1.5 hrs',
    tag: null,
    features: [
      'Private glass dome',
      'Balloon arch décor',
      'LED name sign',
      'Rose petals on table',
      'Candle arrangement',
      'Seating for 2',
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: 1499,
    duration: '1.5 hrs',
    tag: 'MOST POPULAR',
    features: [
      'Everything in Classic',
      'Floral arch upgrade',
      'Welcome mocktail for 2',
      'Polaroid camera (10 shots)',
      'Ribbon ceiling drape',
      'Priority time slot access',
    ],
  },
  {
    id: 'grand',
    name: 'GRAND',
    price: 2199,
    duration: '2 hrs',
    tag: 'BEST EXPERIENCE',
    features: [
      'Everything in Premium',
      'Custom neon LED sign',
      'Celebration cake + sparklers',
      'Dedicated dome host',
      'Short video reel edit (delivered in 48hrs)',
      'Take-home balloon bouquet',
    ],
  },
];

interface Step3PackageProps {
  selectedPackage: string | null;
  onUpdate: (key: string, value: string) => void;
  onNext: () => void;
}

export default function Step3Package({ selectedPackage, onUpdate, onNext }: Step3PackageProps) {
  
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rY = (x - 0.5) * 14;
    const rX = (y - 0.5) * -10;
    ref.current.style.transform = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg)`;
  };

  const handleMouseLeave = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[64px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#F5EDD8] text-center mb-3">
        CHOOSE YOUR DOME PACKAGE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#B8A882] text-center mb-16">
        All packages include private dome access, personalised décor & dining
      </p>

      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8 md:gap-6 justify-center items-stretch md:items-center">
        {packages.map((pkg, i) => {
          const isCenter = i === 1;
          const isSelected = selectedPackage === pkg.id;
          const cardRef = useRef<HTMLDivElement>(null);

          return (
            <div
              key={pkg.id}
              className={`w-full md:w-1/3 flex ${isCenter ? 'z-10' : 'z-0'}`}
              onClick={() => onUpdate('package', pkg.id)}
            >
              <div 
                ref={cardRef}
                onMouseMove={(e) => handleMouseMove(e, cardRef)}
                onMouseLeave={() => handleMouseLeave(cardRef)}
                style={{ 
                  transition: 'transform 0.15s ease, border 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                  border: isSelected ? '1px solid #C9973A' : isCenter ? '1px solid rgba(201,151,58,0.4)' : '1px solid rgba(201,151,58,0.2)',
                  boxShadow: isSelected ? '0 0 40px rgba(201,151,58,0.2)' : isCenter ? '0 0 60px rgba(201,151,58,0.18)' : 'none',
                  background: isSelected ? 'rgba(201,151,58,0.08)' : 'rgba(201,151,58,0.04)'
                }}
                className={`w-full relative flex flex-col backdrop-blur-sm p-8 md:p-10 cursor-pointer
                  ${isCenter ? 'md:scale-y-[1.05] origin-bottom' : 'mt-4 md:mt-0'}
                `}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 text-[#080604] bg-[#C9973A] w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold z-20">
                    ✓
                  </div>
                )}

                {pkg.tag && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#C9973A] text-[#080604] px-4 py-1 font-sans font-medium text-[10px] tracking-[0.2em] uppercase z-20 whitespace-nowrap">
                    {pkg.tag}
                  </div>
                )}
                
                <p className="font-sans font-medium text-[12px] tracking-[0.2em] text-[#C9973A] mb-2 uppercase text-center mt-2">
                  {pkg.name}
                </p>
                <div className="text-center mb-1">
                  <span className="font-display font-semibold text-[48px] md:text-[64px] text-[#C9973A] leading-none">
                    ₹{pkg.price}
                  </span>
                </div>
                <p className="font-sans font-light text-[12px] text-[#B8A882] text-center mb-8 pb-8 border-b border-[rgba(201,151,58,0.15)]">
                  for two
                </p>
                
                <ul className="flex flex-col gap-4 flex-grow">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-[#C9973A] text-[10px] mt-1">✦</span>
                      <span className="font-sans font-light text-[13px] text-[#B8A882] leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

              </div>
            </div>
          );
        })}
      </div>

      {selectedPackage && (
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
