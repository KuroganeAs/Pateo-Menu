from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)

# The deployed database is PostgreSQL; SQLite is supported for tests/smoke
# runs only. SQLite ships with foreign key enforcement OFF, which would break
# ON DELETE SET NULL / CASCADE semantics — turn it on per connection.
if engine.dialect.name == "sqlite":
    @event.listens_for(engine, "connect")
    def _sqlite_fk_pragma(dbapi_conn, _record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: one session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
