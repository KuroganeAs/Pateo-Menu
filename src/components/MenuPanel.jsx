import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useViewport } from '../hooks/useViewport';
import { smoothScrollTo } from '../lib/smoothScroll';
import { ui } from '../data/strings';
import { MenuHeader, SidebarHeader, SidebarControls } from './Header';
import SearchBar from './SearchBar';
import CategoryNav from './CategoryNav';
import MenuFeed from './MenuFeed';
import DishDetailModal from './DishDetailModal';
import FadeText from './FadeText';

// The full-screen interactive menu. Rendered exactly once, so the singleton
// feed ids (#menu-scroll-container, #section-*) stay unique in the document.
export default function MenuPanel({ onBack }) {
  const { t } = useLanguage();
  const [activeCategoryId, setActiveCategoryId] = useState('sandes');
  const [selectedDish, setSelectedDish] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobile, isDesktop, isTabletLandscape } = useViewport();

  const handleCategorySelect = (categoryId) => {
    setActiveCategoryId(categoryId);
    const container = document.getElementById('menu-scroll-container');
    const section = document.getElementById(`section-${categoryId}`);
    if (!container || !section) return;
    const targetTop = section.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 4;
    smoothScrollTo(container, targetTop);
  };

  const showSidebar = isDesktop || isTabletLandscape;
  const search = <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;

  return (
    <div className="relative w-full h-full flex bg-background overflow-hidden">
      {/* Desktop / tablet-landscape sidebar */}
      {showSidebar && (
        <aside className="w-60 lg:w-[300px] h-full shrink-0 flex flex-col gap-[18px] px-4 lg:px-5 py-5 lg:py-6 bg-surface border-r border-line z-20">
          <SidebarHeader onBack={onBack} />
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            className="h-11 bg-background"
            inputClassName="text-sm"
          />
          <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar -mx-1 px-1">
            <CategoryNav
              activeCategoryId={activeCategoryId}
              onCategorySelect={handleCategorySelect}
              isVertical
            />
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 min-h-10 px-3 -mb-2 rounded-[10px] text-sm font-medium text-ink-2 hover:bg-background-alt hover:text-ink transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <FadeText>{t(ui.landing.promoHeading)}</FadeText>
          </button>
          <SidebarControls />
        </aside>
      )}

      {/* Main content area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden w-full">
        {!showSidebar && (
          <div className="z-20 bg-background border-b border-line">
            <MenuHeader onBack={onBack} search={isMobile ? null : search} />
            {isMobile && <div className="px-5 pt-0.5">{search}</div>}
            <CategoryNav
              activeCategoryId={activeCategoryId}
              onCategorySelect={handleCategorySelect}
            />
          </div>
        )}

        <MenuFeed
          onActiveCategoryChange={setActiveCategoryId}
          onItemSelect={setSelectedDish}
          searchQuery={searchQuery}
          isModalOpen={!!selectedDish}
          selectedId={selectedDish?.id}
        />
      </main>

      <DishDetailModal
        item={selectedDish}
        onClose={() => setSelectedDish(null)}
      />
    </div>
  );
}
