import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { categories, menuItems } from '../data/menu';
import { ui } from '../data/strings';
import { useViewport } from '../hooks/useViewport';
import MenuItemCard from './MenuItemCard';
import GradualBlur from './GradualBlur';
import FadeText from './FadeText';
import { isAutoScrolling } from '../lib/smoothScroll';
import {
  Sandwich, Sparkles, Coffee, Croissant, Cookie, CakeSlice, Martini, SearchX
} from 'lucide-react';

// Printed-menu touch: a small icon beside every category heading
const categoryIcons = {
  'sandes': Sandwich,
  'sandes-especiais': Sparkles,
  'barista': Coffee,
  'croissants': Croissant,
  'pasteis-salgados': Cookie,
  'bolos-doces': CakeSlice,
  'bebidas-cocktails': Martini,
};

export default function MenuFeed({ onActiveCategoryChange, onItemSelect, searchQuery, isModalOpen }) {
  const { t } = useLanguage();
  const { isDesktop, isTabletLandscape } = useViewport();
  const sectionRefs = useRef({});

  const query = searchQuery.trim().toLowerCase();

  // Setup Intersection Observer for Scroll-Spy.
  // Re-runs when the query changes because filtered sections unmount/remount,
  // leaving the old observer watching detached DOM nodes.
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
  }, [onActiveCategoryChange, query]);

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

  // Determine Grid Layout based on viewport
  const gridClass = isDesktop ? 'grid-cols-3 lg:grid-cols-4'
                  : isTabletLandscape ? 'grid-cols-3'
                  : 'grid-cols-2';

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
        className="flex-1 overflow-y-auto px-4 pb-32 pt-2 hide-scrollbar overscroll-contain"
      >
        {!hasResults && (
          <div className="flex flex-col items-center justify-center text-center py-24 text-muted gap-3">
            <SearchX size={40} className="text-stone-300" />
            <p className="text-sm font-medium"><FadeText>{t(ui.emptyState)}</FadeText></p>
          </div>
        )}

        {categories.map((cat) => {
          const catItems = filterItems(cat.id);
          if (catItems.length === 0) return null;
          const Icon = categoryIcons[cat.id];

          return (
            <div
              key={cat.id}
              id={`section-${cat.id}`}
              data-section-id={cat.id}
              ref={el => sectionRefs.current[cat.id] = el}
              className="pt-8 pb-4"
            >
              {/* Section heading: icon · serif title · dotted leader · count */}
              <div className="flex items-center gap-3 mb-5">
                {Icon && (
                  <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon size={18} strokeWidth={2.2} />
                  </span>
                )}
                <h2 className="font-display text-2xl font-bold text-ink leading-none"><FadeText>{t(cat.title)}</FadeText></h2>
                <div className="flex-1 border-b-2 border-dotted border-stone-300/80 translate-y-1.5" aria-hidden="true" />
                <span className="text-xs font-semibold text-muted tabular-nums shrink-0">{catItems.length}</span>
              </div>

              {/* Category small print (e.g. Barista takeaway surcharge) */}
              {cat.note && (
                <p className="text-xs text-muted italic -mt-3 mb-4"><FadeText>{t(cat.note)}</FadeText></p>
              )}

              <div className={`grid ${gridClass} gap-4`}>
                {catItems.map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onClick={onItemSelect}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Smooth Blur at the bottom of the scroll feed */}
      <GradualBlur height="6rem" strength={1.5} opacity={1} />
    </section>
  );
}
