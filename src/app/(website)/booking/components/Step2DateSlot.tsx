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
  bookingId?: string | null;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function Step2DateSlot({
  locationId,
  selectedDate,
  selectedSlot,
  bookingId,
  onUpdate,
  onNext,
  onBack,
}: Step2DateSlotProps) {
  const [slotsAvailability, setSlotsAvailability] = useState<Record<string, { available: boolean; reason?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [holding, setHolding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pausedBranch, setPausedBranch] = useState<{
    branchName?: string;
    phone?: string;
    message?: string;
  } | null>(null);

  // Proactive check: Validate if the branch currently allows online bookings
  useEffect(() => {
    if (!locationId) return;

    async function checkBranchStatus() {
      try {
        const res = await fetch('/api/booking/branches');
        const data = await res.json();
        if (data.success && Array.isArray(data.branches)) {
          const current = data.branches.find((b: any) => b.id === locationId);
          if (current && current.allowOnlineBookings === false) {
            setPausedBranch({
              branchName: current.name,
              phone: current.phone,
              message: `Online bookings are currently paused for ${current.name}.`,
            });
          } else {
            setPausedBranch(null);
          }
        }
      } catch (err) {
        console.error('Failed to check branch status:', err);
      }
    }

    checkBranchStatus();
  }, [locationId]);

  useEffect(() => {
    if (!selectedDate || !locationId) {
      setSlotsAvailability({});
      return;
    }

    async function fetchAvailability() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const dateStr = selectedDate instanceof Date 
          ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
          : String(selectedDate).split('T')[0];

        const excludeParam = bookingId ? `&excludeBookingId=${bookingId}` : '';
        const res = await fetch(`/api/booking/availability?branchId=${locationId}&date=${dateStr}${excludeParam}`);
        const data = await res.json();
        
        if (data.allowOnlineBookings === false) {
          setPausedBranch({
            branchName: data.branchName,
            phone: data.phone,
            message: data.error,
          });
          setSlotsAvailability({});
          return;
        }

        if (data.success && data.slots) {
          setPausedBranch(null);
          setSlotsAvailability(data.slots);
        } else {
          setSlotsAvailability({});
          if (data.error) {
            setErrorMsg(data.error);
          }
        }
      } catch (err) {
        console.error('Error fetching slot availability:', err);
        setSlotsAvailability({});
        setErrorMsg('Unable to connect to the booking service. Please check network connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [selectedDate, locationId, bookingId]);

  const handleContinue = async () => {
    if (!locationId || !selectedDate || !selectedSlot) return;

    setHolding(true);
    setErrorMsg(null);
    try {
      const dateStr = selectedDate instanceof Date 
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
        : String(selectedDate).split('T')[0];

      const res = await fetch('/api/booking/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: locationId,
          date: dateStr,
          slot: selectedSlot,
          bookingId: bookingId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onUpdate('bookingId', data.bookingId);
        onUpdate('holdExpiresAt', data.holdExpiresAt);
        onNext();
      } else {
        setErrorMsg(data.error || 'Failed to hold slot. Please select another time.');
      }
    } catch (err) {
      console.error('Error holding slot:', err);
      setErrorMsg('An error occurred while reserving the slot. Please try again.');
    } finally {
      setHolding(false);
    }
  };

  const branchPhone = pausedBranch?.phone || '+91 98765 43210';
  const cleanPhone = branchPhone.replace(/\s+/g, '');

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[64px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#FFFFFF] text-center mb-8">
        PICK YOUR DATE & TIME
      </h2>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl mb-8 p-4 rounded-[4px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#F87171] text-center text-[13px] font-sans"
        >
          {errorMsg}
        </motion.div>
      )}

      {/* When this branch has online bookings paused, show the dedicated Call Us screen */}
      {pausedBranch ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl mx-auto flex flex-col items-center text-center p-8 md:p-12 rounded-[6px] bg-[#F59E0B]/[0.04] border border-[#F59E0B]/30 shadow-[0_0_50px_rgba(245,158,11,0.1)]"
        >
          <div className="w-14 h-14 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
            </svg>
          </div>

          <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-2">
            ● Online Booking Paused
          </span>

          <h3 className="font-display font-light text-[24px] md:text-[30px] text-white mb-3">
            {pausedBranch.branchName || 'This Branch'} is Taking Phone Reservations
          </h3>

          <p className="font-sans font-light text-[14px] text-[#94A3B8] max-w-md mb-8 leading-relaxed">
            Online slot selection has been paused for this location. You can reserve your dome directly with our team over the phone:
          </p>

          <a
            href={`tel:${cleanPhone}`}
            className="flex items-center justify-center gap-2.5 w-full sm:w-auto py-4 px-8 rounded-[4px] bg-[#F59E0B] hover:bg-[#D97706] text-[#09090E] font-sans font-bold text-[13px] tracking-wider uppercase transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.45)] mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
            </svg>
            <span>Call Us: {branchPhone}</span>
          </a>

          <button
            onClick={() => {
              onUpdate('location', null);
              onUpdate('date', null);
              onUpdate('slot', null);
              if (onBack) onBack();
            }}
            className="font-sans font-medium text-[12px] tracking-[0.15em] text-[#00A7FA] hover:text-white uppercase transition-colors flex items-center gap-2"
          >
            <span>←</span> Choose Another Location
          </button>
        </motion.div>
      ) : (
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
      )}

      {/* Floating Continue bar */}
      {!pausedBranch && selectedDate && selectedSlot && (
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
            onClick={handleContinue}
            disabled={holding}
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
            {holding ? 'Securing Slot...' : 'Hold Slot & Continue →'}
          </motion.button>
        </motion.div>
      )}

    </div>
  );
}
