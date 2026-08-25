# -*- coding: utf-8 -*-
import os
import pandas as pd
from sqlalchemy import text
from app.database import engine

EXCEL_FILE = "clinicas.xlsx"

if not os.path.exists(EXCEL_FILE):
    raise FileNotFoundError("No se encontro el archivo clinicas.xlsx en backend/")

print("🚀 Cargando datos desde el Excel...")

df_clinics = pd.read_excel(EXCEL_FILE, sheet_name="Clinics")
df_clinics = df_clinics.loc[:, ~df_clinics.columns.str.contains('^Unnamed')].dropna(how="all")

df_doctors = pd.read_excel(EXCEL_FILE, sheet_name="doctors").dropna(how="all")
df_schedules = pd.read_excel(EXCEL_FILE, sheet_name="Schedules").dropna(how="all")

print("📦 Eliminando tablas dependientes e insertando en Neon PostgreSQL...")

with engine.begin() as connection:
    # 1. Eliminar tablas antiguas usando CASCADE para ignorar restricciones de Foreign Key
    connection.execute(text("DROP TABLE IF EXISTS schedules CASCADE;"))
    connection.execute(text("DROP TABLE IF EXISTS doctors CASCADE;"))
    connection.execute(text("DROP TABLE IF EXISTS clinics CASCADE;"))
    
    # 2. Recrear e insertar las nuevas tablas
    df_clinics.to_sql("clinics", con=connection, if_exists="replace", index=False)
    print("✅ Tabla 'clinics' creada e insertada.")

    df_doctors.to_sql("doctors", con=connection, if_exists="replace", index=False)
    print("✅ Tabla 'doctors' creada e insertada.")

    df_schedules.to_sql("schedules", con=connection, if_exists="replace", index=False)
    print("✅ Tabla 'schedules' creada e insertada.")

print("🎉 ¡Migración completada con éxito en Neon!")