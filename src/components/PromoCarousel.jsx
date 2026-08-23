import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SOCIALS } from '../data/socials';
import { usePromos } from '../hooks/usePromos';
import { useLanguage } from '../context/LanguageContext';
import { ui } from '../data/strings';
import FadeText from './FadeText';

const ADVANCE_MS = 5000;

// Inline Facebook mark (lucide 1.x ships no brand icons; inline SVGs are
// already the pattern here — see the flags in LanguageSwitch)
const FacebookIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.79-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.75 8.44-4.9 8.44-9.94Z" />
  </svg>
);

// Square deck carousel: the active poster sits front and center at 1:1,
// while its neighbours peek out from behind on the left and right, slightly
// scaled down and out of focus. Sized to fill as much of the screen as the
// viewport allows while leaving room for the peeks.
const CARD_SIZE = 'min(84vw, 56vh, 520px)';

// Visual slot for a slide, keyed by its position relative to the active one.
const SLOTS = {
  front: { x: '0%', scale: 1, filter: 'blur(0px) brightness(1)', opacity: 1, zIndex: 3 },
  right: { x: '58%', scale: 0.82, filter: 'blur(3px) brightness(0.92)', opacity: 1, zIndex: 1 },
  left: { x: '-58%', scale: 0.82, filter: 'blur(3px) brightness(0.92)', opacity: 1, zIndex: 1 },
  hidden: { x: '0%', scale: 0.7, filter: 'blur(6px) brightness(0.9)', opacity: 0, zIndex: 0 }
};

const slotFor = (i, idx, count) => {
  const rel = (((i - idx) % count) + count) % count;
  if (rel === 0) return 'front';
  if (rel === 1) return 'right';
  if (rel === count - 1 && count > 2) return 'left';
  return 'hidden';
};

export default function PromoCarousel() {
  const { t } = useLanguage();
  const promos = usePromos();
  const [idx, setIdx] = useState(0);
  // Bumped on every manual swipe so the auto-advance interval restarts,
  // instead of snatching the slide away right after the user picked it.
  const [interactionCount, setInteractionCount] = useState(0);

  const count = promos.length;
  const hasSlides = count > 1;

  // The live fetch can swap in a different number of slides — restart cleanly
  useEffect(() => {
    setIdx(0);
  }, [promos]);

  useEffect(() => {
    if (!hasSlides) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % count), ADVANCE_MS);
    return () => clearInterval(id);
  }, [hasSlides, count, interactionCount]);

  const go = (dir) => {
    setIdx((i) => (i + dir + count) % count);
    setInteractionCount((c) => c + 1);
  };

  const activeCaption = promos[idx]?.caption || '';

  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{ height: CARD_SIZE }}
      >
        {promos.map((promo, i) => {
          const slot = slotFor(i, idx, count);
          const isFront = slot === 'front';
          return (
            <motion.div
              key={`${promo.src}-${i}`}
              animate={SLOTS[slot]}
              initial={false}
              transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
              onClick={() => {
                if (slot === 'right') go(1);
                else if (slot === 'left') go(-1);
              }}
              className={`absolute aspect-square rounded-3xl overflow-hidden shadow-card-hover bg-background-alt ${isFront ? '' : 'cursor-pointer'}`}
              style={{ width: CARD_SIZE, pointerEvents: slot === 'hidden' ? 'none' : 'auto' }}
            >
              <img
                src={promo.src}
                alt={promo.caption}
                draggable={false}
                loading={i < 3 ? 'eager' : 'lazy'}
                className="absolute inset-0 w-full h-full object-cover select-none"
              />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-ink/10 pointer-events-none" aria-hidden="true" />

              {/* Swipe layer only on the front card */}
              {isFront && hasSlides && (
                <motion.div
                  className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  dragMomentum={false}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
                    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Caption of the active poster, swapped in step with the deck */}
      <div className="min-h-[1.5rem] mt-4">
        <AnimatePresence mode="wait">
          {activeCaption && (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-center text-sm text-ink font-medium px-6 max-w-md mx-auto"
            >
              {activeCaption}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {hasSlides && (
        <div className="flex justify-center gap-1.5 mt-3" aria-hidden="true">
          {promos.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${i === idx ? 'w-4 bg-primary' : 'w-2 bg-stone-300 dark:bg-stone-600'}`}
            />
          ))}
        </div>
      )}

      {SOCIALS.facebook && (
        <div className="flex justify-center mt-4">
          <a
            href={SOCIALS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            {FacebookIcon}
            <FadeText>{t(ui.landing.followFacebook)}</FadeText>
          </a>
        </div>
      )}
    </div>
  );
}
