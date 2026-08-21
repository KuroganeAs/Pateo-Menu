"""Startup seeding: the default admin account.

SECURITY: the default account (admin / admin123, overridable via
ADMIN_USERNAME / ADMIN_PASSWORD in .env) exists so the panel is usable on
first run. There is no password-change flow in this scope — change the
password by setting ADMIN_PASSWORD and deleting the row, or via SQL. Do not
expose this backend beyond a trusted LAN with the default credentials.
"""
import logging

from sqlalchemy.orm import Session

from .auth import hash_password
from .config import settings
from .models import AdminRole, AdminUser, Category
from .seed_menu import seed_menu

log = logging.getLogger("seed")


def seed_defaults(db: Session) -> None:
    if db.query(AdminUser).count() == 0:
        db.add(
            AdminUser(
                username=settings.admin_username,
                hashed_password=hash_password(settings.admin_password),
                role=AdminRole.admin,
            )
        )
        db.commit()
        log.warning(
            "=" * 68 + "\n"
            "  Seeded default admin account:  %s / %s\n"
            "  CHANGE THIS PASSWORD before any real use (set ADMIN_PASSWORD in\n"
            "  backend/.env and re-create the user, or update it via SQL).\n" + "=" * 68,
            settings.admin_username,
            settings.admin_password,
        )

    # A brand-new database boots with the full exported menu instead of an
    # empty site. Never touches a menu that has any categories (admin edits,
    # including deletions down to zero items, are respected — only a truly
    # empty categories table triggers this).
    if db.query(Category).count() == 0:
        log.info("Empty menu — %s", seed_menu(db))
