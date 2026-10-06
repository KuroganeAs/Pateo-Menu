// Live menu + promos for the CUSTOMER site, read straight from Supabase.
//
// Every call resolves to { ok, data, error } and never throws, so components
// can always fall back to the bundled data instead of showing an error.
//
// The URL and publishable key are public by design: they only grant what the
// database's row level security policies allow (read the menu and visible
// promos). Env vars override them, e.g. to point a dev build elsewhere.
//
// Only the query client is used (not full supabase-js): visitors never sign
// in, so this keeps auth/realtime/storage code out of the site's bundle.
import { PostgrestClient } from '@supabase/postgrest-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://ycanpsdyscohheewtcpn.supabase.co';
const SUPABASE_KEY =
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_HyDPemBdB7tjiTpusuUwIg_lXVkrLmH';

const supabase = new PostgrestClient(`${SUPABASE_URL}/rest/v1`, {
  headers: { apikey: SUPABASE_KEY },
});

const REQUEST_TIMEOUT = 8000;

const MENU_SELECT = `
  id, name, name_pt, name_tet, display_order,
  items:menu_items (
    id, category_id, name, name_pt, name_tet,
    description, description_pt, description_tet,
    price, image_url, is_available, display_order,
    modifier_groups (
      id, name, selection_type, required,
      options:modifier_options ( id, name, name_pt, name_tet, price_delta )
    )
  )`;

const byOrderThenId = (a, b) => a.display_order - b.display_order || a.id - b.id;
const byId = (a, b) => a.id - b.id;

async function run(buildQuery) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const { data, error } = await buildQuery().abortSignal(controller.signal);
    if (error) return { ok: false, data: null, error: error.message };
    return { ok: true, data, error: null };
  } catch (e) {
    return { ok: false, data: null, error: e?.message || 'Network error' };
  } finally {
    clearTimeout(timer);
  }
}

/** Resolves to { ok, data: { categories: [...] } } with everything sorted for display. */
export async function fetchMenu() {
  const res = await run(() => supabase.from('categories').select(MENU_SELECT));
  if (!res.ok) return res;
  const categories = res.data.sort(byOrderThenId).map((cat) => ({
    ...cat,
    items: (cat.items || []).sort(byOrderThenId).map((item) => ({
      ...item,
      modifier_groups: (item.modifier_groups || []).sort(byId).map((group) => ({
        ...group,
        options: (group.options || []).sort(byId),
      })),
    })),
  }));
  return { ok: true, data: { categories }, error: null };
}

/** Resolves to { ok, data: [{ image_url, caption }] } — only posters marked visible. */
export function fetchPromos() {
  return run(() =>
    supabase
      .from('promos')
      .select('id, image_url, caption')
      .eq('is_active', true)
      .order('display_order')
      .order('id')
  );
}

/** Calls fn whenever the browser regains a network connection. Returns an unsubscribe fn. */
export function onReconnect(fn) {
  window.addEventListener('online', fn);
  return () => window.removeEventListener('online', fn);
}
