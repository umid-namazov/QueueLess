import os
from dotenv import load_dotenv

# dotenv'ni yuklash
load_dotenv()

from app.db.session import SessionLocal
from app.models.branch import Branch
from app.models.booking import Booking

db = SessionLocal()

try:
    print('Deleting bookings...')
    db.query(Booking).delete()
    print('Deleting branches...')
    db.query(Branch).delete()
    db.commit()
    print('All branches and bookings deleted successfully!')
except Exception as e:
    print('Error:', e)
    db.rollback()
finally:
    db.close()
