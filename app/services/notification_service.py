"""
Push notification xizmati.

Expo Push Notifications API ishlatiladi (Expo SDK bilan mos).
Device tokenlar 'ExponentPushToken[xxx]' formatida bo'lishi kerak.

EXPO_ACCESS_TOKEN .env faylida to'ldirilgan bo'lsa, authenticated so'rovlar
yuboriladi. Bo'sh bo'lsa ham ishlaydi (limited rate).
"""
import logging
from typing import Iterable

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.device_token import DeviceToken

logger = logging.getLogger("queueless.notifications")
logging.basicConfig(level=logging.INFO)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def _tokens_for_user(self, user_id: int) -> list[str]:
        rows: Iterable[DeviceToken] = (
            self.db.query(DeviceToken).filter(DeviceToken.user_id == user_id).all()
        )
        return [r.token for r in rows]

    def send_to_user(self, user_id: int, title: str, body: str) -> dict:
        tokens = self._tokens_for_user(user_id)
        if not tokens:
            logger.info("Foydalanuvchi %s uchun device token topilmadi", user_id)
            return {"sent": 0, "reason": "no_device_tokens"}

        return self._send_via_expo(tokens, title, body)

    def _send_via_expo(self, tokens: list[str], title: str, body: str) -> dict:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate",
        }
        if settings.EXPO_ACCESS_TOKEN:
            headers["Authorization"] = f"Bearer {settings.EXPO_ACCESS_TOKEN}"

        messages = [
            {"to": token, "title": title, "body": body, "sound": "default"}
            for token in tokens
        ]
        sent = 0
        try:
            resp = httpx.post(EXPO_PUSH_URL, json=messages, headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                sent = sum(
                    1 for item in data.get("data", [])
                    if item.get("status") == "ok"
                )
                failed = len(messages) - sent
                if failed:
                    logger.warning("Expo push: %s ta yuborildi, %s ta xato", sent, failed)
            else:
                logger.warning("Expo push xatolik: %s - %s", resp.status_code, resp.text)
        except httpx.HTTPError as exc:
            logger.warning("Expo push serveriga ulanishda xatolik: %s", exc)
        return {"sent": sent, "total": len(tokens)}

    def notify_turn_approaching(self, user_id: int, branch_name: str, people_ahead: int) -> dict:
        """Navbat yaqinlashganda ishlatiladigan qulay yordamchi metod."""
        title = "Navbatingiz yaqinlashmoqda!"
        body = f"{branch_name}: sizdan oldin {people_ahead} kishi qoldi."
        return self.send_to_user(user_id, title, body)
