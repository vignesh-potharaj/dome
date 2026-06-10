'use client';

import { useRef, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export interface DomePackage {
  _id?: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  tag?: string | null;
}

const defaultPackages: DomePackage[] = [
  {
    name: 'CLASSIC',
    price: '₹999',
    duration: '1.5 hrs',
    features: ['Balloon décor', 'LED name sign', 'Rose petals', 'Candles', 'Seating for 2'],
    tag: null,
  },
  {
    name: 'PREMIUM',
    price: '₹1,499',
    duration: '1.5 hrs',
    features: ['Everything in Classic', 'Floral arch', 'Chamomile welcome drink', 'Polaroid camera', 'Priority booking'],
    tag: 'MOST POPULAR',
  },
  {
    name: 'GRAND',
    price: '₹2,199',
    duration: '2 hrs',
    features: ['Everything in Premium', 'Custom neon sign', 'Cake + sparklers', 'Dedicated host', 'Video reel edit'],
    tag: null,
  },
];

function PackageCard({ pkg, index }: { pkg: DomePackage; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotY = (x - 0.5) * 14;
    const rotX = (y - 0.5) * -10;
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  };

  const isCenter = index === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.2 }}
      viewport={{ once: true, margin: '-40px' }}
      className={`w-full md:w-1/3 flex ${isCenter ? 'z-10' : 'z-0'}`}
    >
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transition: 'transform 0.15s ease' }}
        className={`w-full relative flex flex-col bg-[rgba(201,151,58,0.04)] backdrop-blur-sm p-8 md:p-10
          ${isCenter ? 'border border-[#C9973A] shadow-[0_0_40px_rgba(201,151,58,0.12)] md:scale-y-[1.08] origin-bottom' : 'border border-[rgba(201,151,58,0.2)] mt-4 md:mt-0'}
        `}
      >
        {pkg.tag && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#C9973A] text-[#080604] px-4 py-1 font-sans font-medium text-[10px] tracking-[0.2em] uppercase">
            {pkg.tag}
          </div>
        )}
        
        <p className="font-sans font-medium text-[12px] tracking-[0.2em] text-[#C9973A] mb-2 uppercase text-center">
          {pkg.name}
        </p>
        <div className="text-center mb-2">
          <span className="font-display font-semibold text-[48px] md:text-[56px] text-[#C9973A] leading-none">
            {pkg.price}
          </span>
        </div>
        <p className="font-sans font-light text-[12px] text-[#B8A882] text-center mb-8 pb-8 border-b border-[rgba(201,151,58,0.15)]">
          {pkg.duration} session
        </p>
        
        <ul className="flex flex-col gap-4 flex-grow">
          {pkg.features && pkg.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-[#C9973A] text-[10px] mt-1">✦</span>
              <span className="font-sans font-light text-[13px] text-[#B8A882] leading-relaxed">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 pt-6">
          <Link 
            href="/booking"
            className={`block w-full text-center font-sans font-medium text-[12px] tracking-[0.15em] uppercase py-4 transition-colors duration-300
              ${isCenter ? 'bg-[#C9973A] text-[#080604] hover:bg-[#E8B96A]' : 'border border-[#C9973A] text-[#C9973A] hover:bg-[#C9973A] hover:text-[#080604]'}
            `}
          >
            Select Package
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Packages({ packages = defaultPackages }: { packages?: DomePackage[] }) {
  const displayPackages = packages.length > 0 ? packages : defaultPackages;

  return (
    <section id="packages" className="w-full py-32 px-6 md:px-12 relative overflow-hidden" style={{ background: 'radial-gradient(circle at center, #080604 0%, #0D0A07 100%)' }}>
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        <div className="text-center mb-20 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            className="font-display font-light text-[40px] md:text-[56px] text-[#F5EDD8] tracking-[0.1em]"
          >
            CHOOSE YOUR DOME
          </motion.h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-[60px] h-[1px] bg-[rgba(201,151,58,0.5)] mx-auto mt-6"
          />
        </div>

        <div className="flex flex-col md:flex-row w-full gap-8 md:gap-6 items-stretch md:items-center">
          {displayPackages.map((pkg, i) => (
            <PackageCard key={pkg.name} pkg={pkg} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
