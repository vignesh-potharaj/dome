'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
  { name: 'About Us', href: '#about' },
  { name: 'Menu', href: '#menu' },
  { name: 'Celebrations', href: '#celebrations' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Locations', href: '#locations' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('');

  // Handle intersection observer to set active section (optional enhancement)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,          // ← must be higher than any section content
      height: '72px',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      background: 'rgba(8,6,4,0.65)',
      borderBottom: '1px solid rgba(201,151,58,0.15)',
    }} className="flex items-center justify-between px-6 md:px-12">
      {/* Logo */}
      <Link href="/" className="flex flex-col items-center justify-center pt-1 hover:opacity-80 transition-opacity">
        <span className="font-display font-light text-[28px] tracking-[0.25em] text-[#C9973A] leading-none ml-[0.25em]">
          DOME
        </span>
        <span className="font-sans font-light text-[9px] tracking-[0.5em] text-[#B8A882] mt-1 ml-[0.5em]">
          CAFE
        </span>
      </Link>

      {/* Nav Links (Desktop) */}
      <div className="hidden md:flex items-center space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`font-sans text-[13px] tracking-[0.08em] transition-colors duration-250 ease-in-out relative py-2 ${
              activeSection === link.href.substring(1)
                ? 'text-[#E8B96A]'
                : 'text-[#B8A882] hover:text-[#E8B96A]'
            }`}
          >
            {link.name}
            {activeSection === link.href.substring(1) && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9973A]" />
            )}
          </Link>
        ))}
      </div>

      {/* CTA Button */}
      <a
        href="https://wa.me/910000000000?text=Hi%2C%20I%27d%20like%20to%20book%20a%20dome%20at%20Dome%20Cafe%20Hyderabad"
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans font-medium text-[12px] tracking-[0.15em] text-[#C9973A] border border-[#C9973A] rounded-sm py-[10px] px-[24px] transition-all duration-300 hover:bg-[#C9973A] hover:text-[#080604] ml-[0.15em]"
      >
        BOOK NOW
      </a>
    </nav>
  );
}
