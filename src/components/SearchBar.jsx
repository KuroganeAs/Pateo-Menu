import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useViewport } from '../hooks/useViewport';
import { ui } from '../data/strings';
import { Search } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery }) {
  const { t } = useLanguage();
  const { isDesktop } = useViewport();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus on '/' press, but only if we aren't already typing somewhere
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="px-4 pb-4">
      <div className="relative flex items-center w-full h-12 rounded-full bg-white shadow-card border border-stone-200/80 overflow-hidden px-4 group focus-within:border-primary/50 transition-colors">
        <Search className="text-stone-400 group-focus-within:text-primary transition-colors" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`${t(ui.searchPlaceholder)} ${isDesktop ? '[/]' : ''}`}
          className="w-full h-full bg-transparent border-none outline-none ml-3 text-sm text-ink placeholder:text-stone-400"
        />
      </div>
    </div>
  );
}
