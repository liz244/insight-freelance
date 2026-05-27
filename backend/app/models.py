from sqlalchemy import Column, String, ForeignKey, Text
import uuid
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    password = Column(String)


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

    # ======================
# CLIENT REQUEST
# ======================
class ClientRequest(Base):
    __tablename__ = "client_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    profile_id = Column(String, ForeignKey("freelance_profiles.id"))

    client_name = Column(String)
    client_email = Column(String)
    message = Column(Text)

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
    