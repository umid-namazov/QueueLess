import os
from dotenv import load_dotenv

load_dotenv()

from app.db.session import SessionLocal
from app.models.user import User

db = SessionLocal()

try:
    users = db.query(User).all()
    for u in users:
        print(f"ID: {u.id}, Phone: {u.phone}, Name: {u.full_name}, IsAdmin: {u.is_admin}")
except Exception as e:
    print('Error:', e)
finally:
    db.close()
