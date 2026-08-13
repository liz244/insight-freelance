from fastapi.security import OAuth2PasswordBearer
from .. import auth
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
import uuid


router = APIRouter(prefix="/requests", tags=["requests"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=schemas.RequestOut)
def create_request(
    request: schemas.RequestCreate,
    token: str = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db)
):
    profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.slug == request.freelancer_slug
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    client_id = None
    if token:
        user = auth.get_current_user(token, db)
        if user:
            client_id = user.id

    new_request = models.ClientRequest(
        id=str(uuid.uuid4()),
        profile_id=profile.id,
        service_id=request.service_id,
        client_id=client_id,
        client_name=request.client_name,
        client_email=request.client_email,
        message=request.message,
        desired_date=request.desired_date,
        status="nouvelle"
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request
@router.get("/me", response_model=list[schemas.RequestOut])
def get_my_requests(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return db.query(models.ClientRequest).filter(
        models.ClientRequest.client_id == user.id
    ).all()

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
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    request = db.query(models.ClientRequest).filter(
        models.ClientRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Seul le freelance propriétaire de la demande peut changer son statut
    owning_profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.id == request.profile_id
    ).first()

    if not owning_profile or owning_profile.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    allowed_status = ["nouvelle", "en cours", "confirmée", "refusée", "terminée"]

    if status_update.status not in allowed_status:
        raise HTTPException(status_code=400, detail="Invalid status")

    request.status = status_update.status

    # Si la demande est confirmée ET que le client a un compte,
    # on crée automatiquement une conversation (une seule fois)
    if status_update.status == "confirmée" and request.client_id:
        existing_conversation = db.query(models.Conversation).filter(
            models.Conversation.request_id == request.id
        ).first()

        if not existing_conversation:
            new_conversation = models.Conversation(
                id=str(uuid.uuid4()),
                request_id=request.id,
                profile_id=request.profile_id,
                client_id=request.client_id,
            )
            db.add(new_conversation)

    db.commit()
    db.refresh(request)

    return request


@router.delete("/{request_id}")
def delete_request(
    request_id: str,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    request = db.query(models.ClientRequest).filter(
        models.ClientRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    owning_profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.id == request.profile_id
    ).first()

    if not owning_profile or owning_profile.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(request)
    db.commit()

    return {"message": "Request deleted successfully"}