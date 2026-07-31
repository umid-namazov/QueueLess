from pydantic import BaseModel


class DeviceTokenCreate(BaseModel):
    token: str
    platform: str = "android"


class NotificationSendRequest(BaseModel):
    title: str
    body: str
