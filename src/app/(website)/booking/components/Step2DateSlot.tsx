'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarPicker from './CalendarPicker';
import DomeLoader from './DomeLoader';

const allSlots = [
  '5:00 PM – 6:30 PM',
  '7:00 PM – 8:30 PM',
  '9:00 PM – 10:30 PM',
  '11:00 PM – 12:30 AM',
];

interface Step2DateSlotProps {
  locationId: string | null;
  selectedDate: Date | null;
  selectedSlot: string | null;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
}

export default function Step2DateSlot({ locationId, selectedDate, selectedSlot, onUpdate, onNext }: Step2DateSlotProps) {
  const [slotsAvailability, setSlotsAvailability] = useState<Record<string, { available: boolean; reason?: string }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate || !locationId) {
      setSlotsAvailability({});
      return;
    }

    async function fetchAvailability() {
      setLoading(true);
      try {
        const dateStr = selectedDate instanceof Date 
          ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
          : String(selectedDate).split('T')[0];

        const res = await fetch(`/api/booking/availability?branchId=${locationId}&date=${dateStr}`);
        const data = await res.json();
        
        if (data.success && data.slots) {
          setSlotsAvailability(data.slots);
        } else {
          setSlotsAvailability({});
        }
      } catch (err) {
        console.error('Error fetching slot availability:', err);
        setSlotsAvailability({});
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [selectedDate, locationId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[64px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#FFFFFF] text-center mb-16">
        PICK YOUR DATE & TIME
      </h2>

      <div className="flex flex-col md:flex-row gap-16 md:gap-24 w-full max-w-5xl justify-center items-start">
        
        {/* Left Panel: Date Picker */}
        <div className="w-full md:w-[40%]">
          <CalendarPicker 
            selectedDate={selectedDate} 
            onSelectDate={(date) => {
              onUpdate('date', date);
              onUpdate('slot', null); // Reset slot when date changes
            }} 
          />
        </div>

        {/* Right Panel: Time Slots */}
        <div className="w-full md:w-[60%] flex flex-col items-stretch md:items-start min-h-[220px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <DomeLoader />
              </motion.div>
            ) : selectedDate ? (
              <motion.div
                key="slots"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center md:items-start"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {allSlots.map((slot) => {
                    const slotInfo = slotsAvailability[slot];
                    const isBlocked = slotInfo ? !slotInfo.available : false;
                    const isSelected = selectedSlot === slot;
                    const isSlotDisabled = isBlocked;
                    const isPast = slotInfo?.reason === 'Slot is in the past';

                    return (
                      <button
                        key={slot}
                        disabled={isSlotDisabled}
                        onClick={() => onUpdate('slot', slot)}
                        className={`relative flex flex-col items-center justify-center h-[56px] w-full border rounded-[2px] transition-all duration-200 focus:outline-none
                          ${isBlocked ? 'bg-[rgba(255,255,255,0.03)] border-transparent cursor-not-allowed' : ''}
                          ${!isBlocked && !isSelected ? 'border-[rgba(0,167,250,0.2)] hover:border-[#00A7FA] bg-transparent text-[#94A3B8]' : ''}
                          ${isSelected ? 'border-[#00A7FA] bg-[rgba(0,167,250,0.12)] text-[#FFFFFF]' : ''}
                        `}
                      >
                        <span className={`font-sans text-[14px] ${isBlocked ? 'text-[rgba(184,168,130,0.3)] line-through' : ''}`}>
                          {slot}
                        </span>
                        {isBlocked && (
                          <span className="font-sans font-medium text-[9px] tracking-[0.2em] text-[#8B3A3A] mt-1 absolute bottom-1">
                            {isPast ? 'UNAVAILABLE' : 'BOOKED'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="font-sans font-light italic text-[12px] text-[#94A3B8] mt-8 text-center md:text-left w-full">
                  Each dome session is 1.5 hours · Please arrive 10 mins early
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="select-date-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-center md:justify-start items-center min-h-[150px] text-center md:text-left"
              >
                <p className="font-sans font-light italic text-[14px] text-[#94A3B8]">
                  Select a date to view available time slots.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {selectedDate && selectedSlot && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNext}
          style={{
            marginTop: '56px',
            padding: '14px 56px',
            background: '#00A7FA', color: '#09090E',
            fontFamily: 'Inter', fontWeight: 500, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            border: 'none', borderRadius: '2px', cursor: 'pointer',
          }}
          className="hover:bg-[#89D0FF] transition-colors"
        >
          Continue →
        </motion.button>
      )}

    </div>
  );
}
