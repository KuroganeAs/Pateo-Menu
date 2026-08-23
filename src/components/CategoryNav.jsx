import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useMenuData } from '../context/MenuDataContext';
import { useFeedScroll } from '../hooks/useFeedScroll';
import FadeText from './FadeText';
import { cn } from '../lib/cn';

export default function CategoryNav({ activeCategoryId, onCategorySelect, isVertical = false }) {
  const { t } = useLanguage();
  const { categories, menuItems } = useMenuData();
  const navRef = useRef(null);
  const [sectionProgress, setSectionProgress] = useState(0);

  // Live item counts per category
  const counts = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      map[item.categoryId] = (map[item.categoryId] || 0) + 1;
    });
    return map;
  }, [menuItems]);

  // Auto-scroll the sticky nav pill into view when active category changes
  useEffect(() => {
    if (navRef.current && activeCategoryId && !isVertical) {
      const activeElement = navRef.current.querySelector(`[data-category="${activeCategoryId}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeCategoryId, isVertical]);

  // Track scroll completion within the active section for the progress bar
  const updateProgress = useCallback((container) => {
    if (isVertical) return;
    const section = document.getElementById(`section-${activeCategoryId}`);
    if (!section) return;
    const sectionTop = section.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    const raw = (container.scrollTop + container.clientHeight * 0.35 - sectionTop) / section.offsetHeight;
    setSectionProgress(Math.min(1, Math.max(0, raw)));
  }, [activeCategoryId, isVertical]);

  useFeedScroll(updateProgress);

  if (isVertical) {
    return (
      <div className="flex flex-col py-2 px-3 gap-1">
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted hover:bg-background-alt hover:text-ink"
              )}
            >
              <div className="relative z-10 flex justify-between items-center">
                <FadeText>{t(cat.title)}</FadeText>
                {/* Live item count badge */}
                <span
                  className={cn(
                    "text-xs font-semibold rounded-full px-2 py-0.5 min-w-[24px] text-center transition-colors tabular-nums",
                    isActive ? "bg-primary text-white" : "bg-background-alt text-muted"
                  )}
                >
                  {counts[cat.id] || 0}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-transparent border-b border-stone-200/70 dark:border-stone-800 py-3 relative">
      <div
        ref={navRef}
        className="flex overflow-x-auto px-4 gap-3 hide-scrollbar snap-x"
      >
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <div key={cat.id} className="relative shrink-0 snap-center">
              <button
                data-category={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                className={cn(
                  "whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px]",
                  isActive
                    ? "bg-primary text-white shadow-glow"
                    : "bg-surface text-muted border border-stone-200 dark:border-stone-700 hover:border-primary/40 hover:text-ink"
                )}
              >
                <FadeText>{t(cat.title)}</FadeText>
              </button>

              {/* Scroll completion progress bar under active pill */}
              {isActive && (
                <div className="absolute -bottom-3 left-0 right-0 h-[2px] bg-primary/20 rounded-t-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-t-full transition-[width] duration-150 ease-out"
                    style={{ width: `${Math.round(sectionProgress * 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
