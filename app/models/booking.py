import enum
import uuid
from datetime import datetime, date, timezone

from sqlalchemy import String, DateTime, Date, Integer, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class BookingStatus(str, enum.Enum):
    waiting = "waiting"        # navbatda kutmoqda
    confirmed = "confirmed"    # QR orqali tasdiqlangan / xizmat boshlandi
    completed = "completed"    # xizmat tugadi
    cancelled = "cancelled"    # foydalanuvchi bekor qildi


class Booking(Base):
    """
    Foydalanuvchining bitta filialdagi navbat bandligi.
    """
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False)

    queue_number: Mapped[int] = mapped_column(Integer, nullable=False)
    queue_date: Mapped[date] = mapped_column(Date, default=lambda: datetime.now(timezone.utc).date())

    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus), default=BookingStatus.waiting, nullable=False
    )

    # Har bir booking uchun unikal QR kod - tasdiqlash uchun ishlatiladi
    qr_code: Mapped[str] = mapped_column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="bookings")
    branch = relationship("Branch", back_populates="bookings")
