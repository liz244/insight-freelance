from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth
import uuid

router = APIRouter(prefix="/services", tags=["services"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=schemas.ServiceOut)
def create_service(
    service: schemas.ServiceCreate,
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
        raise HTTPException(status_code=404, detail="Profile not found")

    new_service = models.Service(
        id=str(uuid.uuid4()),
        profile_id=profile.id,
        title=service.title,
        description=service.description,
        price=service.price
    )

    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    return new_service


@router.get("/me", response_model=list[schemas.ServiceOut])
def get_my_services(
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

    return db.query(models.Service).filter(
        models.Service.profile_id == profile.id
    ).all()

@router.put("/{service_id}", response_model=schemas.ServiceOut)
def update_service(
    service_id: str,
    service_update: schemas.ServiceCreate,
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
        raise HTTPException(status_code=404, detail="Profile not found")

    service = db.query(models.Service).filter(
        models.Service.id == service_id,
        models.Service.profile_id == profile.id
    ).first()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    service.title = service_update.title
    service.description = service_update.description
    service.price = service_update.price

    db.commit()
    db.refresh(service)

    return service
@router.delete("/{service_id}")
def delete_service(
    service_id: str,
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
        raise HTTPException(status_code=404, detail="Profile not found")

    service = db.query(models.Service).filter(
        models.Service.id == service_id,
        models.Service.profile_id == profile.id
    ).first()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    db.delete(service)
    db.commit()

    return {"message": "Service deleted"}


@router.get("/{slug}", response_model=list[schemas.ServiceOut])
def get_services(slug: str, db: Session = Depends(get_db)):
    profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.slug == slug
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return db.query(models.Service).filter(
        models.Service.profile_id == profile.id
    ).all()