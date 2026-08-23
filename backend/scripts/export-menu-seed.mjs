#!/usr/bin/env node
// Regenerates the canonical menu seed JSON from the customer site's menu data.
//   node backend/scripts/export-menu-seed.mjs
// Writes: backend/app/seed_menu.json
//
// Mapping notes:
// - English is the canonical string; PT / Tetun ride along as *_pt / *_tet.
// - menu.js "variants" carry ABSOLUTE prices; the backend models modifiers as
//   price DELTAS, so each variant becomes an option with
//   price_delta = variant.price - item.price, in a required single-select
//   group named "Choice".
// - Variant images have no home in the backend schema (options are name+delta
//   only); the item's base image is kept.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const menuJs = pathToFileURL(path.join(root, 'src', 'data', 'menu.js')).href;

const { categories, menuItems } = await import(menuJs);

const round2 = (n) => Math.round(n * 100) / 100;
const lang = (obj, key) => {
  if (!obj) return null;
  if (typeof obj === 'string') return key === 'en' ? obj : null;
  return obj[key] ?? null;
};
const en = (obj) => lang(obj, 'en') ?? '';

const seed = {
  generated_from: 'src/data/menu.js',
  categories: categories.map((cat, ci) => ({
    name: en(cat.title),
    name_pt: lang(cat.title, 'pt'),
    name_tet: lang(cat.title, 'tet'),
    display_order: ci,
    items: menuItems
      .filter((it) => it.categoryId === cat.id)
      .map((it, ii) => ({
        name: en(it.title),
        name_pt: lang(it.title, 'pt'),
        name_tet: lang(it.title, 'tet'),
        description: en(it.description) || null,
        description_pt: lang(it.description, 'pt'),
        description_tet: lang(it.description, 'tet'),
        price: round2(it.price),
        image_url: it.image ?? null,
        is_available: true,
        display_order: ii,
        modifier_groups: (it.variants && it.variants.length)
          ? [{
              name: 'Choice',
              selection_type: 'single',
              required: true,
              options: it.variants.map((v) => ({
                name: en(v.name),
                name_pt: lang(v.name, 'pt'),
                name_tet: lang(v.name, 'tet'),
                price_delta: round2(v.price - it.price),
              })),
            }]
          : [],
      })),
  })),
};

const json = JSON.stringify(seed, null, 2) + '\n';
const backendTarget = path.join(root, 'backend', 'app', 'seed_menu.json');
await mkdir(path.dirname(backendTarget), { recursive: true });
await writeFile(backendTarget, json);
console.log('wrote', backendTarget);
const nItems = seed.categories.reduce((a, c) => a + c.items.length, 0);
console.log(`categories: ${seed.categories.length}, items: ${nItems}`);
