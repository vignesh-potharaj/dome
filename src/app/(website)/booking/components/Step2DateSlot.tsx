'use client';

import { motion } from 'framer-motion';
import CalendarPicker from './CalendarPicker';

const allSlots = [
  '5:00 PM – 6:30 PM',
  '7:00 PM – 8:30 PM',
  '9:00 PM – 10:30 PM',
  '11:00 PM – 12:30 AM',
];

const blockedSlots = ['7:00 PM – 8:30 PM'];

interface Step2DateSlotProps {
  selectedDate: Date | null;
  selectedSlot: string | null;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
}

export default function Step2DateSlot({ selectedDate, selectedSlot, onUpdate, onNext }: Step2DateSlotProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[64px] px-6 pb-24">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#F5EDD8] text-center mb-16">
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
        <div className="w-full md:w-[60%] flex flex-col items-center md:items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {allSlots.map((slot) => {
              const isBlocked = blockedSlots.includes(slot);
              const isSelected = selectedSlot === slot;

              return (
                <button
                  key={slot}
                  disabled={isBlocked || !selectedDate}
                  onClick={() => onUpdate('slot', slot)}
                  className={`relative flex flex-col items-center justify-center h-[56px] w-full border rounded-[2px] transition-all duration-200
                    ${!selectedDate ? 'opacity-30 cursor-not-allowed border-[rgba(201,151,58,0.2)]' : ''}
                    ${isBlocked && selectedDate ? 'bg-[rgba(255,255,255,0.03)] border-transparent cursor-not-allowed' : ''}
                    ${!isBlocked && !isSelected && selectedDate ? 'border-[rgba(201,151,58,0.2)] hover:border-[#C9973A] bg-transparent text-[#B8A882]' : ''}
                    ${isSelected ? 'border-[#C9973A] bg-[rgba(201,151,58,0.12)] text-[#F5EDD8]' : ''}
                  `}
                >
                  <span className={`font-sans text-[14px] ${isBlocked ? 'text-[rgba(184,168,130,0.3)] line-through' : ''}`}>
                    {slot}
                  </span>
                  {isBlocked && selectedDate && (
                    <span className="font-sans font-medium text-[9px] tracking-[0.2em] text-[#8B3A3A] mt-1 absolute bottom-1">
                      BOOKED
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="font-sans font-light italic text-[12px] text-[#B8A882] mt-8 text-center md:text-left w-full">
            Each dome session is 1.5 hours · Please arrive 10 mins early
          </p>
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
