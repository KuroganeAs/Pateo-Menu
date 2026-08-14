# "Latest from Facebook" widget — shelved proposal (reviewed, not applied)

Status: **not implemented** (deferred 2026-08-13). This document is the full,
adversarially-reviewed plan so it can be picked up later without re-designing.
All review corrections are already folded in (see "Review corrections" at the end).

## What it is

A quiet self-promo widget showing the cafe's most recent Facebook posts:

- **Desktop/tablet**: compact photo card at the bottom of the left sidebar,
  below the category list (sidebar nav scrolls internally, card keeps its spot).
- **Mobile**: slim strip at the top of the scroll feed, directly under the
  category pills — scrolls away naturally. (Note: the originally requested spot
  "between search bar and pills" is a fixed, non-scrolling block in the current
  layout, so it cannot both live there and scroll away. Decide at build time.)
- Resting state: auto-advancing crossfade between post photos (5s, disabled
  when `prefers-reduced-motion`), frosted label like the dish variant carousel.
- Tap → expands through the same sheet/panel system as `DishDetailModal`
  (extract the shared shell first — see ModalShell below), with a larger
  slideshow, caption, and a "See full post" link (new tab).

## Data contract (no live API calls, no token in the browser)

`src/data/latestPost.json` — the app only ever imports this file:

```json
{
  "fetchedAt": null,
  "posts": [
    {
      "id": "sample-1",
      "permalink": "https://www.facebook.com/pateo/posts/…",
      "caption": "Short caption text",
      "created": "2026-08-10T08:30:00Z",
      "image": "/fb/post-sample-1.jpg"
    }
  ]
}
```

- `posts: []` → widget renders nothing at all (feature dormant).
- `image: null` → falls back to the Páteo placeholder SVG.
- Photos live in `public/fb/` (local copies — Facebook CDN URLs are signed and
  expire after days/weeks, so never hotlink them).

Two ways to fill it:

1. **Manual (no Facebook developer app needed)**: save the post photo into
   `public/fb/`, add an entry to the JSON, redeploy. ~2 min per post.
2. **Automated**: the fetch script below + a scheduled GitHub Action, using a
   long-lived Page access token from a Meta developer app. Because it reads
   your own page server-side, the app can stay in Development Mode forever —
   no App Review needed. Token setup: developers.facebook.com → create app →
   Graph API Explorer → user token with `pages_show_list` +
   `pages_read_engagement` → exchange for long-lived → fetch Page token →
   store as GitHub Secrets `FB_PAGE_ID` / `FB_ACCESS_TOKEN`.

## Files to create/change (all code below reflects review corrections)

### 1. `scripts/fetchLatestPost.mjs` (new — server-side only)

```js
#!/usr/bin/env node
// Fetches the cafe's latest Facebook posts and writes them into the static
// site's data files. Server-side only (GitHub Action or your machine):
//   FB_PAGE_ID=xxx FB_ACCESS_TOKEN=xxx node scripts/fetchLatestPost.mjs
// Never import this from the app; never commit the token.
import { writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';

const PAGE_ID = process.env.FB_PAGE_ID;
const TOKEN = process.env.FB_ACCESS_TOKEN;
const GRAPH_VERSION = process.env.FB_GRAPH_VERSION || 'v23.0'; // keep current; Meta EOLs versions ~2y after release
const MAX_POSTS = 3;
const OUT_JSON = path.resolve('src/data/latestPost.json');
const IMG_DIR = path.resolve('public/fb');

if (!PAGE_ID || !TOKEN) {
  console.error('Set FB_PAGE_ID and FB_ACCESS_TOKEN');
  process.exit(1);
}

const api = `https://graph.facebook.com/${GRAPH_VERSION}/${PAGE_ID}/posts` +
  `?fields=id,message,permalink_url,created_time,full_picture&limit=10&access_token=${TOKEN}`;
const res = await fetch(api);
if (!res.ok) {
  console.error('Graph API error', res.status, await res.text());
  process.exit(1);
}
const { data = [] } = await res.json();
const withImages = data.filter((p) => p.full_picture).slice(0, MAX_POSTS);

await mkdir(IMG_DIR, { recursive: true });
// Clear old images so filenames (keyed by post id) never serve stale cache.
for (const f of await readdir(IMG_DIR)) {
  if (f.endsWith('.jpg')) await unlink(path.join(IMG_DIR, f));
}

const posts = [];
for (const post of withImages) {
  const imgRes = await fetch(post.full_picture);
  if (!imgRes.ok) continue;
  const file = `post-${post.id.replace(/[^a-zA-Z0-9_-]/g, '')}.jpg`;
  await writeFile(path.join(IMG_DIR, file), Buffer.from(await imgRes.arrayBuffer()));
  posts.push({
    id: post.id,
    permalink: post.permalink_url,
    caption: (post.message || '').trim().slice(0, 200),
    created: post.created_time,
    image: `/fb/${file}`
  });
}

await writeFile(OUT_JSON, JSON.stringify({ fetchedAt: new Date().toISOString(), posts }, null, 2) + '\n');
console.log(`Wrote ${posts.length} post(s) to ${OUT_JSON}`);
```

Optional npm script: `"fetch:facebook": "node scripts/fetchLatestPost.mjs"`.

### 2. `.github/workflows/facebook.yml` (optional automation)

```yaml
name: Refresh Facebook posts
on:
  schedule:
    - cron: '0 21 * * *'   # daily, 06:00 Dili time
  workflow_dispatch:
permissions:
  contents: write           # default token is read-only; push needs this
jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node scripts/fetchLatestPost.mjs
        env:
          FB_PAGE_ID: ${{ secrets.FB_PAGE_ID }}
          FB_ACCESS_TOKEN: ${{ secrets.FB_ACCESS_TOKEN }}
      - run: |
          git config user.name github-actions
          git config user.email actions@github.com
          git add src/data/latestPost.json public/fb
          git diff --cached --quiet || git commit -m "chore: refresh Facebook posts"
          git push
```

### 3. `src/data/strings.js` — add to the `ui` object (comma after the previous entry!)

```js
  close: { en: 'Close', pt: 'Fechar', tet: 'Taka' },
  facebook: {
    latestFrom: { en: 'Latest from Facebook', pt: 'Últimas do Facebook', tet: 'Foun husi Facebook' },
    seeFullPost: { en: 'See full post', pt: 'Ver publicação completa', tet: 'Haree postu kompletu' },
    prevPhoto: { en: 'Previous photo', pt: 'Foto anterior', tet: 'Foto uluk' },
    nextPhoto: { en: 'Next photo', pt: 'Foto seguinte', tet: 'Foto tuir mai' }
  }
```

### 4. `src/components/ModalShell.jsx` (new — extracted from DishDetailModal)

Shared overlay shell: backdrop + right-side panel (desktop, Esc closes) or
bottom sheet (touch, drag handle + swipe-down). Owns: AnimatePresence tree,
spring transitions, drag controls + handle bar, close button (`t(ui.close)`
via `useLanguage`), Esc listener, and the body-scroll lock. Body-lock effect
MUST be write-only-when-open (multiple mounted shells otherwise clobber each
other's lock across viewport changes):

```js
useEffect(() => {
  if (!open) return;
  document.body.style.overflow = 'hidden';
  return () => { document.body.style.overflow = ''; };
}, [open]);
```

API: `<ModalShell open={bool} onClose={fn} ariaLabel={string}>{content}</ModalShell>`.
Both branch containers keep `role="dialog" aria-modal="true"` and `data-modal-open`.

### 5. `src/components/DishDetailModal.jsx` — refactor onto ModalShell

Keeps ALL of: variant state + reset-on-item-change, hero image + placeholder
fallback, wheel handler, swipe drag layer, chevrons, variant label + dots,
option pills + auto-scroll-into-view. Removes (now shell-owned): backdrop,
sheet/panel motion divs, dragControls, Esc listener, body lock, close button.
⚠️ The file imports `{ ui } from '../data/strings'` and renders
`t(ui.selectOption)` — KEEP that import (review caught its accidental removal).

### 6. `src/components/FacebookLatest.jsx` (new — self-contained: trigger + modal)

- `import latestPost from '../data/latestPost.json'` — renders `null` when no posts.
- Lucide has NO `Facebook` icon (brand icons removed) — use an inline "f" mark:

```jsx
const FacebookMark = ({ size = 12, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.5 21v-7h2.4l.45-3H13.5V9.05c0-.87.28-1.55 1.6-1.55h1.35V4.8c-.3-.04-1.2-.13-2.24-.13-2.32 0-3.96 1.42-3.96 4.03V11H8v3h2.25v7h3.25Z" />
  </svg>
);
```

- `variant="card"` (sidebar): rounded-2xl photo card, aspect 16/10, stacked
  `<img>`s crossfading via opacity (700ms), frosted bottom label
  (`bg-black/50 backdrop-blur-md` pill — same treatment as the dish variant label).
- `variant="strip"` (mobile): h-12 thumb + "Latest from Facebook" + caption
  (truncate) + chevron, card-white with `shadow-card`.
- Auto-advance: `setInterval` 5s when >1 post, skipped under
  `matchMedia('(prefers-reduced-motion: reduce)')`.
- Expanded: `<ModalShell>` with large slideshow (crossfade + arrow buttons using
  `t(ui.facebook.prevPhoto/nextPhoto)` aria-labels + dots), caption, and a
  full-width primary button linking `active.permalink` (`target="_blank"
  rel="noopener noreferrer"`) labeled `t(ui.facebook.seeFullPost)`.
- All trigger buttons carry `aria-label={t(ui.facebook.latestFrom)}`.

### 7. Placement edits

- `src/App.jsx` (sidebar, after the nav scroller div):
  `<FacebookLatest variant="card" className="m-4 mt-3" />`
- `src/components/MenuFeed.jsx` (top of `#menu-scroll-container`):
  `{!(isDesktop || isTabletLandscape) && <FacebookLatest variant="strip" className="mt-3" />}`
- `src/components/MenuFeed.jsx` keyboard handler: add
  `if (document.querySelector('[data-modal-open]')) return;` so arrow-key card
  navigation stops while ANY shell modal is open (not just the dish one).

## Decisions made during review (assumptions)

1. Last **3** posts, one photo each; each slide links to its own post.
2. Daily scheduled fetch (only matters when automation is wired up).
3. Mobile strip at top of feed (scrolls away) — see placement note above.
4. Modal reuse via ModalShell extraction; dish behavior unchanged.
5. Sample data ships so the widget is reviewable pre-API; `posts: []` disables it.
6. Photos stored locally in `public/fb/`; token only ever in env/GitHub Secrets.

## Review corrections already folded in (do not regress)

- lucide-react has no `Facebook` export → inline `FacebookMark` SVG (build breaks otherwise).
- Keep `import { ui } from '../data/strings'` in refactored DishDetailModal.
- ModalShell body lock: write-only-when-open (multi-instance clobber bug).
- MenuFeed arrow keys: bail when any `[data-modal-open]` exists.
- Graph version env-configurable, default `v23.0` (v21.0 EOLs ~Oct 2026).
- GitHub Action needs `permissions: contents: write`.
- Image filenames keyed by post id + old files pruned (stale-cache fix).
- Tetun: "Foto uluk" (not "molok"), "tuir mai" (two words).
- Localized close label `ui.close` used by the shared shell.
