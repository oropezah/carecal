from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    nombre_clinica = Column(String, nullable=False)
    plan = Column(String, nullable=False)
    telefono_contacto = Column(String, nullable=False)
    email_contacto = Column(String, nullable=False)

    doctors = relationship("Doctor", back_populates="clinic", cascade="all, delete-orphan")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    doctor_id = Column(String, nullable=False)
    nombre_doctor = Column(String, nullable=False)
    procedimientos = Column(Text, nullable=True)

    clinic = relationship("Clinic", back_populates="doctors")
    schedules = relationship("Schedule", back_populates="doctor", cascade="all, delete-orphan")

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    dia_semana = Column(String, nullable=False)
    hora_inicio = Column(String, nullable=False)
    hora_fin = Column(String, nullable=False)
    duracion_slot = Column(Integer, nullable=False)

    doctor = relationship("Doctor", back_populates="schedules")