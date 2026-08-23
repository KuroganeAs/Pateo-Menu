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
          dark: 'var(--color-primary-dark)'
        },
        background: {
          DEFAULT: 'var(--color-background)',
          alt: 'var(--color-background-alt)'
        },
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)'
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif']
      },
      boxShadow: {
        // Warm-tinted shadows instead of pure black
        card: '0 4px 16px -4px rgba(46, 42, 38, 0.08)',
        'card-hover': '0 12px 28px -8px rgba(46, 42, 38, 0.16)',
        glow: '0px 10px 25px -5px rgba(24, 100, 176, 0.3)'
      }
    },
  },
  plugins: [],
}
