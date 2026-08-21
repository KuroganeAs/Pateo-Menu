"""Seed the menu tables from seed_menu.json (generated from the customer
site's menu data by backend/scripts/export-menu-seed.mjs).

Usage:
    python -m app.seed_menu            # seeds only if the menu is empty
    python -m app.seed_menu --force    # wipes categories/items and re-seeds

Insertion order is deterministic (categories, then items/groups/options in
file order), so on a FRESH database the generated ids match the ids the
integration kit's mockData assigns — which keeps queued offline orders built
against mock data valid against the real backend. After admin edits the two
naturally diverge; the mock is a browsing fallback, not a mirror.
"""
import argparse
import json
import sys
from decimal import Decimal
from pathlib import Path

from .database import Base, SessionLocal, engine
from .models import Category, MenuItem, ModifierGroup, ModifierOption, SelectionType

SEED_FILE = Path(__file__).with_name("seed_menu.json")


def seed_menu(db, force: bool = False) -> str:
    """Insert the exported menu; returns a human-readable summary.

    Idempotent: does nothing when categories already exist unless force=True.
    Called from the CLI below and from startup seeding (seed.py) so a fresh
    deployment boots with the full menu instead of an empty site.
    """
    if not SEED_FILE.exists():
        return f"Seed file not found: {SEED_FILE}"
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    existing = db.query(Category).count()
    if existing and not force:
        return f"Menu already has {existing} categories — nothing done."
    if existing and force:
        db.query(Category).delete()
        db.commit()

    n_items = 0
    for cat_data in data["categories"]:
        category = Category(name=cat_data["name"], display_order=cat_data["display_order"])
        for item_data in cat_data["items"]:
            item = MenuItem(
                name=item_data["name"],
                description=item_data.get("description"),
                price=Decimal(str(item_data["price"])),
                image_url=item_data.get("image_url"),
                is_available=item_data.get("is_available", True),
                display_order=item_data.get("display_order", 0),
                modifier_groups=[
                    ModifierGroup(
                        name=g["name"],
                        selection_type=SelectionType(g["selection_type"]),
                        required=g["required"],
                        options=[
                            ModifierOption(
                                name=o["name"], price_delta=Decimal(str(o["price_delta"]))
                            )
                            for o in g["options"]
                        ],
                    )
                    for g in item_data.get("modifier_groups", [])
                ],
            )
            category.items.append(item)
            n_items += 1
        db.add(category)
        db.flush()  # keep id assignment in file order, category by category
    db.commit()
    return f"Seeded {len(data['categories'])} categories, {n_items} items."


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="wipe existing menu and re-seed")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        print(seed_menu(db, force=args.force))
    return 0


if __name__ == "__main__":
    sys.exit(main())
