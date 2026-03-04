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

@app.get("/ventas")
async def get_ventas(skip: int = 0, limit: int = 100):
    """Obtener listado de ventas con paginación"""
    from sqlalchemy.orm import Session
    from app.database.models import Venta, Cafe
    
    db = SessionLocal()
    try:
        ventas = db.query(Venta).offset(skip).limit(limit).all()
        result = []
        for v in ventas:
            cafe = db.query(Cafe).filter(Cafe.id == v.cafe_id).first()
            result.append({
                "id": v.id,
                "cafe_id": v.cafe_id,
                "cafe_nombre": cafe.nombre if cafe else "Desconocido",
                "fecha": v.fecha.isoformat(),
                "cantidad": v.cantidad,
                "precio_unitario": v.precio_unitario,
                "total": round(v.cantidad * v.precio_unitario, 2),
                "canal": v.canal,
                "region": v.region,
                "promocion": v.promocion
            })
        return result
    finally:
        db.close()

@app.get("/ventas/cafe/{cafe_id}")
async def get_ventas_por_cafe(cafe_id: int, skip: int = 0, limit: int = 100):
    """Obtener ventas de un café específico"""
    from sqlalchemy.orm import Session
    from app.database.models import Venta, Cafe
    
    db = SessionLocal()
    try:
        cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()
        if not cafe:
            return {"error": "Café no encontrado"}
            
        ventas = db.query(Venta).filter(Venta.cafe_id == cafe_id).offset(skip).limit(limit).all()
        result = []
        for v in ventas:
            result.append({
                "id": v.id,
                "fecha": v.fecha.isoformat(),
                "cantidad": v.cantidad,
                "precio_unitario": v.precio_unitario,
                "total": round(v.cantidad * v.precio_unitario, 2),
                "canal": v.canal,
                "region": v.region,
                "promocion": v.promocion
            })
        return {
            "cafe_id": cafe_id,
            "cafe_nombre": cafe.nombre,
            "total_ventas": len(ventas),
            "ventas": result
        }
    finally:
        db.close()

@app.get("/ventas/stats")
async def get_ventas_stats():
    """Estadísticas generales de ventas"""
    from sqlalchemy.orm import Session
    from sqlalchemy import func
    from app.database.models import Venta, Cafe
    
    db = SessionLocal()
    try:
        # Total de ventas
        total_ventas = db.query(Venta).count()
        
        # Total de ingresos
        total_ingresos = db.query(func.sum(Venta.cantidad * Venta.precio_unitario)).scalar() or 0
        
        # Promedio por venta
        promedio_venta = total_ingresos / total_ventas if total_ventas > 0 else 0
        
        # Ventas por canal
        ventas_por_canal = db.query(
            Venta.canal, 
            func.count(Venta.id).label('cantidad'),
            func.sum(Venta.cantidad * Venta.precio_unitario).label('ingresos')
        ).group_by(Venta.canal).all()
        
        # Ventas por región
        ventas_por_region = db.query(
            Venta.region, 
            func.count(Venta.id).label('cantidad'),
            func.sum(Venta.cantidad * Venta.precio_unitario).label('ingresos')
        ).group_by(Venta.region).all()
        
        # Producto más vendido
        producto_top = db.query(
            Venta.cafe_id,
            func.sum(Venta.cantidad).label('total_unidades')
        ).group_by(Venta.cafe_id).order_by(func.sum(Venta.cantidad).desc()).first()
        
        cafe_top = None
        if producto_top:
            cafe_top = db.query(Cafe).filter(Cafe.id == producto_top.cafe_id).first()
        
        return {
            "totales": {
                "numero_ventas": total_ventas,
                "ingresos_totales": round(total_ingresos, 2),
                "promedio_por_venta": round(promedio_venta, 2)
            },
            "por_canal": [
                {
                    "canal": c[0],
                    "ventas": c[1],
                    "ingresos": round(c[2], 2) if c[2] else 0
                } for c in ventas_por_canal
            ],
            "por_region": [
                {
                    "region": r[0],
                    "ventas": r[1],
                    "ingresos": round(r[2], 2) if r[2] else 0
                } for r in ventas_por_region
            ],
            "producto_top": {
                "cafe_id": producto_top.cafe_id if producto_top else None,
                "nombre": cafe_top.nombre if cafe_top else None,
                "unidades_vendidas": producto_top.total_unidades if producto_top else 0
            } if producto_top else None
        }
    finally:
        db.close()

@app.get("/ventas/tendencias")
async def get_tendencias_ventas(dias: int = 30):
    """Tendencias de ventas por día"""
    from sqlalchemy.orm import Session
    from sqlalchemy import func, and_
    from app.database.models import Venta
    from datetime import datetime, timedelta
    
    db = SessionLocal()
    try:
        fecha_limite = datetime.now().date() - timedelta(days=dias)
        
        ventas_por_dia = db.query(
            Venta.fecha,
            func.count(Venta.id).label('num_ventas'),
            func.sum(Venta.cantidad).label('unidades'),
            func.sum(Venta.cantidad * Venta.precio_unitario).label('ingresos')
        ).filter(Venta.fecha >= fecha_limite).group_by(Venta.fecha).order_by(Venta.fecha).all()
        
        return [
            {
                "fecha": v[0].isoformat(),
                "ventas": v[1],
                "unidades": v[2],
                "ingresos": round(v[3], 2) if v[3] else 0
            } for v in ventas_por_dia
        ]
    finally:
        db.close()
