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
  
  // OTP-specific states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  const hasLedNameAddon = booking.addOns.includes('led-name');
  const ledLettersCount = booking.ledName ? booking.ledName.replace(/[^a-zA-Z0-9]/g, '').length : 0;

  const fields = [
    { id: 'name',         label: 'Your Full Name',          type: 'text',   placeholder: 'e.g. Priya Sharma',     required: true },
    { id: 'phone',        label: 'WhatsApp Number',         type: 'tel',    placeholder: '+91 98765 43210',        required: true },
    { id: 'email',        label: 'Email Address',           type: 'email',  placeholder: 'for confirmation mail',  required: true },
    { id: 'occasion',     label: 'Occasion',                type: 'select', options: ['Birthday', 'Anniversary', 'Proposal', 'Celebration', 'Date Night', 'Baby Shower', 'Other'], required: true },
    { id: 'guestCount',   label: 'Number of Guests',        type: 'select', options: ['2', '3', '4', '5', '6+'],  required: true },
    { id: 'celebrantName',label: 'Name of the Celebrant',  type: 'text',   placeholder: 'Who are we celebrating?',required: false },
    { id: 'specialNote',  label: 'Special Request / Note',  type: 'textarea',placeholder: 'Anything specific you\'d like us to know…', required: false },
  ];

  const sendOtp = async () => {
    const phoneNumber = booking.customer.phone;
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      alert('Please enter a valid WhatsApp phone number first.');
      return;
    }
    setSendingOtp(true);
    setOtpError('');
    try {
      const res = await fetch('/api/booking/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setIsOtpModalOpen(true);
      } else {
        alert(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please check your connection and try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (otpCode.length !== 6) {
      setOtpError('Please enter a 6-digit code.');
      return;
    }
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const res = await fetch('/api/booking/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: booking.customer.phone.trim(), code: otpCode.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setIsPhoneVerified(true);
        setIsOtpModalOpen(false);
        setOtpCode('');

        // Auto-populate returning customer profile details
        if (data.customer) {
          const profile = data.customer;
          const mergedCustomer = {
            ...booking.customer,
            name: profile.name || booking.customer.name,
            email: profile.email || booking.customer.email,
          };

          // Try to match returning occasions JSON keys (e.g. birthday, anniversary) to Step 7 dropdown options
          if (profile.occasions) {
            const occasionKeys = Object.keys(profile.occasions);
            if (occasionKeys.length > 0) {
              const matchedKey = occasionKeys[0]; // e.g. 'birthday'
              const formattedOccasion = matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1);
              if (['Birthday', 'Anniversary', 'Proposal', 'Celebration', 'Date Night', 'Baby Shower', 'Other'].includes(formattedOccasion)) {
                mergedCustomer.occasion = formattedOccasion;
              }
            }
          }

          onUpdate('customer', mergedCustomer);
        }
      } else {
        setOtpError(data.error || 'Invalid code, please try again.');
      }
    } catch (err) {
      console.error(err);
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    fields.forEach(f => {
      if (f.required && !booking.customer[f.id]) {
        newErrors[f.id] = true;
        isValid = false;
      }
      if (f.id === 'phone' && !isPhoneVerified) {
        newErrors['phone'] = true;
        isValid = false;
      }
    });

    if (hasLedNameAddon && !booking.ledName.trim()) {
      newErrors['ledName'] = true;
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      onNext();
    }
  };

  const handleInputChange = (id: string, val: string) => {
    // Reset phone verification if WhatsApp number changes
    if (id === 'phone' && isPhoneVerified) {
      setIsPhoneVerified(false);
    }

    onUpdate('customer', { ...booking.customer, [id]: val });
    if (errors[id] && val.trim() !== '') {
      setErrors(e => ({ ...e, [id]: false }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[100vh] w-full pt-[100px] px-6 pb-24 overflow-y-auto">
      
      <h2 className="font-display font-light text-[32px] md:text-[52px] text-[#FFFFFF] text-center mb-3">
        ALMOST THERE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#94A3B8] text-center mb-16">
        Tell us who's celebrating — we'll personalise everything
      </p>

      <div className="flex flex-col md:flex-row gap-12 max-w-5xl w-full items-start">
        
        {/* Left Form Container */}
        <div className="w-full md:w-2/3 flex flex-col gap-8">
          
          {/* Standard Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {fields.map(f => {
              const isFullWidth = f.type === 'textarea';
              const value = booking.customer[f.id] || '';
              const hasError = errors[f.id];

              return (
                <div key={f.id} className={`flex flex-col ${isFullWidth ? 'md:col-span-2' : ''}`}>
                  <label className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#94A3B8] uppercase mb-2">
                    {f.label} {f.required && '*'}
                  </label>
                  
                  {f.id === 'phone' ? (
                    <div className="flex gap-3 w-full">
                      <div className="relative flex-grow">
                        <input
                          type={f.type}
                          value={value}
                          disabled={isPhoneVerified}
                          onChange={e => handleInputChange(f.id, e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full bg-[rgba(0,167,250,0.04)] border border-[rgba(0,167,250,0.2)] rounded-[2px] p-[14px_18px] text-[#FFFFFF] font-sans font-light text-[14px] outline-none transition-colors focus:border-[#00A7FA] focus:bg-[rgba(0,167,250,0.07)] disabled:opacity-80"
                          style={{ borderColor: hasError ? '#8B3A3A' : undefined }}
                        />
                        {isPhoneVerified && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00A7FA] font-sans font-medium text-[11px] tracking-wide">
                            VERIFIED ✓
                          </span>
                        )}
                      </div>
                      
                      {!isPhoneVerified && (
                        <button
                          type="button"
                          disabled={sendingOtp || value.trim().length < 10}
                          onClick={sendOtp}
                          className="px-6 bg-[rgba(0,167,250,0.1)] hover:bg-[rgba(0,167,250,0.18)] border border-[rgba(0,167,250,0.3)] text-[#00A7FA] font-sans font-medium text-[12px] uppercase tracking-wider rounded-[2px] transition-colors disabled:opacity-30 cursor-pointer whitespace-nowrap"
                        >
                          {sendingOtp ? 'Sending...' : 'Verify'}
                        </button>
                      )}
                    </div>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      value={value}
                      onChange={e => handleInputChange(f.id, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full h-[100px] bg-[rgba(0,167,250,0.04)] border border-[rgba(0,167,250,0.2)] rounded-[2px] p-[14px_18px] text-[#FFFFFF] font-sans font-light text-[14px] outline-none transition-colors resize-none focus:border-[#00A7FA] focus:bg-[rgba(0,167,250,0.07)]"
                      style={{ borderColor: hasError ? '#8B3A3A' : undefined }}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      value={value}
                      onChange={e => handleInputChange(f.id, e.target.value)}
                      className="w-full bg-[rgba(0,167,250,0.04)] border border-[rgba(0,167,250,0.2)] rounded-[2px] p-[14px_18px] text-[#FFFFFF] font-sans font-light text-[14px] outline-none transition-colors focus:border-[#00A7FA] focus:bg-[rgba(0,167,250,0.07)] appearance-none"
                      style={{ 
                        borderColor: hasError ? '#8B3A3A' : undefined,
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%23C9973A" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center'
                      }}
                    >
                      <option value="" disabled className="bg-[#09090E]">Select...</option>
                      {f.options?.map(opt => (
                        <option key={opt} value={opt} className="bg-[#09090E]">{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      value={value}
                      onChange={e => handleInputChange(f.id, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-[rgba(0,167,250,0.04)] border border-[rgba(0,167,250,0.2)] rounded-[2px] p-[14px_18px] text-[#FFFFFF] font-sans font-light text-[14px] outline-none transition-colors focus:border-[#00A7FA] focus:bg-[rgba(0,167,250,0.07)]"
                      style={{ borderColor: hasError ? '#8B3A3A' : undefined }}
                    />
                  )}
                  
                  {hasError && (
                    <span className="text-[#8B3A3A] text-[11px] font-sans mt-1">
                      {f.id === 'phone' && booking.customer.phone && !isPhoneVerified
                        ? 'Please verify this WhatsApp number first'
                        : 'This field is required'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* LED Name Configuration Card */}
          {hasLedNameAddon && (
            <div 
              className="p-6 border rounded-[2px] flex flex-col gap-4 transition-colors"
              style={{
                borderColor: errors['ledName'] ? '#8B3A3A' : 'rgba(0,167,250,0.3)',
                background: 'rgba(0,167,250,0.04)'
              }}
            >
              <div>
                <h4 className="font-sans font-medium text-[12px] tracking-[0.1em] text-[#00A7FA] uppercase mb-1">
                  Custom LED Name Configuration
                </h4>
                <p className="font-sans font-light text-[12px] text-[#94A3B8] leading-relaxed">
                  You have selected the Custom LED Name Sign add-on. Please specify the name or message you want lit up (₹49 per alphanumeric character):
                </p>
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  value={booking.ledName}
                  onChange={e => {
                    onUpdate('ledName', e.target.value.toUpperCase());
                    if (errors['ledName'] && e.target.value.trim() !== '') {
                      setErrors(err => ({ ...err, ledName: false }));
                    }
                  }}
                  placeholder="e.g. PRIYA"
                  className="w-full bg-[rgba(9,9,14,0.7)] border border-[rgba(0,167,250,0.3)] rounded-[2px] p-3 text-[#FFFFFF] font-sans text-[13px] outline-none focus:border-[#00A7FA]"
                  style={{ borderColor: errors['ledName'] ? '#8B3A3A' : undefined }}
                />
                {errors['ledName'] && (
                  <span className="text-[#8B3A3A] text-[11px] font-sans mt-1">Please enter a name for the LED sign</span>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[rgba(0,167,250,0.15)]">
                <span className="font-sans text-[12px] text-[#94A3B8]">
                  Dynamic Price Calculation ({ledLettersCount} letters):
                </span>
                <span className="font-display text-[18px] text-[#00A7FA]">
                  +₹{ledLettersCount * 49}
                </span>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '16px 0',
                background: '#00A7FA', color: '#09090E',
                fontFamily: 'Inter', fontWeight: 500, fontSize: '12px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                border: 'none', borderRadius: '2px', cursor: 'pointer',
              }}
              className="hover:bg-[#89D0FF] transition-colors"
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

      {/* OTP Verification Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#09090E]/90 backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-[420px] rounded-[4px] border border-[#00A7FA]/30 bg-[#09090E]/95 p-8 md:p-10 shadow-2xl relative"
            style={{ boxShadow: '0 0 50px rgba(0,167,250,0.15)' }}
          >
            <h3 className="font-display font-light text-[24px] md:text-[28px] text-[#FFFFFF] text-center tracking-wide mb-2">
              VERIFY YOUR PHONE
            </h3>
            <p className="font-sans font-light text-[12px] text-[#94A3B8] text-center mb-8 leading-relaxed">
              We have sent a 6-digit verification code to <span className="text-[#00A7FA] font-medium">{booking.customer.phone}</span>. Please enter it below.
            </p>

            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setOtpCode(clean);
                    if (otpError) setOtpError('');
                  }}
                  placeholder="0 0 0 0 0 0"
                  className="w-full tracking-[0.5em] text-center bg-[rgba(0,167,250,0.04)] border border-[rgba(0,167,250,0.2)] rounded-[2px] p-[16px_0] text-[24px] font-display font-light text-[#FFFFFF] outline-none focus:border-[#00A7FA] focus:bg-[rgba(0,167,250,0.07)]"
                />
                
                {otpError && (
                  <span className="text-[#8B3A3A] text-[11px] font-sans mt-3 text-center">{otpError}</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  disabled={verifyingOtp}
                  onClick={verifyOtp}
                  className="w-full py-4 bg-[#00A7FA] hover:bg-[#89D0FF] text-[#09090E] font-sans font-semibold text-[12px] tracking-[0.2em] uppercase rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {verifyingOtp ? 'VERIFYING...' : 'VERIFY CODE'}
                </button>

                <button
                  disabled={sendingOtp}
                  onClick={sendOtp}
                  className="w-full py-2 bg-transparent text-[#94A3B8] hover:text-[#00A7FA] font-sans font-light text-[11px] tracking-[0.1em] uppercase transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sendingOtp ? 'SENDING...' : 'RESEND OTP'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#00A7FA] transition-colors bg-transparent border-none text-[16px] cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
