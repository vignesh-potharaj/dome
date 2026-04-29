'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

interface SpinTransitionProps {
  currentImage: string;
  nextImage?: string;
  children: React.ReactNode;
  priority?: boolean;
}

export default function SpinTransition({ currentImage, nextImage, children, priority = false }: SpinTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // If there's a nextImage, this section acts as a transition zone (200vh).
  // If not, it's just the final section (100vh).
  const isLast = !nextImage;

  // Current Image transforms (fades out halfway through scroll)
  // At scrollProgress 0 to 1 mapping:
  // 0 - 0.5: First half of scroll (user starts scrolling down)
  // 0.5 - 1.0: Second half
  const rotateOut = useTransform(scrollYProgress, [0, 0.5, 1], [0, 360, 720]);
  const scaleOut = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [1, 0.5, 0.5, 1]);
  const opacityOut = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [1, 0, 0, 0]);

  // Next Image transforms (fades in halfway through scroll)
  const opacityIn = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [0, 0, 1, 1]);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full"
      style={{ height: isLast ? '100vh' : '200vh' }}
    >
      <div className="sticky top-0 w-full h-[100vh] overflow-hidden">
        
        {/* Current Image Layer */}
        <motion.div 
          className="absolute inset-0 w-full h-full origin-center will-change-transform"
          style={!isLast ? { rotate: rotateOut, scale: scaleOut, opacity: opacityOut } : {}}
        >
          <Image 
            src={currentImage}
            alt="Background"
            fill
            className="object-cover object-center"
            priority={priority}
          />
        </motion.div>

        {/* Next Image Layer (Crossfade incoming) */}
        {!isLast && nextImage && (
          <motion.div 
            className="absolute inset-0 w-full h-full origin-center will-change-transform"
            style={{ rotate: rotateOut, scale: scaleOut, opacity: opacityIn }}
          >
            <Image 
              src={nextImage}
              alt="Next Background"
              fill
              className="object-cover object-center"
            />
          </motion.div>
        )}

        {/* Content Layer */}
        {/* We want content to fade out as soon as we start spinning, and fade in at the end. */}
        <motion.div 
          className="absolute inset-0 z-10 w-full h-full flex flex-col"
          style={!isLast ? { opacity: opacityOut } : {}}
        >
          {children}
        </motion.div>
        
      </div>
    </section>
  );
}
