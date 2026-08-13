from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .database import Base, engine
from .routers import auth
from .routers import profile
from .routers import requests
from .routers import services
from .routers import dashboard

from .routers import portfolio
from .routers import client
from .routers import conversations
from .routers import favorites
from .routers import support
from .routers import admin
from .routers import reviews
from .routers import upload
import os

Base.metadata.create_all(bind=engine)


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # autorise tout (ok en dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "API running"}
app.include_router(profile.router)
app.include_router(requests.router)
app.include_router(services.router)
app.include_router(dashboard.router)

app.include_router(portfolio.router)
app.include_router(client.router)
app.include_router(conversations.router)
app.include_router(favorites.router)
app.include_router(support.router)
app.include_router(admin.router)
app.include_router(reviews.router)
app.include_router(upload.router)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")