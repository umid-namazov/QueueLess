from pydantic import BaseModel, ConfigDict

class ServiceBase(BaseModel):
    name: str
    description: str | None = None
    duration_minutes: int = 10

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
    pass

class ServiceOut(ServiceBase):
    id: int
    branch_id: int

    model_config = ConfigDict(from_attributes=True)
