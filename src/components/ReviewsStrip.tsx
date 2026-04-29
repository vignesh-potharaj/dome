'use client';

const reviews = [
  { name: 'Priya M.', text: 'The dome was magical. Best birthday surprise ever.', stars: 5 },
  { name: 'Arjun K.', text: 'Proposed here. She said yes. The setup was perfect.', stars: 5 },
  { name: 'Sneha R.', text: 'Absolutely stunning experience. Worth every rupee.', stars: 5 },
  { name: 'Vikram T.', text: 'Private, intimate, beautifully decorated. 10/10.', stars: 5 },
  { name: 'Divya S.', text: 'The team handled everything. We just showed up and celebrated.', stars: 5 },
];

function ReviewCard({ name, text, stars }: { name: string; text: string; stars: number }) {
  return (
    <div className="w-[320px] shrink-0 border border-[rgba(201,151,58,0.15)] p-7 bg-[#080604] flex flex-col justify-between h-full">
      <div>
        <div className="text-[#C9973A] text-[14px] tracking-widest mb-4">
          {'★'.repeat(stars)}
        </div>
        <p className="font-display italic font-light text-[18px] text-[#B8A882] leading-[1.7] mb-6">
          "{text}"
        </p>
      </div>
      <p className="font-sans font-medium text-[13px] text-[#F5EDD8]">
        {name}
      </p>
    </div>
  );
}

export default function ReviewsStrip() {
  return (
    <section className="relative w-full py-24 bg-[#080604] overflow-hidden border-t border-[rgba(201,151,58,0.1)]">
      
      <div className="flex justify-center mb-16">
        <h2 className="font-sans font-light text-[11px] tracking-[0.5em] text-[#B8A882] uppercase">
          WHAT THEY'RE SAYING
        </h2>
      </div>

      {/* Marquee Track Container */}
      <div 
        className="flex gap-6 hover:[animation-play-state:paused]" 
        style={{ animation: 'marquee 30s linear infinite', width: 'max-content' }}
      >
        {[...reviews, ...reviews].map((r, i) => (
          <ReviewCard key={i} {...r} />
        ))}
      </div>

    </section>
  );
}
