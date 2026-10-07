// Shared motion language: things arrive with a soft ease-out, leave quickly,
// and nothing bounces. Only transform and opacity are animated.
// The CSS side of the same curves lives in tailwind.config.js (ease-out/in).

export const EASE_OUT = [0.22, 1, 0.36, 1]; // pages, cards, pills, posters
export const EASE_SHEET = [0.32, 0.72, 0, 1]; // dish sheet and side panel
export const EASE_IN = [0.4, 0, 1, 1]; // anything leaving

export const DURATION = {
  press: 0.12,
  text: 0.16,
  card: 0.26,
  pill: 0.28,
  sheetIn: 0.4,
  sheetOut: 0.22,
  page: 0.44,
  poster: 0.42,
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
