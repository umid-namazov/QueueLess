"""
Ilovaning markaziy sozlamalari.
Barcha muhit o'zgaruvchilari (.env) shu yerdan o'qiladi.
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "QueueLess API"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite:///./queueless.db"

    SECRET_KEY: str = "CHANGE_ME_super_secret_key_please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 kun

    FCM_SERVER_KEY: str = ""

    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


settings = Settings()
