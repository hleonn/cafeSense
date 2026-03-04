from fastapi import FastAPI
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

from app.database.models import Base

app = FastAPI(title="CafeSense API")

# Conexión a PostgreSQL local
DATABASE_URL = "postgresql://tato@host.docker.internal:5432/cafesense_dev"
engine = create_engine(DATABASE_URL)

# Crear sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@app.on_event("startup")
async def startup():
    """Crear tablas al iniciar la aplicación"""
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas/verificadas en la base de datos")

@app.get("/")
async def root():
    return {
        "message": "☕ CafeSense API",
        "status": "funcionando",
        "database": "conectada"
    }

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
            result = conn.execute(text("""
                SELECT current_database(), version();
            """))
            row = result.fetchone()
            
            # Verificar tablas creadas
            tables = conn.execute(text("""
                SELECT tablename FROM pg_tables 
                WHERE schemaname='public';
            """)).fetchall()
            
            return {
                "database": row[0],
                "version": row[1],
                "user": "tato",
                "tables": [table[0] for table in tables],
                "connection": "local PostgreSQL via host.docker.internal"
            }
    except Exception as e:
        return {"error": str(e)}
