'use client';

import { motion } from 'framer-motion';

const locations = [
  {
    area: 'SAINIKPURI',
    address: '3rd & 4th Floor, Hi-Tension Road, Eshwarpuri',
    hours: '11:00 AM – 11:30 PM',
    note: 'Live music · Parking available',
    mapsUrl: 'https://maps.google.com/?q=Dome+Cafe+Sainikpuri+Hyderabad',
  },
  {
    area: 'KOKAPET',
    address: 'Plot 4, Survey 160, Brundavan Colony, 60 Feet Road, Narsingi',
    hours: '11:30 AM – 1:00 AM',
    note: 'Continental & Italian · Late night',
    mapsUrl: 'https://maps.google.com/?q=Dome+Cafe+Kokapet+Hyderabad',
  },
];

export default function FindUs() {
  return (
    <section id="locations" className="relative w-full bg-[#09090E] py-32 overflow-hidden border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col items-center">
        
        {/* Section Heading aligned with Spotlight / Packages style */}
        <div className="flex flex-col items-center gap-3 mb-16 text-center">
          <span className="font-manuka text-xl text-ape-blue tracking-widest font-bold uppercase animate-pulse">
            LOCATIONS
          </span>
          <h2 className="font-manuka text-5xl md:text-7xl lg:text-8xl leading-none text-white font-bold select-none tracking-tight uppercase">
            FIND DOME CAFE
          </h2>
        </div>
 
        <div className="relative flex flex-col md:flex-row w-full max-w-4xl justify-between items-start gap-16 md:gap-8">
          
          {/* Cyber Blue Vertical Divider Line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.4 }}
            viewport={{ once: true }}
            className="absolute left-1/2 top-0 -translate-x-1/2 hidden md:block"
            style={{
              width: '1px',
              height: '280px',
              background: 'linear-gradient(to bottom, transparent, #00A7FA 30%, #00A7FA 70%, transparent)',
              transformOrigin: 'top center',
            }}
          />
 
          {/* Location Cards */}
          {locations.map((loc, i) => (
            <motion.div
              key={loc.area}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.2 }}
              viewport={{ once: true, margin: '-60px' }}
              className={`flex flex-col w-full md:w-[45%] ${i === 0 ? 'md:pr-12 items-start md:items-end md:text-right' : 'md:pl-12 items-start'}`}
            >
              <p className="font-sans font-medium text-[11px] tracking-[0.4em] text-ape-blue mb-4 uppercase">
                {loc.area}
              </p>
              <h3 className="font-sans font-semibold text-xl md:text-2xl text-white mb-6 leading-snug">
                {loc.address}
              </h3>
              <p className="font-sans font-light text-[13px] text-white/70 mb-2">
                {loc.hours}
              </p>
              <p className="font-sans font-light text-[13px] text-white/40 mb-6 uppercase tracking-wider">
                {loc.note}
              </p>
              <a 
                href={loc.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans font-medium text-[12px] tracking-[0.1em] text-ape-blue uppercase hover:text-white hover:border-white transition-all border-b border-ape-blue/40 pb-1"
              >
                Get Directions →
              </a>
            </motion.div>
          ))}
          
        </div>
      </div>
    </section>
  );
}
