import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { useViewport } from './hooks/useViewport';
import { smoothScrollTo } from './lib/smoothScroll';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CategoryNav from './components/CategoryNav';
import MenuFeed from './components/MenuFeed';
import DishDetailModal from './components/DishDetailModal';

function MainApp() {
  const [activeCategoryId, setActiveCategoryId] = useState('sandes');
  const [selectedDish, setSelectedDish] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDesktop, isTabletLandscape } = useViewport();

  const handleCategorySelect = (categoryId) => {
    setActiveCategoryId(categoryId);
    const container = document.getElementById('menu-scroll-container');
    const section = document.getElementById(`section-${categoryId}`);
    if (!container || !section) return;
    const targetTop = section.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 4;
    smoothScrollTo(container, targetTop);
  };

  const showSidebar = isDesktop || isTabletLandscape;

  return (
    <div className="w-full h-[100dvh] flex bg-background paper relative overflow-hidden">
      {/* Desktop/Tablet-Landscape Sidebar */}
      {showSidebar && (
        <aside className="w-80 h-full border-r border-stone-200/80 bg-surface shadow-card flex flex-col z-20 shrink-0">
          <Header />
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <div className="flex-1 overflow-y-auto">
            {/* Desktop Vertical Category Nav */}
            <CategoryNav
              activeCategoryId={activeCategoryId}
              onCategorySelect={handleCategorySelect}
              isVertical={true}
            />
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden w-full">
        {!showSidebar && (
          <div className="z-20 bg-background/95 backdrop-blur-md">
            <Header shrinkOnScroll />
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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
        />
      </main>

      {/* Modal */}
      <DishDetailModal
        item={selectedDish}
        onClose={() => setSelectedDish(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
