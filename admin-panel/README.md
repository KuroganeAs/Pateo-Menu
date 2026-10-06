# Páteo Admin Panel

Back-office for the Páteo site: **menu editing** (categories, items, variant
groups, photos, sold-out toggles) and **weekly promo posters** (upload,
caption, reorder, show/hide, delete). Deliberately a separate app from the
customer site.

Everything runs on **Supabase** — there is no backend server. Both apps talk
to the Supabase project directly; the database's row level security (RLS)
decides who may do what. The schema, policies and storage bucket are in
`../supabase/migrations/`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5174
```

Sign in with the admin username (see *Admins* below). Local runs use the
production Supabase project unless the env vars point elsewhere, so edits made
locally are live.

| Env var | Default | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | production project | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | production key | Public client key (safe to expose; RLS limits it) |
| `VITE_CUSTOMER_SITE_URL` | `http://localhost:5173` | Resolves `/dishes/*` images that live in the customer site |

## Admins

Logging in uses Supabase Auth with a **username + password**. Supabase Auth
needs an email, so the panel maps a username to
`<username>@pateo-admin.invalid` (a reserved domain that never receives mail);
typing a full email address on the login screen uses it as-is. An account can
edit only if its user id is listed in the `public.admins` table:

1. Supabase dashboard → **Authentication → Users → Add user** with email
   `menucafetaria@pateo-admin.invalid`, a password, and auto-confirm on.
2. SQL editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'menucafetaria@pateo-admin.invalid';
   ```

Keep **Authentication → Sign In / Providers → Allow new users to sign up**
turned off: admin accounts are created only from the dashboard.

**Forgotten password:** the login email isn't a real mailbox, so reset it in
the dashboard: Authentication → Users → the admin → change password. Use a
long, unique password: the username is public, so the password is the only
lock on the panel.

## Screens

- **Menu** — category create/rename/reorder/delete; item create/edit (name,
  price, description, category, variant groups with price deltas), image
  upload and removal, one-click In stock / Sold out. Everything the customer
  site renders live.
- **Promos** — the landing carousel's posters: upload several at once (file
  picker or drag & drop) with optional caption, reorder with arrows, toggle
  visibility, delete individually or multi-select and bulk-delete. Square
  images look best. Photos are shrunk to 1200px WebP in the browser before
  upload (GIFs are kept as they are).

## Implementation notes

`src/lib/api.js` holds every data call. Images go to the public
`menu-images` Storage bucket (jpeg/png/webp/gif, 5MB max — enforced by the
bucket) and are deleted when their item, category or poster is deleted or the
photo is replaced. Dish photos under `/dishes/` are customer-site assets and
are never deleted from here. Saving an item goes through the
`save_menu_item` database function so the item and its variant groups change
in one transaction.

## Deploying

Build with `npm run build` and host `dist/` anywhere static (the
`pateo-admin` Vercel project). No env vars are required for production; set
`VITE_CUSTOMER_SITE_URL` to the customer site's URL so `/dishes/*` previews
resolve.
