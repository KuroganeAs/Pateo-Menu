import React from 'react';
import { Globe } from 'lucide-react';
import { SOCIALS } from '../data/socials';

// Brand logos as inline SVGs (lucide 1.x ships no brand icons — same pattern
// as the flags in LanguageSwitch).
const FacebookLogo = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.79-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.75 8.44-4.9 8.44-9.94Z" />
  </svg>
);

const InstagramLogo = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
    <circle cx="12" cy="12" r="4.3" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const TikTokLogo = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19" aria-hidden="true">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const buttonBase =
  'w-11 h-11 rounded-full bg-surface shadow-card flex items-center justify-center transition-colors';

function SocialButton({ href, label, children }) {
  if (!href) {
    // Placeholder: visible but inert until the account exists
    return (
      <span
        className={`${buttonBase} text-stone-300 dark:text-stone-600 cursor-default`}
        title={`${label} — coming soon`}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`${buttonBase} text-ink hover:text-primary`}
    >
      {children}
    </a>
  );
}

export default function SocialFooter() {
  return (
    <footer className="flex flex-col items-center gap-3 pb-8 pt-2">
      <div className="flex items-center gap-4">
        <SocialButton href={SOCIALS.facebook} label="Facebook">
          {FacebookLogo}
        </SocialButton>
        <SocialButton href={SOCIALS.instagram} label="Instagram">
          {InstagramLogo}
        </SocialButton>
        <SocialButton href={SOCIALS.tiktok} label="TikTok">
          {TikTokLogo}
        </SocialButton>
        {SOCIALS.website && (
          <SocialButton href={SOCIALS.website} label="Website">
            <Globe size={20} />
          </SocialButton>
        )}
      </div>
      <p className="text-xs text-muted">Páteo Supermercado</p>
    </footer>
  );
}
