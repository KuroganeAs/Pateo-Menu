import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Coffee, Info } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useViewport } from '../hooks/useViewport';
import { useMenuData } from '../context/MenuDataContext';
import { ui } from '../data/strings';
import { DURATION, EASE_IN, EASE_SHEET } from '../lib/motion';
import { cn } from '../lib/cn';
import FadeText from './FadeText';
import Skeleton from './Skeleton';
import placeholderImg from '../assets/food-placeholder.svg';

const enter = { duration: DURATION.sheetIn, ease: EASE_SHEET };
const leave = { duration: DURATION.sheetOut, ease: EASE_IN };

const backdropVariants = {
  hidden: { opacity: 0, transition: { duration: 0.2 } },
  visible: { opacity: 1, transition: { duration: 0.2 } }
};
// Desktop: a floating panel slides in from the right
const panelVariants = {
  hidden: { x: '105%', transition: leave },
  visible: { x: 0, transition: enter }
};
// Phone and tablet: a bottom sheet glides up, no wobble
const sheetVariants = {
  hidden: { y: '100%', transition: leave },
  visible: { y: 0, transition: enter }
};

function PhotoArrow({ label, onClick, disabled, side, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'absolute top-1/2 -mt-5 z-20 w-10 h-10 rounded-[10px] bg-white/95 text-[#1C1915] flex items-center justify-center',
        'shadow-[0_0_0_1px_rgba(28,25,21,0.1),0_4px_10px_-4px_rgba(28,25,21,0.3)] transition-[opacity,scale] duration-150 ease-out active:scale-95',
        'disabled:opacity-0 disabled:pointer-events-none',
        side === 'left' ? 'left-2.5 md:left-3' : 'right-2.5 md:right-3'
      )}
    >
      {children}
    </button>
  );
}

