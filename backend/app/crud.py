from sqlalchemy.orm import Session
from app import models, schemas

def get_clinic_by_slug(db: Session, slug: str):
    return db.query(models.Clinic).filter(models.Clinic.slug == slug).first()

def create_clinic(db: Session, payload: schemas.NewClinicPayload):
    db_clinic = models.Clinic(
        slug=payload.slug,
        nombre_clinica=payload.nombre_clinica,
        plan=payload.plan,
        telefono_contacto=payload.telefono_contacto,
        email_contacto=payload.email_contacto,
    )
    db.add(db_clinic)
    db.commit()
    db.refresh(db_clinic)

    for doc in payload.doctors:
        db_doc = models.Doctor(
            clinic_id=db_clinic.id,
            doctor_id=doc.doctor_id,
            nombre_doctor=doc.nombre_doctor,
            procedimientos=doc.procedimientos,
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)

        for sched in doc.schedules:
            db_sched = models.Schedule(
                doctor_id=db_doc.id,
                dia_semana=sched.dia_semana,
                hora_inicio=sched.hora_inicio,
                hora_fin=sched.hora_fin,
                duracion_slot=sched.duracion_slot,
            )
            db.add(db_sched)

    db.commit()
    return db_clinic