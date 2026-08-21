# Weekly Promos

Drop this week's promo posters in this folder — the site picks them up
automatically. No code changes needed.

## Rules

- Name files by number: `1.jpg` through `7.jpg` (the usual weekly batch) —
  that number is the display order in the carousel. Any count works; 7 is
  just the routine.
- Supported formats: png, jpg, jpeg, webp, gif (any mix).
- Square (1:1) images look best; anything else gets center-cropped to square.

## Facebook link

The "Follow us on Facebook" link under the carousel is configured once in
`src/data/promotions.js` (`FACEBOOK_PAGE_URL`). Empty = hidden.

## Weekly update via GitHub (no tools needed)

1. Open this folder on github.com.
2. Delete last week's images (open a file → trash icon → commit).
3. "Add file" → "Upload files" → drag this week's posters in → commit.
4. The site rebuilds and updates itself in about a minute.

## Optional captions

Add a `captions.json` file here to show a short text under a poster:

```json
{
  "1": "Chocolate pastel de nata — this week only!",
  "2": "Buy 2 XL croissants, get a coffee free"
}
```

Keys match the image filenames (without extension). Images without an entry
simply show no caption. Delete the file to go back to image-only.

The two `.jpg` files currently here are just samples — replace them with real
posters.
