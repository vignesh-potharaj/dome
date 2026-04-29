'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'You Arrive',
    body: 'Walk into a private glass dome decorated exactly for your occasion. Balloon arches, LED neon signs, rose petals — all set before you arrive.',
    icon: '✦'
  },
  {
    number: '02',
    title: 'You Celebrate',
    body: 'Your 1.5-hour session begins. Multicuisine dining, intimate seating for two, and a setup that makes every photo effortless.',
    icon: '✦'
  },
  {
    number: '03',
    title: 'We Handle Everything',
    body: 'No stress. You tell us the occasion — we build the dome around it. Candles, decor, signage, roses — fully handled.',
    icon: '✦'
  },
];

export default function InsideDome() {
  return (
    <section className="w-full bg-[#080604] py-32 px-6 md:px-12 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-16 md:gap-24">
        
        {/* Left sticky heading */}
        <div className="md:w-1/3 md:sticky md:top-32 flex-shrink-0">
          <h2 className="font-display font-light text-[48px] md:text-[72px] text-[#C9973A] leading-tight md:leading-[0.9]">
            INSIDE<br />THE DOME
          </h2>
        </div>

        {/* Right side cards */}
        <div className="md:w-2/3 flex flex-col gap-8 md:gap-12 md:pb-[20vh]">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.2 }}
              viewport={{ once: true, margin: '-80px' }}
              className="relative p-8 md:p-10 border border-[rgba(201,151,58,0.15)] bg-[rgba(8,6,4,0.3)] backdrop-blur-sm"
            >
              <div className="absolute top-6 right-8 font-display italic font-light text-[64px] md:text-[80px] text-[#C9973A] opacity-30 leading-none select-none">
                {step.number}
              </div>
              <div className="text-[#C9973A] mb-4 text-lg">
                {step.icon}
              </div>
              <h3 className="font-display font-medium text-[28px] md:text-[32px] text-[#F5EDD8] mb-4">
                {step.title}
              </h3>
              <p className="font-sans font-light text-[15px] text-[#B8A882] leading-[1.8] max-w-lg relative z-10">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
