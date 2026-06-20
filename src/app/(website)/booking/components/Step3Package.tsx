'use client';

import { useRef, MouseEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const packagesList = [
  {
    id: 'party',
    name: 'PARTY DOME',
    price: 3999,
    duration: '90 Mins',
    tag: 'BEST PRICE',
    features: [
      'Private Dome (90 Minutes)',
      '2 Mocktails',
      'Complimentary 500g Cake (Choose from available flavour options)',
      'Latex Balloon Decor (200 Balloons)',
      'Rose Petal Table Decor',
      'LED Candles',
      '3 LED Letters (HBD / Any 3 Letters)',
      'Occasion Banner',
    ],
  },
  {
    id: 'vibe',
    name: 'VIBE DOME',
    price: 5999,
    duration: '90 Mins',
    tag: 'POPULAR',
    features: [
      'Everything in Party Dome',
      'Chrome Balloon Decor (200 Balloons)',
      'LED Name Sign (instead of letters)',
      '10 Photo Prints',
      'Photo Frame',
      'Personalised Letter',
      'Foil Balloon',
      'Blindfold',
      'Sparkle Candle on Cake',
    ],
  },
  {
    id: 'magic',
    name: 'MAGIC DOME',
    price: 8999,
    duration: '90 Mins',
    tag: 'RECOMMENDED',
    features: [
      'Everything in Vibe Dome',
      'Balloon Stands',
      'Flower Petal Entrance',
      '2 Cold Fire Crackers',
      '2 Starters',
      '1 Main Course',
      '2 Desserts',
    ],
  },
  {
    id: 'elite',
    name: 'ELITE DOME',
    price: 14999,
    duration: '90 Mins',
    tag: 'PREMIUM',
    features: [
      'Everything in Magic Dome',
      'Complimentary 1 Kg Cake (Choose from available flavour options)',
      'Balloon Colour Selection (from available colours)',
      '4 Cold Fire Crackers',
      'Fog Entry',
      'Rose Bouquet',
      'Professional Photographer',
    ],
  },
  {
    id: 'luxury',
    name: 'LUXURY DOME',
    price: 19999,
    duration: '90 Mins',
    tag: 'ULTIMATE',
    features: [
      'Everything in Elite Dome',
      '6 Cold Fire Crackers',
      'Chocolate Bouquet',
      'Live Guitarist',
      'Welcome Board',
    ],
  },
];

interface FeatureRow {
  name: string;
  values: Record<string, string | boolean>;
}

const featuresList: FeatureRow[] = [
  {
    name: 'Private Dome (90 Minutes)',
    values: { party: true, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: '2 Mocktails',
    values: { party: true, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: 'Complimentary Cake',
    values: { party: '500g (Choose flavours)', vibe: '500g (Choose flavours)', magic: '500g (Choose flavours)', elite: '1 Kg (Choose flavours)', luxury: '1 Kg (Choose flavours)' },
  },
  {
    name: 'Balloon Decor (200 Balloons)',
    values: { party: 'Latex Balloons', vibe: 'Chrome Balloons', magic: 'Chrome Balloons', elite: 'Chrome Balloons', luxury: 'Chrome Balloons' },
  },
  {
    name: 'Balloon Colour Selection (from available colours)',
    values: { party: false, vibe: false, magic: false, elite: true, luxury: true },
  },
  {
    name: 'Rose Petal Table Decor',
    values: { party: true, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: 'LED Candles',
    values: { party: true, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: 'LED Name Sign / Letters',
    values: { party: '3 LED Letters (HBD/Any)', vibe: 'LED Name Sign', magic: 'LED Name Sign', elite: 'LED Name Sign', luxury: 'LED Name Sign' },
  },
  {
    name: 'Occasion Banner',
    values: { party: true, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: '10 Photo Prints',
    values: { party: false, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: 'Photo Frame',
    values: { party: false, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: 'Personalised Letter',
    values: { party: false, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: 'Foil Balloon',
    values: { party: false, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: 'Blindfold',
    values: { party: false, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: 'Sparkle Candle on Cake',
    values: { party: false, vibe: true, magic: true, elite: true, luxury: true },
  },
  {
    name: 'Balloon Stands',
    values: { party: false, vibe: false, magic: true, elite: true, luxury: true },
  },
  {
    name: 'Flower Petal Entrance',
    values: { party: false, vibe: false, magic: true, elite: true, luxury: true },
  },
  {
    name: 'Cold Fire Crackers',
    values: { party: false, vibe: false, magic: '2 Crackers', elite: '4 Crackers', luxury: '6 Crackers' },
  },
  {
    name: 'Fog Entry',
    values: { party: false, vibe: false, magic: false, elite: true, luxury: true },
  },
  {
    name: 'Rose Bouquet',
    values: { party: false, vibe: false, magic: false, elite: true, luxury: true },
  },
  {
    name: 'Professional Photographer',
    values: { party: false, vibe: false, magic: false, elite: true, luxury: true },
  },
  {
    name: 'Chocolate Bouquet',
    values: { party: false, vibe: false, magic: false, elite: false, luxury: true },
  },
  {
    name: 'Live Guitarist',
    values: { party: false, vibe: false, magic: false, elite: false, luxury: true },
  },
  {
    name: 'Welcome Board',
    values: { party: false, vibe: false, magic: false, elite: false, luxury: true },
  },
  {
    name: 'Starters',
    values: { party: false, vibe: false, magic: '2 Starters', elite: '2 Starters', luxury: '2 Starters' },
  },
  {
    name: 'Main Course',
    values: { party: false, vibe: false, magic: '1 Main Course', elite: '1 Main Course', luxury: '1 Main Course' },
  },
  {
    name: 'Desserts',
    values: { party: false, vibe: false, magic: '2 Desserts', elite: '2 Desserts', luxury: '2 Desserts' },
  },
];

interface Step3PackageProps {
  selectedPackage: string | null;
  onUpdate: (key: string, value: string) => void;
  onNext: () => void;
}

export default function Step3Package({ selectedPackage, onUpdate, onNext }: Step3PackageProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rY = (x - 0.5) * 10;
    const rX = (y - 0.5) * -7;
    ref.current.style.transform = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg)`;
  };

  const handleMouseLeave = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  };

  const renderCellValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-4 h-4 text-[#00A7FA] mx-auto" />
      ) : (
        <X className="w-4 h-4 text-gray-700 mx-auto" />
      );
    }
    return <span className="font-sans text-[12px] text-[#FFFFFF]">{value}</span>;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[100vh] w-full pt-[80px] px-4 pb-24 overflow-y-auto">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#FFFFFF] text-center mb-3 tracking-wide">
        CHOOSE YOUR DOME PACKAGE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#94A3B8] text-center mb-12 max-w-lg">
        All packages include private dome access, custom balloon theme, and a complimentary cake.
      </p>

      {/* Package Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-7xl justify-center items-stretch mb-12">
        {packagesList.map((pkg, i) => {
          const isSelected = selectedPackage === pkg.id;
          const isCenter = pkg.id === 'magic';
          const cardRef = useRef<HTMLDivElement>(null);

          return (
            <div
              key={pkg.id}
              className="flex flex-col cursor-pointer"
              onClick={() => onUpdate('package', pkg.id)}
            >
              <div 
                ref={cardRef}
                onMouseMove={(e) => handleMouseMove(e, cardRef)}
                onMouseLeave={() => handleMouseLeave(cardRef)}
                style={{ 
                  transition: 'transform 0.15s ease, border 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                  border: isSelected ? '1px solid #00A7FA' : isCenter ? '1px solid rgba(0,167,250,0.35)' : '1px solid rgba(0,167,250,0.18)',
                  boxShadow: isSelected ? '0 0 25px rgba(0,167,250,0.15)' : isCenter ? '0 0 40px rgba(0,167,250,0.08)' : 'none',
                  background: isSelected ? 'rgba(0,167,250,0.08)' : 'rgba(0,167,250,0.03)'
                }}
                className="w-full relative flex flex-col flex-grow backdrop-blur-sm p-6 rounded-[2px]"
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 text-[#09090E] bg-[#00A7FA] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-20">
                    ✓
                  </div>
                )}

                {pkg.tag && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00A7FA] text-[#09090E] px-3 py-0.5 font-sans font-semibold text-[8px] tracking-[0.15em] uppercase z-20 whitespace-nowrap">
                    {pkg.tag}
                  </div>
                )}
                
                <p className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#00A7FA] mb-2 uppercase text-center mt-2">
                  {pkg.name}
                </p>
                <div className="text-center mb-1">
                  <span className="font-display font-semibold text-[36px] text-[#00A7FA] leading-none">
                    ₹{pkg.price.toLocaleString()}
                  </span>
                </div>
                <p className="font-sans font-light text-[11px] text-[#94A3B8] text-center mb-6 pb-6 border-b border-[rgba(0,167,250,0.15)]">
                  for celebration
                </p>
                
                <ul className="flex flex-col gap-3 flex-grow">
                  {pkg.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#00A7FA] text-[8px] mt-1.5">✦</span>
                      <span className="font-sans font-light text-[12px] text-[#94A3B8] leading-snug">
                        {feature}
                      </span>
                    </li>
                  ))}
                  {pkg.features.length > 5 && (
                    <li className="font-sans font-light text-[11px] text-[#00A7FA] italic mt-1">
                      + {pkg.features.length - 5} more features
                    </li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toggle Comparison Table */}
      <div className="mb-12">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center gap-2 font-sans font-medium text-[12px] tracking-[0.15em] text-[#00A7FA] uppercase hover:text-[#89D0FF] transition-colors border border-[rgba(0,167,250,0.3)] px-6 py-3 rounded-[2px] bg-[rgba(0,167,250,0.01)]"
        >
          {showComparison ? 'Hide Detailed Comparison' : 'Compare All Features'}
          {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Hostinger-style Comparison Table */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full max-w-7xl overflow-hidden mb-12"
          >
            <div className="overflow-x-auto border border-[rgba(0,167,250,0.15)] rounded-[2px] bg-[rgba(9,9,14,0.4)] backdrop-blur-sm">
              <table className="w-full min-w-[900px] border-collapse text-center table-fixed">
                <thead>
                  <tr className="border-b border-[rgba(0,167,250,0.2)] bg-[rgba(0,167,250,0.01)]">
                    <th className="p-4 text-left font-sans font-medium text-[11px] tracking-wider text-[#94A3B8] uppercase w-1/4">
                      Inclusions
                    </th>
                    {packagesList.map((pkg) => {
                      const isHovered = hoveredCol === pkg.id;
                      const isSelected = selectedPackage === pkg.id;
                      return (
                        <th
                          key={pkg.id}
                          onMouseEnter={() => setHoveredCol(pkg.id)}
                          onMouseLeave={() => setHoveredCol(null)}
                          onClick={() => onUpdate('package', pkg.id)}
                          className={`p-4 transition-colors duration-300 cursor-pointer relative w-[15%]
                            ${isHovered ? 'bg-[rgba(0,167,250,0.06)]' : ''}
                            ${isSelected ? 'bg-[rgba(0,167,250,0.03)]' : ''}
                          `}
                        >
                          <h4 className="font-display font-medium text-[14px] text-[#FFFFFF] tracking-wider uppercase mb-1">
                            {pkg.name.split(' ')[0]}
                          </h4>
                          <div className="font-sans font-medium text-[13px] text-[#00A7FA]">
                            ₹{pkg.price.toLocaleString()}
                          </div>
                          {isSelected && (
                            <span className="absolute top-2 right-2 text-[#00A7FA] text-[10px] font-bold">✓</span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {featuresList.map((row) => (
                    <tr 
                      key={row.name} 
                      className="border-b border-[rgba(0,167,250,0.08)] last:border-0 hover:bg-[rgba(255,255,255,0.01)] transition-colors"
                    >
                      <td className="p-3.5 text-left font-sans font-light text-[12px] text-[#94A3B8] pl-6 bg-[rgba(0,167,250,0.01)]">
                        {row.name}
                      </td>
                      {packagesList.map((pkg) => {
                        const isHovered = hoveredCol === pkg.id;
                        const isSelected = selectedPackage === pkg.id;
                        const val = row.values[pkg.id];
                        return (
                          <td
                            key={pkg.id}
                            onMouseEnter={() => setHoveredCol(pkg.id)}
                            onMouseLeave={() => setHoveredCol(null)}
                            onClick={() => onUpdate('package', pkg.id)}
                            className={`p-3.5 transition-colors duration-300 cursor-pointer
                              ${isHovered ? 'bg-[rgba(0,167,250,0.05)]' : ''}
                              ${isSelected ? 'bg-[rgba(0,167,250,0.02)]' : ''}
                            `}
                          >
                            {renderCellValue(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Action */}
      {selectedPackage && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNext}
          style={{
            marginTop: '36px',
            padding: '14px 56px',
            background: '#00A7FA', color: '#09090E',
            fontFamily: 'Inter', fontWeight: 500, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            border: 'none', borderRadius: '2px', cursor: 'pointer',
          }}
          className="hover:bg-[#89D0FF] transition-colors shadow-lg"
        >
          Continue →
        </motion.button>
      )}

    </div>
  );
}
