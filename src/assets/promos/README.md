# Fallback promo posters

The weekly posters are managed in the **admin panel** (Promos page) and served
from Supabase. Images in this folder are only a fallback: the site shows them
while the live posters load, or if Supabase can't be reached. With the folder
empty, plain placeholder tiles are shown instead.

## Rules (for fallback images)

- Name files by number: `1.jpg`, `2.jpg`, … — the number is the display order.
- Supported formats: png, jpg, jpeg, webp, gif (any mix).
- Square (1:1) images look best; anything else gets center-cropped to square.
- Optional `captions.json` here shows short text under a poster, keyed by
  filename without extension:

  ```json
  { "1": "Chocolate pastel de nata — this week only!" }
  ```

Adding or changing files here needs a commit and a rebuild; the admin panel
does not.

## Social links

The Facebook link under the carousel and the footer's social buttons
(Facebook / Instagram / TikTok / website) are configured once in
`src/data/socials.js`. Empty = hidden (tiktok shows a greyed placeholder).
