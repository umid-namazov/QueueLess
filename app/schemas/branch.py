from pydantic import BaseModel, Field, ConfigDict


class BranchCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    category: str = Field(min_length=2, max_length=50)
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    avg_service_minutes: int = 10
    working_hours: str = "09:00-18:00"


class BranchOut(BaseModel):
    id: int
    name: str
    category: str
    address: str | None
    latitude: float | None
    longitude: float | None
    avg_service_minutes: int
    working_hours: str
    is_approved: bool
    owner_id: int | None

    model_config = ConfigDict(from_attributes=True)


class BranchWithQueueInfo(BranchOut):
    current_waiting_count: int
    estimated_wait_minutes: int
