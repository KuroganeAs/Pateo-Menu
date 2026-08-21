from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import Category, MenuItem, ModifierGroup
from ..schemas import MenuOut

router = APIRouter(prefix="/api", tags=["menu"])


@router.get("/menu", response_model=MenuOut)
def get_menu(db: Session = Depends(get_db)):
    """Public menu: categories -> items -> modifier groups -> options, fully
    nested and eagerly loaded (one round-trip per level, no N+1)."""
    categories = (
        db.query(Category)
        .options(
            selectinload(Category.items)
            .selectinload(MenuItem.modifier_groups)
            .selectinload(ModifierGroup.options)
        )
        .order_by(Category.display_order, Category.id)
        .all()
    )
    return {"categories": categories}
