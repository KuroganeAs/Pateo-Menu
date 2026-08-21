import placeholderImg from '../assets/food-placeholder.svg';

// Shown as a link under the promo carousel — paste the page URL once
// (e.g. 'https://www.facebook.com/pateo...'). Leave empty to hide the link.
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/pateo.timor';

// Weekly promos = the image files in src/assets/promos/ (see the README
// there for the upload workflow). Vite scans the folder at build time, so
// updating the week is just adding/deleting files — 1.jpg, 2.png, ... are
// shown in numeric order. An optional captions.json maps filename -> text.
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
    caption: captions[baseName(path)] || ''
  }));

// Empty folder still renders a presentable carousel, matching the usual
// weekly batch of 7 posters
export const promos = detected.length
  ? detected
  : Array.from({ length: 7 }, () => ({ src: placeholderImg, caption: '' }));
