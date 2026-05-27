from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, database, auth

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/stats")
def get_stats(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.user_id == user.id
    ).first()

    if not profile:
        return {
            "total_requests": 0,
            "nouvelle": 0,
            "en_cours": 0,
            "confirmée": 0,
            "refusée": 0
        }

    requests = db.query(models.ClientRequest).filter(
        models.ClientRequest.profile_id == profile.id
    ).all()

    total = len(requests)

    stats = {
        "total_requests": total,
        "nouvelle": 0,
        "en_cours": 0,
        "confirmée": 0,
        "refusée": 0
    }

    for r in requests:
        if r.status == "nouvelle":
            stats["nouvelle"] += 1

        elif r.status == "en cours":
            stats["en_cours"] += 1

        elif r.status == "confirmée":
            stats["confirmée"] += 1

        elif r.status == "refusée":
            stats["refusée"] += 1

    return stats