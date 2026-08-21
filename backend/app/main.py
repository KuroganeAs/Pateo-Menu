import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import Base, SessionLocal, engine
from .routers import auth, categories, health, items, menu, promos
from .seed import seed_defaults

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

    # Local-scope choice: create_all instead of migrations (documented in README).
    try:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            seed_defaults(db)
    except Exception:
        # Don't crash the app if the database isn't up yet — /api/health will
        # report db: false and everything recovers once the DB is reachable.
        log.exception("Database unavailable at startup (health check will report db: false)")

    yield


app = FastAPI(title="Menu backend", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,  # bearer tokens, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(categories.router)
app.include_router(items.router)
app.include_router(promos.router)

# Local media, served statically. Directory is ensured in lifespan, but the
# mount is created at import time, so ensure it here too.
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
