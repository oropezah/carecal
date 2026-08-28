from pydantic import BaseModel, EmailStr
from typing import List, Optional


# ── Schemas de entrada (ya existentes, sin cambios) ──

class ScheduleCreate(BaseModel):
    dia_semana: str
    hora_inicio: str
    hora_fin: str
    duracion_slot: int


class DoctorCreate(BaseModel):
    doctor_id: str
    nombre_doctor: str
    procedimientos: Optional[str] = ""
    schedules: List[ScheduleCreate]


class NewClinicPayload(BaseModel):
    slug: str
    nombre_clinica: str
    plan: str
    telefono_contacto: str
    email_contacto: EmailStr
    doctors: List[DoctorCreate]


# ── Schemas de salida (nuevos, para GET /clinics/{slug}) ──

class SchedulePublic(BaseModel):
    dia_semana: str
    hora_inicio: str
    hora_fin: str
    duracion_slot: Optional[int] = None

    class Config:
        from_attributes = True


class DoctorPublic(BaseModel):
    doctor_id: str
    nombre_doctor: Optional[str] = None
    procedimientos: Optional[str] = ""
    schedules: List[SchedulePublic] = []

    class Config:
        from_attributes = True


class ClinicPublic(BaseModel):
    slug: str
    nombre_clinica: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    telefono_contacto: Optional[str] = None
    doctors: List[DoctorPublic] = []

    class Config:
        from_attributes = True