"""Weekly promo posters: the customer site's carousel reads the active list;
admins upload/caption/reorder/toggle/delete posters."""
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import Promo
from ..schemas import PromoOut, PromoPatch
from ..uploads import delete_uploaded_image, save_image_upload

router = APIRouter(prefix="/api/promos", tags=["promos"])


def _get_or_404(db: Session, promo_id: int) -> Promo:
    promo = db.get(Promo, promo_id)
    if promo is None:
        raise HTTPException(status_code=404, detail="Promo not found")
    return promo


@router.get("", response_model=list[PromoOut])
def list_active_promos(db: Session = Depends(get_db)):
    """Public: the customer carousel shows these, in display_order."""
    return (
        db.query(Promo)
        .filter(Promo.is_active.is_(True))
        .order_by(Promo.display_order, Promo.id)
        .all()
    )


@router.get("/all", response_model=list[PromoOut], dependencies=[Depends(get_current_admin)])
def list_all_promos(db: Session = Depends(get_db)):
    """Admin: every poster including inactive ones."""
    return db.query(Promo).order_by(Promo.display_order, Promo.id).all()


@router.post("", response_model=PromoOut, status_code=201, dependencies=[Depends(get_current_admin)])
async def create_promo(
    file: UploadFile,
    caption: str | None = Form(default=None),
    db: Session = Depends(get_db),
):
    url = await save_image_upload(file, subfolder="promo")
    # New posters go to the end of the current ordering
    max_order = db.query(Promo.display_order).order_by(Promo.display_order.desc()).first()
    promo = Promo(
        image_url=url,
        caption=(caption or None),
        display_order=(max_order[0] + 1) if max_order else 0,
        is_active=True,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


@router.patch("/{promo_id}", response_model=PromoOut, dependencies=[Depends(get_current_admin)])
def update_promo(promo_id: int, body: PromoPatch, db: Session = Depends(get_db)):
    promo = _get_or_404(db, promo_id)
    data = body.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(promo, field, value)
    db.commit()
    db.refresh(promo)
    return promo


@router.delete("/{promo_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_promo(promo_id: int, db: Session = Depends(get_db)):
    promo = _get_or_404(db, promo_id)
    delete_uploaded_image(promo.image_url)
    db.delete(promo)
    db.commit()
