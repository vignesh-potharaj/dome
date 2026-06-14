'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import BookingSummary from './BookingSummary';

interface Step8CheckoutProps {
  booking: any;
  totalPrice: number;
  onUpdate: (key: string, value: any) => void;
}

export default function Step8Checkout({ booking, totalPrice, onUpdate }: Step8CheckoutProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const handleConfirm = () => {
    const id = `DC-${Date.now().toString(36).toUpperCase()}`;
    setBookingId(id);
    console.log('📧 Confirmation email sent to:', booking.customer.email);
    console.log('📱 WhatsApp notification to:', booking.customer.phone);
    setShowConfirmation(true);
  };

  if (showConfirmation) {
    const advance = totalPrice / 2;
    
    // Confetti pieces
    const confetti = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      bg: ['#C9973A', '#E8B96A', '#F5EDD8'][Math.floor(Math.random() * 3)],
      rotate: Math.random() * 360,
    }));

    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed inset-0 bg-[#080604] z-[200] flex flex-col items-center justify-center p-6 overflow-hidden"
      >
        {/* CSS Confetti */}
        <style>{`
          @keyframes fall {
            from { top: -20px; opacity: 1; transform: rotate(0deg); }
            to { top: 110vh; opacity: 0; transform: rotate(720deg); }
          }
        `}</style>
        {confetti.map(c => (
          <div key={c.id} style={{
            position: 'absolute',
            left: c.left,
            top: '-20px',
            width: '8px', height: '8px',
            background: c.bg,
            transform: `rotate(${c.rotate}deg)`,
            animation: `fall ${c.duration}s linear ${c.delay}s forwards`,
          }} />
        ))}

        <div className="text-[#C9973A] text-[32px] mb-6 animate-pulse">✦</div>
        <h2 className="font-display font-light text-[36px] md:text-[56px] text-[#F5EDD8] text-center mb-8">
          YOUR DOME IS BOOKED
        </h2>

        <div className="w-[100px] h-[1px] bg-[rgba(201,151,58,0.4)] mb-8" />

        <p className="font-sans font-medium text-[14px] text-[#C9973A] tracking-[0.1em] mb-3">
          Booking ID: {bookingId}
        </p>
        <p className="font-sans font-light text-[14px] text-[#B8A882] text-center mb-8">
          A confirmation has been sent to<br />{booking.customer.email}
        </p>

        <div className="w-[100px] h-[1px] bg-[rgba(201,151,58,0.4)] mb-8" />

        <div className="bg-[rgba(201,151,58,0.03)] border border-[rgba(201,151,58,0.2)] rounded-[4px] p-6 w-full max-w-sm mb-8">
          <div className="flex justify-between mb-3"><span className="text-[#B8A882] text-[13px]">Location:</span><span className="text-[#F5EDD8] text-[13px]">{booking.location.toUpperCase()}</span></div>
          <div className="flex justify-between mb-3"><span className="text-[#B8A882] text-[13px]">Date:</span><span className="text-[#F5EDD8] text-[13px]">{booking.date?.toLocaleDateString()}</span></div>
          <div className="flex justify-between mb-3"><span className="text-[#B8A882] text-[13px]">Time:</span><span className="text-[#F5EDD8] text-[13px]">{booking.slot}</span></div>
          <div className="flex justify-between mb-3"><span className="text-[#B8A882] text-[13px]">Package:</span><span className="text-[#F5EDD8] text-[13px] capitalize">{booking.package}</span></div>
          <div className="flex justify-between mb-3"><span className="text-[#B8A882] text-[13px]">Guests:</span><span className="text-[#F5EDD8] text-[13px]">{booking.customer.guestCount}</span></div>
          
          {booking.ledName && (
            <div className="flex justify-between mb-3"><span className="text-[#B8A882] text-[13px]">LED Name:</span><span className="text-[#F5EDD8] text-[13px]">{booking.ledName}</span></div>
          )}
          {booking.cakeOption && booking.cakeOption !== 'none' && (
            <div className="flex justify-between mb-3">
              <span className="text-[#B8A882] text-[13px]">Cake:</span>
              <span className="text-[#F5EDD8] text-[13px] capitalize">
                {booking.cakeOption.replace('-', ' ')} {booking.eggless ? '(Eggless)' : ''}
              </span>
            </div>
          )}
          {booking.customer.cakeMessage && (
            <div className="flex justify-between mb-3"><span className="text-[#B8A882] text-[13px]">Cake Message:</span><span className="text-[#F5EDD8] text-[13px]">{booking.customer.cakeMessage}</span></div>
          )}
          {booking.addOns.length > 0 && (
            <div className="flex justify-between mb-3"><span className="text-[#B8A882] text-[13px]">Add-ons:</span><span className="text-[#F5EDD8] text-[13px]">{booking.addOns.length} selected</span></div>
          )}

          <div className="flex justify-between mt-4 pt-4 border-t border-[rgba(201,151,58,0.15)]"><span className="text-[#C9973A] font-medium text-[13px]">Total Paid:</span><span className="text-[#C9973A] font-medium text-[13px]">₹{advance} (advance)</span></div>
          <div className="flex justify-between mt-2"><span className="text-[#B8A882] text-[13px]">Balance Due:</span><span className="text-[#B8A882] text-[13px]">₹{totalPrice - advance} (at venue)</span></div>
        </div>

        <div className="w-[100px] h-[1px] bg-[rgba(201,151,58,0.4)] mb-8" />

        <p className="font-sans text-[12px] text-[#B8A882] mb-3">Need to reschedule?</p>
        <a 
          href={`https://wa.me/910000000000?text=Hi,%20I%20need%20help%20with%20booking%20${bookingId}`}
          target="_blank" rel="noopener noreferrer"
          className="font-sans font-medium text-[12px] text-[#C9973A] border border-[#C9973A] px-4 py-2 rounded-[2px] hover:bg-[#C9973A] hover:text-[#080604] transition-colors mb-10"
        >
          WhatsApp Us
        </a>

        <a href="/" className="font-sans text-[12px] text-[#B8A882] hover:text-[#C9973A] tracking-[0.1em] uppercase">
          [ Back to Dome Cafe ↗ ]
        </a>

      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-[100vh] w-full pt-[100px] px-6 pb-24 overflow-y-auto">
      
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#F5EDD8] text-center mb-12">
        BEFORE YOU CONFIRM
      </h2>

      <div className="flex flex-col md:flex-row gap-12 max-w-5xl w-full items-start">
        
        {/* Left: Terms */}
        <div className="w-full md:w-2/3">
          
          <div 
            className="border border-[rgba(201,151,58,0.2)] rounded-[4px] p-6 md:p-8 bg-[rgba(201,151,58,0.03)] overflow-y-auto"
            style={{ maxHeight: '320px' }}
          >
            <h4 className="font-sans font-medium text-[13px] tracking-[0.1em] text-[#C9973A] mb-6">
              DOME CAFE HYDERABAD — BOOKING TERMS & CONDITIONS
            </h4>

            <p className="font-sans font-light text-[13px] text-[#F5EDD8] mb-2 font-medium">1. ADVANCE PAYMENT</p>
            <p className="font-sans font-light text-[13px] text-[#B8A882] mb-6 leading-relaxed">
              A non-refundable advance of 50% of your total booking amount is required to confirm your reservation. The remaining 50% is due upon arrival.
            </p>

            <div className="w-full h-[1px] bg-[rgba(201,151,58,0.15)] mb-6" />

            <p className="font-sans font-light text-[13px] text-[#F5EDD8] mb-2 font-medium">2. CANCELLATION & REFUND POLICY</p>
            <p className="font-sans font-light text-[13px] text-[#B8A882] mb-1 leading-relaxed">
              ⚠ All advance payments are strictly non-refundable.
            </p>
            <p className="font-sans font-light text-[13px] text-[#B8A882] mb-6 leading-relaxed">
              ⚠ Cancellations will result in forfeiture of the advance amount.
            </p>

            <div className="w-full h-[1px] bg-[rgba(201,151,58,0.15)] mb-6" />

            <p className="font-sans font-light text-[13px] text-[#F5EDD8] mb-2 font-medium">3. RESCHEDULING</p>
            <div style={{
              borderLeft: '3px solid #C9973A',
              margin: '12px 0 24px 0',
              background: 'rgba(201,151,58,0.06)',
              padding: '16px 20px',
              borderRadius: '0 4px 4px 0',
            }}>
              <p className="font-sans font-light text-[13px] text-[#B8A882] mb-2 leading-relaxed">✅ Rescheduling is allowed by informing us 2–3 days in advance.</p>
              <p className="font-sans font-light text-[13px] text-[#B8A882] mb-2 leading-relaxed">✅ Rescheduling is subject to slot availability.</p>
              <p className="font-sans font-medium text-[13px] text-[#C9973A]">To reschedule, WhatsApp us at +91 XXXXXXXXXX with your booking ID.</p>
            </div>

            <div className="w-full h-[1px] bg-[rgba(201,151,58,0.15)] mb-6" />

            <p className="font-sans font-light text-[13px] text-[#F5EDD8] mb-2 font-medium">4. NO SHOW POLICY</p>
            <p className="font-sans font-light text-[13px] text-[#B8A882] mb-6 leading-relaxed">
              Failure to arrive at your scheduled time is considered a NO SHOW. This will result in automatic booking cancellation with no refunds and no rescheduling allowed.
            </p>

            <div className="w-full h-[1px] bg-[rgba(201,151,58,0.15)] mb-6" />

            <p className="font-sans font-light text-[13px] text-[#F5EDD8] mb-2 font-medium">5. DOME CAPACITY & GUESTS</p>
            <p className="font-sans font-light text-[13px] text-[#B8A882] mb-6 leading-relaxed">
              Each dome accommodates approximately 7–8 guests. There is no restriction on guest count, and package pricing remains unchanged regardless of the number of guests.
            </p>

            <div className="w-full h-[1px] bg-[rgba(201,151,58,0.15)] mb-6" />

            <p className="font-sans font-light text-[13px] text-[#8B3A3A] mb-2 font-medium">6. STRICTLY PROHIBITED ITEMS</p>
            <p className="font-sans font-light text-[13px] text-[#B8A882] mb-6 leading-relaxed">
              To ensure safety and maintain venue decor standards, customers are strictly prohibited from bringing outside items, including: outside food/beverages, party poppers, snow spray, sashes, tiaras, blindfolds, outside cakes, bouquets, or similar decorative materials.
            </p>

          </div>

          <label className="flex items-start gap-[14px] cursor-pointer mt-8">
            <input
              type="checkbox"
              checked={booking.agreedToTerms}
              onChange={e => onUpdate('agreedToTerms', e.target.checked)}
              className="hidden"
            />
            <div className={`w-5 h-5 flex-shrink-0 border rounded-[2px] flex items-center justify-center transition-colors
              ${booking.agreedToTerms ? 'bg-[#C9973A] border-[#C9973A]' : 'bg-transparent border-[rgba(201,151,58,0.4)]'}
            `}>
              {booking.agreedToTerms && <span className="text-[#080604] text-[10px] font-bold">✓</span>}
            </div>
            <span className="font-sans font-light text-[13px] text-[#B8A882] leading-[1.6]">
              I have read and agree to the Dome Cafe booking terms and conditions. I understand that my advance payment is <strong className="text-[#F5EDD8] font-medium">non-refundable</strong> but that <strong className="text-[#C9973A] font-medium">rescheduling is available</strong> with 2–3 days notice.
            </span>
          </label>

          <button
            disabled={!booking.agreedToTerms}
            onClick={() => setShowPayment(true)}
            style={{
              marginTop: '32px',
              padding: '16px 64px',
              background: booking.agreedToTerms ? '#C9973A' : 'rgba(201,151,58,0.2)',
              color: booking.agreedToTerms ? '#080604' : 'rgba(201,151,58,0.4)',
              cursor: booking.agreedToTerms ? 'pointer' : 'not-allowed',
              fontFamily: 'Inter', fontWeight: 500, fontSize: '12px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              border: 'none', borderRadius: '2px',
              transition: 'all 0.3s ease',
            }}
          >
            Proceed to Payment
          </button>

        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-1/3">
          <BookingSummary booking={booking} total={totalPrice} />
        </div>

      </div>

      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[150] bg-[#080604] flex flex-col items-center justify-center p-6 overflow-y-auto"
          >
            <button 
              onClick={() => setShowPayment(false)}
              className="absolute top-8 right-8 text-[#B8A882] font-sans text-[12px] uppercase tracking-[0.1em]"
            >
              Close ✕
            </button>

            <h2 className="font-display font-light text-[32px] md:text-[40px] text-[#F5EDD8] text-center mb-8 mt-12">
              COMPLETE YOUR ADVANCE PAYMENT
            </h2>

            <div className="text-center mb-8">
              <p className="font-display font-semibold text-[56px] md:text-[72px] text-[#C9973A] leading-none mb-2">
                ₹{totalPrice / 2}
              </p>
              <p className="font-sans font-light text-[13px] text-[#B8A882]">
                50% advance — balance due at venue
              </p>
            </div>

            <div className="w-[200px] h-[200px] border-2 border-[rgba(201,151,58,0.3)] rounded-[8px] bg-[#FFFFFF] flex items-center justify-center mb-6">
              <QRCodeSVG
                value={`upi://pay?pa=domecafe@upi&pn=Dome Cafe Hyderabad&am=${totalPrice/2}&cu=INR`}
                size={160}
                bgColor="#FFFFFF"
                fgColor="#080604"
              />
            </div>

            <div className="text-center mb-10">
              <p className="font-sans font-medium text-[16px] text-[#C9973A] tracking-[0.1em] mb-1">
                domecafe@upi
              </p>
              <p className="font-sans font-light text-[12px] text-[#B8A882]">
                Scan with any UPI app — GPay, PhonePe, Paytm
              </p>
            </div>

            <button
              onClick={handleConfirm}
              style={{
                padding: '16px 56px',
                background: '#C9973A', color: '#080604',
                fontFamily: 'Inter', fontWeight: 500, fontSize: '12px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                border: 'none', borderRadius: '2px', cursor: 'pointer',
              }}
              className="hover:bg-[#E8B96A] transition-colors mb-12"
            >
              ✓ I've Completed the Payment
            </button>
            
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
