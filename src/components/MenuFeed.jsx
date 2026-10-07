import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useMenuData } from '../context/MenuDataContext';
import { ui } from '../data/strings';
import MenuItemCard from './MenuItemCard';
import CategoryIcon from './CategoryIcon';
import FadeText from './FadeText';
import Skeleton from './Skeleton';
import { isAutoScrolling } from '../lib/smoothScroll';
import { cn } from '../lib/cn';
import { SearchX, Info } from 'lucide-react';

const GRID = 'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 lg:gap-5';

function CardSkeleton() {
  return (
    <div className="flex flex-col p-1.5 rounded-[14px] md:rounded-2xl bg-surface border border-line">
      <Skeleton className="w-full aspect-square rounded-[10px] md:rounded-[11px]" />
      <div className="flex flex-col gap-2 px-1 md:px-1.5 pt-3 md:pt-3.5 pb-1.5">
        <Skeleton className="h-3.5 md:h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

// The feed's shape while the menu loads: section headings and dish cards
function FeedSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading the menu…</span>
      {[6, 4].map((cards, s) => (
        <div key={s} className="pt-5 md:pt-[26px] lg:pt-[30px] pb-2" aria-hidden="true">
          <div className="flex items-center gap-2.5 md:gap-3 mb-3.5 md:mb-4 lg:mb-[18px]">
            <Skeleton className="w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-[9px] md:rounded-[10px]" />
            <Skeleton className={cn('h-6 md:h-7 rounded-md', s === 0 ? 'w-36' : 'w-56')} />
            <span className="flex-1 h-px bg-line" />
            <Skeleton className="h-3.5 w-5 rounded" />
          </div>
          <div className={GRID}>
            {Array.from({ length: cards }, (_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MenuFeed({ onActiveCategoryChange, onItemSelect, searchQuery, isModalOpen, selectedId }) {
  const { t } = useLanguage();
  const { categories, menuItems, isLoading } = useMenuData();
  const sectionRefs = useRef({});

  const query = searchQuery.trim().toLowerCase();

  // Setup Intersection Observer for Scroll-Spy.
  // Re-runs when the sections change (search filtering, the menu finishing
  // loading or the live menu arriving), since those mount new section nodes
  // and would leave the old observer watching detached DOM nodes.
  useEffect(() => {
    const container = document.getElementById('menu-scroll-container');
    if (!container) return;

    const options = {
      root: container,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      // Ignore sections flying past during a category-click scroll animation;
      // the clicked category is already active. User scrolling cancels the
      // animation, so the spy always reacts to manual scrolls.
      if (isAutoScrolling()) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.getAttribute('data-section-id');
          if (categoryId) {
            onActiveCategoryChange(categoryId);
          }
        }
      });
    }, options);

    Object.values(sectionRefs.current).forEach((section) => {
      if (section && section.isConnected) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [onActiveCategoryChange, query, isLoading, categories]);

  // Keyboard navigation: arrow keys move focus between cards
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      if (isModalOpen) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const cards = Array.from(document.querySelectorAll('[data-menu-card]'));
      if (!cards.length) return;

      const currentIdx = cards.indexOf(document.activeElement);
      if (currentIdx === -1) {
        cards[0].focus();
        e.preventDefault();
        return;
      }

      // Columns = how many cards share the top edge of the first card in this grid
      const grid = cards[currentIdx].parentElement;
      const siblings = Array.from(grid.querySelectorAll('[data-menu-card]'));
      const cols = siblings.filter((c) => c.offsetTop === siblings[0].offsetTop).length || 1;

      const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' ? cols : -cols;
      const next = currentIdx + delta;
      if (next >= 0 && next < cards.length) {
        cards[next].focus();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const filterItems = (catId) => {
    let catItems = menuItems.filter(item => item.categoryId === catId);
    if (query) {
      catItems = catItems.filter(item => {
        const titleEn = item.title.en?.toLowerCase() || '';
        const titlePt = item.title.pt?.toLowerCase() || '';
        const titleTet = item.title.tet?.toLowerCase() || '';
        return titleEn.includes(query) || titlePt.includes(query) || titleTet.includes(query);
      });
    }
    return catItems;
  };

  const hasResults = categories.some((cat) => filterItems(cat.id).length > 0);

  return (
    <section className="relative h-full overflow-hidden flex flex-col flex-1">
      <div
        id="menu-scroll-container"
        className="flex-1 overflow-y-auto px-5 md:px-6 lg:px-10 pb-28 hide-scrollbar overscroll-contain"
      >
        {isLoading && <FeedSkeleton />}

        {!isLoading && !hasResults && (
          <div className="flex flex-col items-center justify-center text-center py-24 text-muted gap-3">
            <SearchX size={40} className="text-line-strong" />
            <p className="text-sm font-medium"><FadeText>{t(ui.emptyState)}</FadeText></p>
          </div>
        )}

        {!isLoading && categories.map((cat) => {
          const catItems = filterItems(cat.id);
          if (catItems.length === 0) return null;

          return (
            <div
              key={cat.id}
              id={`section-${cat.id}`}
              data-section-id={cat.id}
              ref={el => sectionRefs.current[cat.id] = el}
              className="pt-5 md:pt-[26px] lg:pt-[30px] pb-2"
            >
              {/* Section heading: icon · serif title · hairline · count */}
              <div className="flex items-center gap-2.5 md:gap-3 mb-3.5 md:mb-4 lg:mb-[18px]">
                <span className="w-8 h-8 md:w-9 md:h-9 rounded-[9px] md:rounded-[10px] bg-primary-soft text-primary flex items-center justify-center shrink-0 empty:hidden">
                  <CategoryIcon category={cat} className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                </span>
                <h2 className="font-display text-[22px] md:text-[26px] lg:text-[28px] font-semibold tracking-[-0.015em] leading-tight">
                  <FadeText>{t(cat.title)}</FadeText>
                </h2>
                <span className="flex-1 h-px bg-line" aria-hidden="true" />
                <span className="text-[13px] md:text-sm text-muted tabular-nums shrink-0">{catItems.length}</span>
              </div>

              {/* Category small print (e.g. Barista takeaway surcharge) */}
              {cat.note && (
                <p className="flex items-center gap-1.5 -mt-1 mb-3.5 text-[13px] text-ink-2">
                  <Info size={14} strokeWidth={2} className="shrink-0" />
                  <FadeText>{t(cat.note)}</FadeText>
                </p>
              )}

              <div className={GRID}>
                {catItems.map((item, i) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    index={i}
                    onClick={onItemSelect}
                    searchQuery={searchQuery}
                    isSelected={item.id === selectedId}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Soft fade where the feed runs under the bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 md:h-20 bg-gradient-to-b from-transparent to-background" aria-hidden="true" />
    </section>
  );
}
