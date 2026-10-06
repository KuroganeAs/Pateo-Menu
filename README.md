# Páteo Menu

Digital menu for Páteo Cafetaria, in three parts:

| Part | Where | Hosted on |
|---|---|---|
| Customer site (menu + weekly promo carousel) | repo root (`src/`) | Vercel project `pateo-menu` |
| Admin panel (edit menu, photos, promos) | `admin-panel/` | Vercel project `pateo-admin` |
| Database, image storage, admin login | `supabase/migrations/` | Supabase project `Pateo` |

There is no backend server: both apps talk to Supabase directly, and the
database's row level security decides who may change what (everyone can read
the menu; only accounts in the `admins` table can edit). See
[admin-panel/README.md](admin-panel/README.md) for admin accounts and details.

## Run locally

```bash
npm install
npm run dev        # customer site on http://localhost:5173
```

The admin panel runs separately (`cd admin-panel && npm install && npm run dev`,
port 5174). Both use the production Supabase project by default, so data
shown and edited locally is live; `.env.example` shows how to point them
elsewhere.

## How the site gets its data

- The menu ships with a bundled copy (`src/data/menu.js`) so it renders
  instantly and offline, then swaps in the live menu from Supabase
  (`src/integration/liveData.js` → `adaptMenu.js`).
- Promo posters come from Supabase; `src/assets/promos/` holds an optional
  fallback (see the README there).
- Dish photos live in `public/dishes/`; photos uploaded in the admin panel go
  to Supabase Storage.

## Deploying

Push to `main` — Vercel rebuilds both projects. Database changes go in a new
file under `supabase/migrations/` and are applied to the Supabase project.
