from fastapi import FastAPI
from sqlalchemy import create_engine, text
import os

app = FastAPI(title="CafeSense API")

# Conexión a PostgreSQL local (usuario tato, sin contraseña)
DATABASE_URL = "postgresql://tato@host.docker.internal:5432/cafesense_dev"

engine = create_engine(DATABASE_URL)

@app.get("/")
async def root():
    return {"message": "☕ CafeSense API funcionando!"}

@app.get("/health")
async def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}

@app.get("/db-test")
async def db_test():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT current_database(), version()"))
            row = result.fetchone()
            return {
                "database": row[0],
                "version": row[1],
                "user": "tato",
                "connection": "local PostgreSQL via host.docker.internal"
            }
    except Exception as e:
        return {"error": str(e)}
