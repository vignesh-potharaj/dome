'use client';

export interface Review {
  _id?: string;
  name: string;
  text: string;
  stars: number;
}

const defaultReviews: Review[] = [
  { name: 'Priya M.', text: 'The dome was magical. Best birthday surprise ever.', stars: 5 },
  { name: 'Arjun K.', text: 'Proposed here. She said yes. The setup was perfect.', stars: 5 },
  { name: 'Sneha R.', text: 'Absolutely stunning experience. Worth every rupee.', stars: 5 },
  { name: 'Vikram T.', text: 'Private, intimate, beautifully decorated. 10/10.', stars: 5 },
  { name: 'Divya S.', text: 'The team handled everything. We just showed up and celebrated.', stars: 5 },
];

function ReviewCard({ name, text, stars }: Review) {
  return (
    <div className="w-[300px] md:w-[320px] shrink-0 border border-white/5 p-7 bg-white/5 flex flex-col justify-between h-[200px] rounded-xl transition-all duration-300 hover:border-white/10 hover:bg-white/10">
      <div>
        <div className="text-ape-blue text-[14px] tracking-widest mb-3">
          {'★'.repeat(stars)}
        </div>
        <p className="font-sans text-[14px] text-white/70 leading-relaxed mb-4 line-clamp-3">
          "{text}"
        </p>
      </div>
      <p className="font-sans font-semibold text-xs tracking-wider text-white">
        {name}
      </p>
    </div>
  );
}

export default function ReviewsStrip({ reviews = defaultReviews }: { reviews?: Review[] }) {
  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <section id="reviews" className="relative w-full py-32 bg-[#09090E] overflow-hidden border-t border-white/5">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 35s linear infinite;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col items-center">
        {/* Section Heading aligned with other sections */}
        <div className="flex flex-col items-center gap-3 mb-16 text-center">
          <span className="font-manuka text-xl text-ape-blue tracking-widest font-bold uppercase animate-pulse">
            REVIEWS
          </span>
          <h2 className="font-manuka text-5xl md:text-7xl lg:text-8xl leading-none text-white font-bold select-none tracking-tight uppercase">
            WHAT THEY'RE SAYING
          </h2>
        </div>
      </div>

      {/* Marquee Track Container with side fades */}
      <div className="relative w-full flex overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#09090E] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#09090E] to-transparent z-10 pointer-events-none"></div>
        
        <div 
          className="flex gap-6 hover:[animation-play-state:paused] marquee-track shrink-0" 
          style={{ width: 'max-content' }}
        >
          {[...displayReviews, ...displayReviews].map((r, i) => (
            <ReviewCard key={i} {...r} />
          ))}
        </div>
      </div>

    </section>
  );
}
