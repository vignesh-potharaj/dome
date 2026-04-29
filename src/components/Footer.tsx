'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#080604] border-t border-[rgba(201,151,58,0.2)] pt-20 pb-10 px-6 md:px-12 relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
        
        {/* Logo area */}
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="flex flex-col items-center justify-center hover:opacity-80 transition-opacity mb-6">
            <span className="font-display font-light text-[36px] tracking-[0.25em] text-[#C9973A] leading-none ml-[0.25em]">
              DOME
            </span>
            <span className="font-sans font-light text-[11px] tracking-[0.5em] text-[#B8A882] mt-2 ml-[0.5em]">
              CAFE
            </span>
          </Link>
          <p className="font-sans font-light text-[12px] text-[#B8A882] text-center md:text-left max-w-xs leading-relaxed">
            India's first dome-shaped celebration café. Creating unforgettable moments since 2025.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-16 text-center md:text-left">
          <div className="flex flex-col gap-4">
            <h4 className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#C9973A] uppercase mb-2">Explore</h4>
            <Link href="#about" className="font-sans font-light text-[13px] text-[#F5EDD8] hover:text-[#C9973A] transition-colors">About Us</Link>
            <Link href="#menu" className="font-sans font-light text-[13px] text-[#F5EDD8] hover:text-[#C9973A] transition-colors">Menu</Link>
            <Link href="#packages" className="font-sans font-light text-[13px] text-[#F5EDD8] hover:text-[#C9973A] transition-colors">Packages</Link>
            <Link href="#gallery" className="font-sans font-light text-[13px] text-[#F5EDD8] hover:text-[#C9973A] transition-colors">Gallery</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#C9973A] uppercase mb-2">Connect</h4>
            <a href="https://instagram.com/domecafe" target="_blank" rel="noopener noreferrer" className="font-sans font-light text-[13px] text-[#F5EDD8] hover:text-[#C9973A] transition-colors">Instagram</a>
            <a href="https://wa.me/910000000000" target="_blank" rel="noopener noreferrer" className="font-sans font-light text-[13px] text-[#F5EDD8] hover:text-[#C9973A] transition-colors">WhatsApp</a>
            <Link href="#locations" className="font-sans font-light text-[13px] text-[#F5EDD8] hover:text-[#C9973A] transition-colors">Locations</Link>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-[rgba(201,151,58,0.1)] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-sans font-light text-[11px] text-[#B8A882] tracking-wider">
          © 2025 DOME CAFE HYDERABAD. ALL RIGHTS RESERVED.
        </p>
        <div className="flex gap-6">
          <Link href="#" className="font-sans font-light text-[11px] text-[#B8A882] hover:text-[#C9973A] transition-colors">Privacy Policy</Link>
          <Link href="#" className="font-sans font-light text-[11px] text-[#B8A882] hover:text-[#C9973A] transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
