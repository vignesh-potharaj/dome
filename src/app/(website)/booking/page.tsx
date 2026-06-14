'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ProgressBar from './components/ProgressBar';
import Step1Location from './components/Step1Location';
import Step2DateSlot from './components/Step2DateSlot';
import Step3Package from './components/Step3Package';
import Step4Balloon from './components/Step4Balloon';
import Step5Cake from './components/Step5Cake';
import Step6AddOns, { addOnsList } from './components/Step6AddOns';
import Step7Details from './components/Step7Details';
import Step8Checkout from './components/Step8Checkout';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState({
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
    },
    agreedToTerms: false,
  });

  const next = () => setStep(s => Math.min(s + 1, 8));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const back = () => setStep(s => Math.max(s - 1, 1));
  const update = (key: string, value: any) => setBooking(b => ({ ...b, [key]: value }));

  const calculateTotal = (b: typeof booking) => {
    const packagePrice = { classic: 999, premium: 1499, grand: 2199 }[b.package || ''] || 0;
    
    // Cake pricing logic based on package
    let cakePrice = 0;
    const isGrand = b.package === 'grand';
    const hasCake = b.cakeOption && b.cakeOption !== 'none';
    
    if (hasCake) {
      // Base price is free for grand, 349 for others
      const baseCakePrice = isGrand ? 0 : 349;
      // Premium flavours surcharge (+250)
      const premiumSurcharge = (b.cakeOption === 'red-velvet' || b.cakeOption === 'chocolate-truffle') ? 250 : 0;
      // Eggless surcharge (+250)
      const egglessSurcharge = b.eggless ? 250 : 0;
      
      cakePrice = baseCakePrice + premiumSurcharge + egglessSurcharge;
    }
    
    // Sparklers pricing (free for grand, 149 for others)
    const sparklerPrice = b.sparklers ? (isGrand ? 0 : 149) : 0;

    const addOnsTotal = b.addOns.reduce((sum, id) => {
      if (id === 'led-name') {
        const lettersCount = b.ledName ? b.ledName.replace(/[^a-zA-Z0-9]/g, '').length : 0;
        return sum + lettersCount * 49;
      }
      return sum + (addOnsList.find(a => a.id === id)?.price || 0);
    }, 0);
    return packagePrice + cakePrice + sparklerPrice + addOnsTotal;
  };

  const totalPrice = calculateTotal(booking);

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Location selectedLocation={booking.location} onUpdate={update} onNext={next} />;
      case 2: return <Step2DateSlot selectedDate={booking.date} selectedSlot={booking.slot} onUpdate={update} onNext={next} />;
      case 3: return <Step3Package selectedPackage={booking.package} onUpdate={update} onNext={next} />;
      case 4: return <Step4Balloon selectedColor={booking.balloonColor} onUpdate={update} onNext={next} />;
      case 5: return <Step5Cake selectedCake={booking.cakeOption} sparklers={booking.sparklers} eggless={booking.eggless} cakeMessage={booking.customer.cakeMessage} customer={booking.customer} selectedPackage={booking.package} onUpdate={update} onNext={next} />;
      case 6: return <Step6AddOns selectedAddOns={booking.addOns} ledName={booking.ledName} totalPrice={totalPrice} onUpdate={update} onNext={next} />;
      case 7: return <Step7Details booking={booking} totalPrice={totalPrice} onUpdate={update} onNext={next} />;
      case 8: return <Step8Checkout booking={booking} totalPrice={totalPrice} onUpdate={update} />;
      default: return null;
    }
  };

  return (
    <div className="relative min-h-[100vh] w-full bg-[#080604] overflow-hidden selection:bg-[#C9973A] selection:text-[#080604]">
      <ProgressBar currentStep={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 overflow-y-auto"
        >
          {/* Back button (hide on step 1 and step 8 if confirmation is shown, but for simplicity handled globally here) */}
          {step > 1 && step < 8 && (
            <button 
              onClick={back}
              className="absolute top-[88px] left-6 md:left-12 text-[#B8A882] font-sans text-[12px] uppercase tracking-[0.1em] hover:text-[#C9973A] transition-colors z-50 flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
          )}

          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
