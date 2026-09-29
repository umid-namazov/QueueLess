import os
from dotenv import load_dotenv

load_dotenv()

from app.db.session import SessionLocal
from app.models.user import User

db = SessionLocal()
phone = '+998998691005'

try:
    user = db.query(User).filter(User.phone == phone).first()
    if user:
        user.is_admin = True
        db.commit()
        print(f"User {phone} is now an admin!")
    else:
        print(f"User {phone} not found in DB! Please register first.")
except Exception as e:
    print('Error:', e)
    db.rollback()
finally:
    db.close()
