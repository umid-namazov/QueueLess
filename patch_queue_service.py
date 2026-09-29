import re

with open('app/services/queue_service.py', 'r', encoding='utf-8') as f:
    content = f.read()

new_func = \"\"\"
def complete_booking(db: Session, booking_id: int) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Navbat topilmadi")
    if booking.status != BookingStatus.confirmed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu navbat tasdiqlanmagan")
    booking.status = BookingStatus.completed
    db.commit()
    db.refresh(booking)
    return booking
\"\"\"

content = content + \"\\n\" + new_func

with open('app/services/queue_service.py', 'w', encoding='utf-8') as f:
    f.write(content)
