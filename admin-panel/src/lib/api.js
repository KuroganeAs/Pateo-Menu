// Data layer for the admin panel, talking to Supabase directly.
// - Auth: Supabase Auth (email + password); the session is kept in
//   localStorage and refreshed automatically by supabase-js.
// - Permissions are enforced by the database (row level security): only users
//   listed in public.admins can write. These helpers just surface errors.
// - Images go to the public "menu-images" Storage bucket.
import { createClient } from '@supabase/supabase-js';

// Public by design: the publishable key only grants what RLS allows.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ycanpsdyscohheewtcpn.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_HyDPemBdB7tjiTpusuUwIg_lXVkrLmH';
// The customer site's origin, used to resolve menu image paths like
// /dishes/foo.jpg that are served by the customer site.
export const CUSTOMER_BASE = import.meta.env.VITE_CUSTOMER_SITE_URL || 'http://localhost:5173';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET = 'menu-images';
const BUCKET_URL_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX_UPLOAD_MB = 5;

export class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

function unwrap({ data, error }) {
  if (error) throw new ApiError(error.message, error.code);
  return data;
}

// Updates/deletes that RLS filters out succeed with zero rows; report those.
function unwrapRows(result) {
  const rows = unwrap(result);
  if (!rows || rows.length === 0) {
    throw new ApiError('Nothing was changed — the row no longer exists or you are not allowed to edit it.');
  }
  return rows;
}

// ------------------------------------------------------------------ auth
// Supabase Auth signs in by email. Admins type a plain username, which maps
// to <username>@ADMIN_LOGIN_DOMAIN — a reserved domain that can never
// receive mail. A full email address typed into the form is used as-is.
const ADMIN_LOGIN_DOMAIN = 'pateo-admin.invalid';

export const loginToEmail = (login) =>
  (login.includes('@') ? login : `${login}@${ADMIN_LOGIN_DOMAIN}`).toLowerCase();

export const emailToLogin = (email) =>
  email.endsWith(`@${ADMIN_LOGIN_DOMAIN}`) ? email.slice(0, -(ADMIN_LOGIN_DOMAIN.length + 1)) : email;

export async function isAdmin(userId) {
  const row = unwrap(
    await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle()
  );
  return Boolean(row);
}

// ------------------------------------------------------------------ menu
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

export async function getMenu() {
  const categories = unwrap(await supabase.from('categories').select(MENU_SELECT));
  return {
    categories: categories.sort(byOrderThenId).map((cat) => ({
      ...cat,
      items: (cat.items || []).sort(byOrderThenId).map((item) => ({
        ...item,
        modifier_groups: (item.modifier_groups || []).sort(byId).map((group) => ({
          ...group,
          options: (group.options || []).sort(byId),
        })),
      })),
    })),
  };
}

export async function createCategory(fields) {
  return unwrap(await supabase.from('categories').insert(fields).select().single());
}

export async function updateCategory(id, fields) {
  return unwrapRows(await supabase.from('categories').update(fields).eq('id', id).select('id'));
}

/** Deletes the category, its items (cascade) and their uploaded photos. */
export async function deleteCategory(category) {
  unwrapRows(await supabase.from('categories').delete().eq('id', category.id).select('id'));
  await removeImages(category.items.map((i) => i.image_url));
}

/**
 * Creates (itemId null) or fully replaces an item, modifier groups included,
 * in one database transaction. Returns the item id.
 */
export async function saveItem(payload, itemId = null) {
  return unwrap(await supabase.rpc('save_menu_item', { p_item: payload, p_item_id: itemId }));
}

export async function setItemAvailability(id, isAvailable) {
  return unwrapRows(
    await supabase.from('menu_items').update({ is_available: isAvailable }).eq('id', id).select('id')
  );
}

/** Deletes the item and its uploaded photo. */
export async function deleteItem(item) {
  unwrapRows(await supabase.from('menu_items').delete().eq('id', item.id).select('id'));
  await removeImages([item.image_url]);
}

// ------------------------------------------------------------------ promos
export async function listPromos() {
  return unwrap(
    await supabase.from('promos').select('*').order('display_order').order('id')
  );
}

/** Uploads the poster and adds it to the end of the carousel. */
export async function createPromo(file, caption) {
  const imageUrl = await uploadImage(file, 'promos');
  try {
    const last = unwrap(
      await supabase
        .from('promos')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle()
    );
    return unwrap(
      await supabase
        .from('promos')
        .insert({
          image_url: imageUrl,
          caption: caption || null,
          display_order: last ? last.display_order + 1 : 0,
          is_active: true,
        })
        .select()
        .single()
    );
  } catch (e) {
    await removeImages([imageUrl]);
    throw e;
  }
}

export async function updatePromo(id, patch) {
  return unwrapRows(await supabase.from('promos').update(patch).eq('id', id).select('id'));
}

/** Deletes the poster and its uploaded image. */
export async function deletePromo(promo) {
  unwrapRows(await supabase.from('promos').delete().eq('id', promo.id).select('id'));
  await removeImages([promo.image_url]);
}

// ------------------------------------------------------------------ images
/** Uploads an image to Storage under folder/ and returns its public URL. */
export async function uploadImage(file, folder) {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) {
    throw new ApiError(`"${file.name}" is not a supported image (jpeg, png, webp or gif).`);
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new ApiError(`"${file.name}" is larger than ${MAX_UPLOAD_MB}MB.`);
  }
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  unwrap(
    await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
    })
  );
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Best-effort cleanup of images stored in our bucket. URLs that live
 * elsewhere (Cloudinary, /dishes/* site assets) are left alone.
 */
export async function removeImages(urls) {
  const paths = urls
    .filter((u) => typeof u === 'string' && u.startsWith(BUCKET_URL_PREFIX))
    .map((u) => decodeURIComponent(u.slice(BUCKET_URL_PREFIX.length)));
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.warn('Image cleanup failed', error);
}

// Menu images may be absolute URLs (Supabase Storage, Cloudinary) or
// customer-site assets (/dishes/...). Resolve accordingly.
export function resolveImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${CUSTOMER_BASE}${url}`;
}
