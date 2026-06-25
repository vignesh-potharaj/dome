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
      
      <h2 className="font-display font-light text-[32px] md:text-[52px] text-[#FFFFFF] text-center tracking-[0.05em] leading-tight mb-3">
        WHERE WOULD YOU LIKE TO CELEBRATE?
      </h2>
      <p className="font-sans font-light text-[14px] text-[#94A3B8] text-center mb-16">
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
                border: isSelected ? '1px solid #00A7FA' : '1px solid rgba(0,167,250,0.18)',
                background: isSelected ? 'rgba(0,167,250,0.10)' : 'rgba(0,167,250,0.04)',
                boxShadow: isSelected ? '0 0 40px rgba(0,167,250,0.15)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.border = '1px solid rgba(0,167,250,0.4)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.border = '1px solid rgba(0,167,250,0.18)';
              }}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-[#09090E] bg-[#00A7FA] w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">
                  ✓
                </div>
              )}

              <p className="font-sans font-medium text-[11px] tracking-[0.5em] text-[#00A7FA] uppercase mb-3">
                {loc.area}
              </p>
              <h3 className="font-display font-light text-[22px] text-[#FFFFFF] mb-2 leading-snug">
                {loc.address}
              </h3>
              <p className="font-sans font-light text-[13px] text-[#94A3B8] mb-6">
                {loc.hours}
              </p>

              <ul className="flex flex-col gap-2">
                {loc.perks.map((perk, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-[#00A7FA] text-[10px]">✦</span>
                    <span className="font-sans font-light text-[12px] text-[#94A3B8]">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {selectedLocation && (
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
