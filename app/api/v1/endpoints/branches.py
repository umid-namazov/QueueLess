from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db
from app.models.branch import Branch
from app.schemas.branch import BranchCreate, BranchOut, BranchWithQueueInfo
from app.services.queue_service import estimate_wait_minutes, get_active_queue_count

router = APIRouter()


@router.get("", response_model=list[BranchWithQueueInfo])
def list_branches(category: str | None = None, db: Session = Depends(get_db)):
    """
    Barcha xizmat nuqtalarini (filiallarni) ro'yxatini olish.
    `category` bo'yicha filtrlash mumkin: poliklinika, sartaroshxona, bank, va h.k.
    Har bir filial uchun joriy navbat uzunligi va taxminiy kutish vaqti qo'shib qaytariladi.
    """
    query = db.query(Branch)
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


@router.get("/{branch_id}", response_model=BranchWithQueueInfo)
def get_branch(branch_id: int, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filial topilmadi")

    waiting_count = get_active_queue_count(db, branch.id)
    return BranchWithQueueInfo(
        **BranchOut.model_validate(branch).model_dump(),
        current_waiting_count=waiting_count,
        estimated_wait_minutes=estimate_wait_minutes(branch, waiting_count),
    )


@router.post("", response_model=BranchOut, status_code=status.HTTP_201_CREATED)
def create_branch(
    branch_in: BranchCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Yangi filial/xizmat nuqtasi qo'shish (faqat admin)."""
    branch = Branch(**branch_in.model_dump())
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch
