from fastapi import FastAPI, HTTPException,
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text, func
from sqlalchemy.orm import sessionmaker
from typing import Optional, List
from pydantic import BaseModel, validator
from datetime import datetime, timedelta, date
import numpy as np

from app.database.models import Cafe, Venta, Escenario, Base
from app.database.session import engine, SessionLocal
from ml import predict as ml_predict
from .routers import auth

app = FastAPI(title="CafeSense API")

@app.on_event("startup")
async def startup():
    """Crear tablas al iniciar la aplicación"""
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas/verificadas en la base de datos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://cafesense.vercel.app"],  # Añade tu frontend local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "☕ CafeSense API",
        "status": "funcionando"
    }

@app.get("/health")
async def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}

# ============ ENDPOINTS DE CAFÉS ============

@app.get("/cafes")
async def get_cafes():
    """Obtener todos los cafés"""
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
    db = SessionLocal()
    try:
        cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()
        if not cafe:
            raise HTTPException(status_code=404, detail="Café no encontrado")
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

# ============ ENDPOINTS DE VENTAS ============

@app.get("/ventas")
async def get_ventas(skip: int = 0, limit: int = 100):
    """Obtener listado de ventas con paginación"""
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

# ============ ENDPOINTS DE SIMULACIÓN ============

class SimulacionRequest(BaseModel):
    cafe_id: int
    nuevo_precio: Optional[float] = None
    porcentaje_cambio: Optional[float] = None

    @validator('porcentaje_cambio', always=True)
    def validar_cambio(cls, v, values):
        if values.get('nuevo_precio') is None and v is None:
            raise ValueError('Debe proporcionar nuevo_precio o porcentaje_cambio')
        return v

class SimulacionResponse(BaseModel):
    cafe_id: int
    cafe_nombre: str
    precio_actual: float
    nuevo_precio: float
    cambio_porcentaje: float
    demanda_actual: int
    demanda_estimada: int
    ingreso_actual: float
    ingreso_estimado: float
    impacto_ingreso: float
    elasticidad: float
    recomendacion: str

@app.post("/simular", response_model=SimulacionResponse)
async def simular_cambio_precio(request: SimulacionRequest):
    """Simular el impacto de un cambio de precio usando elasticidad histórica"""
    db = SessionLocal()
    try:
        cafe = db.query(Cafe).filter(Cafe.id == request.cafe_id).first()
        if not cafe:
            raise HTTPException(status_code=404, detail="Café no encontrado")
        
        fecha_limite = datetime.now().date() - timedelta(days=30)
        ventas_recientes = db.query(Venta).filter(
            Venta.cafe_id == request.cafe_id,
            Venta.fecha >= fecha_limite
        ).all()
        
        if not ventas_recientes:
            raise HTTPException(status_code=404, detail="No hay ventas recientes")
        
        precio_actual = sum(v.precio_unitario for v in ventas_recientes) / len(ventas_recientes)
        demanda_actual = sum(v.cantidad for v in ventas_recientes)
        
        # Calcular elasticidad
        fecha_6m = datetime.now().date() - timedelta(days=180)
        ventas_historicas = db.query(Venta).filter(
            Venta.cafe_id == request.cafe_id,
            Venta.fecha >= fecha_6m
        ).all()
        
        if len(ventas_historicas) < 10:
            elasticidad = -1.5
        else:
            precios = {}
            for v in ventas_historicas:
                precio_redon = round(v.precio_unitario, 1)
                if precio_redon not in precios:
                    precios[precio_redon] = []
                precios[precio_redon].append(v.cantidad)
            
            precios_log = []
            demandas_log = []
            for precio, cantidades in precios.items():
                if len(cantidades) >= 3:
                    precios_log.append(np.log(precio))
                    demandas_log.append(np.log(np.mean(cantidades)))
            
            if len(precios_log) >= 3:
                coeficientes = np.polyfit(precios_log, demandas_log, 1)
                elasticidad = coeficientes[0]
            else:
                elasticidad = -1.2
        
        if request.nuevo_precio is not None:
            nuevo_precio = request.nuevo_precio
            cambio_porcentaje = ((nuevo_precio - precio_actual) / precio_actual) * 100
        else:
            cambio_porcentaje = request.porcentaje_cambio
            nuevo_precio = precio_actual * (1 + cambio_porcentaje / 100)
        
        cambio_demanda_porcentaje = elasticidad * (cambio_porcentaje / 100) * 100
        demanda_estimada = int(demanda_actual * (1 + cambio_demanda_porcentaje / 100))
        demanda_estimada = max(1, demanda_estimada)
        
        ingreso_actual = precio_actual * demanda_actual
        ingreso_estimado = nuevo_precio * demanda_estimada
        impacto_ingreso = ((ingreso_estimado - ingreso_actual) / ingreso_actual) * 100
        
        if impacto_ingreso > 5:
            recomendacion = "📈 SUBIR PRECIO - Aumenta ingresos"
        elif impacto_ingreso < -5:
            recomendacion = "📉 BAJAR PRECIO - Disminuye ingresos"
        else:
            recomendacion = "⚖️ MANTENER PRECIO - Impacto neutral"
        
        return SimulacionResponse(
            cafe_id=cafe.id,
            cafe_nombre=cafe.nombre,
            precio_actual=round(precio_actual, 2),
            nuevo_precio=round(nuevo_precio, 2),
            cambio_porcentaje=round(cambio_porcentaje, 2),
            demanda_actual=demanda_actual,
            demanda_estimada=demanda_estimada,
            ingreso_actual=round(ingreso_actual, 2),
            ingreso_estimado=round(ingreso_estimado, 2),
            impacto_ingreso=round(impacto_ingreso, 2),
            elasticidad=round(elasticidad, 2),
            recomendacion=recomendacion
        )
    finally:
        db.close()

