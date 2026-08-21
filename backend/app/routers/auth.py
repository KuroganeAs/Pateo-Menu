from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import create_access_token, get_current_admin, verify_password
from ..database import get_db
from ..models import AdminUser
from ..schemas import AdminOut, LoginIn, TokenOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == body.username).first()
    # Same error for unknown user and wrong password — no username probing.
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return TokenOut(access_token=create_access_token(user), username=user.username, role=user.role)


@router.get("/me", response_model=AdminOut)
def me(current: AdminUser = Depends(get_current_admin)):
    return current
