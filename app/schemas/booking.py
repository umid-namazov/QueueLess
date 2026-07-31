from datetime import datetime, date

from pydantic import BaseModel, ConfigDict

from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    branch_id: int


class BookingOut(BaseModel):
    id: int
    branch_id: int
    user_id: int
    queue_number: int
    queue_date: date
    status: BookingStatus
    qr_code: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingWithPosition(BookingOut):
    people_ahead: int
    estimated_wait_minutes: int
