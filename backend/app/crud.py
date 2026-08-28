from sqlalchemy.orm import Session, joinedload
from app import models, schemas


def get_clinic_by_slug(db: Session, slug: str):
    return db.query(models.Clinic).filter(models.Clinic.slug == slug).first()


def get_clinic_full(db: Session, slug: str):
    """
    Trae la clínica junto con sus doctores y los horarios de cada doctor,
    todo en una sola consulta (evita N+1 queries).
    """
    return (
        db.query(models.Clinic)
        .options(
            joinedload(models.Clinic.doctors).joinedload(models.Doctor.schedules)
        )
        .filter(models.Clinic.slug == slug)
        .first()
    )


def create_clinic(db: Session, payload: schemas.NewClinicPayload):
    db_clinic = models.Clinic(
        slug=payload.slug,
        nombre_clinica=payload.nombre_clinica,
        plan=payload.plan,
        status="pending",
        telefono_contacto=payload.telefono_contacto,
        email=payload.email_contacto,
    )
    db.add(db_clinic)
    db.commit()
    db.refresh(db_clinic)

    for doc in payload.doctors:
        # Prefijamos con el slug para que el doctor_id sea único en toda la tabla,
        # no solo dentro de esta clínica (evita choques entre clínicas distintas)
        unique_doctor_id = f"{db_clinic.slug}-{doc.doctor_id}"

        db_doc = models.Doctor(
            clinic_slug=db_clinic.slug,
            doctor_id=unique_doctor_id,
            nombre_doctor=doc.nombre_doctor,
            procedimientos=doc.procedimientos,
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)

        for sched in doc.schedules:
            db_sched = models.Schedule(
                doctor_id=unique_doctor_id,
                dia_semana=sched.dia_semana,
                hora_inicio=sched.hora_inicio,
                hora_fin=sched.hora_fin,
                duracion_slot=sched.duracion_slot,
            )
            db.add(db_sched)

    db.commit()
    return db_clinic