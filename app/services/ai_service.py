"""
QueueLess AI Service - Sun'iy intellekt xizmati.
O'qitilgan ML modeli orqali kutish vaqtini va navbat sonini bashorat qiladi
hamda eng qulay vaqtni aqlli tavsiya sifatida taklif etadi.
"""

import json
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
import joblib
import pandas as pd
import numpy as np

from app.models.branch import Branch
from app.schemas.ai import (
    WaitTimePredictionResponse,
    SmartRecommendationResponse,
    SlotOption,
    HourlyForecastItem,
    HourlyForecastResponse,
    ModelInfoResponse,
)

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ai_models", "queue_wait_model.joblib")
METADATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ai_models", "model_metadata.json")

CATEGORY_MAP = {
    "sartaroshxona": "Sartaroshxona",
    "barbershop": "Sartaroshxona",
    "avtoyuvish": "Avtoyuvish",
    "avtomobil_yuvish": "Avtoyuvish",
    "carwash": "Avtoyuvish",
    "poliklinika": "Poliklinika",
    "klinika": "Poliklinika",
    "shifoxona": "Poliklinika",
    "bank": "Bank filiali",
    "bank filiali": "Bank filiali",
    "dxm": "Davlat xizmatlari",
    "davlat_xizmatlari": "Davlat xizmatlari",
    "davlat xizmatlari": "Davlat xizmatlari",
}


