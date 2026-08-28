import logging
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

# Configurar logs para Render
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configuración abierta de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "service": "CareCal API"}

@app.get("/clinics/check-slug")
def check_slug(slug: str, db: Session = Depends(get_db)):
    try:
        clinic = crud.get_clinic_by_slug(db, slug=slug)
        if clinic:
            return {"available": False}
        return {"available": True}
    except Exception as e:
        logger.error(f"Error consultando el slug '{slug}': {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en base de datos: {str(e)}"
        )

@app.post("/clinics", status_code=status.HTTP_201_CREATED)
def create_new_clinic(payload: schemas.NewClinicPayload, db: Session = Depends(get_db)):
    existing = crud.get_clinic_by_slug(db, slug=payload.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Slug already taken"
        )
    return crud.create_clinic(db=db, payload=payload)