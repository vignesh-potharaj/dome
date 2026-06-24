'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ApeCanvas from '@/components/ApeCanvas';
import InsideDome from '@/components/InsideDome';
import FindUs from '@/components/FindUs';
import ReviewsStrip from '@/components/ReviewsStrip';

// Occasions data matching the ApeChain layout
const occasions = [
  {
    name: 'DOME CAFE',
    category: 'HYDERABAD',
    description: "India's first dome-shaped celebration café. Experience luxury private dining under the stars with spectacular lighting and ambiance.",
    image: '/images/dome.png',
    url: '/booking',
    accent: '#E8B96A', // Gold
  },
  {
    name: 'BIRTHDAYS',
    category: 'CELEBRATIONS',
    description: 'Celebrate your special milestone in style. Private dome booking, gorgeous custom balloon decoration, LED signs, and gourmet dining.',
    image: '/images/birthday_v3.png',
    url: '/booking',
    accent: '#FF9F0A', // Orange
  },
  {
    name: 'ANNIVERSARIES',
    category: 'ROMANCE',
    description: 'For the ones you love most. Create magical moments with romantic table setups, rose petals, soft candlelight, and premium packages.',
    image: '/images/anniversary.png',
    url: '/booking',
    accent: '#FF375F', // Red
  },
  {
    name: 'GENDER REVEAL',
    category: 'MOMENTS',
    description: 'Reveal the big secret in a grand way! Custom colored balloons, background sparks, and thematic setups in a private celebration dome.',
    image: '/images/genderreveal_v2.png',
    url: '/booking',
    accent: '#FF5E97', // Pink
  },
  {
    name: 'ANY OCCASION',
    category: 'MEMORIES',
    description: 'From corporate dinners and farewells to family reunions, we customize decorations and catering to deliver a premium experience.',
    image: '/images/celebrations.png',
    url: '/booking',
    accent: '#BF5AF2', // Purple
  },
];

// Cafe packages data for the grid section
const packages = [
  {
    name: 'PARTY DOME',
    category: 'BUDGET VALUE',
    price: '₹3,999',
    description: 'Private dome slot (90 Mins) with 2 mocktails, complimentary 500g cake, latex balloon decor (200 balloons), rose petal table styling, LED candles, banner, and 3 LED letters.',
    image: '/images/dome.png',
    url: '/booking',
    accent: '#E8B96A',
  },
  {
    name: 'VIBE DOME',
    category: 'POPULAR CHOICE',
    price: '₹5,999',
    description: 'Premium upgrade with chrome balloon decor (200 balloons), custom LED name sign, 10 photo prints with a keepsake frame, personalized letter, foil balloon, blindfold, and cake sparkler.',
    image: '/images/birthday_v3.png',
    url: '/booking',
    accent: '#FF9F0A',
  },
  {
    name: 'MAGIC DOME',
    category: 'RECOMMENDED',
    price: '₹8,999',
    description: 'Gourmet private dining package adding balloon stands, flower petal entrance, 2 cold fire crackers, and a 3-course meal (2 starters, 1 main, 2 desserts).',
    image: '/images/genderreveal_v2.png',
    url: '/booking',
    accent: '#FF5E97',
  },
  {
    name: 'ELITE DOME',
    category: 'PREMIUM LAYOUT',
    price: '₹14,999',
    description: 'Luxury celebration layout featuring a complimentary 1 Kg cake, balloon color selection, 4 cold fire crackers, fog entry effect, fresh rose bouquet, and a professional photographer.',
    image: '/images/anniversary.png',
    url: '/booking',
    accent: '#FF375F',
  },
  {
    name: 'LUXURY DOME',
    category: 'ULTIMATE EXPERIENCE',
    price: '₹19,999',
    description: 'The ultimate VIP experience adding 6 cold fire crackers, a live guitarist, custom welcome board, chocolate bouquet, and a full premium dining menu.',
    image: '/images/celebrations.png',
    url: '/booking',
    accent: '#BF5AF2',
  },
];

interface PkgType {
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
  url: string;
  accent: string;
}

