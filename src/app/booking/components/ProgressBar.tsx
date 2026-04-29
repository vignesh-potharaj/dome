'use client';

import Link from 'next/link';

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    'Location', 'Date & Slot', 'Package', 'Balloon',
    'Cake', 'Add-ons', 'Details', 'Checkout'
  ];
  
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '64px', zIndex: 100,
      backdropFilter: 'blur(16px)',
      background: 'rgba(8,6,4,0.8)',
      borderBottom: '1px solid rgba(201,151,58,0.12)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      {/* Left: DOME CAFE logo */}
      <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
        <span className="font-display font-light text-[24px] tracking-[0.25em] text-[#C9973A] leading-none ml-[0.25em]">
          DOME
        </span>
      </Link>

      {/* Center: step dots */}
      <div className="flex items-center gap-4 hidden md:flex">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center group relative">
              <div 
                className={`w-[10px] h-[10px] rounded-full flex items-center justify-center transition-colors
                  ${isCompleted ? 'bg-[#C9973A]' : ''}
                  ${isActive ? 'bg-[#C9973A]' : ''}
                  ${isUpcoming ? 'border border-[rgba(201,151,58,0.3)]' : ''}
                `}
              >
                {isCompleted && (
                  <span className="text-[#080604] text-[6px] font-bold">✓</span>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <span className="font-sans font-medium text-[10px] text-[#C9973A] uppercase tracking-wider bg-[#080604] border border-[rgba(201,151,58,0.2)] px-2 py-1 rounded-sm">
                  {stepNumber}: {label}
                </span>
              </div>

              {/* Connecting Line */}
              {stepNumber !== steps.length && (
                <div className="w-[30px] h-[1px] ml-4 bg-[rgba(201,151,58,0.2)] relative overflow-hidden">
                  {isCompleted && (
                    <div className="absolute inset-0 bg-[#C9973A] origin-left animate-[scaleX_0.3s_ease-out]" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Step X of 8 */}
      <div className="font-sans font-light text-[12px] text-[#B8A882]">
        Step {currentStep} of 8
      </div>
    </nav>
  );
}
