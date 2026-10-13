'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DbBranch {
  id: string;
  name: string;
  status: string;
  capacity?: number;
  phone?: string | null;
  allowOnlineBookings: boolean;
}

const locations = [
  {
    id: 'sainikpuri',
    area: 'SAINIKPURI',
    address: '3rd & 4th Floor, Hi-Tension Road, Eshwarpuri',
    hours: '11:00 AM – 11:30 PM',
    perks: ['Live music', 'Parking available', 'Rooftop access'],
    defaultPhone: '+91 98765 43211',
  },
  {
    id: 'kokapet',
    area: 'KOKAPET',
    address: 'AVYANA (Dome Cafe)Plot No. 4, Sy. No. 160, 60 Ft Rd, Brundavan Colony, Beside Ratnadeep Supermarket, Kokapet, Narsingi, Rangareddy, Telangana - 500075',
    hours: '11:30 AM – 1:00 AM',
    perks: ['Continental & Italian', 'Late night slots', 'Quiet neighbourhood'],
    defaultPhone: '+91 98765 43210',
  },
];

interface Step1LocationProps {
  selectedLocation: string | null;
  onUpdate: (key: string, value: string) => void;
  onNext: () => void;
}

export default function Step1Location({ selectedLocation, onUpdate, onNext }: Step1LocationProps) {
  const [dbBranches, setDbBranches] = useState<DbBranch[]>([]);
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

  // Safeguard: Deselect location if it has online bookings paused
  useEffect(() => {
    if (selectedLocation && dbBranches.length > 0) {
      const current = dbBranches.find((db) => db.id === selectedLocation);
      if (current && !current.allowOnlineBookings) {
        onUpdate('location', '');
      }
    }
  }, [dbBranches, selectedLocation, onUpdate]);

  // Filter out completely disabled/offline branches
  const activeLocations = locations.filter((loc) => {
    if (loading) return true;
    const dbBranch = dbBranches.find((db) => db.id === loc.id);
    return dbBranch ? dbBranch.status !== 'disabled' : true;
  });

  const allOnlineBookingsStopped =
    !loading &&
    activeLocations.length > 0 &&
    activeLocations.every((loc) => {
      const dbBranch = dbBranches.find((db) => db.id === loc.id);
      return dbBranch && dbBranch.allowOnlineBookings === false;
    });

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[64px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[52px] text-[#FFFFFF] text-center tracking-[0.05em] leading-tight mb-3">
        WHERE WOULD YOU LIKE TO CELEBRATE?
      </h2>
      <p className="font-sans font-light text-[14px] text-[#94A3B8] text-center mb-8">
        Select your preferred Dome Cafe location
      </p>

      {/* Global Notice if all branches have online bookings paused */}
      {allOnlineBookingsStopped && (
        <div className="mb-10 px-6 py-4 rounded-[6px] bg-[#F59E0B]/10 border border-[#F59E0B]/30 max-w-2xl text-center">
          <p className="font-sans font-medium text-[13px] text-[#F59E0B] tracking-wide">
            Online slot reservations are currently paused. Please call your nearest branch directly to book your dome.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full max-w-4xl">
        {activeLocations.map((loc) => {
          const dbBranch = dbBranches.find((db) => db.id === loc.id);
          const isBookingStopped = dbBranch ? dbBranch.allowOnlineBookings === false : false;
          const isSelected = selectedLocation === loc.id && !isBookingStopped;
          const branchPhone = dbBranch?.phone || loc.defaultPhone || '+91 98765 43210';
          const cleanPhone = branchPhone.replace(/\s+/g, '');

          return (
            <div
              key={loc.id}
              onClick={() => {
                if (!isBookingStopped) {
                  onUpdate('location', loc.id);
                }
              }}
              className={`relative w-full md:w-[360px] px-8 py-10 md:px-10 md:py-12 rounded-[6px] transition-all duration-300 flex flex-col justify-between ${
                isBookingStopped
                  ? 'cursor-default border border-[#F59E0B]/30 bg-[#F59E0B]/[0.03]'
                  : 'cursor-pointer'
              }`}
              style={
                isBookingStopped
                  ? {
                      boxShadow: 'none',
                    }
                  : {
                      border: isSelected ? '1px solid #00A7FA' : '1px solid rgba(0,167,250,0.18)',
                      background: isSelected ? 'rgba(0,167,250,0.10)' : 'rgba(0,167,250,0.04)',
                      boxShadow: isSelected ? '0 0 40px rgba(0,167,250,0.15)' : 'none',
                    }
              }
              onMouseEnter={(e) => {
                if (!isSelected && !isBookingStopped) {
                  e.currentTarget.style.border = '1px solid rgba(0,167,250,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isBookingStopped) {
                  e.currentTarget.style.border = '1px solid rgba(0,167,250,0.18)';
                }
              }}
            >
              {/* Selected Checkmark Indicator */}
              {isSelected && !isBookingStopped && (
                <div className="absolute top-4 right-4 text-[#09090E] bg-[#00A7FA] w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">
                  ✓
                </div>
              )}

              {/* Top Details */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="font-sans font-medium text-[11px] tracking-[0.5em] text-[#00A7FA] uppercase">
                    {loc.area}
                  </p>

                  {/* Booking Paused Badge */}
                  {isBookingStopped && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] text-[10px] font-sans font-semibold tracking-wider uppercase">
                      ● Online Paused
                    </span>
                  )}
                </div>

                <h3 className="font-display font-light text-[22px] text-[#FFFFFF] mb-2 leading-snug">
                  {loc.address}
                </h3>
                <p className="font-sans font-light text-[13px] text-[#94A3B8] mb-6">
                  {loc.hours}
                </p>

                <ul className="flex flex-col gap-2 mb-6">
                  {loc.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-[#00A7FA] text-[10px]">✦</span>
                      <span className="font-sans font-light text-[12px] text-[#94A3B8]">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Actions */}
              {isBookingStopped ? (
                <div className="mt-4 pt-5 border-t border-[#F59E0B]/20">
                  <p className="font-sans text-[12px] text-[#94A3B8] mb-3 leading-relaxed">
                    Online bookings are currently paused for this location. Call us directly to reserve your dome:
                  </p>
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-[4px] bg-[#F59E0B] hover:bg-[#D97706] text-[#09090E] font-sans font-bold text-[12px] tracking-wider uppercase transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
                    </svg>
                    <span>Call Us: {branchPhone}</span>
                  </a>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-[11px] font-sans text-[#94A3B8]">
                    <span>Online Reservations:</span>
                    <span className="text-[#00A7FA] font-medium">Available</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue Button bar for online booking */}
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
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '13px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
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
