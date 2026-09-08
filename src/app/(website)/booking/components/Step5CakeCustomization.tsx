'use client';

import { motion } from 'framer-motion';
import ToggleSwitch from './ToggleSwitch';
import { cakeFlavours } from './Step5Cake';

interface Step5CakeCustomizationProps {
  selectedCake: string | null;
  sparklers: boolean;
  eggless: boolean;
  cakeMessage: string;
  customer: any;
  selectedPackage: string | null;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
}

export default function Step5CakeCustomization({
  selectedCake,
  sparklers,
  eggless,
  cakeMessage,
  customer,
  selectedPackage,
  onUpdate,
  onNext,
}: Step5CakeCustomizationProps) {
  const isSparklerFree = selectedPackage ? ['vibe', 'magic', 'elite', 'luxury'].includes(selectedPackage) : false;
  const selectedCakeObj = cakeFlavours.find((cake) => cake.id === selectedCake);

  // Package specific cake size
  const cakeSizeText = selectedPackage && ['elite', 'luxury'].includes(selectedPackage) ? '1 Kg' : '500g';

  const canContinue = cakeMessage.trim() !== '';

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] w-full pt-[80px] px-6 pb-24">
      <h2 className="font-display font-light text-[32px] md:text-[48px] text-[#FFFFFF] text-center mb-3">
        CUSTOMISE YOUR CAKE
      </h2>
      <p className="font-sans font-light text-[14px] text-[#94A3B8] text-center mb-12 max-w-xl">
        Add your celebration message and choose special touches for your {cakeSizeText} cake
      </p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col gap-6 bg-[rgba(0,167,250,0.03)] border border-[rgba(0,167,250,0.15)] px-6 sm:px-8 py-6 rounded-[4px] w-full max-w-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        {/* Selected Cake Card */}
        {selectedCakeObj && (
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,167,250,0.15)]">
            <div className="flex items-center gap-4">
              <span className="text-[32px]">{selectedCakeObj.emoji}</span>
              <div>
                <span className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#00A7FA] uppercase block mb-1">
                  Cake Selected ({cakeSizeText})
                </span>
                <h3 className="font-display font-light text-[20px] text-[#FFFFFF] leading-snug">
                  {selectedCakeObj.name}
                </h3>
              </div>
            </div>
            <div className="font-sans font-medium text-[12px] tracking-[0.1em] text-[#00A7FA] shrink-0">
              {selectedCakeObj.isPremium ? '+₹250' : 'Included'}
            </div>
          </div>
        )}

        {/* Toggles: Eggless Cake & Add Sparkler Candle */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="font-sans text-[13px] text-[#FFFFFF] block">
                Eggless Cake
              </span>
              <span className="font-sans text-[11px] text-[#94A3B8]">
                100% vegetarian preparation
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ToggleSwitch
                value={eggless}
                onChange={v => onUpdate('eggless', v)}
              />
              <span className="font-sans font-medium text-[12px] text-[#00A7FA] min-w-[42px] text-right">
                +₹250
              </span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[rgba(0,167,250,0.12)]" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="font-sans text-[13px] text-[#FFFFFF] block">
                Add Sparkler Candle
              </span>
              <span className="font-sans text-[11px] text-[#94A3B8]">
                Pyrotechnic cake cutting candle
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ToggleSwitch
                value={sparklers}
                onChange={v => onUpdate('sparklers', v)}
              />
              <span className="font-sans font-medium text-[12px] text-[#00A7FA] text-right">
                {isSparklerFree ? '+₹0 (Included)' : '+₹149'}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-[rgba(0,167,250,0.15)]" />

        {/* Cake Message Input */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#94A3B8] uppercase">
              Message on Cake *
            </label>
            <span className="font-sans text-[11px] text-[#94A3B8]">
              {cakeMessage.length}/50
            </span>
          </div>
          <input
            type="text"
            value={cakeMessage}
            onChange={e => onUpdate('customer', { ...customer, cakeMessage: e.target.value })}
            placeholder="e.g. Happy Birthday Priya"
            maxLength={50}
            autoFocus
            className="w-full bg-[rgba(9,9,14,0.7)] border border-[rgba(0,167,250,0.4)] rounded-[2px] p-3 text-[#FFFFFF] font-sans text-[13px] outline-none focus:border-[#00A7FA] transition-colors"
          />
          <span className="font-sans text-[11px] text-[#64748B] mt-1.5">
            This message will be iced directly onto your cake
          </span>
        </div>
      </motion.div>

      {/* Floating Continue Button */}
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
          whileHover={canContinue ? { scale: 1.03 } : {}}
          whileTap={canContinue ? { scale: 0.97 } : {}}
          disabled={!canContinue}
          onClick={onNext}
          style={{
            padding: '16px 64px',
            background: canContinue
              ? 'linear-gradient(135deg, #00A7FA, #0090d6)'
              : 'rgba(0,167,250,0.15)',
            color: canContinue ? '#FFFFFF' : 'rgba(0,167,250,0.4)',
            cursor: canContinue ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter', fontWeight: 600, fontSize: '13px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            border: 'none', borderRadius: '4px',
            boxShadow: canContinue
              ? '0 0 30px rgba(0,167,250,0.4), 0 4px 15px rgba(0,0,0,0.3)'
              : 'none',
            transition: 'all 0.3s ease',
          }}
          className={canContinue ? "hover:shadow-[0_0_40px_rgba(0,167,250,0.6)] transition-all duration-300" : "transition-all duration-300"}
        >
          Continue to Add-ons →
        </motion.button>
      </motion.div>
    </div>
  );
}
