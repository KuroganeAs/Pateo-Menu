import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/cn';

// Round flag buttons — the flag IS the button background.
// Inline SVGs, simplified to stay recognizable at 28px: UK for English,
// Portugal for Portuguese, Timor-Leste for Tetun.
const FLAGS = {
  en: (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
      <rect width="32" height="32" fill="#012169" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M16 0 V32 M0 16 H32" stroke="#fff" strokeWidth="10" />
      <path d="M16 0 V32 M0 16 H32" stroke="#C8102E" strokeWidth="6" />
    </svg>
  ),
  pt: (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
      <rect width="32" height="32" fill="#DA291C" />
      <rect width="13" height="32" fill="#046A38" />
      <circle cx="13" cy="16" r="6" fill="#FFE900" />
      <circle cx="13" cy="16" r="3.2" fill="#fff" stroke="#DA291C" strokeWidth="1.4" />
    </svg>
  ),
  tet: (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
      <rect width="32" height="32" fill="#DC241F" />
      <path d="M0 0 L21 16 L0 32 Z" fill="#FFC726" />
      <path d="M0 0 L14 16 L0 32 Z" fill="#000" />
      <path d="M6.5 12.4 L7.38 14.79 L9.92 14.89 L7.93 16.46 L8.62 18.91 L6.5 17.5 L4.38 18.91 L5.07 16.46 L3.08 14.89 L5.62 14.79 Z" fill="#fff" />
    </svg>
  )
};

const NAMES = { en: 'English', pt: 'Português', tet: 'Tetun' };

export default function LanguageSwitch({ className }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className={cn('flex items-center gap-2', className)} role="group" aria-label="Language">
      {Object.keys(FLAGS).map((code) => {
        const isActive = language === code;
        return (
          <button
            key={code}
            onClick={() => toggleLanguage(code)}
            aria-pressed={isActive}
            aria-label={NAMES[code]}
            title={NAMES[code]}
            className={cn(
              'w-7 h-7 rounded-full overflow-hidden shrink-0 transition-all duration-300 outline-none',
              isActive
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-glow scale-105'
                : 'opacity-55 saturate-[.8] hover:opacity-100 hover:saturate-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            )}
          >
            {FLAGS[code]}
          </button>
        );
      })}
    </div>
  );
}
