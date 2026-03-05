from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, text, func
from sqlalchemy.orm import sessionmaker
from typing import Optional, List
from pydantic import BaseModel, validator
from datetime import datetime, timedelta, date
import numpy as np
from ml import predict as ml_predict
from app.database.models import Cafe, Venta, Escenario, Base

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

# ============ ENDPOINTS DE SIMULACIÓN ============

class SimulacionRequest(BaseModel):
    cafe_id: int
    nuevo_precio: Optional[float] = None
    porcentaje_cambio: Optional[float] = None

    @validator('porcentaje_cambio', always=True)
    def validar_cambio(cls, v, values):
        # Si no hay nuevo_precio y no hay porcentaje, error
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
        # Obtener información del café
        cafe = db.query(Cafe).filter(Cafe.id == request.cafe_id).first()
        if not cafe:
            raise HTTPException(status_code=404, detail="Café no encontrado")

        # Calcular precio actual promedio (últimos 30 días)
        fecha_limite = datetime.now().date() - timedelta(days=30)
        ventas_recientes = db.query(Venta).filter(
            Venta.cafe_id == request.cafe_id,
            Venta.fecha >= fecha_limite
        ).all()

        if not ventas_recientes:
            raise HTTPException(status_code=404, detail="No hay ventas recientes para este café")

        precio_actual = sum(v.precio_unitario for v in ventas_recientes) / len(ventas_recientes)
        demanda_actual = sum(v.cantidad for v in ventas_recientes)

        # Calcular elasticidad precio-demanda usando datos históricos
        fecha_6m = datetime.now().date() - timedelta(days=180)
        ventas_historicas = db.query(Venta).filter(
            Venta.cafe_id == request.cafe_id,
            Venta.fecha >= fecha_6m
        ).all()

        if len(ventas_historicas) < 10:
            elasticidad = -1.5  # Valor por defecto si no hay suficientes datos
        else:
            # Agrupar por precio para calcular elasticidad
            precios = {}
            for v in ventas_historicas:
                precio_redondeado = round(v.precio_unitario, 1)
                if precio_redondeado not in precios:
                    precios[precio_redondeado] = []
                precios[precio_redondeado].append(v.cantidad)

            # Calcular demanda promedio por precio
            precios_list = []
            demandas_list = []
            for precio, cantidades in precios.items():
                if len(cantidades) >= 3:  # Mínimo 3 ventas para considerar
                    precios_list.append(np.log(precio))
                    demandas_list.append(np.log(np.mean(cantidades)))

            if len(precios_list) >= 3:
                # Regresión lineal simple para elasticidad
                coeficientes = np.polyfit(precios_list, demandas_list, 1)
                elasticidad = coeficientes[0]  # La pendiente es la elasticidad
            else:
                elasticidad = -1.2

        # Determinar nuevo precio basado en lo que envió el usuario
        if request.nuevo_precio is not None:
            nuevo_precio = request.nuevo_precio
            cambio_porcentaje = ((nuevo_precio - precio_actual) / precio_actual) * 100
        else:
            cambio_porcentaje = request.porcentaje_cambio
            nuevo_precio = precio_actual * (1 + cambio_porcentaje / 100)

        # Estimar nueva demanda usando elasticidad
        cambio_demanda_porcentaje = elasticidad * (cambio_porcentaje / 100) * 100
        demanda_estimada = int(demanda_actual * (1 + cambio_demanda_porcentaje / 100))
        demanda_estimada = max(1, demanda_estimada)  # Mínimo 1 unidad

        # Calcular ingresos
        ingreso_actual = precio_actual * demanda_actual
        ingreso_estimado = nuevo_precio * demanda_estimada
        impacto_ingreso = ((ingreso_estimado - ingreso_actual) / ingreso_actual) * 100

        # Generar recomendación
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

# ============ ENDPOINTS DE ESCENARIOS ============

