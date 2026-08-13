from pydantic import BaseModel, EmailStr, constr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=6, max_length=72)
    role: Optional[str] = "client"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    role: str

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
    verified: bool = False

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
    service_id: Optional[str] = None
    client_name: str
    client_email: EmailStr
    message: str
    desired_date: Optional[str] = None


class RequestOut(BaseModel):
    id: str
    profile_id: str
    service_id: Optional[str] = None
    client_id: Optional[str] = None
    client_name: str
    client_email: EmailStr
    message: str
    desired_date: Optional[str] = None
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


class ClientProfileCreate(BaseModel):
    name: str
    city: Optional[str] = None
    avatar_url: Optional[str] = None


class ClientProfileOut(BaseModel):
    id: str
    name: str
    city: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content: str
    created_at: str

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: str
    request_id: str
    profile_id: str
    client_id: str
    created_at: str
    other_party_name: str
    last_message: Optional[str] = None

class FavoriteOut(BaseModel):
    id: str
    profile_id: str
    slug: str
    name: str
    title: str
    city: str
    category: str
    avatar_url: Optional[str] = None



class TicketCreate(BaseModel):
    subject: str
    message: str


class TicketOut(BaseModel):
    id: str
    user_id: str
    subject: str
    message: str
    status: str
    created_at: str

    class Config:
        from_attributes = True


class TicketStatusUpdate(BaseModel):
    status: str


class AdminUserOut(BaseModel):
    id: str
    email: str
    role: str
    suspended: bool
    name: Optional[str] = None
    city: Optional[str] = None
    profile_id: Optional[str] = None
    verified: bool = False

    class Config:
        from_attributes = True


class AdminStats(BaseModel):
    total_freelances: int
    total_clients: int
    total_requests: int
    open_tickets: int


class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    id: str
    request_id: str
    profile_id: str
    author_id: str
    author_role: str
    rating: int
    comment: Optional[str] = None
    created_at: str
    author_name: Optional[str] = None

    class Config:
        from_attributes = True
