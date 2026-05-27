from fastapi.security import OAuth2PasswordBearer
from .. import auth
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
import uuid


router = APIRouter(prefix="/requests", tags=["requests"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=schemas.RequestOut)
def create_request(request: schemas.RequestCreate, db: Session = Depends(get_db)):
    profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.slug == request.freelancer_slug
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    new_request = models.ClientRequest(
        id=str(uuid.uuid4()),
        profile_id=profile.id,
        client_name=request.client_name,
        client_email=request.client_email,
        message=request.message,
        status="nouvelle"
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


@router.get("/", response_model=list[schemas.RequestOut])
def get_requests(
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
        return []

    return db.query(models.ClientRequest).filter(
        models.ClientRequest.profile_id == profile.id
    ).all()

@router.patch("/{request_id}/status", response_model=schemas.RequestOut)
def update_request_status(
    request_id: str,
    status_update: schemas.RequestStatusUpdate,
    db: Session = Depends(get_db)
):
    request = db.query(models.ClientRequest).filter(
        models.ClientRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    allowed_status = ["nouvelle", "en cours", "confirmée", "refusée"]

    if status_update.status not in allowed_status:
        raise HTTPException(status_code=400, detail="Invalid status")

    request.status = status_update.status

    db.commit()
    db.refresh(request)

    return request


@router.delete("/{request_id}")
def delete_request(request_id: str, db: Session = Depends(get_db)):
    request = db.query(models.ClientRequest).filter(
        models.ClientRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    db.delete(request)
    db.commit()

    return {"message": "Request deleted successfully"}