class EscenarioRequest(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    cambios: dict  # Ej: {"cafe_1": 25.0, "cafe_2": 30.0}
    impacto_estimado: float

class EscenarioResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    cambios: dict
    impacto_estimado: float
    fecha_creacion: str

@app.post("/escenarios", response_model=EscenarioResponse)
async def guardar_escenario(request: EscenarioRequest):
    """Guardar un escenario de simulación"""
    db = SessionLocal()
    try:
        escenario = Escenario(
            nombre=request.nombre,
            descripcion=request.descripcion,
            cambios=request.cambios,
            impacto_estimado=request.impacto_estimado,
            fecha_creacion=date.today()
        )
        db.add(escenario)
        db.commit()
        db.refresh(escenario)

        return EscenarioResponse(
            id=escenario.id,
            nombre=escenario.nombre,
            descripcion=escenario.descripcion,
            cambios=escenario.cambios,
            impacto_estimado=escenario.impacto_estimado,
            fecha_creacion=escenario.fecha_creacion.isoformat()
        )
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
            "cambios": escenario.cambios,
            "impacto_estimado": escenario.impacto_estimado,
            "fecha_creacion": escenario.fecha_creacion.isoformat()
        }
    finally:
        db.close()
# ============ ENDPOINT RANDOM FOREST ============

@app.post("/simular-rf", response_model=SimulacionResponse)
async def simular_cambio_precio_rf(request: SimulacionRequest):
    """Simular usando Random Forest (más preciso, multi-variable)"""
    db = SessionLocal()
    try:
        # Obtener información del café
        cafe = db.query(Cafe).filter(Cafe.id == request.cafe_id).first()
        if not cafe:
            raise HTTPException(status_code=404, detail="Café no encontrado")
        
        # Calcular precio actual promedio (últimos 30 días)
        fecha_limite = datetime.now().date() - timedelta(days=30)
        ventas_recientes = db.query(Venta).filter(
            Venta.cafe_id == request.cafe_id,
            Venta.fecha >= fecha_limite
        ).all()
        
        if not ventas_recientes:
            raise HTTPException(status_code=404, detail="No hay ventas recientes para este café")
        
        precio_actual = sum(v.precio_unitario for v in ventas_recientes) / len(ventas_recientes)
        demanda_actual = sum(v.cantidad for v in ventas_recientes)
        
        # Determinar nuevo precio basado en lo que envió el usuario
        if request.nuevo_precio is not None:
            nuevo_precio = request.nuevo_precio
            cambio_porcentaje = ((nuevo_precio - precio_actual) / precio_actual) * 100
        else:
            cambio_porcentaje = request.porcentaje_cambio
            nuevo_precio = precio_actual * (1 + cambio_porcentaje / 100)
        
        # Predecir demanda con Random Forest
        # Usamos valores típicos para canal, región, etc.
        demanda_estimada = ml_predict.predecir_demanda_mensual(
            cafe_id=request.cafe_id,
            nuevo_precio=nuevo_precio,
            db=db
        )
        
        # Si el modelo no está disponible, usar el método lineal
        if demanda_estimada is None:
            # Calcular elasticidad con método lineal
            fecha_6m = datetime.now().date() - timedelta(days=180)
            ventas_historicas = db.query(Venta).filter(
                Venta.cafe_id == request.cafe_id,
                Venta.fecha >= fecha_6m
            ).all()
            
            if len(ventas_historicas) < 10:
                elasticidad = -1.5
            else:
                # Agrupar por precio
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
            
            cambio_demanda_porcentaje = elasticidad * (cambio_porcentaje / 100) * 100
            demanda_estimada = int(demanda_actual * (1 + cambio_demanda_porcentaje / 100))
            demanda_estimada = max(1, demanda_estimada)
            elasticidad_calc = elasticidad
            metodo = "lineal (fallback)"
        else:
            # Calcular elasticidad aproximada con el modelo RF
            elasticidad_calc = ml_predict.calcular_elasticidad(
                cafe_id=request.cafe_id,
                precio_actual=precio_actual,
                db=db
            )
            metodo = "random forest"
        
        # Calcular ingresos
        ingreso_actual = precio_actual * demanda_actual
        ingreso_estimado = nuevo_precio * demanda_estimada
        impacto_ingreso = ((ingreso_estimado - ingreso_actual) / ingreso_actual) * 100
        
        # Generar recomendación
        if impacto_ingreso > 5:
            recomendacion = f"📈 SUBIR PRECIO - Aumenta ingresos ({metodo})"
        elif impacto_ingreso < -5:
            recomendacion = f"📉 BAJAR PRECIO - Disminuye ingresos ({metodo})"
        else:
            recomendacion = f"⚖️ MANTENER PRECIO - Impacto neutral ({metodo})"
        
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
