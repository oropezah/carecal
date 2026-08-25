from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Clinic(Base):
    __tablename__ = "clinics"

    slug = Column(String, primary_key=True, index=True)
    nombre_clinica = Column(String, nullable=True)
    plan = Column(String, nullable=True)
    status = Column(String, nullable=True)
    telefono_contacto = Column(String, nullable=True)
    fecha_creacion = Column(String, nullable=True)
    email = Column(String, nullable=True)
    og_image_url = Column(String, nullable=True)

    # Relación con doctores
    doctors = relationship("Doctor", back_populates="clinic", cascade="all, delete-orphan")


class Doctor(Base):
    __tablename__ = "doctors"

    doctor_id = Column(String, primary_key=True, index=True)
    clinic_slug = Column(String, ForeignKey("clinics.slug"), nullable=False)
    nombre_doctor = Column(String, nullable=True)
    procedimientos = Column(String, nullable=True)
    calendar_id = Column(String, nullable=True)

    # Relaciones
    clinic = relationship("Clinic", back_populates="doctors")
    schedules = relationship("Schedule", back_populates="doctor", cascade="all, delete-orphan")


class Schedule(Base):
    __tablename__ = "schedules"

    # Clave primaria compuesta para asegurar identificador único por horario/doctor
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_slug = Column(String, nullable=True)
    doctor_id = Column(String, ForeignKey("doctors.doctor_id"), nullable=False)
    dia_semana = Column(String, nullable=False)
    hora_inicio = Column(String, nullable=False)
    hora_fin = Column(String, nullable=False)
    duracion_slot = Column(Integer, nullable=True)
    calendar_id = Column(String, nullable=True)

    # Relación
    doctor = relationship("Doctor", back_populates="schedules")