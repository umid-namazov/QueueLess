from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.device_token import DeviceToken
from app.models.user import User
from app.schemas.notification import DeviceTokenCreate, NotificationSendRequest
from app.services.notification_service import NotificationService

router = APIRouter()


@router.post("/register-token", status_code=201)
def register_device_token(
    payload: DeviceTokenCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mobil ilova ishga tushganda FCM device tokenini backendga yuboradi,
    shunda navbat yaqinlashganda push notification jo'natish mumkin bo'ladi.
    """
    existing = db.query(DeviceToken).filter(DeviceToken.token == payload.token).first()
    if existing:
        existing.user_id = current_user.id
        db.commit()
        return {"detail": "Token yangilandi"}

    token = DeviceToken(user_id=current_user.id, token=payload.token, platform=payload.platform)
    db.add(token)
    db.commit()
    return {"detail": "Token saqlandi"}


@router.post("/send-test")
def send_test_notification(
    payload: NotificationSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """O'ziga sinov push-xabar yuborish (development/test uchun qulay)."""
    notifier = NotificationService(db)
    result = notifier.send_to_user(current_user.id, payload.title, payload.body)
    return result
