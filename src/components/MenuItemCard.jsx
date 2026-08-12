import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ui } from '../data/strings';
import { useViewport } from '../hooks/useViewport';
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
          <mark key={i} className="bg-primary/15 text-primary rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default function MenuItemCard({ item, onClick, searchQuery }) {
  const { t } = useLanguage();
  const { isDesktop } = useViewport();
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  // A cached image can finish loading before React attaches onLoad
  useEffect(() => {
    if (imgRef.current?.complete) setIsLoaded(true);
  }, []);

  const title = t(item.title) || 'Placeholder Item';
  const desc = t(item.description) || '';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(item);
    }
  };

  return (
    <div
      onClick={() => onClick(item)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      data-menu-card
      aria-label={title}
      className={`bg-white rounded-2xl p-2 shadow-card cursor-pointer transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${isDesktop ? 'hover:-translate-y-1 hover:shadow-card-hover' : 'active:scale-95'}`}
    >
      {/* Dish image (branded Páteo paper until real photos arrive) */}
      <div className="relative w-full aspect-square bg-stone-100 rounded-xl overflow-hidden">
        <img
          ref={imgRef}
          src={item.image || placeholderImg}
          alt=""
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        )}

        {/* Floating Price Badge */}
        <div className="absolute top-2 left-2 bg-ink/75 backdrop-blur-md px-2 py-1 rounded-lg z-20 flex items-center">
          <span className="text-white text-xs font-bold tabular-nums leading-none">
            ${item.price.toFixed(2)}{item.variants ? '+' : ''}
          </span>
        </div>

        {/* Variant count hint */}
        {item.variants?.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-white/85 backdrop-blur-sm px-2 py-1 rounded-full z-20 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-ink tabular-nums leading-none">
              {item.variants.length} {t(ui.optionsLabel)}
            </span>
          </div>
        )}
      </div>

      {/* Dish Details */}
      <div className="pt-3 pb-2 px-1 flex flex-col h-[76px] justify-between">
        <h3 className="font-display text-[15px] font-semibold text-ink leading-tight line-clamp-2">
          <HighlightText text={title} highlight={searchQuery} />
        </h3>

        <p className="text-[12px] text-muted line-clamp-1 mt-1">
          {desc}
        </p>
      </div>
    </div>
  );
}
