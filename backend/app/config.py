"""Central settings, loaded from environment / backend/.env.

Everything has a local-development default so `uvicorn app.main:app` works
out of the box; override via .env for anything real.
"""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- database ---
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/menu_app"

    # --- auth ---
    jwt_secret: str = "dev-only-secret-change-me-0123456789abcdef"  # override in .env for anything non-throwaway
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 12 * 60  # a work shift

    # Default admin seeded on first startup (see seed.py). CHANGE THE PASSWORD.
    admin_username: str = "admin"
    admin_password: str = "admin123"

    # --- uploads ---
    upload_dir: Path = BACKEND_DIR / "uploads"
    max_upload_mb: int = 5

    # --- CORS: comma-separated origins, or * for local development ---
    cors_origins: str = "*"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


settings = Settings()
