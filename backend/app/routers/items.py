from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session, selectinload

from ..auth import get_current_admin
from ..database import get_db
from ..models import Category, MenuItem, ModifierGroup, ModifierOption
from ..schemas import (
    AvailabilityPatch, MenuItemIn, MenuItemOut, MenuItemPatch, ModifierGroupIn,
)
from ..uploads import delete_uploaded_image, save_image_upload

router = APIRouter(prefix="/api/items", tags=["items"], dependencies=[Depends(get_current_admin)])


def _get_or_404(db: Session, item_id: int) -> MenuItem:
    item = (
        db.query(MenuItem)
        .options(selectinload(MenuItem.modifier_groups).selectinload(ModifierGroup.options))
        .filter(MenuItem.id == item_id)
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item


def _require_category(db: Session, category_id: int) -> None:
    if db.get(Category, category_id) is None:
        raise HTTPException(status_code=400, detail=f"Category {category_id} does not exist")


def _build_groups(groups_in: list[ModifierGroupIn]) -> list[ModifierGroup]:
    return [
        ModifierGroup(
            name=g.name,
            selection_type=g.selection_type,
            required=g.required,
            options=[
                ModifierOption(
                    name=o.name,
                    name_pt=o.name_pt,
                    name_tet=o.name_tet,
                    price_delta=Decimal(str(o.price_delta)),
                )
                for o in g.options
            ],
        )
        for g in groups_in
    ]


@router.post("", response_model=MenuItemOut, status_code=201)
def create_item(body: MenuItemIn, db: Session = Depends(get_db)):
    """Create an item, optionally with nested modifier groups in one call."""
    _require_category(db, body.category_id)
    item = MenuItem(
        category_id=body.category_id,
        name=body.name,
        name_pt=body.name_pt,
        name_tet=body.name_tet,
        description=body.description,
        description_pt=body.description_pt,
        description_tet=body.description_tet,
        price=Decimal(str(body.price)),
        image_url=body.image_url,
        is_available=body.is_available,
        display_order=body.display_order,
        modifier_groups=_build_groups(body.modifier_groups),
    )
    db.add(item)
    db.commit()
    return _get_or_404(db, item.id)


@router.put("/{item_id}", response_model=MenuItemOut)
def replace_item(item_id: int, body: MenuItemIn, db: Session = Depends(get_db)):
    """Full replace, modifier groups included: existing groups/options are
    dropped and rebuilt from the payload (delete-orphan cascade)."""
    item = _get_or_404(db, item_id)
    _require_category(db, body.category_id)
    item.category_id = body.category_id
    item.name = body.name
    item.name_pt = body.name_pt
    item.name_tet = body.name_tet
    item.description = body.description
    item.description_pt = body.description_pt
    item.description_tet = body.description_tet
    item.price = Decimal(str(body.price))
    item.image_url = body.image_url
    item.is_available = body.is_available
    item.display_order = body.display_order
    item.modifier_groups = _build_groups(body.modifier_groups)
    db.commit()
    return _get_or_404(db, item_id)


@router.patch("/{item_id}", response_model=MenuItemOut)
def patch_item(item_id: int, body: MenuItemPatch, db: Session = Depends(get_db)):
    """Partial update of scalar fields; modifier groups are PUT-only."""
    item = _get_or_404(db, item_id)
    data = body.model_dump(exclude_unset=True)
    if "category_id" in data:
        _require_category(db, data["category_id"])
    if "price" in data and data["price"] is not None:
        data["price"] = Decimal(str(data["price"]))
    for field, value in data.items():
        setattr(item, field, value)
    db.commit()
    return _get_or_404(db, item_id)


@router.patch("/{item_id}/availability", response_model=MenuItemOut)
def set_availability(item_id: int, body: AvailabilityPatch, db: Session = Depends(get_db)):
    """Dedicated Sold Out / In Stock toggle."""
    item = _get_or_404(db, item_id)
    item.is_available = body.is_available
    db.commit()
    return _get_or_404(db, item_id)


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, item_id)
    delete_uploaded_image(item.image_url)
    db.delete(item)  # order lines keep their snapshots; FK goes SET NULL
    db.commit()


@router.post("/{item_id}/image", response_model=MenuItemOut)
async def upload_item_image(item_id: int, file: UploadFile, db: Session = Depends(get_db)):
    item = _get_or_404(db, item_id)
    url = await save_image_upload(file, subfolder="items")
    delete_uploaded_image(item.image_url)  # replace: clean up the old file
    item.image_url = url
    db.commit()
    return _get_or_404(db, item_id)


@router.delete("/{item_id}/image", response_model=MenuItemOut)
def delete_item_image(item_id: int, db: Session = Depends(get_db)):
    """Remove an item's photo: delete the stored file and clear the reference."""
    item = _get_or_404(db, item_id)
    delete_uploaded_image(item.image_url)
    item.image_url = None
    db.commit()
    return _get_or_404(db, item_id)
