from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth

router = APIRouter(prefix="/admin", tags=["admin"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user


@router.get("/freelances", response_model=list[schemas.AdminUserOut])
def list_freelances(admin=Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.role == "freelance").all()

    results = []
    for u in users:
        profile = db.query(models.FreelanceProfile).filter(
            models.FreelanceProfile.user_id == u.id
        ).first()
        results.append({
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "suspended": u.suspended,
            "name": profile.name if profile else None,
            "city": profile.city if profile else None,
            "profile_id": profile.id if profile else None,
            "verified": profile.verified if profile else False,
        })
    return results


@router.get("/clients", response_model=list[schemas.AdminUserOut])
def list_clients(admin=Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.role == "client").all()

    results = []
    for u in users:
        profile = db.query(models.ClientProfile).filter(
            models.ClientProfile.user_id == u.id
        ).first()
        results.append({
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "suspended": u.suspended,
            "name": profile.name if profile else None,
            "city": profile.city if profile else None,
        })
    return results


@router.get("/tickets")
def list_all_tickets(admin=Depends(require_admin), db: Session = Depends(get_db)):
    tickets = db.query(models.SupportTicket).order_by(
        models.SupportTicket.created_at.desc()
    ).all()

    results = []
    for t in tickets:
        user = db.query(models.User).filter(models.User.id == t.user_id).first()
        results.append({
            "id": t.id,
            "subject": t.subject,
            "message": t.message,
            "status": t.status,
            "created_at": t.created_at,
            "user_email": user.email if user else "Inconnu",
        })
    return results


@router.patch("/tickets/{ticket_id}/status", response_model=schemas.TicketOut)
def update_ticket_status(
    ticket_id: str,
    status_update: schemas.TicketStatusUpdate,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(models.SupportTicket).filter(
        models.SupportTicket.id == ticket_id
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    allowed = ["ouvert", "en cours", "fermé"]
    if status_update.status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid status")

    ticket.status = status_update.status
    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/users/{user_id}/toggle-suspend")
def toggle_suspend(user_id: str, admin=Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot suspend an admin")

    user.suspended = not user.suspended
    db.commit()
    return {"suspended": user.suspended}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, admin=Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete an admin")

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.post("/freelances/{profile_id}/toggle-verified")
def toggle_verified(profile_id: str, admin=Depends(require_admin), db: Session = Depends(get_db)):
    profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.id == profile_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.verified = not profile.verified
    db.commit()
    return {"verified": profile.verified}


@router.get("/stats", response_model=schemas.AdminStats)
def get_admin_stats(admin=Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "total_freelances": db.query(models.User).filter(models.User.role == "freelance").count(),
        "total_clients": db.query(models.User).filter(models.User.role == "client").count(),
        "total_requests": db.query(models.ClientRequest).count(),
        "open_tickets": db.query(models.SupportTicket).filter(
            models.SupportTicket.status == "ouvert"
        ).count(),
    }