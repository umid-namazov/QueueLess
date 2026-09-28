from typing import Optional, List
from pydantic import BaseModel, Field


class WaitTimePredictionRequest(BaseModel):
    branch_id: int = Field(..., description="Filial ID raqami")
    date: Optional[str] = Field(None, description="Sana (YYYY-MM-DD), kiritilmasa bugungi sana olinadi")
    time: str = Field(..., description="Vaqt (HH:MM), masalan: '15:00'")
    current_queue_length: Optional[int] = Field(None, description="Hozirgi navbatdagi odamlar soni (agar ma'lum bo'lsa)")


class WaitTimePredictionResponse(BaseModel):
    branch_id: int
    branch_name: str
    category: str
    date: str
    time: str
    predicted_queue_length: int
    predicted_wait_minutes: float
    is_peak_hour: bool
    traffic_level: str


class SmartRecommendationRequest(BaseModel):
    branch_id: int = Field(..., description="Filial ID raqami")
    preferred_time: str = Field(..., description="Foydalanuvchi tanlagan vaqt (HH:MM), masalan: '15:00'")
    target_date: Optional[str] = Field(None, description="Sana (YYYY-MM-DD), kiritilmasa bugungi sana")
    search_window_hours: int = Field(2, description="Tavsiya uchun qidiruv oynasi (± soat)", ge=1, le=4)


class SlotOption(BaseModel):
    time: str
    estimated_wait_minutes: float
    estimated_queue_length: int
    traffic_level: str


class SmartRecommendationResponse(BaseModel):
    branch_id: int
    branch_name: str
    date: str
    selected_slot: SlotOption
    recommended_slot: SlotOption
    time_saved_minutes: float
    has_better_alternative: bool
    ai_recommendation_message: str


class HourlyForecastItem(BaseModel):
    hour: int
    time_label: str
    predicted_queue_length: int
    predicted_wait_minutes: float
    traffic_level: str


class HourlyForecastResponse(BaseModel):
    branch_id: int
    branch_name: str
    date: str
    forecast: List[HourlyForecastItem]
    recommended_best_time: str
    peak_time: str


class ModelInfoResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    model_name: str
    version: str
    framework: str
    status: str
    metrics: dict
