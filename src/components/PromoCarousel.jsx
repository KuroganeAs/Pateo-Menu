import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePromos } from '../hooks/usePromos';
import { DURATION, EASE_OUT, prefersReducedMotion } from '../lib/motion';
import { cn } from '../lib/cn';
import Skeleton from './Skeleton';
import FadeText from './FadeText';

const ADVANCE_MS = 5000;

// Two deck styles share one carousel:
// - 'center' (phone, tablet): the active poster sits front and centre, its
//   neighbours peek out on both sides, dimmed.
// - 'stack' (desktop): the next posters fan out behind the active one to the
//   right; the old poster slides off to the left as the next comes forward.
const LAYOUTS = {
  center: {
    card: 'w-[min(78vw,46vh,340px)] md:w-[min(62vw,46vh,520px)]',
    stage: 'h-[min(78vw,46vh,340px)] md:h-[min(62vw,46vh,520px)] justify-center overflow-x-clip',
    slots: {
      front: { x: '0%', scale: 1, filter: 'brightness(1) saturate(1)', opacity: 1, zIndex: 3 },
      next: { x: '84%', scale: 0.84, filter: 'brightness(0.86) saturate(0.9)', opacity: 1, zIndex: 1 },
      prev: { x: '-84%', scale: 0.84, filter: 'brightness(0.86) saturate(0.9)', opacity: 1, zIndex: 1 },
      hidden: { x: '0%', scale: 0.7, filter: 'brightness(0.86) saturate(0.9)', opacity: 0, zIndex: 0 }
    }
  },
  stack: {
    card: 'w-[min(38vw,60vh,540px)]',
    stage: 'h-[min(38vw,60vh,540px)] justify-start',
    slots: {
      front: { x: '0%', scale: 1, filter: 'brightness(1) saturate(1)', opacity: 1, zIndex: 3 },
      next: { x: '22%', scale: 0.85, filter: 'brightness(0.9) saturate(0.95)', opacity: 1, zIndex: 2 },
      after: { x: '42%', scale: 0.7, filter: 'brightness(0.82) saturate(0.9)', opacity: 1, zIndex: 1 },
      prev: { x: '-24%', scale: 0.96, filter: 'brightness(1) saturate(1)', opacity: 0, zIndex: 4 },
      hidden: { x: '56%', scale: 0.55, filter: 'brightness(0.8) saturate(0.9)', opacity: 0, zIndex: 0 }
    }
  }
};

const slotFor = (i, idx, count, variant) => {
  const rel = (((i - idx) % count) + count) % count;
  if (rel === 0) return 'front';
  if (rel === 1) return 'next';
  if (variant === 'stack' && rel === 2 && count > 3) return 'after';
  if (rel === count - 1 && count > 2) return 'prev';
  return 'hidden';
};

const cardShape = 'absolute aspect-square rounded-[18px] md:rounded-[22px]';

// The deck's shape while the posters load: a front card with its neighbours
// in the same slots the real posters will take, plus the progress row.
function DeckSkeleton({ variant }) {
  const layout = LAYOUTS[variant];
  const behind = variant === 'center'
    ? [layout.slots.prev, layout.slots.next]
    : [layout.slots.after, layout.slots.next];

  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading this week's specials…</span>
      <div className={cn('relative w-full flex items-center', layout.stage)}>
        {behind.map((slot, i) => (
          <Skeleton
            key={i}
            className={cn(cardShape, layout.card, 'opacity-60')}
            style={{ transform: `translateX(${slot.x}) scale(${slot.scale})`, zIndex: slot.zIndex }}
          />
        ))}
        <Skeleton className={cn(cardShape, layout.card)} style={{ zIndex: 3 }} />
      </div>
      <div className={cn('flex items-center justify-between gap-4 mt-3.5 md:mt-4', layout.card, variant === 'center' && 'mx-auto')} aria-hidden="true">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-1 w-24 rounded-full" />
          <Skeleton className="h-3 w-8 rounded" />
        </div>
        <div className="hidden md:flex gap-2">
          <Skeleton className="w-11 h-11 rounded-xl" />
          <Skeleton className="w-11 h-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// A poster that shows a skeleton until its image has arrived, then fades in.
function PosterImage({ src, alt, eager }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // A cached image can finish before React attaches onLoad
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth) setLoaded(true);
  }, []);

  return (
    <>
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        loading={eager ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          'absolute inset-0 w-full h-full object-cover select-none transition-opacity duration-300 ease-out',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </>
  );
}

