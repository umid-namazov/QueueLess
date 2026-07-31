"""
Navbat (queue) bilan bog'liq asosiy biznes-logika.
Bu qatlam router (endpoint) va model o'rtasida joylashadi - shu tufayli
endpointlar yupqa (thin) bo'lib qoladi va logikani test qilish osonlashadi.
"""
from datetime import date, datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.branch import Branch
from app.services.notification_service import NotificationService


def _today() -> date:
    return datetime.now(timezone.utc).date()


def get_active_queue_count(db: Session, branch_id: int, on_date: date | None = None) -> int:
    on_date = on_date or _today()
    return (
        db.query(func.count(Booking.id))
        .filter(
            Booking.branch_id == branch_id,
            Booking.queue_date == on_date,
            Booking.status.in_([BookingStatus.waiting, BookingStatus.confirmed]),
        )
        .scalar()
        or 0
    )


def estimate_wait_minutes(branch: Branch, people_ahead: int) -> int:
    return max(people_ahead, 0) * branch.avg_service_minutes


def create_booking(db: Session, user_id: int, branch_id: int) -> Booking:
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filial topilmadi")

    today = _today()

    existing = (
        db.query(Booking)
        .filter(
            Booking.user_id == user_id,
            Booking.branch_id == branch_id,
            Booking.queue_date == today,
            Booking.status.in_([BookingStatus.waiting, BookingStatus.confirmed]),
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Siz bu filialda bugun uchun allaqachon navbatga yozilgansiz",
        )

    last_number = (
        db.query(func.max(Booking.queue_number))
        .filter(Booking.branch_id == branch_id, Booking.queue_date == today)
        .scalar()
    )
    next_number = (last_number or 0) + 1

    booking = Booking(
        user_id=user_id,
        branch_id=branch_id,
        queue_number=next_number,
        queue_date=today,
        status=BookingStatus.waiting,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def get_people_ahead(db: Session, booking: Booking) -> int:
    return (
        db.query(func.count(Booking.id))
        .filter(
            Booking.branch_id == booking.branch_id,
            Booking.queue_date == booking.queue_date,
            Booking.status.in_([BookingStatus.waiting, BookingStatus.confirmed]),
            Booking.queue_number < booking.queue_number,
        )
        .scalar()
        or 0
    )


def cancel_booking(db: Session, user_id: int, booking_id: int) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Navbat topilmadi")
    if booking.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu sizning navbatingiz emas")
    if booking.status in (BookingStatus.cancelled, BookingStatus.completed):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu navbat allaqachon yakunlangan")

    booking.status = BookingStatus.cancelled
    db.commit()
    db.refresh(booking)

    # Navbat siljigani uchun, ortda qolganlarga bildirishnoma yuborish mumkin (ixtiyoriy kengaytma)
    return booking


def confirm_booking_by_qr(db: Session, qr_code: str) -> Booking:
    booking = db.query(Booking).filter(Booking.qr_code == qr_code).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR kod bo'yicha navbat topilmadi")
    if booking.status != BookingStatus.waiting:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu navbat kutilayotgan holatda emas")

    booking.status = BookingStatus.confirmed
    db.commit()
    db.refresh(booking)

    notifier = NotificationService(db)
    notifier.send_to_user(
        booking.user_id, "Navbat tasdiqlandi", "Sizning navbatingiz tasdiqlandi, xizmat boshlanmoqda."
    )
    return booking
