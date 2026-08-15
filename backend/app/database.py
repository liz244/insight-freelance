from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# En local : rien à faire, ça reste sur SQLite comme avant.
# En production (Render, Railway...) : on définit la variable d'environnement
# DATABASE_URL avec l'URL PostgreSQL fournie par l'hébergeur, et le site
# bascule automatiquement dessus, sans changer une ligne de code.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# Render/Railway fournissent parfois une URL commençant par "postgres://"
# (ancien format), alors que SQLAlchemy attend "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()