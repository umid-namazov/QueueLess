"""
QueueLess AI/ML API Endpoints.
Sun'iy intellekt modeli bilan muloqot qilish, kutish vaqtlarini hisoblash va aqlli tavsiyalar olish.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.branch import Branch
from app.schemas.ai import (
    WaitTimePredictionRequest,
    WaitTimePredictionResponse,
    SmartRecommendationRequest,
    SmartRecommendationResponse,
    HourlyForecastResponse,
    ModelInfoResponse,
)
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()


@router.post("/predict", response_model=WaitTimePredictionResponse, status_code=200)
def predict_wait_time(
    payload: WaitTimePredictionRequest,
    db: Session = Depends(get_db),
):
    """
    Muayyan filial, sana va vaqt uchun kutish vaqti va navbat uzunligini bashorat qilish.
    """
    branch = db.query(Branch).filter(Branch.id == payload.branch_id).first()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filial topilmadi")

    result = ai_service.predict_wait_and_queue(
        branch=branch,
        date_str=payload.date,
        time_str=payload.time,
        current_queue_length=payload.current_queue_length,
        db=db,
    )
    return WaitTimePredictionResponse(**result)


@router.post("/recommend", response_model=SmartRecommendationResponse, status_code=200)
def get_smart_recommendation(
    payload: SmartRecommendationRequest,
    db: Session = Depends(get_db),
):
    """
    AI Aqlli Tavsiya (Smart Recommendation):
    Foydalanuvchi tanlagan vaqtni tahlil qilib, eng qulay va navbat kamroq bo'lgan vaqtni tavsiya qiladi.
    Masalan: '15:00 ni tanladingiz. Taxminiy kutish: 8 daqiqa. 16:30 da borsangiz 2 daqiqa kutasiz.'
    """
    branch = db.query(Branch).filter(Branch.id == payload.branch_id).first()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filial topilmadi")

    recommendation = ai_service.smart_recommend(
        branch=branch,
        preferred_time=payload.preferred_time,
        target_date_str=payload.target_date,
        search_window_hours=payload.search_window_hours,
        db=db,
    )
    return recommendation


@router.get("/branch/{branch_id}/forecast", response_model=HourlyForecastResponse, status_code=200)
def get_branch_hourly_forecast(
    branch_id: int,
    date: Optional[str] = Query(None, description="Sana (YYYY-MM-DD), kiritilmasa bugungi sana"),
    db: Session = Depends(get_db),
):
    """
    Filialning bir kunlik soatbay yuklama grafigi va kutish vaqtlari prognozi.
    Frontendda grafik va diagrammalar chizish uchun mo'ljallangan.
    """
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filial topilmadi")

    return ai_service.get_hourly_forecast(branch=branch, target_date_str=date)


@router.get("/model-info", response_model=ModelInfoResponse, status_code=200)
def get_ai_model_info():
    """
    Sun'iy intellekt modelining texnik holati, versiyasi va aniqlik ko'rsatkichlari (MAE, R2).
    """
    return ai_service.get_model_info()
