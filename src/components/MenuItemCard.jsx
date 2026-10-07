import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { ui } from '../data/strings';
import { DURATION, EASE_OUT } from '../lib/motion';
import { cn } from '../lib/cn';
import FadeText from './FadeText';
import Skeleton from './Skeleton';
import placeholderImg from '../assets/food-placeholder.svg';

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper to highlight matching text
const HighlightText = ({ text, highlight }) => {
  const query = highlight.trim();
  if (!query) return <>{text}</>;

  // split with a capture group: odd indexes are the matched parts
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-primary-soft text-primary rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default function MenuItemCard({ item, index = 0, onClick, searchQuery, isSelected = false }) {
  const { t } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  // Variants that have their own photo become an auto-advancing slideshow
  // on the card. The detail view stays fully manual.
  const slides = useMemo(() => {
    const withImage = (item.variants || []).filter((v) => v.image);
    return withImage.length > 1 ? withImage : [];
  }, [item]);
  const hasSlides = slides.length > 1;
  const [slideIdx, setSlideIdx] = useState(0);

  // Every slideshow completes one full loop in the same total time, so
  // cards with fewer photos advance a bit slower and all cards finish
  // their cycle together (6 photos → 3.0s each, 5 photos → 3.6s each).
  const CYCLE_MS = 18000;

  useEffect(() => {
    if (!hasSlides) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setSlideIdx((i) => (i + 1) % slides.length), CYCLE_MS / slides.length);
    return () => clearInterval(id);
  }, [hasSlides, slides.length]);

  // A cached image can finish loading before React attaches onLoad
  useEffect(() => {
    if (imgRef.current?.complete) setIsLoaded(true);
  }, []);

  // Price follows the slide currently shown
  const shownPrice = hasSlides ? slides[slideIdx].price : item.price;

  const title = t(item.title) || 'Placeholder Item';
  const desc = t(item.description) || '';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(item);
    }
  };

  return (
    <motion.div
      // Cards rise in as they scroll into view, a beat apart along each row
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -24px 0px' }}
      transition={{ duration: DURATION.card, ease: EASE_OUT, delay: (index % 4) * 0.03 }}
      onClick={() => onClick(item)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      data-menu-card
      aria-label={title}
      className={cn(
        'flex flex-col p-1.5 rounded-[14px] md:rounded-2xl bg-surface border cursor-pointer outline-none',
        'transition-[translate,scale,box-shadow,border-color] duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift active:scale-[0.98]',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isSelected ? 'border-primary ring-1 ring-primary' : 'border-line'
      )}
    >
      {/* Dish photo on a white plate (photos have white backgrounds) */}
      <div className="relative w-full aspect-square bg-white rounded-[10px] md:rounded-[11px] overflow-hidden">
        {hasSlides ? (
          slides.map((variant, i) => (
            <img
              key={variant.image}
              ref={i === 0 ? imgRef : undefined}
              src={variant.image}
              alt=""
              loading="lazy"
              onLoad={i === 0 ? () => setIsLoaded(true) : undefined}
              onError={i === 0 ? () => setIsLoaded(true) : undefined}
              className={`photo absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isLoaded && i === slideIdx ? 'opacity-100' : 'opacity-0'}`}
            />
          ))
        ) : (
          <img
            ref={imgRef}
            src={item.image || placeholderImg}
            alt=""
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsLoaded(true)}
            className={`photo absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        {/* Skeleton until the photo arrives; it fades in over it */}
        {!isLoaded && <Skeleton className="absolute inset-0 rounded-none" />}

        {/* Price badge — follows the visible slide. Fixed colours: it sits on
            the photo, not the themed page, so it must not flip. */}
        <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 z-20 px-[7px] md:px-2 py-1 rounded-[7px] bg-[rgba(28,25,21,0.86)]">
          <span className="block text-white text-xs md:text-[13px] font-semibold tabular-nums leading-none">
            ${shownPrice.toFixed(2)}{item.variants && !hasSlides ? '+' : ''}
          </span>
        </div>

        {/* Slide indicator */}
        {hasSlides && (
          <div className="absolute bottom-2 left-2 z-20 flex gap-1" aria-hidden="true">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-[width,background-color] duration-300 ${i === slideIdx ? 'w-3 bg-[#1560A8]' : 'w-1.5 bg-[rgba(28,25,21,0.2)]'}`}
              />
            ))}
          </div>
        )}

        {/* Variant count */}
        {item.variants?.length > 0 && (
          <div className="absolute bottom-1.5 right-1.5 md:bottom-2 md:right-2 z-20 px-[7px] md:px-2 py-1 rounded-[7px] bg-white/95 shadow-[0_0_0_1px_rgba(28,25,21,0.08)]">
            <span className="block text-[11px] md:text-xs font-semibold text-[#2A2622] tabular-nums leading-none">
              <FadeText>{item.variants.length} {t(ui.optionsLabel)}</FadeText>
            </span>
          </div>
        )}
      </div>

      {/* Dish details */}
      <div className="flex flex-col gap-1 px-1 md:px-1.5 pt-2.5 md:pt-3 pb-1">
        <h3 className="font-display text-[15px] md:text-[17px] font-semibold leading-tight line-clamp-2">
          <FadeText><HighlightText text={title} highlight={searchQuery} /></FadeText>
        </h3>
        <p className="text-xs md:text-[13px] text-muted truncate">
          <FadeText>{desc}</FadeText>
        </p>
      </div>
    </motion.div>
  );
}
