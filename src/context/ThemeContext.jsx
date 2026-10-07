import React, { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '../lib/motion';

// Light is the brand default; dark is an explicit guest choice, remembered
// across visits. The .dark class on <html> drives the CSS-variable palette.
const STORAGE_KEY = 'pateo-theme';
const REVEAL_MS = 480;

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

const applyClass = (theme) => document.documentElement.classList.toggle('dark', theme === 'dark');

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    applyClass(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private-mode storage failures just mean the choice isn't remembered
    }
  }, [theme]);

  // `origin` is the toggle's on-screen centre: the new theme spreads out from
  // there as a circle (View Transitions). Browsers without the API swap
  // instantly; reduced motion gets the short default crossfade instead.
  const toggleTheme = (origin) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition) {
      setTheme(next);
      return;
    }

    const reveal = !prefersReducedMotion() && origin;
    const root = document.documentElement;
    if (reveal) root.classList.add('theme-reveal');

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
      applyClass(next);
    });

    if (reveal) {
      const { x, y } = origin;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      transition.ready
        .then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: REVEAL_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
          );
        })
        .catch(() => {});
    }
    transition.finished.finally(() => root.classList.remove('theme-reveal'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
