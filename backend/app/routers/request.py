
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(prefix="/requests", tags=["requests"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=schemas.RequestOut)
def create_request (request: schemas.RequestCreate, db: Session = Depends(get_db)):

    new_request = models.Request(
        freelancer_slug=request.freelancer_slug,
        client_name=request.client_name,
        client_email=request.client_email,
        message=request.message,
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request