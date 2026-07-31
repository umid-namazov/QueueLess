from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite uchun bir nechta thread bilan ishlashga ruxsat beramiz (FastAPI uchun kerak)
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
