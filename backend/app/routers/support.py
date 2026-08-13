from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth
import uuid

router = APIRouter(prefix="/support", tags=["support"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=schemas.TicketOut)
def create_ticket(
    ticket: schemas.TicketCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    new_ticket = models.SupportTicket(
        id=str(uuid.uuid4()),
        user_id=user.id,
        subject=ticket.subject,
        message=ticket.message,
        status="ouvert",
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket


@router.get("/me", response_model=list[schemas.TicketOut])
def get_my_tickets(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return db.query(models.SupportTicket).filter(
        models.SupportTicket.user_id == user.id
    ).order_by(models.SupportTicket.created_at.desc()).all()