class AIService:
    _instance = None
    _bundle = None
    _metadata = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self._bundle = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"[AIService Warning] Model yuklanmadi: {e}")
                self._bundle = None
        else:
            self._bundle = None

        if os.path.exists(METADATA_PATH):
            try:
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    self._metadata = json.load(f)
            except Exception as e:
                print(f"[AIService Warning] Metadata o'qilmadi: {e}")
                self._metadata = None
        else:
            self._metadata = None

    def is_model_loaded(self) -> bool:
        return self._bundle is not None

    def _normalize_category(self, cat: str) -> str:
        if not cat:
            return "Poliklinika"
        normalized = cat.strip().lower()
        return CATEGORY_MAP.get(normalized, "Poliklinika")

    def _build_features(
        self,
        service_name: str,
        hour: int,
        minute: int,
        day_of_week: int,
        is_weekend: int,
        service_avg_minutes: int,
        operators_count: int,
        queue_length: Optional[int] = None,
    ) -> (pd.DataFrame, pd.DataFrame):
        hour_sin = np.sin(2 * np.pi * hour / 24.0)
        hour_cos = np.cos(2 * np.pi * hour / 24.0)

        # Peak hour aniqlash
        is_peak_hour = 1 if hour in [12, 13, 17, 18, 19] else 0

        queue_row = {
            "service_name": [service_name],
            "hour": [hour],
            "minute": [minute],
            "day_of_week": [day_of_week],
            "is_weekend": [is_weekend],
            "is_peak_hour": [is_peak_hour],
            "service_avg_minutes": [service_avg_minutes],
            "operators_count": [operators_count],
            "hour_sin": [hour_sin],
            "hour_cos": [hour_cos],
        }
        df_queue = pd.DataFrame(queue_row)

        wait_row = dict(queue_row)
        wait_row["queue_length"] = [queue_length if queue_length is not None else 0]
        df_wait = pd.DataFrame(wait_row)

        return df_queue, df_wait

    def predict_wait_and_queue(
        self,
        branch: Branch,
        date_str: Optional[str],
        time_str: str,
        current_queue_length: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Filial, sana va vaqt uchun kutish vaqti va navbat sonini bashorat qiladi.
        """
        now = datetime.now(timezone.utc)
        target_date_str = date_str or now.strftime("%Y-%m-%d")
        
        try:
            target_dt = datetime.strptime(f"{target_date_str} {time_str}", "%Y-%m-%d %H:%M")
        except ValueError:
            target_dt = now
            target_date_str = now.strftime("%Y-%m-%d")
            time_str = now.strftime("%H:%M")

        day_of_week = target_dt.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        hour = target_dt.hour
        minute = target_dt.minute

        service_name = self._normalize_category(branch.category)
        service_avg_minutes = branch.avg_service_minutes or 15
        operators_count = 2 if service_name in ["Bank filiali", "Davlat xizmatlari"] else (3 if service_name == "Avtoyuvish" else 1)

        if self.is_model_loaded():
            df_queue, df_wait = self._build_features(
                service_name=service_name,
                hour=hour,
                minute=minute,
                day_of_week=day_of_week,
                is_weekend=is_weekend,
                service_avg_minutes=service_avg_minutes,
                operators_count=operators_count,
            )

            # Navbat uzunligini bashorat qilish (agar berilmagan bo'lsa)
            if current_queue_length is None:
                predicted_q = float(self._bundle["queue_pipeline"].predict(df_queue)[0])
                predicted_queue_len = max(0, int(round(predicted_q)))
            else:
                predicted_queue_len = max(0, current_queue_length)

            # Kutish vaqtini bashorat qilish
            df_wait["queue_length"] = [predicted_queue_len]
            predicted_wait = float(self._bundle["wait_pipeline"].predict(df_wait)[0])
            predicted_wait_min = max(0.0, round(predicted_wait, 1))
        else:
            # Fallback evristik hisoblash
            predicted_queue_len = current_queue_length if current_queue_length is not None else 3
            predicted_wait_min = round(float((predicted_queue_len / operators_count) * service_avg_minutes), 1)

        is_peak = hour in [11, 12, 13, 17, 18, 19]
        if predicted_wait_min >= 25:
            traffic_level = "Yuqori (Pik)"
        elif predicted_wait_min >= 12:
            traffic_level = "O'rtacha"
        else:
            traffic_level = "Past (Qulay)"

        return {
            "branch_id": branch.id,
            "branch_name": branch.name,
            "category": branch.category,
            "date": target_date_str,
            "time": time_str,
            "predicted_queue_length": predicted_queue_len,
            "predicted_wait_minutes": predicted_wait_min,
            "is_peak_hour": is_peak,
            "traffic_level": traffic_level,
        }

    def smart_recommend(
        self,
        branch: Branch,
        preferred_time: str,
        target_date_str: Optional[str] = None,
        search_window_hours: int = 2,
    ) -> SmartRecommendationResponse:
        """
        AI Aqlli Tavsiya:
        Foydalanuvchi tanlagan vaqtni tekshiradi va ±2 soat oralig'idagi eng kam kutish vaqtiga ega
        optimal slotni aniqlaydi.
        """
        now = datetime.now(timezone.utc)
        date_str = target_date_str or now.strftime("%Y-%m-%d")

        try:
            pref_h, pref_m = map(int, preferred_time.split(":"))
        except ValueError:
            pref_h, pref_m = 15, 0
            preferred_time = "15:00"

        # 1. Tanlangan vaqt uchun bashorat
        selected_res = self.predict_wait_and_queue(branch, date_str, preferred_time)
        selected_slot = SlotOption(
            time=preferred_time,
            estimated_wait_minutes=selected_res["predicted_wait_minutes"],
            estimated_queue_length=selected_res["predicted_queue_length"],
            traffic_level=selected_res["traffic_level"],
        )

        # 2. Qo'shni vaqt oraliqlarini tekshirish (masalan har 30 daqiqada)
        candidates: List[SlotOption] = []
        min_hour = max(9, pref_h - search_window_hours)
        max_hour = min(20, pref_h + search_window_hours)

        for h in range(min_hour, max_hour + 1):
            for m in (0, 30):
                slot_time = f"{h:02d}:{m:02d}"
                res = self.predict_wait_and_queue(branch, date_str, slot_time)
                candidates.append(
                    SlotOption(
                        time=slot_time,
                        estimated_wait_minutes=res["predicted_wait_minutes"],
                        estimated_queue_length=res["predicted_queue_length"],
                        traffic_level=res["traffic_level"],
                    )
                )

        # Eng past kutish vaqtiga ega slotni topish
        best_candidate = min(candidates, key=lambda c: c.estimated_wait_minutes)
        time_saved = round(max(0.0, selected_slot.estimated_wait_minutes - best_candidate.estimated_wait_minutes), 1)

        # Agar tejash kamida 3 daqiqadan ko'p bo'lsa va tanlangan vaqtdan farq qilsa
        has_better = (time_saved >= 3.0) and (best_candidate.time != selected_slot.time)

        if has_better:
            sel_wait_int = int(round(selected_slot.estimated_wait_minutes))
            best_wait_int = int(round(best_candidate.estimated_wait_minutes))
            message = f"{selected_slot.time} ni tanladingiz. Taxminiy kutish: {sel_wait_int} daqiqa. {best_candidate.time} da borsangiz {best_wait_int} daqiqa kutasiz."
            recommended_slot = best_candidate
        else:
            sel_wait_int = int(round(selected_slot.estimated_wait_minutes))
            message = f"{selected_slot.time} ni tanladingiz. Taxminiy kutish: {sel_wait_int} daqiqa. Bu vaqt juda qulay va navbat kam."
            recommended_slot = selected_slot

        return SmartRecommendationResponse(
            branch_id=branch.id,
            branch_name=branch.name,
            date=date_str,
            selected_slot=selected_slot,
            recommended_slot=recommended_slot,
            time_saved_minutes=time_saved if has_better else 0.0,
            has_better_alternative=has_better,
            ai_recommendation_message=message,
        )

    def get_hourly_forecast(self, branch: Branch, target_date_str: Optional[str] = None) -> HourlyForecastResponse:
        """
        Filialning 09:00 dan 20:00 gacha bo'lgan to'liq soatlik tirbandlik grafigini qaytaradi.
        """
        now = datetime.now(timezone.utc)
        date_str = target_date_str or now.strftime("%Y-%m-%d")

        forecast_items: List[HourlyForecastItem] = []
        for h in range(9, 21):
            time_str = f"{h:02d}:00"
            res = self.predict_wait_and_queue(branch, date_str, time_str)
            forecast_items.append(
                HourlyForecastItem(
                    hour=h,
                    time_label=time_str,
                    predicted_queue_length=res["predicted_queue_length"],
                    predicted_wait_minutes=res["predicted_wait_minutes"],
                    traffic_level=res["traffic_level"],
                )
            )

        best_item = min(forecast_items, key=lambda x: x.predicted_wait_minutes)
        peak_item = max(forecast_items, key=lambda x: x.predicted_wait_minutes)

        return HourlyForecastResponse(
            branch_id=branch.id,
            branch_name=branch.name,
            date=date_str,
            forecast=forecast_items,
            recommended_best_time=best_item.time_label,
            peak_time=peak_item.time_label,
        )

    def get_model_info(self) -> ModelInfoResponse:
        if self._metadata:
            return ModelInfoResponse(
                model_name=self._metadata.get("model_name", "QueueLess Smart Predictor"),
                version=self._metadata.get("version", "1.0.0"),
                framework=self._metadata.get("framework", "scikit-learn"),
                status="online" if self.is_model_loaded() else "degraded",
                metrics=self._metadata.get("metrics", {}),
            )
        return ModelInfoResponse(
            model_name="QueueLess Smart Wait & Queue Predictor",
            version="1.0.0",
            framework="scikit-learn",
            status="online" if self.is_model_loaded() else "degraded",
            metrics={"status": "Model file ready"},
        )
