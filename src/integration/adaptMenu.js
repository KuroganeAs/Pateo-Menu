// Converts the backend's menu shape (GET /api/menu — English canonical plus
// optional *_pt / *_tet translations, integer ids, modifier groups with price
// deltas) into the site's shape (trilingual {en,pt,tet} text, string ids,
// variants with absolute prices).
//
// Text priority per language: admin-entered translation > bundled menu.js
// translation (matched by English text) > English. Bundled data also supplies
// per-variant photos, which the backend doesn't store.
import { API_BASE } from './apiClient';
import { categories as localCategories, menuItems as localItems } from '../data/menu';

const norm = (s) => (s || '').trim().toLowerCase();

// Lookups from the bundled data, keyed by English text
const localCategoryByName = new Map(localCategories.map((c) => [norm(c.title.en), c]));
const localItemByName = new Map(localItems.map((i) => [norm(i.title.en), i]));

const tri = (en, pt, tet, localTri) => ({
  en: en || '',
  pt: pt || localTri?.pt || en || '',
  tet: tet || localTri?.tet || en || ''
});

const resolveImage = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  // Admin uploads live on the backend; /dishes/* stays a site asset
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`;
  return url;
};

function adaptVariants(apiItem, localItem) {
  // The seed convention collapses site "variants" into one required
  // single-select group; treat the first such group as the variant list.
  const group = (apiItem.modifier_groups || []).find(
    (g) => g.selection_type === 'single' && g.required && (g.options || []).length > 0
  );
  if (!group) return undefined;

  const base = Number(apiItem.price) || 0;
  return group.options.map((opt) => {
    const localVariant = localItem?.variants?.find((v) => norm(v.name.en) === norm(opt.name));
    return {
      name: tri(opt.name, opt.name_pt, opt.name_tet, localVariant?.name),
      price: Math.round((base + (Number(opt.price_delta) || 0)) * 100) / 100,
      image: localVariant?.image ?? null,
    };
  });
}

export function adaptMenu(apiMenu) {
  const categories = [];
  const menuItems = [];

  for (const apiCat of apiMenu.categories || []) {
    const localCat = localCategoryByName.get(norm(apiCat.name));
    const catId = localCat?.id ?? `cat-${apiCat.id}`;

    const visibleItems = (apiCat.items || []).filter((i) => i.is_available);
    if (visibleItems.length === 0) continue; // hide empty / all-sold-out sections

    categories.push({
      id: catId,
      title: tri(apiCat.name, apiCat.name_pt, apiCat.name_tet, localCat?.title),
      ...(localCat?.note ? { note: localCat.note } : {}),
    });

    for (const apiItem of visibleItems) {
      const localItem = localItemByName.get(norm(apiItem.name));
      const variants = adaptVariants(apiItem, localItem);

      menuItems.push({
        id: localItem?.id ?? `item-${apiItem.id}`,
        categoryId: catId,
        image: resolveImage(apiItem.image_url) ?? localItem?.image ?? null,
        title: tri(apiItem.name, apiItem.name_pt, apiItem.name_tet, localItem?.title),
        description: tri(
          apiItem.description,
          apiItem.description_pt,
          apiItem.description_tet,
          localItem?.description
        ),
        price: Number(apiItem.price) || 0,
        ...(variants ? { variants } : {}),
      });
    }
  }

  return { categories, menuItems };
}
