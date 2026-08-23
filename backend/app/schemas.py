"""Pydantic request/response schemas.

Money is exposed as float at the API boundary (JSON has no decimal type);
internally everything is Decimal.
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .models import AdminRole, SelectionType


# ---------------------------------------------------------------- auth
class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: AdminRole


class AdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    role: AdminRole


# ---------------------------------------------------------------- menu
class ModifierOptionIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    name_pt: str | None = Field(default=None, max_length=120)
    name_tet: str | None = Field(default=None, max_length=120)
    price_delta: float = 0.0


class ModifierOptionOut(ModifierOptionIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ModifierGroupIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    selection_type: SelectionType = SelectionType.single
    required: bool = False
    options: list[ModifierOptionIn] = []


class ModifierGroupOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    selection_type: SelectionType
    required: bool
    options: list[ModifierOptionOut] = []


class MenuItemBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    name_pt: str | None = Field(default=None, max_length=200)
    name_tet: str | None = Field(default=None, max_length=200)
    description: str | None = None
    description_pt: str | None = None
    description_tet: str | None = None
    price: float = Field(ge=0)
    image_url: str | None = None
    is_available: bool = True
    display_order: int = 0


class MenuItemIn(MenuItemBase):
    category_id: int
    modifier_groups: list[ModifierGroupIn] = []


class MenuItemPatch(BaseModel):
    """Partial update — only provided fields change. Modifier groups are managed
    through PUT (full replace), not PATCH."""
    name: str | None = Field(default=None, min_length=1, max_length=200)
    name_pt: str | None = None
    name_tet: str | None = None
    description: str | None = None
    description_pt: str | None = None
    description_tet: str | None = None
    price: float | None = Field(default=None, ge=0)
    image_url: str | None = None
    is_available: bool | None = None
    display_order: int | None = None
    category_id: int | None = None


class AvailabilityPatch(BaseModel):
    is_available: bool


class MenuItemOut(MenuItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category_id: int
    modifier_groups: list[ModifierGroupOut] = []
    created_at: datetime
    updated_at: datetime


class CategoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    name_pt: str | None = Field(default=None, max_length=120)
    name_tet: str | None = Field(default=None, max_length=120)
    display_order: int = 0


class CategoryOut(CategoryIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class CategoryWithItemsOut(CategoryOut):
    items: list[MenuItemOut] = []


class MenuOut(BaseModel):
    categories: list[CategoryWithItemsOut]


# ---------------------------------------------------------------- promos
class PromoPatch(BaseModel):
    """Partial update — only provided fields change; the image itself is
    replaced by re-uploading (delete + create)."""
    caption: str | None = Field(default=None, max_length=2000)
    display_order: int | None = None
    is_active: bool | None = None


class PromoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    image_url: str
    caption: str | None
    display_order: int
    is_active: bool
    created_at: datetime
