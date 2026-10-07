import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useViewport } from '../hooks/useViewport';
import { ui } from '../data/strings';
import { cn } from '../lib/cn';

export default function SearchBar({ searchQuery, setSearchQuery, className, inputClassName }) {
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
    <label
      className={cn(
        'flex items-center gap-2.5 w-full h-[46px] pl-3.5 pr-2 rounded-xl border border-line bg-surface text-muted transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
        className
      )}
    >
      <Search size={18} strokeWidth={2} className="shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t(ui.searchPlaceholder)}
        aria-label={t(ui.searchPlaceholder)}
        className={cn('flex-1 min-w-0 h-full bg-transparent border-none outline-none text-[15px] text-ink placeholder:text-muted', inputClassName)}
      />
      {searchQuery ? (
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-background-alt"
        >
          <X size={16} />
        </button>
      ) : (
        isDesktop && (
          <kbd className="min-w-6 h-6 px-1.5 shrink-0 inline-flex items-center justify-center rounded-md border border-line bg-surface text-ink-2 text-xs font-semibold font-sans" aria-hidden="true">
            /
          </kbd>
        )
      )}
    </label>
  );
}
