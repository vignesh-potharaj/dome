'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image, { StaticImageData } from 'next/image';

interface CrossfadeSectionProps {
  currentImage: StaticImageData | string;
  nextImage: StaticImageData | string;
  children: React.ReactNode;
  isLast?: boolean;
}

export function CrossfadeSection({
  currentImage,
  nextImage,
  children,
  isLast = false,
}: CrossfadeSectionProps) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Current image: fully visible at rest, fades out in the LAST 25% of scroll
  const currentOpacity = useTransform(
    scrollYProgress,
    [0, 0.65, 0.85],
    isLast ? [1, 1, 1] : [1, 1, 0]
  );

  // Next image: invisible at rest, fades in during the LAST 25% of scroll
  const nextOpacity = useTransform(
    scrollYProgress,
    [0, 0.65, 0.85],
    [0, 0, 1]
  );

  // Subtle inner zoom on current image as it fades — creates depth, not movement
  // Scale stays close to 1 — just a whisper of zoom (1.0 → 1.04)
  const currentScale = useTransform(
    scrollYProgress,
    [0, 0.85],
    [1.0, 1.04]
  );

  // Text: fades out earlier so it doesn't clash with incoming content
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.45, 0.65],
    isLast ? [1, 1, 1] : [1, 1, 0]
  );

  const textY = useTransform(
    scrollYProgress,
    [0, 0.65],
    isLast ? [0, 0] : [0, -24]
  );

  return (
    // 250vh gives plenty of scroll room — transition happens in the last ~60vh of scroll
    <div ref={containerRef} style={{ height: isLast ? '100vh' : '250vh', position: 'relative' }}>
      
      {/* STICKY VIEWPORT — holds everything during scroll */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>

        {/* LAYER 0: Next image — sits beneath, fades in */}
        <motion.div style={{
          opacity: nextOpacity,
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}>
          <Image
            src={nextImage}
            alt=""
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority={false}
          />
        </motion.div>

        {/* LAYER 1: Current image — on top, subtle zoom, fades out */}
        <motion.div style={{
          opacity: currentOpacity,
          scale: currentScale,
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          willChange: 'opacity, transform',
          transformOrigin: 'center center',
        }}>
          <Image
            src={currentImage}
            alt=""
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
        </motion.div>

        {/* LAYER 2: Gradient — always present, sits over both images */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(8,6,4,0.05) 0%, rgba(8,6,4,0.15) 40%, rgba(8,6,4,0.75) 80%, rgba(8,6,4,0.95) 100%)',
          pointerEvents: 'none',
        }} />

        {/* LAYER 3: Text content — fades and lifts on scroll */}
        <motion.div style={{
          opacity: textOpacity,
          y: textY,
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: '10vh',
        }}>
          {children}
        </motion.div>

      </div>
    </div>
  );
}
