from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin, get_db, get_current_user
from app.models.branch import Branch
from app.models.booking import Booking, BookingStatus
from app.schemas.branch import BranchCreate, BranchOut, BranchWithQueueInfo, BranchUpdate
from app.schemas.booking import BookingWithPosition, BookingOut
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceOut
from app.models.service import Service
from app.services.queue_service import estimate_wait_minutes, get_active_queue_count, get_people_ahead

router = APIRouter()



@router.get("", response_model=list[BranchWithQueueInfo])
def list_branches(category: str | None = None, db: Session = Depends(get_db)):
    """
    Barcha xizmat nuqtalarini (filiallarni) ro'yxatini olish.
    Faqat admin tomonidan tasdiqlanganlari chiqadi.
    """
    from datetime import datetime, timezone, date as date_type
    today: date_type = datetime.now(timezone.utc).date()

    query = db.query(Branch).filter(Branch.is_approved == True)
    if category:
        query = query.filter(Branch.category == category)
    branches = query.all()

    if not branches:
        return []

    # Single subquery to get waiting counts for all branches at once (no N+1)
    branch_ids = [b.id for b in branches]
    from app.models.booking import BookingStatus
    counts_q = (
        db.query(Booking.branch_id, func.count(Booking.id).label("cnt"))
        .filter(
            Booking.branch_id.in_(branch_ids),
            Booking.queue_date == today,
            Booking.status.in_([BookingStatus.waiting, BookingStatus.confirmed]),
        )
        .group_by(Booking.branch_id)
        .all()
    )
    count_map = {row.branch_id: row.cnt for row in counts_q}

    result = []
    for b in branches:
        waiting_count = count_map.get(b.id, 0)
        result.append(
            BranchWithQueueInfo(
                **BranchOut.model_validate(b).model_dump(),
                current_waiting_count=waiting_count,
                estimated_wait_minutes=waiting_count * b.avg_service_minutes,
            )
        )
    return result



# ── MUHIM: Statik routelar /{branch_id} dan OLDIN turishi SHART ──────────────

@router.post("", response_model=BranchOut, status_code=status.HTTP_201_CREATED)
def create_branch(
    branch_in: BranchCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Yangi filial/xizmat nuqtasi qo'shish (faqat admin tasdiqsiz qo'shadi)."""
    branch = Branch(**branch_in.model_dump(), is_approved=True)
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


@router.post("/request", response_model=BranchOut, status_code=status.HTTP_201_CREATED)
def request_branch(
    branch_in: BranchCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Biznes egalari (Seller) tomonidan yangi filial qo'shish uchun ariza yuborish.
    Bunda `is_approved=False` bo'ladi va admin tasdiqlashi kutiladi.
    """
    branch = Branch(**branch_in.model_dump(), is_approved=False, owner_id=current_user.id)
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


@router.get("/my", response_model=list[BranchOut])
def my_branches(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    Joriy foydalanuvchining o'z bizneslarini qaytaradi.
    Shu orqali foydalanuvchi "seller" ekanligini aniqlaymiz.
    """
    return db.query(Branch).filter(Branch.owner_id == current_user.id).all()


@router.get("/admin/pending", response_model=list[BranchOut])
def pending_branches(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """
    Admin paneli uchun: Hali tasdiqlanmagan (is_approved=False) filiallarni olish.
    """
    return db.query(Branch).filter(Branch.is_approved == False).all()


@router.post("/admin/{branch_id}/approve", response_model=BranchOut)
def approve_branch(branch_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """
    Admin paneli uchun: Kutilayotgan arizani tasdiqlash.
    """
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Topilmadi")
    branch.is_approved = True
    db.commit()
    db.refresh(branch)
    return branch


# ── Wildcard route oxirida keladi ─────────────────────────────────────────────

@router.get("/{branch_id}", response_model=BranchWithQueueInfo)
def get_branch(branch_id: int, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == branch_id, Branch.is_approved == True).first()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filial topilmadi yoki tasdiqlanmagan")

    waiting_count = get_active_queue_count(db, branch.id)
    return BranchWithQueueInfo(
        **BranchOut.model_validate(branch).model_dump(),
        current_waiting_count=waiting_count,
        estimated_wait_minutes=estimate_wait_minutes(branch, waiting_count),
    )


@router.put("/{branch_id}", response_model=BranchOut)
def update_branch(branch_id: int, branch_in: BranchUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Filial ma'lumotlarini yangilash (faqat filial egasi yoki admin)"""
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Filial topilmadi")
    if branch.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Faqat filial egasi o'zgartira oladi")
    
    update_data = branch_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(branch, field, value)
        
    db.commit()
    db.refresh(branch)
    return branch

from datetime import date

@router.get("/{branch_id}/history", response_model=list[BookingWithPosition])
def get_branch_history(branch_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Filialning bugungi barcha navbatlari tarixi (seller paneli uchun)"""
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch or (branch.owner_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    today = date.today()
    bookings = (
        db.query(Booking)
        .filter(Booking.branch_id == branch_id, Booking.queue_date == today)
        .order_by(Booking.queue_number.desc())
        .all()
    )
    result = []
    for b in bookings:
        ahead = get_people_ahead(db, b) if b.status in (BookingStatus.waiting, BookingStatus.confirmed) else 0
        result.append(
            BookingWithPosition(
                **BookingOut.model_validate(b).model_dump(),
                people_ahead=ahead,
                estimated_wait_minutes=estimate_wait_minutes(branch, ahead),
                branch_name=branch.name,
            )
        )
    return result

@router.get("/{branch_id}/services", response_model=list[ServiceOut])
def get_branch_services(branch_id: int, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Filial topilmadi")
    return branch.services

@router.post("/{branch_id}/services", response_model=ServiceOut)
def create_branch_service(branch_id: int, service_in: ServiceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Filial topilmadi")
    if branch.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Faqat filial egasi o'zgartira oladi")
    
    service = Service(branch_id=branch_id, **service_in.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.put("/{branch_id}/services/{service_id}", response_model=ServiceOut)
def update_branch_service(branch_id: int, service_id: int, service_in: ServiceUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch or (branch.owner_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
        
    service = db.query(Service).filter(Service.id == service_id, Service.branch_id == branch_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Xizmat topilmadi")
        
    update_data = service_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
        
    db.commit()
    db.refresh(service)
    return service

@router.delete("/{branch_id}/services/{service_id}")
def delete_branch_service(branch_id: int, service_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch or (branch.owner_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
        
    service = db.query(Service).filter(Service.id == service_id, Service.branch_id == branch_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Xizmat topilmadi")
        
    db.delete(service)
    db.commit()
    return {"detail": "Xizmat o'chirildi"}

@router.get("/{branch_id}/queue", response_model=list[BookingWithPosition])
def get_branch_queue(branch_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    Bitta filialning joriy kutayotgan navbatini olish (Sotuvchi paneli uchun).
    Faqat 'waiting' va 'confirmed' maqomidagi navbatlarni qaytaradi.
    """
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filial topilmadi")

    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.branch))
        .filter(Booking.branch_id == branch_id)
        .filter(Booking.status.in_([BookingStatus.waiting, BookingStatus.confirmed]))
        .order_by(Booking.queue_number.asc())
        .all()
    )

    result = []
    for b in bookings:
        ahead = get_people_ahead(db, b)
        result.append(
            BookingWithPosition(
                **BookingOut.model_validate(b).model_dump(),
                people_ahead=ahead,
                estimated_wait_minutes=estimate_wait_minutes(b.branch, ahead),
                branch_name=b.branch.name if b.branch else None,
            )
        )
    return result
