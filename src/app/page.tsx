'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CrossfadeSection } from '@/components/CrossfadeSection';
import InsideDome from '@/components/InsideDome';
import Packages from '@/components/Packages';
import FindUs from '@/components/FindUs';
import ReviewsStrip from '@/components/ReviewsStrip';
import Footer from '@/components/Footer';

export default function Page() {
  // Force page to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main style={{ paddingTop: '0' }}>
      
      {/* Section 1: dome → birthday */}
      <CrossfadeSection currentImage="/images/dome.png" nextImage="/images/birthday_v3.png">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <h1 className="font-display font-light text-[52px] md:text-[90px] tracking-[0.3em] text-[var(--color-gold)] leading-none text-center">
            DOME CAFE
          </h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
            className="font-sans font-light text-[13px] tracking-[0.6em] text-[var(--color-cream-muted)] mt-2 uppercase ml-[0.6em] text-center"
          >
            Hyderabad
          </motion.p>
          <motion.div 
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="w-[80px] h-[1px] bg-[rgba(201,151,58,0.4)] my-6 origin-center"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}
            className="font-display italic font-light text-[26px] text-[var(--color-cream)] text-center"
          >
            India's first dome-shaped<br />celebration café
          </motion.p>
        </motion.div>

        {/* Scroll Cue */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
          className="mt-12 flex flex-col items-center pointer-events-auto cursor-pointer"
        >
          <span className="font-sans font-light text-[11px] text-[var(--color-cream-muted)] tracking-[0.3em] mb-2 uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
            <span className="text-[var(--color-cream-muted)] text-sm">↓</span>
          </motion.div>
        </motion.div>
      </CrossfadeSection>

      {/* Section 2: birthday → anniversary */}
      <CrossfadeSection currentImage="/images/birthday_v3.png" nextImage="/images/anniversary.png">
        <div className="flex flex-col items-center">
          <h2 className="font-display font-light text-[36px] md:text-[72px] tracking-[0.25em] text-[var(--color-cream)] leading-tight ml-[0.25em] text-center">
            CELEBRATE<br />
            <span className="text-[var(--color-gold)]">YOUR BIRTHDAY</span>
          </h2>
          <div className="w-[80px] h-[1px] bg-[rgba(201,151,58,0.4)] my-6" />
          <p className="font-sans font-light text-[14px] tracking-[0.1em] text-[var(--color-cream-muted)] text-center uppercase">
            Private dome · Balloon décor · LED signs
          </p>
        </div>
        
        {/* Floating Badge */}
        <motion.div 
          animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute top-[20%] right-[5%] md:right-[15%] border border-[rgba(201,151,58,0.4)] px-5 py-3 rounded-sm backdrop-blur-sm pointer-events-auto"
        >
          <span className="font-sans font-light text-[12px] text-[var(--color-gold)] uppercase">
            ✦ Packages from ₹999 ✦
          </span>
        </motion.div>
      </CrossfadeSection>

      {/* Section 3: anniversary → genderreveal */}
      <CrossfadeSection currentImage="/images/anniversary.png" nextImage="/images/genderreveal_v2.png">
        <div className="flex flex-col items-center text-center">
          <p className="font-display italic font-light text-[36px] md:text-[52px] text-[var(--color-cream-muted)] leading-tight">
            FOR THE ONES
          </p>
          <h2 className="font-display font-semibold text-[48px] md:text-[80px] text-[var(--color-cream)] leading-tight tracking-wide">
            YOU LOVE MOST
          </h2>
          <div className="w-[80px] h-[1px] bg-[rgba(201,151,58,0.4)] my-6" />
          <p className="font-sans font-light text-[13px] tracking-[0.12em] text-[var(--color-cream-muted)] uppercase">
            Anniversaries · Gender Reveals · Romantic Dinners
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 mt-10 pointer-events-auto">
            <Link href="/booking" className="bg-[var(--color-gold)] text-[#080604] font-sans font-medium text-[12px] tracking-[0.15em] py-[14px] px-[36px] rounded-sm transition-transform hover:scale-105 inline-block">
              BOOK A DOME
            </Link>
            <button className="bg-transparent border border-[var(--color-gold)] text-[var(--color-gold)] font-sans font-medium text-[12px] tracking-[0.15em] py-[14px] px-[36px] rounded-sm transition-all hover:bg-[var(--color-gold)] hover:text-[#080604]">
              VIEW PACKAGES
            </button>
          </div>
        </div>
      </CrossfadeSection>

      {/* Section 4: genderreveal → celebrations */}
      <CrossfadeSection currentImage="/images/genderreveal_v2.png" nextImage="/images/celebrations.png">
        <div className="flex flex-col items-center text-center">
          <p className="font-display italic font-light text-[36px] md:text-[52px] text-[var(--color-cream-muted)] leading-tight">
            THE BIG
          </p>
          <h2 className="font-display font-semibold text-[48px] md:text-[80px] text-[var(--color-cream)] leading-tight tracking-wide">
            REVEAL
          </h2>
          <div className="w-[80px] h-[1px] bg-[rgba(201,151,58,0.4)] my-6" />
          <p className="font-sans font-light text-[13px] tracking-[0.12em] text-[var(--color-cream-muted)] uppercase">
            Magical gender reveal celebrations
          </p>
        </div>
      </CrossfadeSection>

      {/* Section 5: celebrations — last section, no next image needed, 100vh */}
      <CrossfadeSection currentImage="/images/celebrations.png" nextImage="/images/celebrations.png" isLast>
        <div className="flex flex-col items-center text-center pointer-events-auto">

          {/* Eyebrow */}
          <p className="font-sans font-light text-[11px] tracking-[0.5em] text-[var(--color-cream-muted)] uppercase mb-3">
            For Every Occasion
          </p>

          {/* Headline */}
          <h2 className="font-display font-light text-[42px] sm:text-[60px] md:text-[80px] tracking-[0.1em] text-[var(--color-cream)] leading-none mb-4 whitespace-nowrap">
            ANY OCCASION
          </h2>

          {/* Divider */}
          <div className="w-[60px] h-[1px] bg-[rgba(201,151,58,0.5)] mb-4" />

          {/* Subtext */}
          <p className="font-sans font-light text-[13px] tracking-[0.15em] text-[var(--color-cream-muted)]">
            BIRTHDAYS · FAREWELLS · GET-TOGETHERS
          </p>

          {/* CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 mt-7">
            <Link href="/booking"
              className="font-sans font-medium text-[12px] tracking-[0.15em] uppercase py-[14px] px-[36px] bg-[var(--color-gold)] text-[#080604] border border-[var(--color-gold)] rounded-[2px] transition-all hover:bg-transparent hover:text-[var(--color-gold)]"
            >
              Book a Dome
            </Link>
            <a href="#packages"
              className="font-sans font-medium text-[12px] tracking-[0.15em] uppercase py-[14px] px-[36px] bg-transparent text-[var(--color-gold)] border border-[var(--color-gold)] rounded-[2px] transition-all hover:bg-[var(--color-gold)] hover:text-[#080604]"
            >
              View Packages
            </a>
          </div>
        </div>
      </CrossfadeSection>

      <InsideDome />
      <Packages />
      <FindUs />
      <ReviewsStrip />
      <Footer />

    </main>
  );
}
