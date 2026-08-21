"""Create the PostgreSQL database named in DATABASE_URL if it doesn't exist.

Usage:  python -m app.create_db

Connects to the server's maintenance database ('postgres') with the same
credentials, checks pg_database, and issues CREATE DATABASE if needed.
"""
import sys

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

from .config import settings


def main() -> int:
    url = make_url(settings.database_url)
    target = url.database
    if not target:
        print("DATABASE_URL has no database name.")
        return 1

    admin_url = url.set(database="postgres")
    try:
        engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
        with engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": target}
            ).scalar()
            if exists:
                print(f"Database '{target}' already exists.")
            else:
                # Identifier, not a value — can't be bound; quote defensively.
                conn.execute(text(f'CREATE DATABASE "{target}"'))
                print(f"Created database '{target}'.")
        return 0
    except Exception as e:
        print(f"Could not create database: {e}")
        print("Check DATABASE_URL credentials in backend/.env")
        return 1


if __name__ == "__main__":
    sys.exit(main())
