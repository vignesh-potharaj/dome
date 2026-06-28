'use client';

import { useState, useEffect } from 'react';

interface HoldCountdownBannerProps {
  holdExpiresAt: string | Date;
  onExpired: () => void;
}

export default function HoldCountdownBanner({ holdExpiresAt, onExpired }: HoldCountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    function calculateTimeLeft() {
      const expireTime = new Date(holdExpiresAt).getTime();
      const now = new Date().getTime();
      const diff = expireTime - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        onExpired();
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setTimeLeft(formatted);
    }

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, onExpired]);

  if (!timeLeft) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center items-center py-2.5 px-4 bg-[#09090E]/90 backdrop-blur-md border-b border-[#00A7FA]/30 shadow-[0_4px_20px_rgba(0,167,250,0.15)]">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A7FA] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00A7FA]"></span>
        </span>
        <span className="font-sans font-medium text-[12px] md:text-[13px] tracking-wide text-[#E2E8F0]">
          SLOT HELD FOR YOU:
        </span>
        <span className="font-display font-bold text-[15px] md:text-[16px] tracking-widest text-[#00A7FA] bg-[rgba(0,167,250,0.1)] px-2.5 py-0.5 rounded border border-[rgba(0,167,250,0.2)] font-mono">
          {timeLeft}
        </span>
      </div>
    </div>
  );
}
