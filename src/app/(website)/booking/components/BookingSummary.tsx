'use client';

interface BookingSummaryProps {
  booking: any;
  total: number;
}

export default function BookingSummary({ booking, total }: BookingSummaryProps) {
  
  const formatDate = (d: Date | null) => {
    if (!d) return 'Not selected';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPackageName = (id: string | null) => {
    if (!id) return 'Not selected';
    return id.charAt(0).toUpperCase() + id.slice(1);
  };

  const getBalloonName = (id: string | null) => {
    const map: Record<string, string> = {
      'rose-gold': 'Rose Gold',
      'red-hearts': 'Classic Red',
      'blush-pink': 'Blush Pink',
      'gold-white': 'Gold & White',
      'purple': 'Royal Purple',
      'custom': 'Surprise Me'
    };
    return id ? (map[id] || id) : 'Not selected';
  };

  const getCakeName = (id: string | null) => {
    const map: Record<string, string> = {
      'none': 'No Cake',
      'chocolate': 'Dark Chocolate',
      'black-forest': 'Black Forest',
      'white-forest': 'White Forest',
      'butterscotch': 'Butterscotch',
      'red-velvet': 'Premium Red Velvet',
      'chocolate-truffle': 'Premium Chocolate Truffle'
    };
    return id ? (map[id] || id) : 'Not selected';
  };

  const items = [
    { label: 'Location', value: booking.location ? booking.location.toUpperCase() : 'Not selected' },
    { label: 'Date', value: formatDate(booking.date) },
    { label: 'Time', value: booking.slot || 'Not selected' },
    { label: 'Package', value: getPackageName(booking.package) },
    { label: 'Theme', value: getBalloonName(booking.balloonColor) },
    { label: 'Cake', value: getCakeName(booking.cakeOption) + (booking.eggless ? ' (Eggless)' : '') + (booking.sparklers ? ' + Sparkler' : '') },
    { label: 'Add-ons', value: `${booking.addOns.length} selected` },
  ];

  return (
    <div className="w-full md:w-[280px] bg-[rgba(201,151,58,0.03)] border border-[rgba(201,151,58,0.2)] rounded-[4px] p-6 sticky top-[100px]">
      
      <h3 className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#C9973A] uppercase mb-6">
        Booking Summary
      </h3>

      <div className="flex flex-col">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-[rgba(201,151,58,0.1)] last:border-0">
            <span className="font-display italic text-[16px] text-[#B8A882]">
              {item.label}
            </span>
            <span className="font-sans font-light text-[13px] text-[#F5EDD8] text-right max-w-[120px] truncate">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-[rgba(201,151,58,0.3)]">
        <div className="flex justify-between items-end mb-2">
          <span className="font-display italic text-[18px] text-[#B8A882]">Total</span>
          <span className="font-display text-[28px] text-[#C9973A] leading-none">₹{total}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-sans text-[11px] text-[#B8A882] tracking-wider uppercase">50% Advance</span>
          <span className="font-sans font-medium text-[14px] text-[#C9973A]">₹{total / 2}</span>
        </div>
      </div>

    </div>
  );
}
