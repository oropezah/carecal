import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Ruta absoluta al directorio backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Busca .env.local en backend/ o en la raíz del proyecto
dotenv_path = BASE_DIR / ".env.local"
if not dotenv_path.exists():
    dotenv_path = BASE_DIR.parent / ".env.local"

load_dotenv(dotenv_path=dotenv_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(f"DATABASE_URL no está configurada. Buscado en: {dotenv_path}")

# Ajuste para PostgreSQL en SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()