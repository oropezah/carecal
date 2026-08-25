from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
# Ajusta tus importaciones de base de datos según tu estructura (ej. app.database, app.models)
from app.database import get_db 
from app.models import Clinic 

app = FastAPI()

# 1. Habilitar CORS para permitir peticiones desde Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción puedes especificar: ["https://carecal-kappa.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Endpoint para verificar disponibilidad del slug
@app.get("/clinics/check-slug")
def check_slug(slug: string, db: Session = Depends(get_db)):
    clinic = db.query(Clinic).filter(Clinic.slug == slug).first()
    if clinic:
        return {"available": False}
    return {"available": True}