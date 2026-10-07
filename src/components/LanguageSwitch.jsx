import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { DURATION, EASE_OUT } from '../lib/motion';
import { cn } from '../lib/cn';

// Inline SVG flags, simplified to stay recognizable when small: UK for
// English, Portugal for Portuguese, Timor-Leste for Tetun. Cropped to fill
// the selected tile.
const FLAGS = {
  en: (
    <svg viewBox="0 0 32 32" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="32" height="32" fill="#012169" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M16 0 V32 M0 16 H32" stroke="#fff" strokeWidth="10" />
      <path d="M16 0 V32 M0 16 H32" stroke="#C8102E" strokeWidth="6" />
    </svg>
  ),
  pt: (
    <svg viewBox="0 0 32 32" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="32" height="32" fill="#DA291C" />
      <rect width="13" height="32" fill="#046A38" />
      <circle cx="13" cy="16" r="6" fill="#FFE900" />
      <circle cx="13" cy="16" r="3.2" fill="#fff" stroke="#DA291C" strokeWidth="1.4" />
    </svg>
  ),
  tet: (
    <svg viewBox="0 0 32 32" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="32" height="32" fill="#DC241F" />
      <path d="M0 0 L21 16 L0 32 Z" fill="#FFC726" />
      <path d="M0 0 L14 16 L0 32 Z" fill="#000" />
      <path d="M6.5 12.4 L7.38 14.79 L9.92 14.89 L7.93 16.46 L8.62 18.91 L6.5 17.5 L4.38 18.91 L5.07 16.46 L3.08 14.89 L5.62 14.79 Z" fill="#fff" />
    </svg>
  )
};

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'tet', label: 'TET', name: 'Tetun' }
];

const flagShown = { opacity: 1, scale: 1 };
const flagHidden = { opacity: 0, scale: 0.6 };
const flagTransition = { opacity: { duration: DURATION.text }, scale: { duration: DURATION.pill, ease: EASE_OUT } };

// Segmented control: languages read as text until chosen, and the chosen one
// becomes its flag. One flag tile slides to the new language while the new
// flag fades in on it and the old language turns back into text.
export default function LanguageSwitch({ className }) {
  const { language, toggleLanguage } = useLanguage();
  const groupRef = useRef(null);
  const [thumb, setThumb] = useState(null);

  // Follow the chosen button's box (measured before paint); re-measure when
  // the control changes size at a breakpoint.
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return undefined;
    const measure = () => {
      const button = group.querySelector(`[data-lang="${language}"]`);
      if (button) setThumb({ x: button.offsetLeft, width: button.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    return () => observer.disconnect();
  }, [language]);

  return (
    <div
      ref={groupRef}
      className={cn('relative flex shrink-0 gap-0.5 h-11 p-[3px] rounded-xl border border-line bg-background-alt', className)}
      role="group"
      aria-label="Language"
    >
      {thumb && (
        <motion.span
          className="absolute top-[3px] bottom-[3px] left-0 rounded-[9px] overflow-hidden bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.22)]"
          initial={false}
          animate={{ x: thumb.x, width: thumb.width }}
          transition={{ duration: DURATION.pill, ease: EASE_OUT }}
          aria-hidden="true"
        >
          {LANGUAGES.map(({ code }) => (
            <motion.span
              key={code}
              className="absolute inset-0"
              initial={false}
              animate={code === language ? flagShown : flagHidden}
              transition={flagTransition}
            >
              {FLAGS[code]}
            </motion.span>
          ))}
          <span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/10" />
        </motion.span>
      )}

      {LANGUAGES.map(({ code, label, name }) => {
        const isActive = language === code;
        return (
          <button
            key={code}
            data-lang={code}
            onClick={() => toggleLanguage(code)}
            aria-pressed={isActive}
            aria-label={name}
            title={name}
            className={cn(
              'relative w-[38px] max-[379px]:w-[33px] md:w-11 rounded-[9px] text-xs md:text-[13px] font-semibold outline-none',
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background-alt',
              'text-muted hover:text-ink transition-colors duration-150'
            )}
          >
            <span className={cn('transition-opacity duration-150', isActive ? 'opacity-0' : 'opacity-100')}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
