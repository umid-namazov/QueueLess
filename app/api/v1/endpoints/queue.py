from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db
from app.models.booking import Booking, BookingStatus
from app.models.branch import Branch
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut, BookingWithPosition
from app.services.queue_service import (
    cancel_booking,
    confirm_booking_by_qr,
    create_booking,
    estimate_wait_minutes,
    get_people_ahead,
    complete_booking,
)

router = APIRouter()


@router.post("/book", response_model=BookingOut, status_code=201)
def book_queue(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Navbat band qilish - foydalanuvchi tanlagan filialga navbatga yoziladi."""
    return create_booking(db, user_id=current_user.id, branch_id=booking_in.branch_id)


@router.get("/my", response_model=list[BookingWithPosition])
def my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Foydalanuvchining barcha faol/oldingi navbatlari ro'yxati."""
    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.branch))
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    result = []
    for b in bookings:
        ahead = get_people_ahead(db, b) if b.status in (BookingStatus.waiting, BookingStatus.confirmed) else 0
        result.append(
            BookingWithPosition(
                **BookingOut.model_validate(b).model_dump(),
                people_ahead=ahead,
                estimated_wait_minutes=estimate_wait_minutes(b.branch, ahead),
                branch_name=b.branch.name if b.branch else None,
            )
        )
    return result


@router.delete("/{booking_id}", response_model=BookingOut)
def cancel_queue(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Navbatni bekor qilish."""
    return cancel_booking(db, user_id=current_user.id, booking_id=booking_id)


@router.post("/confirm/{qr_code}", response_model=BookingOut)
def confirm_queue(
    qr_code: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    QR kod orqali navbatni tasdiqlash (filial xodimi mijoz kelganda skanerlaydi).
    """
    is_seller = db.query(Branch).filter(Branch.owner_id == current_user.id).first() is not None
    if not is_seller and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Faqat admin yoki filial egasi ruxsat etilgan")
    return confirm_booking_by_qr(db, qr_code=qr_code)

@router.post("/{booking_id}/complete", response_model=BookingOut)
def complete_queue(
    booking_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Xizmat yakunlanganda navbatni tugatish.
    """
    is_seller = db.query(Branch).filter(Branch.owner_id == current_user.id).first() is not None
    if not is_seller and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Faqat admin yoki filial egasi ruxsat etilgan")
    return complete_booking(db, booking_id=booking_id)
