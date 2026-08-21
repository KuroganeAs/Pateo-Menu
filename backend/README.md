# Páteo backend — menu & promos API

FastAPI + SQLAlchemy service powering the admin panel and feeding the customer
site its live menu and weekly promo posters. This is the trimmed edition of
the original full-stack project: **no ordering, payments, analytics, or
websockets** — menu CRUD, promo management, admin auth, and image uploads only.

## Endpoints

| Area | Endpoints |
|---|---|
| Health | `GET /api/health` (public) |
| Auth | `POST /api/auth/login`, `GET /api/auth/me` |
| Menu | `GET /api/menu` (public, nested tree) |
| Categories | `GET` (public) / `POST` / `PUT` / `DELETE /api/categories*` (admin) |
| Items | `POST/PUT/PATCH/DELETE /api/items*`, `PATCH /api/items/{id}/availability`, `POST /api/items/{id}/image` (admin) |
| Promos | `GET /api/promos` (public, active only), `GET /api/promos/all`, `POST /api/promos` (image + caption), `PATCH/DELETE /api/promos/{id}` (admin) |
| Uploads | served at `/uploads/*` |

## Run locally

```bash
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env
.venv\Scripts\python -m uvicorn app.main:app --port 8000
```

- `backend/.env` ships with `DATABASE_URL=sqlite:///./app.db` for zero-setup
  local development. For production use PostgreSQL (see `.env.example`).
- Tables are created automatically on startup (`create_all`, no migrations).
- First startup seeds `admin` / `admin123` (override via `ADMIN_USERNAME` /
  `ADMIN_PASSWORD`). **Change this before deploying.**
- Seed the real menu (59 items, exported from the site's `menu.js`):
  `python -m app.seed_menu` (`--force` wipes and re-seeds).
- API docs at http://localhost:8000/docs.

## Deploying

Set real values for `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`, and
`CORS_ORIGINS` (comma-separated: the customer site and admin panel origins).
Uploads are written to local disk (`UPLOAD_DIR`, default `backend/uploads`) —
the host needs a persistent volume mounted there or images vanish on redeploy.

## Not production-hardened (inherited honest list)

No rate limiting, no password-change flow (re-seed via env + delete the
`admin_users` row), no migrations, `role` is informational only, uploads are
validated (type sniffing, size cap) but stored on local disk with no CDN.
