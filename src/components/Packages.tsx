'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

export interface DomePackage {
  id: string;
  name: string;
  price: string;
  duration: string;
  tag?: string | null;
  features: string[];
}

const packagesList: DomePackage[] = [
  {
    id: 'party',
    name: 'PARTY DOME',
    price: '₹3,999',
    duration: '90 Mins',
    tag: 'BEST VALUE',
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
    price: '₹5,999',
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
    price: '₹8,999',
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
    price: '₹14,999',
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
    price: '₹19,999',
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

export default function Packages({ packages }: { packages?: any[] }) {
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  const renderCellValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-[#C9973A] mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-700 mx-auto" />
      );
    }
    return <span className="font-sans font-medium text-[13px] text-[#F5EDD8]">{value}</span>;
  };

  return (
    <section id="packages" className="w-full py-28 px-4 md:px-12 relative overflow-hidden" style={{ background: 'radial-gradient(circle at center, #080604 0%, #0D0A07 100%)' }}>
      
      {/* Background glowing shapes */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[rgba(201,151,58,0.02)] rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[rgba(201,151,58,0.02)] rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Title */}
        <div className="text-center mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-sans font-medium text-[11px] tracking-[0.25em] text-[#C9973A] uppercase mb-4"
          >
            Exclusive Celebrations
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            className="font-display font-light text-[40px] md:text-[56px] text-[#F5EDD8] tracking-[0.08em] leading-tight"
          >
            CHOOSE YOUR DOME
          </motion.h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-[80px] h-[1px] bg-[rgba(201,151,58,0.5)] mx-auto mt-6"
          />
        </div>

        {/* 1. Quick Package Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 w-full items-stretch mb-24">
          {packagesList.map((pkg, index) => {
            const isRecommended = pkg.id === 'magic';
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col relative rounded-[2px] overflow-hidden transition-all duration-300
                  ${isRecommended 
                    ? 'border border-[#C9973A] shadow-[0_0_30px_rgba(201,151,58,0.1)] lg:scale-[1.03] bg-[rgba(201,151,58,0.06)]' 
                    : 'border border-[rgba(201,151,58,0.15)] bg-[rgba(201,151,58,0.02)] hover:border-[rgba(201,151,58,0.35)]'
                  }
                `}
              >
                {pkg.tag && (
                  <div className="bg-[#C9973A] text-[#080604] text-[9px] font-sans font-semibold tracking-widest uppercase py-1 text-center w-full">
                    {pkg.tag}
                  </div>
                )}
                
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-medium text-[20px] text-[#F5EDD8] mb-1 uppercase tracking-wider">
                      {pkg.name.split(' ')[0]}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="font-display font-semibold text-[32px] text-[#C9973A]">{pkg.price}</span>
                      <span className="font-sans text-[11px] text-[#B8A882] tracking-wider">/ 90m</span>
                    </div>

                    <ul className="flex flex-col gap-3 mb-8">
                      {pkg.features.slice(0, 4).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-left">
                          <span className="text-[#C9973A] text-[9px] mt-1.5">✦</span>
                          <span className="font-sans font-light text-[12px] text-[#B8A882] leading-snug">{feat}</span>
                        </li>
                      ))}
                      {pkg.features.length > 4 && (
                        <li className="font-sans font-light text-[11px] text-[#C9973A] italic mt-1 text-left">
                          + {pkg.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  <Link 
                    href={`/booking?package=${pkg.id}`}
                    className={`block w-full text-center font-sans font-medium text-[11px] tracking-[0.15em] uppercase py-3 transition-colors rounded-[2px]
                      ${isRecommended 
                        ? 'bg-[#C9973A] text-[#080604] hover:bg-[#E8B96A]' 
                        : 'border border-[#C9973A] text-[#C9973A] hover:bg-[#C9973A] hover:text-[#080604]'
                      }
                    `}
                  >
                    Book Now
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 2. Hostinger Style Complete Comparison Section */}
        <div className="w-full flex flex-col items-center">
          
          <div className="text-center mb-10">
            <h3 className="font-display font-light text-[28px] md:text-[36px] text-[#F5EDD8] tracking-[0.05em]">
              Compare Features & Inclusions
            </h3>
            <p className="font-sans font-light text-[13px] text-[#B8A882] mt-2">
              Review every single detail included in our dome packages side by side.
            </p>
          </div>

          <div className="w-full overflow-x-auto border border-[rgba(201,151,58,0.15)] rounded-[2px] bg-[rgba(8,6,4,0.3)] backdrop-blur-sm">
            <table className="w-full min-w-[950px] border-collapse text-center table-fixed">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-[rgba(201,151,58,0.2)]">
                  <th className="p-6 text-left font-sans font-medium text-[12px] tracking-widest text-[#B8A882] uppercase w-1/4 bg-[rgba(201,151,58,0.01)]">
                    Inclusions
                  </th>
                  {packagesList.map((pkg) => {
                    const isHovered = hoveredCol === pkg.id;
                    const isRecommended = pkg.id === 'magic';
                    return (
                      <th
                        key={pkg.id}
                        onMouseEnter={() => setHoveredCol(pkg.id)}
                        onMouseLeave={() => setHoveredCol(null)}
                        className={`p-6 transition-colors duration-300 relative w-[15%]
                          ${isHovered ? 'bg-[rgba(201,151,58,0.06)]' : ''}
                          ${isRecommended ? 'bg-[rgba(201,151,58,0.02)]' : ''}
                        `}
                      >
                        {isRecommended && (
                          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#C9973A] text-[#080604] font-sans font-semibold text-[8px] tracking-wider px-2 py-0.5 uppercase whitespace-nowrap">
                            Best Choice
                          </span>
                        )}
                        <h4 className="font-display font-semibold text-[15px] text-[#F5EDD8] tracking-wider uppercase mb-1">
                          {pkg.name.split(' ')[0]}
                        </h4>
                        <div className="font-sans font-medium text-[16px] text-[#C9973A] mb-4">
                          {pkg.price}
                        </div>
                        <Link
                          href={`/booking?package=${pkg.id}`}
                          className={`inline-block w-full text-center font-sans font-medium text-[10px] tracking-[0.1em] uppercase py-2 transition-colors rounded-[2px]
                            ${isRecommended
                              ? 'bg-[#C9973A] text-[#080604] hover:bg-[#E8B96A]'
                              : 'border border-[rgba(201,151,58,0.5)] text-[#C9973A] hover:bg-[#C9973A] hover:text-[#080604]'
                            }
                          `}
                        >
                          Select
                        </Link>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {featuresList.map((row, idx) => (
                  <tr 
                    key={row.name} 
                    className={`border-b border-[rgba(201,151,58,0.08)] last:border-0 hover:bg-[rgba(255,255,255,0.01)] transition-colors`}
                  >
                    <td className="p-4 text-left font-sans font-light text-[13px] text-[#B8A882] pl-6 bg-[rgba(201,151,58,0.01)]">
                      {row.name}
                    </td>
                    {packagesList.map((pkg) => {
                      const isHovered = hoveredCol === pkg.id;
                      const isRecommended = pkg.id === 'magic';
                      const val = row.values[pkg.id];
                      return (
                        <td
                          key={pkg.id}
                          onMouseEnter={() => setHoveredCol(pkg.id)}
                          onMouseLeave={() => setHoveredCol(null)}
                          className={`p-4 transition-colors duration-300
                            ${isHovered ? 'bg-[rgba(201,151,58,0.05)]' : ''}
                            ${isRecommended ? 'bg-[rgba(201,151,58,0.01)]' : ''}
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
        </div>

      </div>
    </section>
  );
}