function ArrowButton({ label, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-11 h-11 rounded-xl border border-line bg-surface text-ink flex items-center justify-center transition-[transform,background-color] duration-150 ease-out hover:bg-background-alt active:scale-95"
    >
      {children}
    </button>
  );
}

export default function PromoCarousel({ variant = 'center', className }) {
  const { promos, isLoading } = usePromos();
  const [idx, setIdx] = useState(0);
  // Bumped on every manual change so the auto-advance timer (and its progress
  // bar) restarts instead of snatching the slide away right after a pick.
  const [interactionCount, setInteractionCount] = useState(0);
  const [autoplay] = useState(() => !prefersReducedMotion());

  const layout = LAYOUTS[variant];
  const count = promos.length;
  const hasSlides = count > 1;

  // The live fetch can swap in a different number of slides — restart cleanly
  useEffect(() => {
    setIdx(0);
  }, [promos]);

  useEffect(() => {
    if (!hasSlides || !autoplay || isLoading) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % count), ADVANCE_MS);
    return () => clearInterval(id);
  }, [hasSlides, autoplay, isLoading, count, interactionCount]);

  const go = (dir) => {
    setIdx((i) => (i + dir + count) % count);
    setInteractionCount((c) => c + 1);
  };

  const activeCaption = promos[idx]?.caption || '';

  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <DeckSkeleton variant={variant} />
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('relative w-full flex items-center', layout.stage)}>
        {promos.map((promo, i) => {
          const slot = slotFor(i, idx, count, variant);
          const isFront = slot === 'front';
          return (
            <motion.div
              key={`${promo.src}-${i}`}
              animate={layout.slots[slot]}
              initial={false}
              transition={{ duration: DURATION.poster, ease: EASE_OUT }}
              onClick={() => {
                if (slot === 'next' || slot === 'after') go(1);
                else if (slot === 'prev') go(-1);
              }}
              className={cn(
                'absolute aspect-square rounded-[18px] md:rounded-[22px] overflow-hidden bg-background-alt',
                isFront ? 'shadow-poster' : 'cursor-pointer',
                layout.card
              )}
              style={{ pointerEvents: slot === 'hidden' || (variant === 'stack' && slot === 'prev') ? 'none' : 'auto' }}
              aria-hidden={!isFront}
            >
              <PosterImage
                key={promo.src}
                src={promo.src}
                alt={isFront ? promo.caption || `Weekly special, poster ${i + 1} of ${count}` : ''}
                eager={i < 3}
              />
              <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-line pointer-events-none" aria-hidden="true" />

              {/* Swipe layer only on the front card: it follows the finger a
                  little, then the deck takes over */}
              {isFront && hasSlides && (
                <motion.div
                  className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.35}
                  dragMomentum={false}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -50 || info.velocity.x < -400) go(1);
                    else if (info.offset.x > 50 || info.velocity.x > 400) go(-1);
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {hasSlides && (
        <div className={cn('flex items-center justify-between gap-4 mt-3.5 md:mt-4', layout.card, variant === 'center' && 'mx-auto')}>
          <div className="flex items-center gap-3.5">
            {/* Progress: the active bar fills until the next poster */}
            <div className="flex items-center gap-1" aria-hidden="true">
              {promos.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'relative h-1 rounded-full overflow-hidden bg-line transition-[width] duration-300 ease-out',
                    i === idx ? 'w-7' : 'w-2.5'
                  )}
                >
                  {i === idx && (
                    <motion.span
                      key={`${idx}-${interactionCount}`}
                      className="absolute inset-0 bg-primary origin-left"
                      initial={{ scaleX: autoplay ? 0 : 1 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: autoplay ? ADVANCE_MS / 1000 : 0, ease: 'linear' }}
                    />
                  )}
                </span>
              ))}
            </div>
            <span className="text-xs md:text-[13px] font-medium text-muted tabular-nums">
              <FadeText>{idx + 1} / {count}</FadeText>
            </span>
          </div>

          <div className="hidden md:flex gap-2">
            <ArrowButton label="Previous poster" onClick={() => go(-1)}>
              <ChevronLeft size={18} strokeWidth={2.2} />
            </ArrowButton>
            <ArrowButton label="Next poster" onClick={() => go(1)}>
              <ChevronRight size={18} strokeWidth={2.2} />
            </ArrowButton>
          </div>
        </div>
      )}

      {/* Caption of the active poster, swapped in step with the deck */}
      {activeCaption && (
        <div className={cn('mt-3', layout.card, variant === 'center' && 'mx-auto')}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.text }}
              className={cn('text-sm text-ink-2 font-medium', variant === 'center' && 'text-center')}
            >
              <FadeText>{activeCaption}</FadeText>
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
