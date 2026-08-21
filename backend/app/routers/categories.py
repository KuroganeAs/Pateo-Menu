from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import Category
from ..schemas import CategoryIn, CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])


def _get_or_404(db: Session, category_id: int) -> Category:
    cat = db.get(Category, category_id)
    if cat is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.display_order, Category.id).all()


@router.post("", response_model=CategoryOut, status_code=201, dependencies=[Depends(get_current_admin)])
def create_category(body: CategoryIn, db: Session = Depends(get_db)):
    cat = Category(name=body.name, display_order=body.display_order)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{category_id}", response_model=CategoryOut, dependencies=[Depends(get_current_admin)])
def update_category(category_id: int, body: CategoryIn, db: Session = Depends(get_db)):
    cat = _get_or_404(db, category_id)
    cat.name = body.name
    cat.display_order = body.display_order
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Deletes the category AND its items (cascade)."""
    cat = _get_or_404(db, category_id)
    db.delete(cat)
    db.commit()
