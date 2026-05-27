from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth
import uuid

router = APIRouter(prefix="/portfolio", tags=["portfolio"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=schemas.PortfolioImageOut)
def create_portfolio_image(
    image: schemas.PortfolioImageCreate,
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

    existing_images = db.query(models.PortfolioImage).filter(
        models.PortfolioImage.profile_id == profile.id
    ).count()

    if existing_images >= 3:
        raise HTTPException(status_code=400, detail="Maximum 3 images")

    new_image = models.PortfolioImage(
        id=str(uuid.uuid4()),
        profile_id=profile.id,
        title=image.title,
        image_url=image.image_url
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image


@router.get("/me", response_model=list[schemas.PortfolioImageOut])
def get_my_portfolio(
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

    return db.query(models.PortfolioImage).filter(
        models.PortfolioImage.profile_id == profile.id
    ).all()


@router.delete("/{image_id}")
def delete_portfolio_image(
    image_id: str,
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

    image = db.query(models.PortfolioImage).filter(
        models.PortfolioImage.id == image_id,
        models.PortfolioImage.profile_id == profile.id
    ).first()

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    db.delete(image)
    db.commit()

    return {"message": "Image deleted"}


@router.get("/{slug}", response_model=list[schemas.PortfolioImageOut])
def get_portfolio(slug: str, db: Session = Depends(get_db)):
    profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.slug == slug
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return db.query(models.PortfolioImage).filter(
        models.PortfolioImage.profile_id == profile.id
    ).all()