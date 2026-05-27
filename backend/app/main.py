from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from .database import Base, engine
from .routers import auth
from .routers import profile
from .routers import requests
from .routers import services
from .routers import dashboard
from .routers import request
from .routers import portfolio

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
app.include_router(request.router)
app.include_router(portfolio.router)