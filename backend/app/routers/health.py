from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..database import get_db

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health(db: Session = Depends(get_db)):
    """Cheap liveness probe for the frontend's cached online/offline check.
    Always 200 when the app is up; `db` reports whether PostgreSQL answered."""
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    return {
        "ok": True,
        "service": "menu-backend",
        "db": db_ok,
        "time": datetime.now(timezone.utc).isoformat(),
    }
