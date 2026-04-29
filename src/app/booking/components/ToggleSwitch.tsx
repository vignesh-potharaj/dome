'use client';

interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function ToggleSwitch({ value, onChange }: ToggleSwitchProps) {
  return (
    <div 
      onClick={() => onChange(!value)}
      className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300"
      style={{ background: value ? '#C9973A' : 'rgba(201,151,58,0.2)' }}
    >
      <div 
        className="w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm"
        style={{ transform: value ? 'translateX(24px)' : 'translateX(0)' }}
      />
    </div>
  );
}