export default function DishDetailModal({ item, onClose }) {
  const { t } = useLanguage();
  const { categories } = useMenuData();
  const { isDesktop } = useViewport();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  // Photos that have finished loading, so each shows a skeleton only once
  const [loadedPhotos, setLoadedPhotos] = useState(() => new Set());
  const markPhotoLoaded = (src) => setLoadedPhotos((s) => (s.has(src) ? s : new Set(s).add(src)));
  const dragControls = useDragControls();
  const heroRef = useRef(null);
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);
  const wheelCooldown = useRef(0);
  const scrollRef = useRef(null);
  const swipeState = useRef(null);

  // Whole-sheet swipe-to-dismiss (phone/tablet): begin the sheet drag only
  // when the content is scrolled to the top AND the finger moves downward —
  // otherwise the gesture belongs to normal content scrolling.
  const onContentPointerDown = (e) => {
    if (isDesktop) return;
    swipeState.current = { y: e.clientY, armed: true };
  };
  const onContentPointerMove = (e) => {
    const s = swipeState.current;
    if (!s?.armed || isDesktop) return;
    const dy = e.clientY - s.y;
    if (dy > 12 && (scrollRef.current?.scrollTop ?? 0) <= 1) {
      s.armed = false;
      dragControls.start(e);
    } else if (dy < -12) {
      s.armed = false; // upward move — native scroll owns this gesture
    }
  };
  const onContentPointerEnd = () => {
    swipeState.current = null;
  };

  // Lock background scrolling, reset the variant, and move focus into the
  // dialog while it's open; hand focus back to the card on close.
  useEffect(() => {
    if (!item) return undefined;
    document.body.style.overflow = 'hidden';
    setSelectedVariantIdx(0);
    returnFocusRef.current = document.activeElement;
    const id = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = '';
      returnFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [item]);

  // Handle ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && item) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  const title = item ? t(item.title) : '';
  const desc = item ? t(item.description) : '';
  const category = item ? categories.find((c) => c.id === item.categoryId) : null;

  const hasVariants = !!(item?.variants && item.variants.length > 0);
  const variantCount = hasVariants ? item.variants.length : 0;
  const safeVariantIdx = hasVariants ? Math.min(selectedVariantIdx, variantCount - 1) : 0;
  const selectedVariant = hasVariants ? item.variants[safeVariantIdx] : null;
  const price = selectedVariant ? selectedVariant.price : item?.price ?? 0;
  // Selected variant's own photo wins; falls back to the item photo, then the placeholder
  const heroImage = selectedVariant?.image || item?.image || placeholderImg;

  const goVariant = (dir) => {
    if (!hasVariants) return;
    setSelectedVariantIdx((prev) => Math.min(Math.max(prev + dir, 0), item.variants.length - 1));
  };

  // Desktop: mouse wheel over the photo cycles through variants.
  // Attached natively (non-passive) so we can preventDefault the body scroll.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !hasVariants) return;
    const onWheel = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelCooldown.current < 250) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 10) return;
      wheelCooldown.current = now;
      goVariant(delta > 0 ? 1 : -1);
    };
    hero.addEventListener('wheel', onWheel, { passive: false });
    return () => hero.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVariants, item]);

  // Rendered as a plain JSX variable (not a nested component) so variant
  // selection re-renders don't remount the DOM and reset scroll position.
  const modalContent = item && (
    <div
      className="flex flex-col h-full bg-surface"
      onPointerDown={onContentPointerDown}
      onPointerMove={onContentPointerMove}
      onPointerUp={onContentPointerEnd}
      onPointerCancel={onContentPointerEnd}
    >
      {/* Grabber (phone/tablet), category and close */}
      <div
        className="relative shrink-0 flex items-center justify-between gap-3 px-5 pt-4 pb-3 lg:px-6 lg:pt-5 lg:pb-3.5 touch-none"
        onPointerDown={(e) => { if (!isDesktop) { swipeState.current = null; dragControls.start(e); } }}
      >
        {!isDesktop && <span className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-line" aria-hidden="true" />}
        <span className="text-xs font-semibold tracking-[0.06em] uppercase text-muted truncate">
          <FadeText>{t(category?.title)}</FadeText>
        </span>
        <div className="flex items-center gap-2">
          {isDesktop && (
            <kbd className="h-6 px-[7px] inline-flex items-center rounded-md border border-line bg-background text-muted text-[11px] font-semibold font-sans" aria-hidden="true">
              Esc
            </kbd>
          )}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-[10px] border border-line bg-surface text-ink-2 flex items-center justify-center transition-[scale,background-color,color] duration-150 ease-out hover:bg-background-alt hover:text-ink active:scale-95"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar overscroll-contain px-5 lg:px-6 pb-8">
        {/* Photo on a white plate: swipe, scroll or use the arrows to see each option */}
        <div ref={heroRef} className="relative w-full aspect-[6/5] rounded-[14px] border border-line overflow-hidden">
          <div className="photo absolute inset-0 bg-white">
            {!loadedPhotos.has(heroImage) && <Skeleton className="absolute inset-0 rounded-none" />}
            <AnimatePresence initial={false}>
              <motion.img
                key={heroImage}
                src={heroImage}
                alt={selectedVariant ? `${title} — ${t(selectedVariant.name)}` : title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.text }}
                onLoad={() => markPhotoLoaded(heroImage)}
                onError={() => markPhotoLoaded(heroImage)}
                className="absolute inset-0 w-full h-full object-contain"
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {hasVariants && (
            <>
              <motion.div
                className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                dragMomentum={false}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -60 || info.velocity.x < -400) goVariant(1);
                  else if (info.offset.x > 60 || info.velocity.x > 400) goVariant(-1);
                }}
              />
              <PhotoArrow side="left" label="Previous option" onClick={() => goVariant(-1)} disabled={safeVariantIdx === 0}>
                <ChevronLeft size={18} strokeWidth={2.2} />
              </PhotoArrow>
              <PhotoArrow side="right" label="Next option" onClick={() => goVariant(1)} disabled={safeVariantIdx === variantCount - 1}>
                <ChevronRight size={18} strokeWidth={2.2} />
              </PhotoArrow>
            </>
          )}
        </div>

        {hasVariants && (
          <div className="flex items-center justify-between pt-3" aria-hidden="true">
            <div className="flex items-center gap-1">
              {item.variants.map((_, idx) => (
                <span
                  key={idx}
                  className={cn('h-1 rounded-full transition-[width,background-color] duration-200 ease-out', idx === safeVariantIdx ? 'w-[22px] bg-primary' : 'w-2.5 bg-line')}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-muted tabular-nums">{safeVariantIdx + 1} / {variantCount}</span>
          </div>
        )}

        {/* Name, description and price */}
        <div className="flex items-start justify-between gap-4 pt-5">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h2 id="dish-title" className="font-display text-[26px] lg:text-[30px] font-semibold leading-[1.1] tracking-[-0.02em]">
              <FadeText>{title}</FadeText>
            </h2>
            {desc && (
              <p className="text-sm lg:text-[15px] leading-relaxed text-ink-2">
                <FadeText>{desc}</FadeText>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-0.5 shrink-0 pt-0.5">
            <span className="text-2xl lg:text-[26px] font-semibold tracking-[-0.01em] tabular-nums">${price.toFixed(2)}</span>
            {selectedVariant && (
              <span className="text-xs text-muted text-right max-w-32"><FadeText>{t(selectedVariant.name)}</FadeText></span>
            )}
          </div>
        </div>

        {/* Category small print (e.g. Barista takeaway surcharge) */}
        {category?.note && (
          <div className="flex items-center gap-2.5 mt-5 px-3.5 py-3 rounded-xl bg-primary-soft text-sm font-medium">
            <span className="text-primary shrink-0">
              {category.id === 'barista' ? <Coffee size={18} strokeWidth={2} /> : <Info size={18} strokeWidth={2} />}
            </span>
            <FadeText>{t(category.note)}</FadeText>
          </div>
        )}

        {/* Options */}
        {hasVariants && (
          <div className="mt-6">
            <div className="flex items-center gap-2.5 pb-2.5">
              <span className="text-xs font-semibold tracking-[0.06em] uppercase text-muted shrink-0">
                <FadeText>{t(ui.selectOption)}</FadeText>
              </span>
              <span className="flex-1 h-px bg-line" aria-hidden="true" />
            </div>
            <div role="radiogroup" aria-label={t(ui.selectOption)} className="grid grid-cols-2 gap-2">
              {item.variants.map((variant, idx) => {
                const isActive = idx === safeVariantIdx;
                return (
                  <button
                    key={idx}
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={cn(
                      'flex items-center justify-between gap-2 min-h-12 lg:min-h-[48px] px-3 py-2 rounded-[10px] border text-left transition-[border-color,background-color,box-shadow] duration-150',
                      isActive
                        ? 'border-primary bg-primary-soft shadow-[inset_0_0_0_1px_var(--color-primary)]'
                        : 'border-line bg-surface hover:border-line-strong'
                    )}
                  >
                    <span className="text-sm font-medium leading-snug text-ink"><FadeText>{t(variant.name)}</FadeText></span>
                    <span className={cn('text-[13px] font-semibold tabular-nums shrink-0', isActive ? 'text-primary' : 'text-muted')}>
                      ${variant.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // AnimatePresence must stay mounted with a conditional child inside it,
  // otherwise exit animations never play. A single keyed child propagates
  // exit variants to the backdrop and the panel/sheet together.
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="dish-modal"
          className="fixed inset-0 z-40"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Softly blurs the menu behind, so the open dish has the focus */}
          <motion.div
            variants={backdropVariants}
            onClick={onClose}
            className="absolute inset-0 bg-scrim backdrop-blur-[6px] lg:backdrop-blur-[8px]"
          />

          {isDesktop ? (
            <motion.div
              variants={panelVariants}
              className="absolute top-3 right-3 bottom-3 w-[460px] z-50 rounded-[20px] border border-line overflow-hidden shadow-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dish-title"
              data-modal-open
            >
              {modalContent}
            </motion.div>
          ) : (
            <motion.div
              variants={sheetVariants}
              drag="y"
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.7 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) onClose();
              }}
              className="absolute bottom-0 inset-x-0 md:inset-x-auto md:left-1/2 md:-ml-[300px] md:w-[600px] z-50 h-[88dvh] max-h-[88dvh] rounded-t-[20px] border-t border-x-0 md:border-x border-line overflow-hidden shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.35)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dish-title"
              data-modal-open
            >
              {modalContent}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
