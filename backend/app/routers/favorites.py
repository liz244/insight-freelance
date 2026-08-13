from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth
import uuid

router = APIRouter(prefix="/favorites", tags=["favorites"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/toggle/{profile_id}")
def toggle_favorite(
    profile_id: str,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    existing = db.query(models.Favorite).filter(
        models.Favorite.client_id == user.id,
        models.Favorite.profile_id == profile_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"favorited": False}

    new_fav = models.Favorite(
        id=str(uuid.uuid4()),
        client_id=user.id,
        profile_id=profile_id,
    )
    db.add(new_fav)
    db.commit()
    return {"favorited": True}


@router.get("/ids")
def get_favorite_ids(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    favs = db.query(models.Favorite).filter(
        models.Favorite.client_id == user.id
    ).all()

    return [f.profile_id for f in favs]


@router.get("/", response_model=list[schemas.FavoriteOut])
def get_favorites(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    favs = db.query(models.Favorite).filter(
        models.Favorite.client_id == user.id
    ).all()

    results = []
    for f in favs:
        profile = db.query(models.FreelanceProfile).filter(
            models.FreelanceProfile.id == f.profile_id
        ).first()
        if not profile:
            continue
        results.append({
            "id": f.id,
            "profile_id": profile.id,
            "slug": profile.slug,
            "name": profile.name,
            "title": profile.title,
            "city": profile.city,
            "category": profile.category,
            "avatar_url": profile.avatar_url,
        })

    return results