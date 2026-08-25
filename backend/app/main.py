from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

app = FastAPI()

# 1. Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root de prueba
@app.get("/")
def read_root():
    return {"status": "ok", "service": "CareCal API"}

# 2. Endpoint para verificar disponibilidad del slug (Sustituido string -> str)
@app.get("/clinics/check-slug")
def check_slug(slug: str, db: Session = Depends(get_db)):
    clinic = crud.get_clinic_by_slug(db, slug=slug)
    if clinic:
        return {"available": False}
    return {"available": True}

# 3. Endpoint para guardar la clínica completa desde create.tsx
@app.post("/clinics", status_code=status.HTTP_201_CREATED)
def create_new_clinic(payload: schemas.NewClinicPayload, db: Session = Depends(get_db)):
    # Verificar si el slug ya existe antes de insertar
    existing = crud.get_clinic_by_slug(db, slug=payload.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Slug already taken"
        )
    return crud.create_clinic(db=db, payload=payload)