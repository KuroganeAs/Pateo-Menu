import placeholderImg from '../assets/food-placeholder.svg';


// Bundled FALLBACK promos: the live posters are managed in the admin panel
// and loaded from Supabase (hooks/usePromos.js). These show only while that
// loads or if it is unreachable. Vite scans src/assets/promos/ at build time;
// 1.jpg, 2.png, ... are shown in numeric order and an optional captions.json
// maps filename -> text.
const imageModules = import.meta.glob(
  '../assets/promos/*.{png,jpg,jpeg,webp,gif,PNG,JPG,JPEG,WEBP,GIF}',
  { eager: true, import: 'default' }
);
const captionModules = import.meta.glob('../assets/promos/captions.json', {
  eager: true,
  import: 'default'
});
const captions = Object.values(captionModules)[0] || {};

const baseName = (path) => path.split('/').pop().replace(/\.[^.]+$/, '');
// Numeric-aware ordering so 10.jpg comes after 2.jpg, not before
const orderOf = (path) => {
  const n = parseInt(baseName(path), 10);
  return Number.isNaN(n) ? Infinity : n;
};

const detected = Object.keys(imageModules)
  .sort((a, b) => orderOf(a) - orderOf(b) || a.localeCompare(b))
  .map((path) => ({
    src: imageModules[path],
    caption: { en: captions[baseName(path)] || '' }
  }));

// Empty folder still renders a presentable carousel, matching the usual
// weekly batch of 7 posters
export const promos = detected.length
  ? detected
  : Array.from({ length: 7 }, () => ({ src: placeholderImg, caption: { en: '' } }));
