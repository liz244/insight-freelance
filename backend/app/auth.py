from . import models
from datetime import datetime, timedelta, timezone
from jose import jwt
import hashlib
import os

# En local : valeur de secours utilisée automatiquement.
# En production (Render...) : on définit la variable d'environnement
# SECRET_KEY avec une vraie clé secrète aléatoire, jamais mise sur GitHub.
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret-key-do-not-use-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def hash_password(password: str):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str):
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)



from jose import JWTError

def get_current_user(token: str, db):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            return None

    except JWTError:
        return None

    return db.query(models.User).filter(models.User.email == email).first()