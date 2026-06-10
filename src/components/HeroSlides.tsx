'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CrossfadeSection } from '@/components/CrossfadeSection';

interface SlideData {
  _id: string;
  title: string;
  subtitle?: string;
  italicText?: string;
  currentImage: string;
  nextImage: string;
  badgeText?: string;
  isFirst?: boolean;
  showButtons?: boolean;
}

export default function HeroSlides({ slides }: { slides: SlideData[] }) {
  return (
    <>
      {slides.map((slide, index) => {
        const isLast = index === slides.length - 1;

        return (
          <CrossfadeSection
            key={slide._id}
            currentImage={slide.currentImage}
            nextImage={slide.nextImage || slide.currentImage}
            isLast={isLast}
          >
            <div className="flex flex-col items-center text-center">
              {/* Highlight italic text on top (e.g. For Every Occasion, For the Ones) */}
              {slide.italicText && !slide.isFirst && (
                <p className="font-display italic font-light text-[36px] md:text-[52px] text-[var(--color-cream-muted)] leading-tight">
                  {slide.italicText}
                </p>
              )}

              {/* Eyebrow text fallback or if layout matches any occasion */}
              {slide.isFirst ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <h1 className="font-display font-light text-[52px] md:text-[90px] tracking-[0.3em] text-[var(--color-gold)] leading-none text-center">
                    {slide.title}
                  </h1>
                </motion.div>
              ) : (
                <h2 className="font-display font-light text-[36px] md:text-[72px] tracking-[0.25em] text-[var(--color-cream)] leading-tight ml-[0.25em] text-center">
                  {slide.title}
                </h2>
              )}

              {/* Subtitle description (e.g. Hyderabad, or description) */}
              {slide.subtitle && slide.isFirst && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="font-sans font-light text-[13px] tracking-[0.6em] text-[var(--color-cream-muted)] mt-2 uppercase ml-[0.6em] text-center"
                >
                  {slide.subtitle}
                </motion.p>
              )}

              {/* Divider Line */}
              {slide.isFirst ? (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="w-[80px] h-[1px] bg-[rgba(201,151,58,0.4)] my-6 origin-center"
                />
              ) : (
                <div className="w-[80px] h-[1px] bg-[rgba(201,151,58,0.4)] my-6" />
              )}

              {/* Italic highlight text at bottom (for Slide 1) */}
              {slide.italicText && slide.isFirst && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="font-display italic font-light text-[26px] text-[var(--color-cream)] text-center"
                >
                  {slide.italicText}
                </motion.p>
              )}

              {/* Subtitle description for normal slides (e.g. Private dome · Balloon décor · LED signs) */}
              {slide.subtitle && !slide.isFirst && (
                <p className="font-sans font-light text-[14px] tracking-[0.1em] text-[var(--color-cream-muted)] text-center uppercase">
                  {slide.subtitle}
                </p>
              )}

              {/* CTA buttons */}
              {slide.showButtons && (
                <div className="flex flex-col sm:flex-row gap-5 mt-10 pointer-events-auto">
                  <Link href="/booking" className="bg-[var(--color-gold)] text-[#080604] font-sans font-medium text-[12px] tracking-[0.15em] py-[14px] px-[36px] rounded-sm transition-transform hover:scale-105 inline-block">
                    BOOK A DOME
                  </Link>
                  <a href="#packages" className="bg-transparent border border-[var(--color-gold)] text-[var(--color-gold)] font-sans font-medium text-[12px] tracking-[0.15em] py-[14px] px-[36px] rounded-sm transition-all hover:bg-[var(--color-gold)] hover:text-[#080604] inline-block text-center">
                    VIEW PACKAGES
                  </a>
                </div>
              )}
            </div>

            {/* Scroll indicator for first slide */}
            {slide.isFirst && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="mt-12 flex flex-col items-center pointer-events-auto cursor-pointer"
              >
                <span className="font-sans font-light text-[11px] text-[var(--color-cream-muted)] tracking-[0.3em] mb-2 uppercase">Scroll</span>
                <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                  <span className="text-[var(--color-cream-muted)] text-sm">↓</span>
                </motion.div>
              </motion.div>
            )}

            {/* Floating Badge */}
            {slide.badgeText && (
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute top-[20%] right-[5%] md:right-[15%] border border-[rgba(201,151,58,0.4)] px-5 py-3 rounded-sm backdrop-blur-sm pointer-events-auto"
              >
                <span className="font-sans font-light text-[12px] text-[var(--color-gold)] uppercase">
                  {slide.badgeText}
                </span>
              </motion.div>
            )}
          </CrossfadeSection>
        );
      })}
    </>
  );
}
