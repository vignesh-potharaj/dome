'use client';

import { useState } from 'react';
import BookingSummary from './BookingSummary';

interface Step7DetailsProps {
  booking: any;
  totalPrice: number;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
}

export default function Step7Details({ booking, totalPrice, onUpdate, onNext }: Step7DetailsProps) {
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const hasCake = booking.cakeOption && booking.cakeOption !== 'none';

  const fields = [
    { id: 'name',         label: 'Your Full Name',          type: 'text',   placeholder: 'e.g. Priya Sharma',     required: true },
    { id: 'phone',        label: 'WhatsApp Number',         type: 'tel',    placeholder: '+91 98765 43210',        required: true },
    { id: 'email',        label: 'Email Address',           type: 'email',  placeholder: 'for confirmation mail',  required: true },
    { id: 'occasion',     label: 'Occasion',                type: 'select', options: ['Birthday', 'Anniversary', 'Proposal', 'Celebration', 'Date Night', 'Baby Shower', 'Other'], required: true },
    { id: 'guestCount',   label: 'Number of Guests',        type: 'select', options: ['2', '3', '4', '5', '6+'],  required: true },
    { id: 'celebrantName',label: 'Name of the Celebrant',  type: 'text',   placeholder: 'Who are we celebrating?',required: false },
    ...(hasCake ? [{ id: 'cakeMessage', label: 'Message on Cake', type: 'text', placeholder: 'Text to write on cake', required: true }] : []),
    { id: 'specialNote',  label: 'Special Request / Note',  type: 'textarea',placeholder: 'Anything specific you\'d like us to know…', required: false },
  ];

  const handleNext = () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    fields.forEach(f => {
      if (f.required && !booking.customer[f.id]) {
        newErrors[f.id] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid) {
      onNext();
    }
  };

  const handleInputChange = (id: string, val: string) => {
    onUpdate('customer', { ...booking.customer, [id]: val });
    if (errors[id] && val.trim() !== '') {
      setErrors(e => ({ ...e, [id]: false }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[100vh] w-full pt-[100px] px-6 pb-24 overflow-y-auto">
      
      <h2 className="font-display font-light text-[32px] md:text-[52px] text-[#F5EDD8] text-center mb-3">
        ALMOST THERE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#B8A882] text-center mb-16">
        Tell us who's celebrating — we'll personalise everything
      </p>

      <div className="flex flex-col md:flex-row gap-12 max-w-5xl w-full items-start">
        
        {/* Left Form */}
        <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {fields.map(f => {
            const isFullWidth = f.type === 'textarea';
            const value = booking.customer[f.id] || '';
            const hasError = errors[f.id];

            return (
              <div key={f.id} className={`flex flex-col ${isFullWidth ? 'md:col-span-2' : ''}`}>
                <label className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#B8A882] uppercase mb-2">
                  {f.label} {f.required && '*'}
                </label>
                
                {f.type === 'textarea' ? (
                  <textarea
                    value={value}
                    onChange={e => handleInputChange(f.id, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full h-[100px] bg-[rgba(201,151,58,0.04)] border border-[rgba(201,151,58,0.2)] rounded-[2px] p-[14px_18px] text-[#F5EDD8] font-sans font-light text-[14px] outline-none transition-colors resize-none focus:border-[#C9973A] focus:bg-[rgba(201,151,58,0.07)]"
                    style={{ borderColor: hasError ? '#8B3A3A' : undefined }}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={value}
                    onChange={e => handleInputChange(f.id, e.target.value)}
                    className="w-full bg-[rgba(201,151,58,0.04)] border border-[rgba(201,151,58,0.2)] rounded-[2px] p-[14px_18px] text-[#F5EDD8] font-sans font-light text-[14px] outline-none transition-colors focus:border-[#C9973A] focus:bg-[rgba(201,151,58,0.07)] appearance-none"
                    style={{ 
                      borderColor: hasError ? '#8B3A3A' : undefined,
                      backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%23C9973A" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center'
                    }}
                  >
                    <option value="" disabled className="bg-[#080604]">Select...</option>
                    {f.options?.map(opt => (
                      <option key={opt} value={opt} className="bg-[#080604]">{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={value}
                    onChange={e => handleInputChange(f.id, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full bg-[rgba(201,151,58,0.04)] border border-[rgba(201,151,58,0.2)] rounded-[2px] p-[14px_18px] text-[#F5EDD8] font-sans font-light text-[14px] outline-none transition-colors focus:border-[#C9973A] focus:bg-[rgba(201,151,58,0.07)]"
                    style={{ borderColor: hasError ? '#8B3A3A' : undefined }}
                  />
                )}
                
                {hasError && (
                  <span className="text-[#8B3A3A] text-[11px] font-sans mt-1">This field is required</span>
                )}
              </div>
            );
          })}
          
          <div className="md:col-span-2 mt-4">
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '16px 0',
                background: '#C9973A', color: '#080604',
                fontFamily: 'Inter', fontWeight: 500, fontSize: '12px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                border: 'none', borderRadius: '2px', cursor: 'pointer',
              }}
              className="hover:bg-[#E8B96A] transition-colors"
            >
              Review Booking →
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-1/3">
          <BookingSummary booking={booking} total={totalPrice} />
        </div>

      </div>

    </div>
  );
}
