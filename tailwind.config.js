/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand accent — deep blue on warm paper
        primary: {
          DEFAULT: '#1864B0',
          dark: '#0C48AB'
        },
        // Warm cream paper instead of cold admin grey
        background: {
          DEFAULT: '#FAF7F2',
          alt: '#F3EEE6'
        },
        // Elevated surfaces (sidebar, sticky bars)
        surface: '#FFFDF9',
        // Warm near-black for headings/titles
        ink: '#2E2A26',
        // Warm taupe for secondary text
        muted: '#7A716A'
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
