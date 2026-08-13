from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth
from datetime import datetime
import uuid

router = APIRouter(prefix="/conversations", tags=["conversations"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def build_conversation_out(conv: models.Conversation, db: Session, current_user_id: str):
    last_msg = (
        db.query(models.Message)
        .filter(models.Message.conversation_id == conv.id)
        .order_by(models.Message.created_at.desc())
        .first()
    )

    freelance_profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.id == conv.profile_id
    ).first()

    if freelance_profile and freelance_profile.user_id == current_user_id:
        # l'utilisateur connecté EST le freelance -> l'autre partie = le client
        client_profile = db.query(models.ClientProfile).filter(
            models.ClientProfile.user_id == conv.client_id
        ).first()
        request = db.query(models.ClientRequest).filter(
            models.ClientRequest.id == conv.request_id
        ).first()
        other_name = client_profile.name if client_profile else (
            request.client_name if request else "Client"
        )
    else:
        other_name = freelance_profile.name if freelance_profile else "Freelance"

    return {
        "id": conv.id,
        "request_id": conv.request_id,
        "profile_id": conv.profile_id,
        "client_id": conv.client_id,
        "created_at": conv.created_at,
        "other_party_name": other_name,
        "last_message": last_msg.content if last_msg else None,
    }


@router.get("/", response_model=list[schemas.ConversationOut])
def get_my_conversations(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    results = []

    freelance_profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.user_id == user.id
    ).first()

    if freelance_profile:
        convs = db.query(models.Conversation).filter(
            models.Conversation.profile_id == freelance_profile.id
        ).all()
        for c in convs:
            results.append(build_conversation_out(c, db, user.id))

    client_convs = db.query(models.Conversation).filter(
        models.Conversation.client_id == user.id
    ).all()
    for c in client_convs:
        results.append(build_conversation_out(c, db, user.id))

    return results


def check_access(conv: models.Conversation, user, db: Session):
    freelance_profile = db.query(models.FreelanceProfile).filter(
        models.FreelanceProfile.user_id == user.id
    ).first()

    is_freelance_owner = freelance_profile and freelance_profile.id == conv.profile_id
    is_client_owner = conv.client_id == user.id

    if not (is_freelance_owner or is_client_owner):
        raise HTTPException(status_code=403, detail="Access denied")


@router.get("/{conversation_id}/messages", response_model=list[schemas.MessageOut])
def get_messages(
    conversation_id: str,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    conv = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    check_access(conv, user, db)

    return db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(models.Message.created_at).all()


@router.post("/{conversation_id}/messages", response_model=schemas.MessageOut)
def send_message(
    conversation_id: str,
    message: schemas.MessageCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user = auth.get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    conv = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    check_access(conv, user, db)

    new_message = models.Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        sender_id=user.id,
        content=message.content,
        created_at=datetime.utcnow().isoformat(),
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message