"""SQLAlchemy models.

Design notes:
- Enums are stored as plain VARCHARs (native_enum=False) so schema changes never
  require ALTER TYPE; values are constrained by the app layer.
- Money is Numeric(10, 2) end to end; totals are computed in Decimal and only
  serialized to float at the API boundary.
- This deployment is menu + promos + admin only: the ordering/checkout models
  from the original full-stack project are intentionally absent.
"""
import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class SelectionType(str, enum.Enum):
    single = "single"
    multiple = "multiple"


class AdminRole(str, enum.Enum):
    admin = "admin"
    staff = "staff"


def _enum(e):  # VARCHAR-backed enum column type
    return Enum(e, native_enum=False, length=20, values_callable=lambda x: [i.value for i in x])


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))  # English (canonical)
    name_pt: Mapped[str | None] = mapped_column(String(120), nullable=True)
    name_tet: Mapped[str | None] = mapped_column(String(120), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    items: Mapped[list["MenuItem"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="MenuItem.display_order, MenuItem.id",
    )


class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200))  # English (canonical)
    name_pt: Mapped[str | None] = mapped_column(String(200), nullable=True)
    name_tet: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_pt: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_tet: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    category: Mapped["Category"] = relationship(back_populates="items")
    modifier_groups: Mapped[list["ModifierGroup"]] = relationship(
        back_populates="menu_item", cascade="all, delete-orphan", order_by="ModifierGroup.id"
    )


class ModifierGroup(Base):
    __tablename__ = "modifier_groups"

    id: Mapped[int] = mapped_column(primary_key=True)
    menu_item_id: Mapped[int] = mapped_column(ForeignKey("menu_items.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(120))  # e.g. "Size"
    selection_type: Mapped[SelectionType] = mapped_column(_enum(SelectionType), default=SelectionType.single)
    required: Mapped[bool] = mapped_column(Boolean, default=False)

    menu_item: Mapped["MenuItem"] = relationship(back_populates="modifier_groups")
    options: Mapped[list["ModifierOption"]] = relationship(
        back_populates="group", cascade="all, delete-orphan", order_by="ModifierOption.id"
    )


class ModifierOption(Base):
    __tablename__ = "modifier_options"

    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("modifier_groups.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(120))  # e.g. "Large" — English (canonical)
    name_pt: Mapped[str | None] = mapped_column(String(120), nullable=True)
    name_tet: Mapped[str | None] = mapped_column(String(120), nullable=True)
    price_delta: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0"))

    group: Mapped["ModifierGroup"] = relationship(back_populates="options")


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(200))
    role: Mapped[AdminRole] = mapped_column(_enum(AdminRole), default=AdminRole.staff)


class Promo(Base):
    """One weekly promo poster shown in the customer site's carousel.

    The site displays every active promo ordered by display_order; caption is
    optional (image-only posters are the common case).
    """

    __tablename__ = "promos"

    id: Mapped[int] = mapped_column(primary_key=True)
    image_url: Mapped[str] = mapped_column(String(500))
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
