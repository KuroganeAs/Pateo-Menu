"""One-time migration: adds the PT/Tetun translation columns and backfills
them from seed_menu.json (matching rows by their English text, so admin edits
to prices/availability/etc. are untouched).

Idempotent — safe to run repeatedly. Works on both SQLite and PostgreSQL.

Usage:  python -m app.migrate_i18n     (DATABASE_URL decides which DB)
"""
import json
from pathlib import Path

from sqlalchemy import inspect, text

from .database import SessionLocal, engine

SEED_FILE = Path(__file__).with_name("seed_menu.json")

COLUMNS = {
    "categories": [("name_pt", "VARCHAR(120)"), ("name_tet", "VARCHAR(120)")],
    "menu_items": [
        ("name_pt", "VARCHAR(200)"),
        ("name_tet", "VARCHAR(200)"),
        ("description_pt", "TEXT"),
        ("description_tet", "TEXT"),
    ],
    "modifier_options": [("name_pt", "VARCHAR(120)"), ("name_tet", "VARCHAR(120)")],
}


def add_missing_columns() -> None:
    inspector = inspect(engine)
    with engine.begin() as conn:
        for table, cols in COLUMNS.items():
            existing = {c["name"] for c in inspector.get_columns(table)}
            for name, coltype in cols:
                if name not in existing:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {coltype}"))
                    print(f"added {table}.{name}")


def backfill_from_seed() -> None:
    if not SEED_FILE.exists():
        print("no seed file — skipping backfill")
        return
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    filled = 0
    with SessionLocal() as db:
        for cat in data["categories"]:
            filled += db.execute(
                text(
                    "UPDATE categories SET name_pt = :pt, name_tet = :tet "
                    "WHERE name = :en AND name_pt IS NULL"
                ),
                {"pt": cat.get("name_pt"), "tet": cat.get("name_tet"), "en": cat["name"]},
            ).rowcount

            for item in cat["items"]:
                filled += db.execute(
                    text(
                        "UPDATE menu_items SET name_pt = :npt, name_tet = :ntet, "
                        "description_pt = :dpt, description_tet = :dtet "
                        "WHERE name = :en AND name_pt IS NULL"
                    ),
                    {
                        "npt": item.get("name_pt"),
                        "ntet": item.get("name_tet"),
                        "dpt": item.get("description_pt"),
                        "dtet": item.get("description_tet"),
                        "en": item["name"],
                    },
                ).rowcount

                for group in item.get("modifier_groups", []):
                    for opt in group["options"]:
                        filled += db.execute(
                            text(
                                "UPDATE modifier_options SET name_pt = :pt, name_tet = :tet "
                                "WHERE name = :en AND name_pt IS NULL AND group_id IN ("
                                "  SELECT mg.id FROM modifier_groups mg"
                                "  JOIN menu_items mi ON mi.id = mg.menu_item_id"
                                "  WHERE mi.name = :item_en)"
                            ),
                            {
                                "pt": opt.get("name_pt"),
                                "tet": opt.get("name_tet"),
                                "en": opt["name"],
                                "item_en": item["name"],
                            },
                        ).rowcount
        db.commit()
    print(f"backfilled translations on {filled} rows")


if __name__ == "__main__":
    add_missing_columns()
    backfill_from_seed()
    print("migration complete")
