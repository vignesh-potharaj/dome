'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const carouselSlides = [
  {
    tag: "HYDERABAD",
    title: "DOME CAFE",
    flourish: "under the stars",
    description: "India's first dome-shaped celebration cafÃ©. Experience luxury private dining under the stars with spectacular lighting and ambiance.",
    ctaLabel: "Book a Dome",
    ctaLink: "/booking",
    image: "/images/dome.png",
    thumbLabel: "Dome Cafe",
    accentColor: "#E8B96A", // Warm gold
    badgeBg: "rgba(232, 185, 106, 0.18)",
    badgeText: "#E8B96A",
    glowColor: "rgba(232, 185, 106, 0.35)",
    btnBg: "#E8B96A",
    btnText: "#080604",
    glowStart: "rgba(232, 185, 106, 0.25)",
    glowEnd: "rgba(232, 185, 106, 0.55)",
  },
  {
    tag: "CELEBRATIONS",
    title: "BIRTHDAYS",
    flourish: "make a wish",
    description: "Celebrate your special milestone in style. Private dome booking, gorgeous custom balloon decoration, LED signs, and gourmet dining.",
    ctaLabel: "Book a Dome",
    ctaLink: "/booking",
    image: "/images/birthday_v3.png",
    thumbLabel: "Birthdays",
    accentColor: "#FF9F0A", // Vibrant celebration orange/yellow
    badgeBg: "rgba(255, 159, 10, 0.18)",
    badgeText: "#FF9F0A",
    glowColor: "rgba(255, 159, 10, 0.35)",
    btnBg: "#FF9F0A",
    btnText: "#080604",
    glowStart: "rgba(255, 159, 10, 0.25)",
    glowEnd: "rgba(255, 159, 10, 0.55)",
  },
  {
    tag: "ROMANCE",
    title: "ANNIVERSARIES",
    flourish: "for the ones you love",
    description: "For the ones you love most. Create magical moments with romantic table setups, rose petals, soft candlelight, and premium packages.",
    ctaLabel: "Book a Dome",
    ctaLink: "/booking",
    image: "/images/anniversary.png",
    thumbLabel: "Anniversaries",
    accentColor: "#FF375F", // Vibrant romantic pink
    badgeBg: "rgba(255, 55, 95, 0.18)",
    badgeText: "#FF375F",
    glowColor: "rgba(255, 55, 95, 0.4)",
    btnBg: "#FF375F",
    btnText: "#FFFFFF",
    glowStart: "rgba(255, 55, 95, 0.3)",
    glowEnd: "rgba(255, 55, 95, 0.65)",
  },
  {
    tag: "MOMENTS",
    title: "GENDER REVEAL",
    flourish: "boy or girl?",
    description: "Reveal the big secret in a grand way! Custom colored balloons, background sparks, and thematic setups in a private celebration dome.",
    ctaLabel: "Book a Dome",
    ctaLink: "/booking",
    image: "/images/genderreveal_v2.png",
    thumbLabel: "Gender Reveal",
    accentColor: "#FF5E97", // Pink & blue theme
    badgeBg: "linear-gradient(90deg, rgba(255, 94, 151, 0.25) 0%, rgba(94, 185, 255, 0.25) 100%)",
    badgeText: "#FFCCD8",
    glowColor: "rgba(255, 94, 151, 0.35)",
    btnBg: "linear-gradient(90deg, #FF5E97 0%, #5EB9FF 100%)",
    btnText: "#080604",
    glowStart: "rgba(255, 94, 151, 0.3)",
    glowEnd: "rgba(94, 185, 255, 0.6)",
    isDualGlow: true,
  },
  {
    tag: "MEMORIES",
    title: "ANY OCCASION",
    flourish: "celebrate everything",
    description: "From corporate dinners and farewells to family reunions, we customize decorations and catering to deliver a premium experience.",
    ctaLabel: "Book a Dome",
    ctaLink: "/booking",
    image: "/images/celebrations.png",
    thumbLabel: "Any Occasion",
    accentColor: "#BF5AF2", // Festive purple
    badgeBg: "linear-gradient(90deg, rgba(232, 185, 106, 0.2) 0%, rgba(191, 90, 242, 0.2) 100%)",
    badgeText: "#E5C8FF",
    glowColor: "rgba(191, 90, 242, 0.35)",
    btnBg: "linear-gradient(90deg, #E8B96A 0%, #BF5AF2 100%)",
    btnText: "#080604",
    glowStart: "rgba(191, 90, 242, 0.25)",
    glowEnd: "rgba(232, 185, 106, 0.55)",
    isMultiGlow: true,
  }
];

