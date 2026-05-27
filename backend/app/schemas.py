from pydantic import BaseModel, EmailStr, constr
from typing import Optional
class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=6, max_length=72)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ProfileCreate(BaseModel):
    name: str
    title: str
    category: str
    bio: str
    city: str

    avatar_url: Optional[str] = None
    experience_years: Optional[str] = None
    availability: Optional[str] = None
    starting_price: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    instagram_url: Optional[str] = None

class ProfileOut(BaseModel):
    id: str
    name: str
    title: str
    category: str
    bio: str
    city: str
    slug: str
    avatar_url: Optional[str] = None
    experience_years: Optional[str] = None
    availability: Optional[str] = None
    starting_price: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    instagram_url: Optional[str] = None
    class Config:
        from_attributes = True

class ServiceCreate(BaseModel):
    
    title: str
    description: str
    price: str

class ServiceOut(BaseModel):
    id: str
    profile_id: str
    title: str
    description: str
    price: str

    class Config:
        from_attributes = True

class RequestCreate(BaseModel):
    freelancer_slug: str
    client_name: str
    client_email: EmailStr
    message: str

class RequestOut(BaseModel):
    id: str
    profile_id: str
    client_name: str
    client_email: EmailStr
    message: str
    status: str

    class Config:
        from_attributes = True

class RequestStatusUpdate(BaseModel):
    status: str



class PortfolioImageCreate(BaseModel):
    title: str
    image_url: str


class PortfolioImageOut(BaseModel):
    id: str
    profile_id: str
    title: str
    image_url: str

    class Config:
        from_attributes = True