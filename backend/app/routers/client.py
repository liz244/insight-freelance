from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth
import uuid

router = APIRouter(prefix="/client", tags=["client"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=schemas.ClientProfileOut)
def create_client_profile(
    profile: schemas.ClientProfileCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    existing = db.query(models.ClientProfile).filter(
        models.ClientProfile.user_id == user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Client profile already exists")

    new_profile = models.ClientProfile(
        id=str(uuid.uuid4()),
        user_id=user.id,
        name=profile.name,
        city=profile.city,
        avatar_url=profile.avatar_url,
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


@router.get("/me", response_model=schemas.ClientProfileOut)
def get_my_client_profile(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    profile = db.query(models.ClientProfile).filter(
        models.ClientProfile.user_id == user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Client profile not found")

    return profile


@router.put("/me/update", response_model=schemas.ClientProfileOut)
def update_my_client_profile(
    profile_update: schemas.ClientProfileCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    profile = db.query(models.ClientProfile).filter(
        models.ClientProfile.user_id == user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Client profile not found")

    profile.name = profile_update.name
    profile.city = profile_update.city
    profile.avatar_url = profile_update.avatar_url

    db.commit()
    db.refresh(profile)

    return profile


@router.delete("/me")
def delete_my_client_profile(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    profile = db.query(models.ClientProfile).filter(
        models.ClientProfile.user_id == user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Client profile not found")

    db.delete(profile)
    db.commit()

    return {"message": "Client profile deleted"}