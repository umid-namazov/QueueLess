from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: jadvallarni yaratish va demo ma'lumotlar bilan to'ldirish
    init_db()
    yield
    # Shutdown: hozircha qo'shimcha tozalash kerak emas


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "QueueLess - navbatlarni oldindan band qilish tizimi uchun backend API.\n\n"
        "Login uchun Swagger'dagi 'Authorize' tugmasidan foydalaning "
        "(username = telefon raqami, password = parol)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Health"])
def health_check():
    """Server ishlab turganini tekshirish uchun oddiy endpoint."""
    return {"status": "ok", "project": settings.PROJECT_NAME}