const PackageCard = ({ pkg, isFeatured = false }: { pkg: PkgType; isFeatured?: boolean }) => {
  return (
    <a
      href={pkg.url}
      className={`group relative flex flex-col w-full md:w-[340px] lg:w-[360px] rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:translate-y-[-4px] ${
        isFeatured ? 'border-purple-500/30 shadow-[0_0_35px_0_rgba(191,90,242,0.12)]' : ''
      }`}
    >
      {/* Card Image */}
      <div className="relative w-full overflow-hidden aspect-[16/10]">
        <Image
          src={pkg.image}
          alt={pkg.name}
          fill
          sizes="(max-width: 768px) 100vw, 350px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Card Information */}
      <div className="p-6 flex flex-col gap-2 flex-grow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
            {pkg.category}
          </span>
          <span className="text-sm font-semibold tracking-wider font-mono" style={{ color: pkg.accent }}>
            {pkg.price}
          </span>
        </div>
        <h3 className="font-manuka text-2xl font-bold uppercase text-white group-hover:text-ape-blue transition-colors">
          {pkg.name}
        </h3>
        <p className="text-xs text-white/60 leading-relaxed uppercase tracking-wider font-light">
          {pkg.description}
        </p>
      </div>
    </a>
  );
};

export default function DomeHomepage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeIndex = ((currentIndex % occasions.length) + occasions.length) % occasions.length;

  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  // Responsive width tracking
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleThumbnailClick = (idx: number) => {
    const currentModulo = ((currentIndex % occasions.length) + occasions.length) % occasions.length;
    let diff = idx - currentModulo;
    if (diff > 2) diff -= occasions.length;
    if (diff < -2) diff += occasions.length;
    setCurrentIndex((prev) => prev + diff);
  };

  // Auto-advance timer (4000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Calculate card sizes and cylinder radius dynamically
  const isMobile = windowWidth <= 640;
  const isTablet = windowWidth > 640 && windowWidth <= 1024;

  const cardWidth = isMobile ? 365 : isTablet ? 740 : 1080;
  const cardHeight = isMobile ? 210 : isTablet ? 420 : 615;
  const radius = isMobile ? 260 : isTablet ? 480 : 700;
  const perspective = isMobile ? 950 : isTablet ? 1300 : 1600;
  const translateY = isMobile ? 80 : isTablet ? 145 : 230;

  return (
    <div className="relative min-h-screen bg-[#09090E] text-white font-sans overflow-x-hidden selection:bg-ape-blue selection:text-black">
      {/* 3D Interactive Background Canvas */}
      <ApeCanvas />

      <style>{`
        .carousel-container {
          --card-width: ${cardWidth}px;
          --card-height: ${cardHeight}px;
        }
      `}</style>

      {/* Header */}
      <header className="fixed left-0 top-0 z-[99] flex w-full h-[80px] md:h-[100px] items-center justify-between px-6 md:px-12 backdrop-blur-md border-b border-white/5 bg-black/20">
        {/* Hamburger Menu Toggle (Mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden z-50 p-2 text-white hover:text-ape-blue transition-colors"
          aria-label="Toggle Menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        {/* Brand Text Logo in Manuka Font */}
        <a href="/" className="z-40 font-manuka text-3xl tracking-[0.2em] text-white hover:text-ape-blue transition-colors duration-300">
          DOME CAFE
        </a>

        {/* Navigation Links */}
        <nav className={`fixed md:relative inset-0 md:inset-auto z-30 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 bg-black md:bg-transparent transition-transform duration-300 md:translate-x-0 ${menuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          {['About Us', 'Menu', 'Celebrations', 'Gallery', 'Locations'].map((link) => {
            const url = link === 'Celebrations' ? '#packages' : link === 'Locations' ? '#locations' : '/';
            return (
              <a
                key={link}
                href={url}
                className="font-manuka text-[32px] md:text-[20px] uppercase text-white/60 hover:text-white transition-colors tracking-widest"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            );
          })}
        </nav>

        {/* Action Button: Book Now */}
        <a href="/booking" className="hidden md:inline-flex relative overflow-hidden rounded-[4px] border border-white/20 hover:border-white px-6 py-2 text-xs font-semibold uppercase tracking-widest text-white transition-all bg-white/5 hover:bg-white/10">
          Book Now
        </a>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-[100px]">
        {/* Section 1: Hero Carousel with 3D Curved Cylinder Ring */}
        <section className="SectionHomepageHero relative min-h-[calc(100vh-100px)] flex flex-col justify-end pb-16">
          
          {/* Centered 3D Cylinder Ring Carousel Background */}
          <div 
            className="absolute top-0 left-0 right-0 h-[calc(100vh-100px)] flex items-center justify-center pointer-events-none select-none z-0"
            style={{
              perspective: `${perspective}px`,
            }}
          >
            <div
              className="carousel-container relative flex items-center justify-center"
              style={{
                transformStyle: 'preserve-3d',
                width: 'var(--card-width)',
                height: 'var(--card-height)',
                transform: `rotateX(8deg) translateZ(${-radius}px) translateY(${translateY}px)`,
              }}
            >
              <motion.div
                animate={{ rotateY: -currentIndex * 72 }}
                transition={{
                  type: 'spring',
                  stiffness: 120,
                  damping: 18,
                  mass: 1.1,
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                }}
              >
                {occasions.map((occasion, index) => {
                  const angle = index * 72;
                  const isActive = index === activeIndex;

                  return (
                    <div
                      key={occasion.name}
                      style={{
                        position: 'absolute',
                        width: 'var(--card-width)',
                        height: 'var(--card-height)',
                        left: '50%',
                        top: '50%',
                        marginLeft: 'calc(-1 * var(--card-width) / 2)',
                        marginTop: 'calc(-1 * var(--card-height) / 2)',
                        transform: `rotateY(${angle}deg) rotateX(22deg) translateZ(${radius}px)`,
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'visible',
                        pointerEvents: 'auto',
                      }}
                      onClick={() => handleThumbnailClick(index)}
                      className="rounded-t-[50%] rounded-b-2xl overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={occasion.image}
                        alt={occasion.name}
                        fill
                        sizes="(max-width: 640px) 365px, (max-width: 1024px) 740px, 1080px"
                        className="object-cover"
                        draggable={false}
                        priority={index === 0}
                      />
                      {/* Recede overlay for side slides */}
                      <div
                        className="absolute inset-0 bg-black transition-opacity duration-500"
                        style={{
                          opacity: isActive ? 0.05 : 0.65,
                        }}
                      />
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>

          {/* Stable Vertical Navigation Arrows on the Right */}
          <div className="absolute top-0 left-0 right-0 h-[calc(100vh-100px)] w-full max-w-7xl mx-auto px-6 md:px-12 pointer-events-none z-20">
            <div className="relative w-full h-full">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-ape-blue hover:border-ape-blue transition-all duration-300 cursor-pointer"
                  aria-label="Next Slide"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-ape-blue hover:border-ape-blue transition-all duration-300 cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Floating controls / Content layered over the carousel */}
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative flex flex-col justify-end min-h-[calc(100vh-200px)] z-10 pointer-events-none">

            <div className="w-full flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 mt-auto">
              {/* Left Content Info Panel */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 max-w-xl pointer-events-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -35 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center lg:items-start gap-4"
                  >
                    {/* Category Tag Badge */}
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse" style={{ color: occasions[activeIndex].accent }}>
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                      <span className="font-manuka text-lg tracking-wider" style={{ color: occasions[activeIndex].accent }}>HOT</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wider text-white/80">
                        {occasions[activeIndex].category}
                      </span>
                    </div>

                    {/* Active Title */}
                    <h1 className="font-manuka text-6xl md:text-8xl lg:text-9xl leading-none text-white font-bold select-none tracking-tight">
                      {occasions[activeIndex].name}
                    </h1>

                    {/* Active Description */}
                    <p className="max-w-md text-white/70 text-sm md:text-base leading-relaxed tracking-wider uppercase font-light">
                      {occasions[activeIndex].description}
                    </p>

                    {/* Book Now Button */}
                    <a
                      href={occasions[activeIndex].url}
                      className="pulse-glow relative mt-4 inline-flex items-center justify-center overflow-hidden rounded-[4px] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-black transition-transform hover:scale-[1.03] w-[180px]"
                      style={{
                        background: `linear-gradient(90deg, ${occasions[activeIndex].accent} 0%, #FFFFFF 100%)`,
                      }}
                    >
                      Book Now
                    </a>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Content Panel: Thumbnails Strip */}
              <div className="flex flex-col items-center lg:items-end gap-6 pointer-events-auto">
                <a href="#packages" className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2">
                  See All Packages
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>

                {/* Thumbnails Row */}
                <div className="flex gap-4">
                  {occasions.map((occasion, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={occasion.name}
                        onClick={() => handleThumbnailClick(idx)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          isActive
                            ? 'border-white scale-110 shadow-[0_0_20px_0_rgba(255,255,255,0.4)]'
                            : 'border-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <Image
                          src={occasion.image}
                          alt={occasion.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Section 2: Spotlight (Celebrating Anniversaries) */}
        <section id="explore" className="relative min-h-screen py-24 flex items-center justify-center overflow-hidden border-t border-white/5">
          {/* Wireframe background grid lines */}
          <div className="Background_grid__B6Ncz absolute inset-0">
            <div className="Background_grid-wrap__MIDDp"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Side: Spotlight Title & Content */}
            <div className="lg:col-span-7 flex flex-col items-start gap-8">
              <div className="flex items-center gap-2">
                <span className="font-manuka text-xl text-ape-blue tracking-widest font-bold">SPOTLIGHT</span>
              </div>
              <h2 className="font-manuka text-5xl md:text-7xl lg:text-8xl leading-none text-white font-bold select-none tracking-tight">
                Where Moments Shine & Memories Stay
              </h2>
              <div className="flex flex-wrap gap-4 mt-4">
                <a href="/booking" className="relative inline-flex items-center justify-center rounded-[4px] border border-white/20 bg-white/5 hover:bg-white/10 px-8 py-3 text-xs font-semibold uppercase tracking-widest transition-all">
                  Book a Dome
                </a>
                <a href="#packages" className="relative inline-flex items-center justify-center rounded-[4px] border border-white/20 bg-white/5 hover:bg-white/10 px-8 py-3 text-xs font-semibold uppercase tracking-widest transition-all">
                  View Packages
                </a>
              </div>
            </div>

            {/* Right Side: Floating Tilted 3D Spotlight Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div
                className="spotlight-card relative max-w-[400px] aspect-[4/3] w-full rounded-2xl p-0.5"
                style={{
                  background: 'linear-gradient(45deg, #A281FF 10%, #EB8280 33%, #EBBF9A 66%, #89D0FF 90%)',
                  transform: 'perspective(800px) scale(1.4) rotateX(7.5deg) rotateY(-15deg) rotateZ(6deg)',
                }}
              >
                {/* Inner Card Content */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#09090E]">
                  <Image
                    src="/images/anniversary.png"
                    alt="Anniversaries at Dome Cafe"
                    fill
                    sizes="(max-width: 768px) 600px, 1000px"
                    className="object-cover opacity-90"
                  />
                  {/* Backdrop Shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  
                  {/* Description overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-manuka text-3xl font-bold uppercase text-white mb-1">Luxury Anniversaries</h3>
                    <p className="font-mono text-[10px] tracking-wider uppercase text-white/60">
                      Private romantic dome setups under the stars in Hyderabad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <InsideDome />

        {/* Section 3: Packages Grid */}
        <section id="packages" className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500 animate-pulse">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <h2 className="font-manuka text-4xl uppercase tracking-widest text-white">Dome Packages</h2>
            </div>
            <a href="/booking" className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              Book Instantly
            </a>
          </div>

          {/* Desktop Symmetrical Layout (Row 1: Party, Luxury, Vibe | Row 2: Magic, Elite) */}
          <div className="hidden lg:flex flex-col gap-8 w-full items-center">
            {/* Row 1: 3 Cards Centered */}
            <div className="flex justify-center gap-8 w-full">
              <PackageCard pkg={packages[0]} />
              <PackageCard pkg={packages[4]} isFeatured={true} />
              <PackageCard pkg={packages[1]} />
            </div>
            {/* Row 2: 2 Cards Centered */}
            <div className="flex justify-center gap-8 w-full">
              <PackageCard pkg={packages[2]} />
              <PackageCard pkg={packages[3]} />
            </div>
          </div>

          {/* Mobile/Tablet Symmetrical Layout (2-2-1 layout using flex wrapping) */}
          <div className="flex flex-wrap justify-center gap-8 lg:hidden w-full">
            <PackageCard pkg={packages[0]} />
            <PackageCard pkg={packages[1]} />
            <PackageCard pkg={packages[2]} />
            <PackageCard pkg={packages[3]} />
            <PackageCard pkg={packages[4]} isFeatured={true} />
          </div>
        </section>

        {/* Section 4: Locations */}
        <FindUs />

        {/* Section 5: Reviews */}
        <ReviewsStrip />
      </main>

      {/* Footer */}
      <footer id="footer" className="relative z-10 border-t border-white/5 py-12 px-6 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <span className="font-manuka text-lg uppercase text-white/40 tracking-wider">© 2026 DOME CAFE HYDERABAD</span>
          </div>
          <div className="flex gap-8">
            {['Instagram', 'Location', 'Packages', 'Booking'].map((link) => {
              const url = link === 'Booking' ? '/booking' : link === 'Packages' ? '#packages' : link === 'Location' ? '#locations' : '/';
              return (
                <a
                  key={link}
                  href={url}
                  className="font-mono text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  {link}
                </a>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}
