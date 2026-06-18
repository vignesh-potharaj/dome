'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const locations = [
  {
    id: 'sainikpuri',
    area: 'SAINIKPURI',
    address: '3rd & 4th Floor, Hi-Tension Road, Eshwarpuri',
    hours: '11:00 AM – 11:30 PM',
    perks: ['Live music', 'Parking available', 'Rooftop access'],
  },
  {
    id: 'kokapet',
    area: 'KOKAPET',
    address: 'Plot 4, Survey 160, Brundavan Colony, 60 Feet Road, Narsingi',
    hours: '11:30 AM – 1:00 AM',
    perks: ['Continental & Italian', 'Late night slots', 'Quiet neighbourhood'],
  },
];

interface Step1LocationProps {
  selectedLocation: string | null;
  onUpdate: (key: string, value: string) => void;
  onNext: () => void;
}

export default function Step1Location({ selectedLocation, onUpdate, onNext }: Step1LocationProps) {
  const [dbBranches, setDbBranches] = useState<{ id: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await fetch('/api/booking/branches');
        const data = await res.json();
        if (data.success && Array.isArray(data.branches)) {
          setDbBranches(data.branches);
        }
      } catch (err) {
        console.error('Failed to fetch branches:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBranches();
  }, []);

  const activeLocations = locations.filter((loc) => {
    if (loading) return true;
    const dbBranch = dbBranches.find((db) => db.id === loc.id);
    return dbBranch ? dbBranch.status !== 'disabled' : true;
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[64px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[52px] text-[#F5EDD8] text-center tracking-[0.05em] leading-tight mb-3">
        WHERE WOULD YOU LIKE TO CELEBRATE?
      </h2>
      <p className="font-sans font-light text-[14px] text-[#B8A882] text-center mb-16">
        Select your preferred Dome Cafe location
      </p>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full max-w-4xl">
        {activeLocations.map((loc) => {
          const isSelected = selectedLocation === loc.id;
          
          return (
            <div
              key={loc.id}
              onClick={() => onUpdate('location', loc.id)}
              className="relative w-full md:w-[340px] px-8 py-10 md:px-10 md:py-12 rounded-[4px] cursor-pointer transition-all duration-300"
              style={{
                border: isSelected ? '1px solid #C9973A' : '1px solid rgba(201,151,58,0.18)',
                background: isSelected ? 'rgba(201,151,58,0.10)' : 'rgba(201,151,58,0.04)',
                boxShadow: isSelected ? '0 0 40px rgba(201,151,58,0.15)' : 'none',
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

              <p className="font-sans font-medium text-[11px] tracking-[0.5em] text-[#C9973A] uppercase mb-3">
                {loc.area}
              </p>
              <h3 className="font-display font-light text-[22px] text-[#F5EDD8] mb-2 leading-snug">
                {loc.address}
              </h3>
              <p className="font-sans font-light text-[13px] text-[#B8A882] mb-6">
                {loc.hours}
              </p>

              <ul className="flex flex-col gap-2">
                {loc.perks.map((perk, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-[#C9973A] text-[10px]">✦</span>
                    <span className="font-sans font-light text-[12px] text-[#B8A882]">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {selectedLocation && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNext}
          style={{
            marginTop: '40px',
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
