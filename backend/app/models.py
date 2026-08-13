from sqlalchemy import Column, String, ForeignKey, Text, Boolean, Integer
import uuid
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="client")  # "client", "freelance" ou "admin"
    suspended = Column(Boolean, default=False)


# ======================
# FREELANCE PROFILE
# ======================
class FreelanceProfile(Base):
    __tablename__ = "freelance_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    user_id = Column(String, ForeignKey("users.id"))

    name = Column(String)
    title = Column(String)  # ex: "Développeur web"
    category = Column(String)  # ex: "Développement"
    bio = Column(Text)
    city = Column(String)

    slug = Column(String, unique=True)  # pour URL publique
    avatar_url = Column(String)
    experience_years = Column(String)
    availability = Column(String)
    starting_price = Column(String)

    linkedin_url = Column(String)
    portfolio_url = Column(String)
    github_url = Column(String)
    instagram_url = Column(String)

    verified = Column(Boolean, default=False)  # validé par un admin


class ClientProfile(Base):
    __tablename__ = "client_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))

    name = Column(String)
    city = Column(String)
    avatar_url = Column(String)
    # ======================
# CLIENT REQUEST
# ======================
class ClientRequest(Base):
    __tablename__ = "client_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    profile_id = Column(String, ForeignKey("freelance_profiles.id"))
    service_id = Column(String, ForeignKey("services.id"), nullable=True)
    client_id = Column(String, ForeignKey("users.id"), nullable=True)

    client_name = Column(String)
    client_email = Column(String)
    message = Column(Text)
    desired_date = Column(String, nullable=True)

    status = Column(String, default="nouvelle")


    
class Service(Base):
    __tablename__ = "services"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String, ForeignKey("freelance_profiles.id"))

    title = Column(String)
    description = Column(Text)
    price = Column(String) 


class Request(Base):
    __tablename__ = "requests"

    id = Column(String, primary_key=True)
    profile_id = Column(String, ForeignKey("freelance_profiles.id"))

    client_name = Column(String)
    client_email = Column(String)
    message = Column(String)
    status = Column(String, default="nouvelle")


class PortfolioImage(Base):
    __tablename__ = "portfolio_images"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String, ForeignKey("freelance_profiles.id"))

    title = Column(String)
    image_url = Column(String)
    

# ======================
# CONVERSATION & MESSAGES
# ======================
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String, ForeignKey("client_requests.id"), unique=True)
    profile_id = Column(String, ForeignKey("freelance_profiles.id"))
    client_id = Column(String, ForeignKey("users.id"))
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"))
    sender_id = Column(String, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, ForeignKey("users.id"))
    profile_id = Column(String, ForeignKey("freelance_profiles.id"))       



class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))

    subject = Column(String)
    message = Column(Text)
    status = Column(String, default="ouvert")  # "ouvert", "en cours", "fermé"
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


# ======================
# AVIS (REVIEWS)
# ======================
class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String, ForeignKey("client_requests.id"))
    profile_id = Column(String, ForeignKey("freelance_profiles.id"))  # freelance concerné

    author_id = Column(String, ForeignKey("users.id"))
    author_role = Column(String)  # "client" ou "freelance"

    rating = Column(Integer)  # 1 à 5
    comment = Column(Text, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
