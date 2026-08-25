from pydantic import BaseModel, EmailStr
from typing import List, Optional

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
    action: str
    slug: str
    nombre_clinica: str
    plan: str
    telefono_contacto: str
    email_contacto: EmailStr
    doctors: List[DoctorCreate]