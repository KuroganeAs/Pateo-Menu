import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const onClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <button
      onClick={onClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-11 h-11 shrink-0 rounded-xl border border-line bg-surface text-ink-2 flex items-center justify-center transition-[transform,background-color,color] duration-150 ease-out hover:text-ink hover:bg-background-alt active:scale-95"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
