'use client';

import { motion } from 'framer-motion';

export default function DomeLoader() {
  return (
    <div className="w-full min-h-[220px] flex flex-col items-center justify-center border border-[rgba(0,167,250,0.12)] bg-[rgba(255,255,255,0.01)] backdrop-blur-md rounded-[2px] p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute w-[200px] h-[200px] rounded-full bg-[rgba(0,167,250,0.03)] blur-[40px] pointer-events-none -top-12" />
      
      {/* Dome SVG Container */}
      <div className="relative w-[160px] h-[110px] flex items-center justify-center">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_6px_rgba(0,167,250,0.3)]"
        >
          <defs>
            <linearGradient id="domeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A7FA" />
              <stop offset="50%" stopColor="#BF5AF2" />
              <stop offset="100%" stopColor="#FF5E97" />
            </linearGradient>
            <linearGradient id="baseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0,167,250,0.1)" />
              <stop offset="50%" stopColor="#00A7FA" />
              <stop offset="100%" stopColor="rgba(0,167,250,0.1)" />
            </linearGradient>
          </defs>

          {/* Base dashed ring */}
          <motion.ellipse
            cx="100"
            cy="115"
            rx="75"
            ry="12"
            stroke="url(#baseGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {/* Dome Outer Arch */}
          <motion.path
            d="M 25,115 A 75,75 0 0,1 175,115"
            stroke="url(#domeGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* Latitudinal Ellipses (Horizontal Rings) */}
          <motion.path
            d="M 29,100 A 71,11 0 0,1 171,100"
            stroke="rgba(0, 167, 250, 0.4)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, delay: 0.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />
          <motion.path
            d="M 43,80 A 57,9 0 0,1 157,80"
            stroke="rgba(191, 90, 242, 0.4)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, delay: 0.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />
          <motion.path
            d="M 64,60 A 36,6 0 0,1 136,60"
            stroke="rgba(255, 94, 151, 0.4)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, delay: 0.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* Vertical Arches (Meridians) */}
          <motion.path
            d="M 100,115 L 100,40"
            stroke="url(#domeGrad)"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />
          
          <motion.path
            d="M 62,115 C 62,85 80,50 100,40"
            stroke="rgba(0, 167, 250, 0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />

          <motion.path
            d="M 138,115 C 138,85 120,50 100,40"
            stroke="rgba(0, 167, 250, 0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />

          <motion.path
            d="M 35,115 C 35,75 70,45 100,40"
            stroke="rgba(191, 90, 242, 0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.0, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />

          <motion.path
            d="M 165,115 C 165,75 130,45 100,40"
            stroke="rgba(191, 90, 242, 0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.0, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* Geodesic triangular grid patterns */}
          <motion.path
            d="M 29,100 L 43,80 M 62,115 L 43,80 M 62,115 L 80,100 M 100,115 L 80,100 M 100,115 L 120,100 M 138,115 L 120,100 M 138,115 L 157,80 M 171,100 L 157,80"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          <motion.path
            d="M 43,80 L 64,60 M 80,100 L 64,60 M 80,100 L 100,80 M 100,115 L 100,80 M 120,100 L 100,80 M 120,100 L 136,60 M 157,80 L 136,60"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2.4, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Pulsing apex node */}
          <motion.circle
            cx="100"
            cy="40"
            r="3.5"
            fill="#00A7FA"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      {/* Loading Status Text */}
      <div className="text-center mt-2 z-10">
        <motion.h4
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="font-display font-light text-[13px] text-[#00A7FA] tracking-[0.25em] uppercase"
        >
          Checking Availability
        </motion.h4>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.4 }}
          className="font-sans font-light text-[10px] text-[#94A3B8] tracking-[0.05em] mt-1.5"
        >
          Securing the best 3D dome slots for you...
        </motion.p>
      </div>
    </div>
  );
}