export default function DomeHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 5);
    }, 4000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isHovered) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isHovered, activeIndex]);

  const handleManualSelect = (index: number) => {
    setActiveIndex(index);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + 5) % 5);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % 5);
  };

  const getCardPosition = (index: number, activeIdx: number) => {
    const offset = (index - activeIdx + 5) % 5;
    const zIndex = 10 - offset; // higher z-index to stay on top

    const isMobile = windowWidth <= 640;
    const isTablet = windowWidth > 640 && windowWidth <= 1024;

    let width = 360;
    let height = 480;
    let x = 0;
    let z = 0;
    let rotateY = 0;
    let scale = 1;
    let opacity = 1;

    if (isMobile) {
      width = 200;
      height = 270;
      if (offset === 0) {
        x = 0; z = 0; rotateY = 0; scale = 1; opacity = 1;
      } else if (offset === 1) {
        x = 35; z = -60; rotateY = -15; scale = 0.85; opacity = 0.65;
      } else if (offset === 2) {
        x = 65; z = -120; rotateY = -20; scale = 0.70; opacity = 0.35;
      } else if (offset === 3) {
        x = 95; z = -180; rotateY = -25; scale = 0.55; opacity = 0.15;
      } else {
        x = 155; z = -280; rotateY = -25; scale = 0.40; opacity = 0;
      }
    } else if (isTablet) {
      width = 280;
      height = 370;
      if (offset === 0) {
        x = 0; z = 0; rotateY = 0; scale = 1; opacity = 1;
      } else if (offset === 1) {
        x = 120; z = -120; rotateY = -20; scale = 0.85; opacity = 0.65;
      } else if (offset === 2) {
        x = 210; z = -220; rotateY = -30; scale = 0.70; opacity = 0.35;
      } else if (offset === 3) {
        x = 290; z = -320; rotateY = -35; scale = 0.55; opacity = 0.15;
      } else {
        x = 350; z = -420; rotateY = -35; scale = 0.40; opacity = 0;
      }
    } else {
      // Desktop
      width = 360;
      height = 480;
      if (offset === 0) {
        x = 0; z = 0; rotateY = 0; scale = 1; opacity = 1;
      } else if (offset === 1) {
        x = 220; z = -200; rotateY = -25; scale = 0.85; opacity = 0.65;
      } else if (offset === 2) {
        x = 380; z = -350; rotateY = -35; scale = 0.70; opacity = 0.35;
      } else if (offset === 3) {
        x = 500; z = -500; rotateY = -40; scale = 0.55; opacity = 0.15;
      } else {
        x = 560; z = -600; rotateY = -45; scale = 0.40; opacity = 0;
      }
    }

    return { width, height, x, z, rotateY, scale, opacity, zIndex };
  };

  return (
    <>
      <style>{`
        .carousel-container {
          --card-width: 360px;
          --card-height: 480px;
        }

        @media (max-width: 640px) {
          .carousel-container {
            --card-width: 200px;
            --card-height: 270px;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .carousel-container {
            --card-width: 280px;
            --card-height: 370px;
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 12px var(--btn-glow-start);
          }
          50% {
            box-shadow: 0 0 24px var(--btn-glow-end);
          }
        }

        .pulsing-btn {
          animation: pulseGlow 2.5s infinite ease-in-out;
        }
      `}</style>

      <section
        className="carousel-container relative w-full min-h-[100vh] overflow-hidden flex flex-col justify-between pt-[100px] pb-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'linear-gradient(to bottom, #080604 0%, #0d0a07 100%)',
        }}
      >
        {/* Ambient Backdrops reflecting current card color scheme - opacity increased for richness */}
        {carouselSlides.map((slide, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
            style={{
              opacity: index === activeIndex ? 0.28 : 0,
              zIndex: 0,
            }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover filter blur-[70px]"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Muted overlay to blend, drastically reduced to keep photo background colors vibrant */}
        <div className="absolute inset-0 bg-[#080604]/20 pointer-events-none z-[1]" />
        
        {/* Dynamic Color-specific glow reacting to the active slide */}
        <div 
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-[120px] pointer-events-none transition-all duration-1000 ease-in-out z-[1]"
          style={{
            background: carouselSlides[activeIndex].isDualGlow 
              ? 'radial-gradient(circle, rgba(255, 94, 151, 0.3) 0%, rgba(94, 185, 255, 0.2) 50%, transparent 100%)'
              : carouselSlides[activeIndex].isMultiGlow
              ? 'radial-gradient(circle, rgba(191, 90, 242, 0.3) 0%, rgba(232, 185, 106, 0.2) 60%, transparent 100%)'
              : `radial-gradient(circle, ${carouselSlides[activeIndex].glowColor} 0%, transparent 70%)`,
            opacity: isHovered ? 0.55 : 0.45,
          }}
        />

        {/* Main Content Grid */}
        <div className="flex-grow w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between z-[2] relative">
          
          {/* Left Panel: Content Info */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center items-center lg:items-start text-center lg:text-left py-6 lg:py-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center lg:items-start"
              >
                {/* Tag/Badge pill with colorful slide-specific background */}
                <span 
                  className="font-sans font-medium text-[10px] tracking-[0.2em] uppercase mb-4 px-4 py-1.5 border border-transparent rounded-full select-none transition-all duration-500"
                  style={{
                    background: carouselSlides[activeIndex].badgeBg,
                    color: carouselSlides[activeIndex].badgeText,
                  }}
                >
                  {carouselSlides[activeIndex].tag}
                </span>

                {/* Hand-drawn / script flourish accent text */}
                <p 
                  className="font-display italic font-light text-[24px] md:text-[30px] mb-2 leading-none transition-colors duration-500"
                  style={{ color: carouselSlides[activeIndex].accentColor }}
                >
                  {carouselSlides[activeIndex].flourish}
                </p>
                
                {/* Title in near-white for high contrast */}
                <h1 
                  className="font-display font-light text-[38px] sm:text-[52px] lg:text-[68px] leading-[1.1] mb-5 tracking-[0.05em] uppercase"
                  style={{ color: '#F5EDD8' }}
                >
                  {carouselSlides[activeIndex].title}
                </h1>
                
                {/* Description in readable warm cream */}
                <p className="font-sans font-light text-[14px] md:text-[15px] text-[#EAE3D2] leading-relaxed mb-8 max-w-md">
                  {carouselSlides[activeIndex].description}
                </p>
                
                {/* Pulsing CTA Link with active accent bg and glow */}
                <Link
                  href={carouselSlides[activeIndex].ctaLink}
                  className="pulsing-btn text-center font-sans font-medium text-[11px] tracking-[0.15em] py-[15px] px-[38px] rounded-sm transition-all duration-300 hover:scale-[1.03] uppercase select-none inline-block"
                  style={{
                    background: carouselSlides[activeIndex].btnBg,
                    color: carouselSlides[activeIndex].btnText,
                    '--btn-glow-start': carouselSlides[activeIndex].glowStart,
                    '--btn-glow-end': carouselSlides[activeIndex].glowEnd,
                  } as React.CSSProperties}
                >
                  {carouselSlides[activeIndex].ctaLabel}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Panel: 3D Stack */}
          <div className="w-full lg:w-[50%] h-[300px] sm:h-[400px] lg:h-[520px] flex items-center justify-center relative mt-8 lg:mt-0">
            <div
              className="relative flex items-center justify-center"
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d',
                width: 'var(--card-width)',
                height: 'var(--card-height)',
              }}
            >
              {carouselSlides.map((slide, index) => {
                const cardStyle = getCardPosition(index, activeIndex);
                const isActive = index === activeIndex;

                return (
                  <motion.div
                    key={index}
                    onClick={() => handleManualSelect(index)}
                    animate={{
                      x: cardStyle.x,
                      z: cardStyle.z,
                      rotateY: cardStyle.rotateY,
                      scale: cardStyle.scale,
                      opacity: cardStyle.opacity,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 18,
                    }}
                    className={`absolute rounded-[4px] overflow-hidden cursor-pointer select-none`}
                    style={{
                      width: 'var(--card-width)',
                      height: 'var(--card-height)',
                      transformStyle: 'preserve-3d',
                      zIndex: cardStyle.zIndex,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: isActive ? carouselSlides[activeIndex].accentColor : 'rgba(255,255,255,0.06)',
                      boxShadow: isActive ? `0 0 35px ${carouselSlides[activeIndex].glowStart}` : 'none',
                    }}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 280px, 360px"
                      className="object-cover"
                      draggable={false}
                      priority={index === 0}
                    />
                    {/* Shadow overlay to recede non-active cards, active card shows full vibrant color */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-[#080604]/40 hover:bg-[#080604]/10 transition-colors duration-300" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Panel: Controls & Scroll Indicator */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between z-[3] gap-6 md:gap-0 mt-6 lg:mt-0">
          
          {/* Scroll Indicator */}
          <div className="order-2 md:order-1 flex justify-center w-full md:w-auto">
            <div
              onClick={() => {
                const nextSection = document.getElementById('inside-dome');
                if (nextSection) {
                  nextSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex flex-col items-center cursor-pointer hover:opacity-85 transition-opacity"
            >
              <span className="font-sans font-light text-[9px] text-[var(--color-cream-muted)] tracking-[0.3em] mb-1.5 uppercase select-none">Scroll</span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <span className="text-[var(--color-cream-muted)] text-[12px]">â†“</span>
              </motion.div>
            </div>
          </div>

          {/* Controls Strip */}
          <div className="order-1 md:order-2 flex items-center gap-6">
            
            {/* Thumbnail Navigation with spring bounce on active */}
            <div className="flex items-center gap-2">
              {carouselSlides.map((slide, index) => {
                const isActive = index === activeIndex;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleManualSelect(index)}
                    animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className={`relative h-[32px] w-[48px] md:h-[40px] md:w-[60px] rounded-[2px] overflow-hidden outline-none cursor-pointer
                      ${isActive ? 'opacity-100' : 'opacity-35 hover:opacity-75'}
                    `}
                    style={{
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isActive ? carouselSlides[activeIndex].accentColor : 'transparent',
                      boxShadow: isActive ? `0 0 10px ${carouselSlides[activeIndex].glowStart}` : 'none',
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.thumbLabel}
                      fill
                      sizes="60px"
                      className="object-cover"
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* Prev/Next Buttons recoloring dynamically on hover */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[var(--color-cream)] bg-transparent transition-all duration-300 cursor-pointer"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = carouselSlides[activeIndex].accentColor;
                  e.currentTarget.style.color = carouselSlides[activeIndex].accentColor;
                  e.currentTarget.style.boxShadow = `0 0 10px ${carouselSlides[activeIndex].glowStart}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.color = 'var(--color-cream)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                aria-label="Previous Slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[var(--color-cream)] bg-transparent transition-all duration-300 cursor-pointer"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = carouselSlides[activeIndex].accentColor;
                  e.currentTarget.style.color = carouselSlides[activeIndex].accentColor;
                  e.currentTarget.style.boxShadow = `0 0 10px ${carouselSlides[activeIndex].glowStart}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.color = 'var(--color-cream)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                aria-label="Next Slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>

          </div>

        </div>

      </section>
    </>
  );
}

