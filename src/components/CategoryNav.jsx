import React, { useRef, useEffect, useState, useMemo, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useMenuData } from '../context/MenuDataContext';
import { useFeedScroll } from '../hooks/useFeedScroll';
import { ui } from '../data/strings';
import { DURATION, EASE_OUT } from '../lib/motion';
import FadeText from './FadeText';
import Skeleton from './Skeleton';
import { cn } from '../lib/cn';

const pillTransition = { duration: DURATION.pill, ease: EASE_OUT };

// Widths for the loading placeholders, so they read like real category names
const CHIP_WIDTHS = ['w-28', 'w-52', 'w-24', 'w-28', 'w-36', 'w-32', 'w-40'];
const ROW_WIDTHS = ['w-24', 'w-40', 'w-16', 'w-24', 'w-32', 'w-28', 'w-36'];

function NavSkeleton({ isVertical }) {
  if (isVertical) {
    return (
      <div className="flex flex-col gap-0.5" aria-hidden="true">
        <Skeleton className="h-3 w-20 mx-3 mb-3 rounded" />
        {ROW_WIDTHS.map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-2 min-h-[42px] px-3">
            <Skeleton className={cn('h-3.5 rounded', w)} />
            <Skeleton className="h-3 w-4 rounded" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-2 overflow-hidden px-5 py-3 md:px-10 md:py-4" aria-hidden="true">
      {CHIP_WIDTHS.map((w, i) => (
        <Skeleton key={i} className={cn('shrink-0 h-[38px] md:h-10 rounded-[10px]', w)} />
      ))}
    </div>
  );
}

export default function CategoryNav({ activeCategoryId, onCategorySelect, isVertical = false }) {
  const { t } = useLanguage();
  const { categories, menuItems, isLoading } = useMenuData();
  const navRef = useRef(null);
  const pillId = useId();
  const [sectionProgress, setSectionProgress] = useState(0);

  // Live item counts per category
  const counts = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      map[item.categoryId] = (map[item.categoryId] || 0) + 1;
    });
    return map;
  }, [menuItems]);

  // Auto-scroll the active chip into view when the active category changes
  useEffect(() => {
    if (navRef.current && activeCategoryId && !isVertical) {
      const activeElement = navRef.current.querySelector(`[data-category="${activeCategoryId}"]`);
      activeElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategoryId, isVertical]);

  // Track scroll completion within the active section for the progress line
  const updateProgress = useCallback((container) => {
    if (isVertical) return;
    const section = document.getElementById(`section-${activeCategoryId}`);
    if (!section) return;
    const sectionTop = section.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    const raw = (container.scrollTop + container.clientHeight * 0.35 - sectionTop) / section.offsetHeight;
    setSectionProgress(Math.min(1, Math.max(0, raw)));
  }, [activeCategoryId, isVertical]);

  useFeedScroll(updateProgress);

  if (isLoading) return <NavSkeleton isVertical={isVertical} />;

  if (isVertical) {
    return (
      <nav aria-label={t(ui.categoriesLabel)} className="flex flex-col gap-0.5">
        <span className="px-3 pb-2 text-xs font-semibold tracking-[0.06em] uppercase text-muted">
          <FadeText>{t(ui.categoriesLabel)}</FadeText>
        </span>
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'relative flex items-center justify-between gap-2 min-h-[42px] px-3 py-2 rounded-[10px] text-left text-sm leading-snug transition-colors duration-150',
                isActive ? 'text-primary font-semibold' : 'text-ink-2 font-medium hover:bg-background-alt hover:text-ink'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={pillId}
                  transition={pillTransition}
                  className="absolute inset-0 rounded-[10px] bg-primary-soft"
                  aria-hidden="true"
                />
              )}
              <span className="relative"><FadeText>{t(cat.title)}</FadeText></span>
              <span className={cn('relative text-xs font-semibold tabular-nums', isActive ? 'text-primary' : 'text-muted')}>
                <FadeText>{counts[cat.id] || 0}</FadeText>
              </span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      ref={navRef}
      aria-label={t(ui.categoriesLabel)}
      className="flex gap-2 overflow-x-auto hide-scrollbar px-5 py-3 md:px-10 md:py-4"
    >
      {categories.map((cat) => {
        const isActive = activeCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            data-category={cat.id}
            onClick={() => onCategorySelect(cat.id)}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'relative shrink-0 h-[38px] md:h-10 flex items-center gap-2 pl-3.5 pr-2.5 rounded-[10px] border text-sm whitespace-nowrap transition-[color,border-color] duration-150',
              isActive
                ? 'z-[1] border-transparent text-on-primary font-semibold'
                : 'border-line bg-surface text-ink-2 font-medium hover:border-line-strong hover:text-ink'
            )}
          >
            {isActive && (
              <motion.span
                layoutId={pillId}
                transition={pillTransition}
                className="absolute -inset-px rounded-[10px] bg-primary overflow-hidden"
                aria-hidden="true"
              >
                {/* How far through this section the feed is scrolled */}
                <span
                  className="absolute left-0 bottom-0 h-[3px] bg-on-primary/35 transition-[width] duration-150 ease-out"
                  style={{ width: `${Math.round(sectionProgress * 100)}%` }}
                />
              </motion.span>
            )}
            <span className="relative"><FadeText>{t(cat.title)}</FadeText></span>
            <span
              className={cn(
                'relative text-xs font-semibold tabular-nums',
                isActive ? 'min-w-5 px-1.5 py-0.5 rounded-md text-center bg-white/20 dark:bg-black/15' : 'text-muted'
              )}
            >
              <FadeText>{counts[cat.id] || 0}</FadeText>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
