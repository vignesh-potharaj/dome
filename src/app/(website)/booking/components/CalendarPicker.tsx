'use client';

import { useState } from 'react';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export default function CalendarPicker({ selectedDate, onSelectDate }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display font-light text-[22px] text-[#FFFFFF]">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-4">
          <button onClick={prevMonth} className="text-[#00A7FA] hover:text-[#FFFFFF] transition-colors p-2">
            ←
          </button>
          <button onClick={nextMonth} className="text-[#00A7FA] hover:text-[#FFFFFF] transition-colors p-2">
            →
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map(day => (
          <div key={day} className="text-center font-sans font-light text-[11px] tracking-[0.2em] text-[#94A3B8] uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
          date.setHours(0, 0, 0, 0);
          
          const isPast = date < today;
          const isToday = date.getTime() === today.getTime();
          const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

          return (
            <div key={i + 1} className="flex justify-center items-center h-10">
              <button
                onClick={() => !isPast && onSelectDate(date)}
                disabled={isPast}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-sans font-normal text-[14px] transition-all
                  ${isPast ? 'opacity-30 cursor-not-allowed text-[#94A3B8]' : 'cursor-pointer hover:bg-[rgba(0,167,250,0.2)] text-[#FFFFFF]'}
                  ${isToday && !isSelected ? 'border border-[#00A7FA]' : ''}
                  ${isSelected ? 'bg-[#00A7FA] !text-[#09090E] font-medium' : ''}
                `}
              >
                {i + 1}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
