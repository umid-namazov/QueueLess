"""
Push notification xizmati.

Hozircha haqiqiy Firebase Cloud Messaging (FCM) kaliti ulanmagan bo'lsa,
xabarlar shunchaki log qilinadi (konsolga chiqadi). FCM_SERVER_KEY .env
faylida to'ldirilgandan so'ng, `_send_via_fcm` funksiyasi haqiqiy so'rov
yuboradi - qolgan barcha kod (endpoint, chaqiruvlar) o'zgarishsiz qoladi.

Bu arxitektura orqali frontend/AI qismi FCM sozlanmasa ham backend bilan
osongina test qilinadi, keyinchalik esa faqat shu bitta fayl yangilanadi.
"""
import logging
from typing import Iterable

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.device_token import DeviceToken

logger = logging.getLogger("queueless.notifications")
logging.basicConfig(level=logging.INFO)

FCM_ENDPOINT = "https://fcm.googleapis.com/fcm/send"


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

        if not settings.FCM_SERVER_KEY:
            # FCM ulanmagan - faqat log qilamiz (development rejimi)
            logger.info(
                "[DEV MODE] Push yuborilgan bo'lardi -> user=%s title=%r body=%r tokens=%s",
                user_id, title, body, tokens,
            )
            return {"sent": len(tokens), "mode": "dev_log_only"}

        return self._send_via_fcm(tokens, title, body)

    def _send_via_fcm(self, tokens: list[str], title: str, body: str) -> dict:
        headers = {
            "Authorization": f"key={settings.FCM_SERVER_KEY}",
            "Content-Type": "application/json",
        }
        sent = 0
        for token in tokens:
            payload = {
                "to": token,
                "notification": {"title": title, "body": body},
            }
            try:
                resp = httpx.post(FCM_ENDPOINT, json=payload, headers=headers, timeout=10)
                if resp.status_code == 200:
                    sent += 1
                else:
                    logger.warning("FCM xatolik: %s - %s", resp.status_code, resp.text)
            except httpx.HTTPError as exc:
                logger.warning("FCM ga ulanishda xatolik: %s", exc)
        return {"sent": sent, "mode": "fcm"}

    def notify_turn_approaching(self, user_id: int, branch_name: str, people_ahead: int) -> dict:
        """Navbat yaqinlashganda ishlatiladigan qulay yordamchi metod."""
        title = "Navbatingiz yaqinlashmoqda!"
        body = f"{branch_name}: sizdan oldin {people_ahead} kishi qoldi."
        return self.send_to_user(user_id, title, body)
