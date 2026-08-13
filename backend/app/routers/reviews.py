from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth
import uuid

router = APIRouter(prefix="/reviews", tags=["reviews"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def resolve_author_name(user_id: str, role: str, db: Session) -> str:
    if role == "client":
        profile = db.query(models.ClientProfile).filter(
            models.ClientProfile.user_id == user_id
        ).first()
        return profile.name if profile else "Client"

    profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.user_id == user_id
    ).first()
    return profile.name if profile else "Freelance"


def to_review_out(review: models.Review, db: Session) -> dict:
    return {
        "id": review.id,
        "request_id": review.request_id,
        "profile_id": review.profile_id,
        "author_id": review.author_id,
        "author_role": review.author_role,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at,
        "author_name": resolve_author_name(review.author_id, review.author_role, db),
    }


@router.post("/{request_id}", response_model=schemas.ReviewOut)
def create_review(
    request_id: str,
    review: schemas.ReviewCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    req = db.query(models.ClientRequest).filter(
        models.ClientRequest.id == request_id
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.status != "terminée":
        raise HTTPException(
            status_code=400,
            detail="La prestation doit être marquée comme terminée pour laisser un avis"
        )

    freelance_profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.id == req.profile_id
    ).first()

    is_client = req.client_id is not None and req.client_id == user.id
    is_freelance = freelance_profile is not None and freelance_profile.user_id == user.id

    if not (is_client or is_freelance):
        raise HTTPException(status_code=403, detail="Access denied")

    existing = db.query(models.Review).filter(
        models.Review.request_id == request_id,
        models.Review.author_id == user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà laissé un avis pour cette prestation")

    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="La note doit être comprise entre 1 et 5")

    new_review = models.Review(
        id=str(uuid.uuid4()),
        request_id=request_id,
        profile_id=req.profile_id,
        author_id=user.id,
        author_role="client" if is_client else "freelance",
        rating=review.rating,
        comment=review.comment,
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return to_review_out(new_review, db)


@router.get("/profile/{profile_id}", response_model=list[schemas.ReviewOut])
def get_profile_reviews(profile_id: str, db: Session = Depends(get_db)):
    # Uniquement les avis laissés par des clients sur ce freelance (avis publics)
    reviews = db.query(models.Review).filter(
        models.Review.profile_id == profile_id,
        models.Review.author_role == "client"
    ).order_by(models.Review.created_at.desc()).all()

    return [to_review_out(r, db) for r in reviews]


@router.get("/request/{request_id}/mine")
def get_my_review_status(
    request_id: str,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    existing = db.query(models.Review).filter(
        models.Review.request_id == request_id,
        models.Review.author_id == user.id
    ).first()

    return {"has_reviewed": existing is not None}
