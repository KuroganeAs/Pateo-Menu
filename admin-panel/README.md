# Páteo Admin Panel

Back-office for the Páteo site: **menu editing** (categories, items, variant
groups, photos, sold-out toggles) and **weekly promo posters** (upload,
caption, reorder, show/hide, delete). Deliberately a separate app from the
customer site. Ordering/analytics from the original project are removed.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5174
```

Sign in with the backend's seeded account (`admin` / `admin123` by default —
change it in `backend/.env`).

| Env var | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend origin |
| `VITE_CUSTOMER_SITE_URL` | `http://localhost:5173` | Resolves `/dishes/*` images that live in the customer site |

## Screens

- **Menu** — category create/rename/delete; item create/edit (name, price,
  description, category, variant groups with price deltas), image upload,
  one-click In stock / Sold out. Everything the customer site renders live.
- **Promos** — the landing carousel's posters: upload with optional caption,
  reorder with arrows, toggle visibility, delete. Square images look best.

## Implementation notes

JWT from `POST /api/auth/login` stored in `localStorage`, attached by
`src/lib/api.js`; a 401 clears it and redirects to `/login`. Light theme,
desktop-first. Not hardened: token in localStorage, no session refresh.

## Deploying

Build with `npm run build` and host the `dist/` anywhere static (e.g. a second
Vercel project rooted at `admin-panel/`), with `VITE_API_URL` pointing at the
deployed backend and the backend's `CORS_ORIGINS` including this app's origin.
