from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class DeviceToken(Base):
    """
    Push notification (FCM) yuborish uchun foydalanuvchi qurilma tokeni.
    """
    __tablename__ = "device_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    platform: Mapped[str] = mapped_column(String(20), default="android")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="device_tokens")