@app.post("/simular-rf", response_model=SimulacionResponse)
async def simular_cambio_precio_rf(request: SimulacionRequest):
    """Simular usando Random Forest"""
    db = SessionLocal()
    try:
        cafe = db.query(Cafe).filter(Cafe.id == request.cafe_id).first()
        if not cafe:
            raise HTTPException(status_code=404, detail="Café no encontrado")
        
        fecha_limite = datetime.now().date() - timedelta(days=30)
        ventas_recientes = db.query(Venta).filter(
            Venta.cafe_id == request.cafe_id,
            Venta.fecha >= fecha_limite
        ).all()
        
        if not ventas_recientes:
            raise HTTPException(status_code=404, detail="No hay ventas recientes")
        
        precio_actual = sum(v.precio_unitario for v in ventas_recientes) / len(ventas_recientes)
        demanda_actual = sum(v.cantidad for v in ventas_recientes)
        
        if request.nuevo_precio is not None:
            nuevo_precio = request.nuevo_precio
            cambio_porcentaje = ((nuevo_precio - precio_actual) / precio_actual) * 100
        else:
            cambio_porcentaje = request.porcentaje_cambio
            nuevo_precio = precio_actual * (1 + cambio_porcentaje / 100)
        
        demanda_estimada = ml_predict.predecir_demanda_mensual(
            cafe_id=request.cafe_id,
            nuevo_precio=nuevo_precio,
            db=db
        )
        
        if demanda_estimada is None:
            demanda_estimada = int(demanda_actual * 0.9)  # fallback
        
        elasticidad_calc = ml_predict.calcular_elasticidad(
            cafe_id=request.cafe_id,
            precio_actual=precio_actual,
            db=db
        )
        
        ingreso_actual = precio_actual * demanda_actual
        ingreso_estimado = nuevo_precio * demanda_estimada
        impacto_ingreso = ((ingreso_estimado - ingreso_actual) / ingreso_actual) * 100
        
        if impacto_ingreso > 5:
            recomendacion = "📈 SUBIR PRECIO - Aumenta ingresos (random forest)"
        elif impacto_ingreso < -5:
            recomendacion = "📉 BAJAR PRECIO - Disminuye ingresos (random forest)"
        else:
            recomendacion = "⚖️ MANTENER PRECIO - Impacto neutral (random forest)"
        
        return SimulacionResponse(
            cafe_id=cafe.id,
            cafe_nombre=cafe.nombre,
            precio_actual=round(precio_actual, 2),
            nuevo_precio=round(nuevo_precio, 2),
            cambio_porcentaje=round(cambio_porcentaje, 2),
            demanda_actual=demanda_actual,
            demanda_estimada=demanda_estimada,
            ingreso_actual=round(ingreso_actual, 2),
            ingreso_estimado=round(ingreso_estimado, 2),
            impacto_ingreso=round(impacto_ingreso, 2),
            elasticidad=round(elasticidad_calc, 2),
            recomendacion=recomendacion
        )
    finally:
        db.close()

