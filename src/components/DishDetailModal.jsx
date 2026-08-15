import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import placeholderImg from '../assets/food-placeholder.svg';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useViewport } from '../hooks/useViewport';
import { ui } from '../data/strings';
import { categories } from '../data/menu';
import { cn } from '../lib/cn';
import FadeText from './FadeText';

export default function DishDetailModal({ item, onClose }) {
  const { t, language } = useLanguage();
  const { isDesktop } = useViewport();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const dragControls = useDragControls();
  const heroRef = useRef(null);
  const pillsRef = useRef(null);
  const wheelCooldown = useRef(0);
  const scrollRef = useRef(null);
  const swipeState = useRef(null);

  // Whole-sheet swipe-to-dismiss (mobile): begin the sheet drag only when
  // the content is scrolled to the top AND the finger moves downward —
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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
      setSelectedVariantIdx(0); // reset variant
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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

  const hasVariants = !!(item?.variants && item.variants.length > 0);
  const safeVariantIdx = hasVariants ? Math.min(selectedVariantIdx, item.variants.length - 1) : 0;
  const price = hasVariants ? item.variants[safeVariantIdx].price : item?.price ?? 0;

  const goVariant = (dir) => {
    if (!hasVariants) return;
    setSelectedVariantIdx((prev) => Math.min(Math.max(prev + dir, 0), item.variants.length - 1));
  };

  // Keep the selected variant pill in view whenever the selection changes
  // (via pills, swipe, wheel or the chevrons)
  useEffect(() => {
    if (!item) return;
    const pill = pillsRef.current?.querySelector(`[data-variant-idx="${safeVariantIdx}"]`);
    pill?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [safeVariantIdx, item]);

  // Desktop: mouse wheel over the hero image cycles through variants.
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
      className="flex flex-col h-full bg-white relative"
      onPointerDown={onContentPointerDown}
      onPointerMove={onContentPointerMove}
      onPointerUp={onContentPointerEnd}
      onPointerCancel={onContentPointerEnd}
    >
      {/* Drag Handle (Mobile) & Close Button */}
      <div
        className="sticky top-0 w-full z-10 flex justify-between items-center px-4 pt-4 pb-2 bg-gradient-to-b from-white via-white to-transparent touch-none"
        onPointerDown={(e) => { if (!isDesktop) { swipeState.current = null; dragControls.start(e); } }}
      >
        {!isDesktop && <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2" />}
        <button
          onClick={onClose}
          aria-label="Close"
          className="ml-auto bg-stone-100 p-2 rounded-full text-muted hover:bg-stone-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="overflow-y-auto pb-10 hide-scrollbar flex-1 overscroll-contain">
        {/* Hero Image Placeholder with Carousel */}
        <div className="px-4 pb-6">
          <div ref={heroRef} className="relative w-full aspect-square bg-stone-100 rounded-2xl overflow-hidden group">
            <img
              src={item.image || placeholderImg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Swipe/drag layer: swipe the image left/right to change variant */}
            {hasVariants && (
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
            )}

            {/* Carousel Controls (Desktop) */}
            {isDesktop && hasVariants && (
              <>
                <button
                  onClick={() => goVariant(-1)}
                  aria-label="Previous variant"
                  className="absolute left-2 z-20 w-8 h-8 rounded-full bg-white/50 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button
                  onClick={() => goVariant(1)}
                  aria-label="Next variant"
                  className="absolute right-2 z-20 w-8 h-8 rounded-full bg-white/50 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow"
                >
                  <ChevronRight size={16}/>
                </button>
              </>
            )}

            {/* Current variant label + pagination dots */}
            {hasVariants && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${safeVariantIdx}-${language}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-medium whitespace-nowrap"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {t(item.variants[safeVariantIdx].name)} · ${item.variants[safeVariantIdx].price.toFixed(2)}
                  </motion.span>
                </AnimatePresence>
                <div className="flex gap-1.5">
                  {item.variants.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn("h-2 rounded-full transition-all duration-300", idx === safeVariantIdx ? "w-4 bg-primary" : "w-2 bg-white/60")}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="px-5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-display text-[24px] font-bold text-ink leading-tight max-w-[70%]">
              <FadeText>{title}</FadeText>
            </h2>
            <span className="font-display text-[20px] font-semibold text-primary tabular-nums">
              ${price.toFixed(2)}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-[15px] text-muted leading-relaxed">
              <FadeText>{desc}</FadeText>
            </p>
            {/* Category small print (e.g. Barista takeaway surcharge) */}
            {(() => {
              const catNote = categories.find((c) => c.id === item.categoryId)?.note;
              return catNote ? (
                <p className="mt-3 text-xs text-muted italic"><FadeText>{t(catNote)}</FadeText></p>
              ) : null;
            })()}
          </div>

          {/* Base Variant Carousel */}
          {hasVariants && (
            <div className="mt-8">
              <h4 className="text-sm font-bold text-ink mb-3 uppercase tracking-wider"><FadeText>{t(ui.selectOption)}</FadeText></h4>
              <div ref={pillsRef} className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x">
                {item.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    data-variant-idx={idx}
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={cn(
                      "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-300 snap-center shrink-0",
                      idx === safeVariantIdx
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-stone-200 bg-white text-muted hover:border-stone-300"
                    )}
                  >
                    <FadeText>{t(variant.name)}</FadeText>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
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
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {isDesktop ? (
            <motion.div
              variants={{ hidden: { x: '100%' }, visible: { x: 0 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-[400px] z-50 shadow-2xl overflow-hidden rounded-l-[28px]"
              role="dialog"
              aria-modal="true"
              data-modal-open
            >
              {modalContent}
            </motion.div>
          ) : (
            <motion.div
              variants={{ hidden: { y: '100%' }, visible: { y: 0 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.7 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) onClose();
              }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] h-[85dvh] max-h-[85dvh] w-full mx-auto shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
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
