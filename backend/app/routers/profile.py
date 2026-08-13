from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from typing import Optional
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth
import uuid

router = APIRouter(prefix="/profile", tags=["profile"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=schemas.ProfileOut)
def create_profile(
    profile: schemas.ProfileCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    existing_profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.user_id == user.id
    ).first()

    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")

    new_profile = models.FreelanceProfile(
        id=str(uuid.uuid4()),
        user_id=user.id,

        name=profile.name,
        title=profile.title,
        category=profile.category,
        bio=profile.bio,
        city=profile.city,

        slug=profile.name.lower().replace(" ", "-"),

        avatar_url=profile.avatar_url,
        experience_years=profile.experience_years,
        availability=profile.availability,
        starting_price=profile.starting_price,
        linkedin_url=profile.linkedin_url,
        portfolio_url=profile.portfolio_url,
        github_url=profile.github_url,
        instagram_url=profile.instagram_url,
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


@router.get("/me", response_model=schemas.ProfileOut)
def get_my_profile(
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

    return profile


@router.get("/", response_model=list[schemas.ProfileOut])
def get_profiles(
    q: Optional[str] = Query(None, description="Recherche libre : nom, métier, ville, catégorie"),
    category: Optional[str] = None,
    city: Optional[str] = None,
    availability: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.FreelanceProfile)

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                models.FreelanceProfile.name.ilike(like),
                models.FreelanceProfile.title.ilike(like),
                models.FreelanceProfile.city.ilike(like),
                models.FreelanceProfile.category.ilike(like),
            )
        )

    if category:
        query = query.filter(models.FreelanceProfile.category.ilike(f"%{category}%"))

    if city:
        query = query.filter(models.FreelanceProfile.city.ilike(f"%{city}%"))

    if availability:
        query = query.filter(models.FreelanceProfile.availability == availability)

    profiles = query.all()

    if price_min is not None or price_max is not None:
        def safe_int(value):
            try:
                return int(value)
            except (TypeError, ValueError):
                return None

        filtered = []
        for p in profiles:
            price = safe_int(p.starting_price)
            if price is None:
                continue
            if price_min is not None and price < price_min:
                continue
            if price_max is not None and price > price_max:
                continue
            filtered.append(p)
        return filtered

    return profiles


@router.get("/{slug}", response_model=schemas.ProfileOut)
def get_profile_by_slug(slug: str, db: Session = Depends(get_db)):
    profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.slug == slug
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.put("/me/update", response_model=schemas.ProfileOut)
def update_my_profile(
    profile_update: schemas.ProfileCreate,
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

    profile.name = profile_update.name
    profile.title = profile_update.title
    profile.category = profile_update.category
    profile.bio = profile_update.bio
    profile.city = profile_update.city

    profile.slug = profile_update.name.lower().replace(" ", "-")

    profile.avatar_url = profile_update.avatar_url
    profile.experience_years = profile_update.experience_years
    profile.availability = profile_update.availability
    profile.starting_price = profile_update.starting_price
    profile.linkedin_url = profile_update.linkedin_url
    profile.portfolio_url = profile_update.portfolio_url
    profile.github_url = profile_update.github_url
    profile.instagram_url = profile_update.instagram_url

    db.commit()
    db.refresh(profile)

    return profile


@router.delete("/me")
def delete_my_profile(
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

    db.delete(profile)
    db.commit()

    return {"message": "Profile deleted"}