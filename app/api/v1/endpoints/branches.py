from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db, get_current_user
from app.models.branch import Branch
from app.models.booking import Booking, BookingStatus
from app.schemas.branch import BranchCreate, BranchOut, BranchWithQueueInfo
from app.schemas.booking import BookingWithPosition, BookingOut
from app.services.queue_service import estimate_wait_minutes, get_active_queue_count, get_people_ahead

router = APIRouter()


@router.get("", response_model=list[BranchWithQueueInfo])
def list_branches(category: str | None = None, db: Session = Depends(get_db)):
    """
    Barcha xizmat nuqtalarini (filiallarni) ro'yxatini olish.
    Faqat admin tomonidan tasdiqlanganlari chiqadi.
    """
    query = db.query(Branch).filter(Branch.is_approved == True)
    if category:
        query = query.filter(Branch.category == category)
    branches = query.all()

    result = []
    for b in branches:
        waiting_count = get_active_queue_count(db, b.id)
        result.append(
            BranchWithQueueInfo(
                **BranchOut.model_validate(b).model_dump(),
                current_waiting_count=waiting_count,
                estimated_wait_minutes=estimate_wait_minutes(b, waiting_count),
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
            )
        )
    return result
