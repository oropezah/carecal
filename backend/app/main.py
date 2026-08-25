from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app import schemas, crud

# Auto-create Postgres tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareCal API")

# Allow Next.js on Vercel to access Python endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "CareCal FastAPI Backend"}

@app.get("/api/sheets")
def check_slug(slug: str, db: Session = Depends(get_db)):
    clinic = crud.get_clinic_by_slug(db, slug=slug)
    if clinic:
        return {"available": False}
    return {"available": True}

@app.post("/api/sheets")
def create_new_clinic(payload: schemas.NewClinicPayload, db: Session = Depends(get_db)):
    existing = crud.get_clinic_by_slug(db, slug=payload.slug)
    if existing:
        raise HTTPException(status_code=400, detail="slug_taken")
    
    crud.create_clinic(db, payload)
    return {"success": True}