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

@app.get("/cafes")
async def get_cafes():
    """Obtener todos los cafés"""
    from sqlalchemy.orm import Session
    from app.database.models import Cafe
    
    db = SessionLocal()
    try:
        cafes = db.query(Cafe).all()
        return [
            {
                "id": c.id,
                "nombre": c.nombre,
                "origen": c.origen,
                "tipo": c.tipo,
                "tostado": c.tostado,
                "formato": c.formato,
                "costo_base": c.costo_base,
                "precio_sugerido": round(c.costo_base * 2, 2),
                "descripcion": c.descripcion
            }
            for c in cafes
        ]
    finally:
        db.close()

@app.get("/cafes/{cafe_id}")
async def get_cafe(cafe_id: int):
    """Obtener un café por ID"""
    from sqlalchemy.orm import Session
    from app.database.models import Cafe
    
    db = SessionLocal()
    try:
        cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()
        if not cafe:
            return {"error": "Café no encontrado"}
        return {
            "id": cafe.id,
            "nombre": cafe.nombre,
            "origen": cafe.origen,
            "tipo": cafe.tipo,
            "tostado": cafe.tostado,
            "formato": cafe.formato,
            "costo_base": cafe.costo_base,
            "descripcion": cafe.descripcion
        }
    finally:
        db.close()
