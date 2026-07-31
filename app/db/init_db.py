"""
Jadvallarni yaratish va (agar bo'sh bo'lsa) boshlang'ich demo-ma'lumotlar bilan to'ldirish.
"""
from sqlalchemy.orm import Session

from app.db.base_class import Base
from app.db.session import engine, SessionLocal
import app.models  # noqa: F401  (barcha modellarni Base.metadata ga ro'yxatga oladi)
from app.models.branch import Branch

DEMO_BRANCHES = [
    {"name": "1-son Oilaviy Poliklinika", "category": "poliklinika", "address": "Toshkent, Chilonzor",
     "avg_service_minutes": 12},
    {"name": "Sartaroshxona 'Ustara'", "category": "sartaroshxona", "address": "Toshkent, Yunusobod",
     "avg_service_minutes": 20},
    {"name": "Avtoyuvish 'CleanCar'", "category": "avtomobil_yuvish", "address": "Toshkent, Mirzo Ulug'bek",
     "avg_service_minutes": 15},
    {"name": "Xalq banki - Markaziy filial", "category": "bank", "address": "Toshkent, Shayxontohur",
     "avg_service_minutes": 8},
]


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        if db.query(Branch).count() == 0:
            for data in DEMO_BRANCHES:
                db.add(Branch(**data))
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print("Database tayyor va demo ma'lumotlar bilan to'ldirildi.")
