from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserOut)
def read_profile(current_user: User = Depends(get_current_user)):
    """Profil ma'lumotlarini olish."""
    return current_user


@router.put("/me", response_model=UserOut)
def update_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Profilni yangilash (ism va/yoki parol)."""
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.password is not None:
        current_user.hashed_password = get_password_hash(user_in.password)

    db.commit()
    db.refresh(current_user)
    return current_user