# ============ ENDPOINTS DE ESCENARIOS ============

class EscenarioRequest(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    cambios: dict
    impacto_estimado: float

class EscenarioResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    cafe_id: Optional[int]
    cafe_nombre: Optional[str]
    precio_nuevo: Optional[float]
    cambios: dict
    impacto_estimado: float
    fecha_creacion: str

@app.post("/escenarios", response_model=EscenarioResponse)
async def guardar_escenario(request: EscenarioRequest):
    """Guardar un escenario de simulación con todos los detalles"""
    db = SessionLocal()
    try:
        # Extraer cafe_id del campo cambios
        cafe_id = None
        cafe_nombre = None
        precio_nuevo = None
        
        if request.cambios:
            for key, value in request.cambios.items():
                if key.startswith('cafe_'):
                    cafe_id = int(key.replace('cafe_', ''))
                    precio_nuevo = value
                    cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()
                    if cafe:
                        cafe_nombre = cafe.nombre
        
        escenario = Escenario(
            nombre=request.nombre,
            descripcion=request.descripcion,
            cafe_id=cafe_id,
            cafe_nombre=cafe_nombre,
            precio_nuevo=precio_nuevo,
            cambios=request.cambios,
            impacto_estimado=request.impacto_estimado,
            fecha_creacion=date.today()
        )
        db.add(escenario)
        db.commit()
        db.refresh(escenario)
        
        return {
            "id": escenario.id,
            "nombre": escenario.nombre,
            "descripcion": escenario.descripcion,
            "cafe_id": escenario.cafe_id,
            "cafe_nombre": escenario.cafe_nombre,
            "precio_nuevo": escenario.precio_nuevo,
            "cambios": escenario.cambios,
            "impacto_estimado": escenario.impacto_estimado,
            "fecha_creacion": escenario.fecha_creacion.isoformat()
        }
    finally:
        db.close()

@app.get("/escenarios")
async def listar_escenarios(skip: int = 0, limit: int = 50):
    """Listar todos los escenarios guardados"""
    db = SessionLocal()
    try:
        escenarios = db.query(Escenario).order_by(Escenario.fecha_creacion.desc()).offset(skip).limit(limit).all()
        return [
            {
                "id": e.id,
                "nombre": e.nombre,
                "descripcion": e.descripcion,
                "cafe_id": e.cafe_id,
                "cafe_nombre": e.cafe_nombre,
                "precio_nuevo": e.precio_nuevo,
                "cambios": e.cambios,
                "impacto_estimado": e.impacto_estimado,
                "fecha_creacion": e.fecha_creacion.isoformat()
            } for e in escenarios
        ]
    finally:
        db.close()

@app.get("/escenarios/{escenario_id}")
async def get_escenario(escenario_id: int):
    """Obtener un escenario específico"""
    db = SessionLocal()
    try:
        escenario = db.query(Escenario).filter(Escenario.id == escenario_id).first()
        if not escenario:
            raise HTTPException(status_code=404, detail="Escenario no encontrado")
        
        return {
            "id": escenario.id,
            "nombre": escenario.nombre,
            "descripcion": escenario.descripcion,
            "cafe_id": escenario.cafe_id,
            "cafe_nombre": escenario.cafe_nombre,
            "precio_nuevo": escenario.precio_nuevo,
            "cambios": escenario.cambios,
            "impacto_estimado": escenario.impacto_estimado,
            "fecha_creacion": escenario.fecha_creacion.isoformat()
        }
    finally:
        db.close()

@app.delete("/escenarios/{escenario_id}")
async def eliminar_escenario(escenario_id: int):
    """Eliminar un escenario por ID"""
    db = SessionLocal()
    try:
        escenario = db.query(Escenario).filter(Escenario.id == escenario_id).first()
        if not escenario:
            raise HTTPException(status_code=404, detail="Escenario no encontrado")
        
        db.delete(escenario)
        db.commit()
        return {"message": "Escenario eliminado correctamente"}
    finally:
        db.close()
# ============ ENDPOINTS DE AUTENTICACIÓN ============
app.include_router(auth.router)