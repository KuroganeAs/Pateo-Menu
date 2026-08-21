"""One-time import of the customer site's bundled promo posters into the
backend, so the admin panel manages them from day one.

Copies the images from src/assets/promos/ (the site's build-time fallback
folder) into the upload store and creates a Promo row per image, in filename
order (1.jpg, 2.png, ...). Captions come from an optional captions.json in
that folder ({"1": "text", ...}).

Usage:  python -m app.seed_promos [--force]
No-ops if any promos already exist; --force deletes them (and their uploaded
files) first.
"""
import json
import re
import sys
from pathlib import Path

from .config import BACKEND_DIR
from .database import Base, SessionLocal, engine
from .models import Promo
from .uploads import delete_uploaded_image, store_image_bytes

SITE_PROMOS_DIR = BACKEND_DIR.parent / "src" / "assets" / "promos"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def order_key(path: Path):
    m = re.match(r"(\d+)", path.stem)
    return (int(m.group(1)) if m else 10**9, path.name.lower())


def main() -> None:
    force = "--force" in sys.argv

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        existing = db.query(Promo).count()
        if existing and not force:
            print(f"{existing} promos already exist — nothing to do (use --force to re-seed).")
            return
        if existing and force:
            for promo in db.query(Promo).all():
                delete_uploaded_image(promo.image_url)
                db.delete(promo)
            db.commit()
            print(f"Deleted {existing} existing promos.")

        images = sorted(
            (p for p in SITE_PROMOS_DIR.iterdir() if p.suffix.lower() in IMAGE_EXTS),
            key=order_key,
        )
        if not images:
            print(f"No images found in {SITE_PROMOS_DIR}")
            return

        captions = {}
        captions_file = SITE_PROMOS_DIR / "captions.json"
        if captions_file.exists():
            captions = json.loads(captions_file.read_text(encoding="utf-8"))

        for idx, src in enumerate(images):
            url = store_image_bytes(src.read_bytes(), "promo", src.suffix.lower())
            db.add(
                Promo(
                    image_url=url,
                    caption=captions.get(src.stem) or None,
                    display_order=idx,
                    is_active=True,
                )
            )
        db.commit()
        print(f"Seeded {len(images)} promos from {SITE_PROMOS_DIR}")


if __name__ == "__main__":
    main()
