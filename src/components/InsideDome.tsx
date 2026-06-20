'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'You Arrive',
    body: 'Walk into a private glass dome decorated exactly for your occasion. Balloon arches, LED neon signs, rose petals — all set before you arrive.',
    icon: '✦',
  },
  {
    number: '02',
    title: 'You Celebrate',
    body: 'Your 1.5-hour session begins. Multicuisine dining, intimate seating for two, and a setup that makes every photo effortless.',
    icon: '✦',
  },
  {
    number: '03',
    title: 'We Handle Everything',
    body: 'No stress. You tell us the occasion — we build the dome around it. Candles, decor, signage, roses — fully handled.',
    icon: '✦',
  },
];

export default function InsideDome() {
  return (
    <section className="w-full bg-[#09090E] py-32 px-6 md:px-12 relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-16 md:gap-24">
        
        {/* Left sticky heading aligned with Locations & Reviews */}
        <div className="md:w-1/3 md:sticky md:top-32 flex-shrink-0 flex flex-col gap-3">
          <span className="font-manuka text-xl text-ape-blue tracking-widest font-bold uppercase animate-pulse">
            EXPERIENCE
          </span>
          <h2 className="font-manuka text-5xl md:text-7xl leading-none text-white font-bold select-none tracking-tight uppercase">
            INSIDE<br />THE DOME
          </h2>
        </div>

        {/* Right side step cards with cyberpunk styling */}
        <div className="md:w-2/3 flex flex-col gap-8 md:gap-12 w-full">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.15 }}
              viewport={{ once: true, margin: '-80px' }}
              className="relative p-8 md:p-10 border border-white/5 bg-white/5 backdrop-blur-sm rounded-xl transition-all duration-300 hover:border-white/10 hover:bg-white/10"
            >
              {/* Receded translucent step number */}
              <div className="absolute top-6 right-8 font-manuka font-bold text-[64px] md:text-[80px] text-white/5 leading-none select-none">
                {step.number}
              </div>
              
              {/* Accent Icon */}
              <div className="text-ape-blue mb-4 text-lg">
                {step.icon}
              </div>
              
              {/* Step Title */}
              <h3 className="font-sans font-bold text-xl md:text-2xl text-white mb-4 uppercase tracking-wide">
                {step.title}
              </h3>
              
              {/* Step Description */}
              <p className="font-sans font-light text-sm md:text-base text-white/70 leading-[1.8] max-w-lg relative z-10 uppercase tracking-wider">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
