'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ProgressBar from './components/ProgressBar';
import HoldCountdownBanner from './components/HoldCountdownBanner';
import Step1Location from './components/Step1Location';
import Step2DateSlot from './components/Step2DateSlot';
import Step3Package from './components/Step3Package';
import Step4Balloon from './components/Step4Balloon';
import Step5Cake from './components/Step5Cake';
import Step5CakeCustomization from './components/Step5CakeCustomization';
import Step6AddOns, { addOnsList } from './components/Step6AddOns';
import Step7Details from './components/Step7Details';
import Step8Checkout from './components/Step8Checkout';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState({
    bookingId: null as string | null,
    holdExpiresAt: null as string | Date | null,
    location: null as string | null,
    date: null as Date | null,
    slot: null as string | null,
    package: null as string | null,
    balloonColor: null as string | null,
    cakeOption: null as string | null,
    sparklers: false,
    eggless: false,
    addOns: [] as string[],
    ledName: '',
    customer: {
      name: '',
      phone: '',
      email: '',
      occasion: '',
      guestCount: '',
      celebrantName: '',
      cakeMessage: '',
      specialNote: '',
      marketingConsent: true,
    },
    agreedToTerms: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pkg = params.get('package');
      if (pkg && ['party', 'vibe', 'magic', 'elite', 'luxury'].includes(pkg)) {
        setBooking(b => ({ ...b, package: pkg }));
      }
    }
  }, []);

  const next = () => {
    setStep(s => {
      if (s === 5 && booking.cakeOption === 'none') {
        return 7; // Skip cake customization if "No Cake" selected
      }
      return Math.min(s + 1, 9);
    });
  };

  const back = () => {
    setStep(s => {
      if (s === 7 && booking.cakeOption === 'none') {
        return 5; // Return to cake selection skipping customization
      }
      return Math.max(s - 1, 1);
    });
  };

  const update = (key: string, value: any) => setBooking(b => ({ ...b, [key]: value }));

  const handleHoldExpired = () => {
    alert('Your 30-minute slot reservation has expired. Please select your preferred time slot again.');
    setBooking(b => ({ ...b, bookingId: null, holdExpiresAt: null, slot: null }));
    setStep(2);
  };

  const calculateTotal = (b: typeof booking) => {
    const packagePrice = {
      party: 3999,
      vibe: 5999,
      magic: 8999,
      elite: 14999,
      luxury: 19999
    }[b.package || ''] || 0;
    
    // Cake pricing logic: Cake is complimentary (0 base price) for all new packages
    let cakePrice = 0;
    const hasCake = b.cakeOption && b.cakeOption !== 'none';
    
    if (hasCake) {
      const baseCakePrice = 0; // Free for all packages
      // Premium flavours surcharge (+250)
      const premiumSurcharge = (b.cakeOption === 'red-velvet' || b.cakeOption === 'chocolate-truffle') ? 250 : 0;
      // Eggless surcharge (+250)
      const egglessSurcharge = b.eggless ? 250 : 0;
      
      cakePrice = baseCakePrice + premiumSurcharge + egglessSurcharge;
    }
    
    // Sparklers pricing: Included in Vibe, Magic, Elite, Luxury. +149 for Party.
    const isSparklerFree = ['vibe', 'magic', 'elite', 'luxury'].includes(b.package || '');
    const sparklerPrice = b.sparklers ? (isSparklerFree ? 0 : 149) : 0;

    const addOnsTotal = b.addOns.reduce((sum, id) => {
      if (id === 'led-name') {
        const lettersCount = b.ledName ? b.ledName.replace(/[^a-zA-Z0-9]/g, '').length : 0;
        return sum + lettersCount * 49;
      }
      return sum + (addOnsList.find(a => a.id === id)?.price || 0);
    }, 0);
    return packagePrice + cakePrice + sparklerPrice + addOnsTotal;
  };

  const [pausedBranchAlert, setPausedBranchAlert] = useState<{
    isOpen: boolean;
    branchName: string;
    phone: string;
  } | null>(null);

  useEffect(() => {
    if (!booking.location || step === 1) return;

    async function verifyBranchStatus() {
      try {
        const res = await fetch('/api/booking/branches');
        const data = await res.json();
        if (data.success && Array.isArray(data.branches)) {
          const current = data.branches.find((b: any) => b.id === booking.location);
          if (current && (!current.allowOnlineBookings || current.status === 'disabled')) {
            // Location is no longer accepting online bookings: display friendly in-app modal
            setPausedBranchAlert({
              isOpen: true,
              branchName: current.name,
              phone: current.phone || '+91 98765 43210',
            });
          }
        }
      } catch (err) {
        console.error('Error verifying branch status:', err);
      }
    }

    verifyBranchStatus();
  }, [step, booking.location]);

  const totalPrice = calculateTotal(booking);

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Location selectedLocation={booking.location} onUpdate={update} onNext={next} />;
      case 2: return <Step2DateSlot locationId={booking.location} selectedDate={booking.date} selectedSlot={booking.slot} bookingId={booking.bookingId} onUpdate={update} onNext={next} onBack={back} />;
      case 3: return <Step3Package selectedPackage={booking.package} onUpdate={update} onNext={next} />;
      case 4: return <Step4Balloon selectedColor={booking.balloonColor} onUpdate={update} onNext={next} />;
      case 5: return <Step5Cake selectedCake={booking.cakeOption} customer={booking.customer} selectedPackage={booking.package} onUpdate={update} onNext={next} />;
      case 6: return <Step5CakeCustomization selectedCake={booking.cakeOption} sparklers={booking.sparklers} eggless={booking.eggless} cakeMessage={booking.customer.cakeMessage} customer={booking.customer} selectedPackage={booking.package} onUpdate={update} onNext={next} />;
      case 7: return <Step6AddOns selectedAddOns={booking.addOns} ledName={booking.ledName} totalPrice={totalPrice} onUpdate={update} onNext={next} />;
      case 8: return <Step7Details booking={booking} totalPrice={totalPrice} onUpdate={update} onNext={next} />;
      case 9: return <Step8Checkout booking={booking} totalPrice={totalPrice} onUpdate={update} />;
      default: return null;
    }
  };

  return (
    <div className="relative min-h-[100vh] w-full bg-[#09090E] overflow-hidden selection:bg-[#00A7FA] selection:text-[#09090E]" data-lenis-prevent>
      {step >= 3 && booking.holdExpiresAt && (
        <HoldCountdownBanner holdExpiresAt={booking.holdExpiresAt} onExpired={handleHoldExpired} />
      )}
      <ProgressBar currentStep={step} cakeOption={booking.cakeOption} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 overflow-y-auto"
        >
          {/* Back button (hide on step 1 and step 9 if checkout) */}
          {step > 1 && step < 9 && (
            <button 
              onClick={back}
              className="absolute top-[88px] left-6 md:left-12 text-[#94A3B8] font-sans text-[12px] uppercase tracking-[0.1em] hover:text-[#00A7FA] transition-colors z-50 flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
          )}

          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Friendly Alert Modal when selected branch becomes paused mid-booking */}
      {pausedBranchAlert?.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg p-8 md:p-10 rounded-[8px] bg-[#111625] border border-[#F59E0B]/40 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.15)] text-center flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
              </svg>
            </div>

            <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-2">
              ● Online Bookings Paused
            </span>

            <h3 className="font-display font-light text-[24px] md:text-[28px] text-white mb-3">
              {pausedBranchAlert.branchName}
            </h3>

            <p className="font-sans font-light text-[14px] text-[#94A3B8] leading-relaxed mb-8 max-w-md">
              Online bookings for {pausedBranchAlert.branchName} were just paused. Please call the branch directly to complete your reservation, or select another location.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <a
                href={`tel:${pausedBranchAlert.phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto py-3.5 px-6 rounded-[4px] bg-[#F59E0B] hover:bg-[#D97706] text-[#09090E] font-sans font-bold text-[12px] tracking-wider uppercase transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
                </svg>
                <span>Call Us: {pausedBranchAlert.phone}</span>
              </a>

              <button
                onClick={() => {
                  setPausedBranchAlert(null);
                  setBooking(prev => ({
                    ...prev,
                    location: null,
                    date: null,
                    slot: null,
                    bookingId: null,
                    holdExpiresAt: null,
                  }));
                  setStep(1);
                }}
                className="flex items-center justify-center w-full sm:w-auto py-3.5 px-6 rounded-[4px] border border-white/20 hover:border-white text-white font-sans font-semibold text-[12px] tracking-wider uppercase transition-all duration-300 bg-white/5 hover:bg-white/10"
              >
                Choose Another Location
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
