/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // All theme colors resolve through CSS variables (:root vs .dark in
        // index.css), so the whole site re-skins for dark mode without
        // touching component classes.
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          soft: 'var(--color-primary-soft)'
        },
        'on-primary': 'var(--color-on-primary)',
        background: {
          DEFAULT: 'var(--color-background)',
          alt: 'var(--color-background-alt)'
        },
        surface: 'var(--color-surface)',
        line: {
          DEFAULT: 'var(--color-line)',
          strong: 'var(--color-line-strong)'
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          2: 'var(--color-ink-2)'
        },
        muted: 'var(--color-muted)',
        scrim: 'var(--color-scrim)'
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif']
      },
      boxShadow: {
        lift: 'var(--shadow-lift)',
        poster: 'var(--shadow-poster)',
        panel: 'var(--shadow-panel)'
      },
      transitionTimingFunction: {
        // Mirrors src/lib/motion.js
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)'
      }
    },
  },
  plugins: [],
}
