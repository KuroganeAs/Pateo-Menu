// Backs up the live menu and promo posters from Supabase into a dated folder
// OUTSIDE this repo (the repo is public, so backups must never be committed).
//
//   npm run backup                      -> ../Pateo Backups/<date and time>/
//   BACKUP_DIR="D:\Backups" npm run backup
//
// No keys or passwords: it reads only what the public site can read.
//   Included: every category, item (sold-out ones too), variant group and
//             option; every visible promo; every uploaded image those rows use.
//   Not included: hidden promos, the admin account (recreate it as described
//             in admin-panel/README.md) and the table structure (that's in
//             supabase/migrations/).
// Each backup folder has restore.sql and RESTORE.txt explaining how to use it.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || 'https://ycanpsdyscohheewtcpn.supabase.co').replace(/\/+$/, '');
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_HyDPemBdB7tjiTpusuUwIg_lXVkrLmH';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BACKUP_ROOT = path.resolve(process.env.BACKUP_DIR || path.join(ROOT, '..', 'Pateo Backups'));
const BUCKET = 'menu-images';
const BUCKET_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
const PAGE = 1000;

// Parents first: the order rows are restored in.
const TABLES = {
  categories: ['id', 'name', 'name_pt', 'name_tet', 'display_order'],
  menu_items: [
    'id', 'category_id', 'name', 'name_pt', 'name_tet', 'description', 'description_pt', 'description_tet',
    'price', 'image_url', 'is_available', 'display_order', 'created_at', 'updated_at',
  ],
  modifier_groups: ['id', 'menu_item_id', 'name', 'selection_type', 'required'],
  modifier_options: ['id', 'group_id', 'name', 'name_pt', 'name_tet', 'price_delta'],
  promos: ['id', 'image_url', 'caption', 'caption_pt', 'caption_tet', 'display_order', 'is_active', 'created_at'],
};

async function readTable(table, columns) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns.join(',')}&order=id&limit=${PAGE}&offset=${offset}`;
    const res = await fetch(url, { headers: { apikey: KEY } });
    if (!res.ok) throw new Error(`Reading ${table} failed: HTTP ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE) return rows;
  }
}

const sqlValue = (v) => {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};

function insertSql(table, columns, rows, onConflict = '') {
  if (!rows.length) return `-- (no ${table})\n`;
  const values = rows.map((r) => `  (${columns.map((c) => sqlValue(r[c])).join(', ')})`).join(',\n');
  return `insert into public.${table} (${columns.join(', ')}) values\n${values}${onConflict};\n`;
}

function restoreSql(data, takenAt) {
  const promoIds = data.promos.map((p) => p.id);
  const promoUpdate = TABLES.promos.filter((c) => c !== 'id').map((c) => `${c} = excluded.${c}`).join(', ');
  let sql = `-- Páteo menu backup from ${takenAt}.
-- Run in the Supabase SQL editor of a project that already has the tables
-- (supabase/migrations/). It REPLACES the whole menu with this backup and puts
-- the backed-up promos back. Promos that are hidden now are left alone.
begin;

-- Deleting categories also deletes their items, variant groups and options.
delete from public.categories;
delete from public.promos where is_active${promoIds.length ? ` and id not in (${promoIds.join(', ')})` : ''};

-- Keep each item's "last updated" time as it was in the backup.
alter table public.menu_items disable trigger menu_items_set_updated_at;

`;
  for (const [table, columns] of Object.entries(TABLES)) {
    if (table === 'promos') continue;
    sql += insertSql(table, columns, data[table]) + '\n';
  }
  sql += insertSql('promos', TABLES.promos, data.promos, `\non conflict (id) do update set ${promoUpdate}`) + '\n';
  sql += 'alter table public.menu_items enable trigger menu_items_set_updated_at;\n\n';
  sql += '-- New rows added after a restore continue numbering after the restored ones.\n';
  for (const table of Object.keys(TABLES)) {
    sql += `select setval(pg_get_serial_sequence('public.${table}', 'id'), greatest((select max(id) from public.${table}), 1));\n`;
  }
  return sql + '\ncommit;\n';
}

const RESTORE_TXT = `How to restore this backup
==========================

1. Images (only if they're missing from Supabase Storage)
   Supabase dashboard -> Storage -> bucket "menu-images". Upload the files from
   images/promos into the "promos" folder and images/items into "items",
   keeping the file names exactly as they are.

2. Menu and promos
   Supabase dashboard -> SQL Editor -> paste the whole of restore.sql -> Run.
   It replaces the current menu with this backup.

Restoring into a NEW Supabase project: first run the files in
supabase/migrations/ (in order), create the admin account as described in
admin-panel/README.md, then in restore.sql replace every
"${SUPABASE_URL}" with the new project's URL before running it.
`;

async function main() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  // Local time, e.g. 2026-10-06_17-47
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const dir = path.join(BACKUP_ROOT, stamp);
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });

  const data = {};
  for (const [table, columns] of Object.entries(TABLES)) data[table] = await readTable(table, columns);
  if (!data.categories.length) throw new Error('The menu came back empty; not writing a backup that would erase it.');

  const urls = [...new Set([...data.menu_items, ...data.promos].map((r) => r.image_url).filter((u) => u?.startsWith(BUCKET_PREFIX)))];
  let bytes = 0;
  for (const url of urls) {
    const rel = decodeURIComponent(url.slice(BUCKET_PREFIX.length));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Downloading ${rel} failed: HTTP ${res.status}`);
    const file = Buffer.from(await res.arrayBuffer());
    const expected = Number(res.headers.get('content-length'));
    if (expected && expected !== file.length) throw new Error(`${rel} downloaded incompletely`);
    const target = path.join(dir, 'images', ...rel.split('/'));
    if (!target.startsWith(path.join(dir, 'images'))) throw new Error(`Unexpected image path: ${rel}`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file);
    bytes += file.length;
  }

  const takenAt = now.toISOString();
  fs.writeFileSync(path.join(dir, 'data.json'), JSON.stringify({ takenAt, source: SUPABASE_URL, ...data }, null, 1));
  fs.writeFileSync(path.join(dir, 'restore.sql'), restoreSql(data, takenAt));
  fs.writeFileSync(path.join(dir, 'RESTORE.txt'), RESTORE_TXT);

  const counts = Object.entries(data).map(([t, rows]) => `${rows.length} ${t}`).join(', ');
  console.log(`Backup written to ${dir}`);
  console.log(`  ${counts}; ${urls.length} images (${(bytes / 1024).toFixed(0)} KB)`);
}

main().catch((e) => {
  console.error(`Backup FAILED: ${e.message}`);
  process.exit(1);
});
