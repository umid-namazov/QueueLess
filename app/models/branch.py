from sqlalchemy import String, Float, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Branch(Base):
    """
    Xizmat ko'rsatish nuqtasi: poliklinika, sartaroshxona, bank filiali va h.k.
    """
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Har bir mijozga ketadigan o'rtacha xizmat vaqti (daqiqada)
    avg_service_minutes: Mapped[int] = mapped_column(Integer, default=10)
    working_hours: Mapped[str] = mapped_column(String(50), default="09:00-18:00")
    
    # Seller tasdiqlash tizimi
    is_approved: Mapped[bool] = mapped_column(Boolean, default=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)

    bookings = relationship("Booking", back_populates="branch", cascade="all, delete-orphan")
    owner = relationship("User", foreign_keys=[owner_id])
