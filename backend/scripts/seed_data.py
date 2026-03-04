#!/usr/bin/env python3
"""
Script para poblar la base de datos con datos de prueba.
Ejecutar: python scripts/seed_data.py
"""

import sys
import os
import random
from datetime import datetime, timedelta, date
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Añadir el directorio padre al path para poder importar los modelos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.models import Cafe, Venta, Escenario, Base

# Configuración de conexión
DATABASE_URL = "postgresql://tato@host.docker.internal:5432/cafesense_dev"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Datos de ejemplo para cafés
CAFES = [
    {
        "nombre": "Colombia Supremo",
        "origen": "Colombia",
        "tipo": "Arábica",
        "tostado": "Medio",
        "formato": "Grano",
        "costo_base": 12.50,
        "descripcion": "Café colombiano de altura, notas de caramelo y nueces",
        "imagen_url": "/images/colombia.jpg"
    },
    {
        "nombre": "Etiopía Yirgacheffe",
        "origen": "Etiopía",
        "tipo": "Arábica",
        "tostado": "Claro",
        "formato": "Grano",
        "costo_base": 15.00,
        "descripcion": "Notas florales y cítricas, cuerpo ligero",
        "imagen_url": "/images/etiopia.jpg"
    },
    {
        "nombre": "Brasil Santos",
        "origen": "Brasil",
        "tipo": "Arábica",
        "tostado": "Oscuro",
        "formato": "Molido",
        "costo_base": 10.00,
        "descripcion": "Cuerpo completo, notas a chocolate y nueces",
        "imagen_url": "/images/brasil.jpg"
    },
    {
        "nombre": "Costa Rica Tarrazú",
        "origen": "Costa Rica",
        "tipo": "Arábica",
        "tostado": "Medio",
        "formato": "Cápsula",
        "costo_base": 14.00,
        "descripcion": "Acidez brillante, notas cítricas",
        "imagen_url": "/images/costarica.jpg"
    },
    {
        "nombre": "Guatemala Antigua",
        "origen": "Guatemala",
        "tipo": "Arábica",
        "tostado": "Medio-Oscuro",
        "formato": "Grano",
        "costo_base": 13.50,
        "descripcion": "Cuerpo sedoso, notas de chocolate y especias",
        "imagen_url": "/images/guatemala.jpg"
    },
    {
        "nombre": "Perú Chanchamayo",
        "origen": "Perú",
        "tipo": "Arábica",
        "tostado": "Medio",
        "formato": "Molido",
        "costo_base": 11.00,
        "descripcion": "Suave y dulce, notas de frutos secos",
        "imagen_url": "/images/peru.jpg"
    },
    {
        "nombre": "Kenia AA",
        "origen": "Kenia",
        "tipo": "Arábica",
        "tostado": "Claro",
        "formato": "Grano",
        "costo_base": 16.00,
        "descripcion": "Acidez vínosa, notas de frutos rojos",
        "imagen_url": "/images/kenia.jpg"
    },
    {
        "nombre": "Indonesia Sumatra",
        "origen": "Indonesia",
        "tipo": "Arábica",
        "tostado": "Oscuro",
        "formato": "Grano",
        "costo_base": 14.50,
        "descripcion": "Cuerpo pesado, notas terrosas y especiadas",
        "imagen_url": "/images/indonesia.jpg"
    }
]

def seed_cafes(db):
    """Poblar la tabla de cafés"""
    print("🌱 Poblando tabla de cafés...")
    
    # Verificar si ya hay datos
    existing = db.query(Cafe).count()
    if existing > 0:
        print(f"⚠️ Ya existen {existing} cafés. Omitiendo...")
        return db.query(Cafe).all()
    
    cafes_creados = []
    for cafe_data in CAFES:
        cafe = Cafe(**cafe_data)
        db.add(cafe)
        cafes_creados.append(cafe_data["nombre"])
    
    db.commit()
    print(f"✅ Creados {len(cafes_creados)} cafés: {', '.join(cafes_creados)}")
    
    # Devolver los cafés creados
    return db.query(Cafe).all()

def seed_ventas(db, cafes, años=2):
    """Generar ventas aleatorias para los últimos X años"""
    print(f"🌱 Generando ventas para los últimos {años} años...")
    
    # Verificar si ya hay ventas
    existing = db.query(Venta).count()
    if existing > 0:
        print(f"⚠️ Ya existen {existing} ventas. Omitiendo...")
        return
    
    fecha_fin = date.today()
    fecha_inicio = fecha_fin - timedelta(days=años*365)
    
    canales = ["Web", "Tienda", "Distribuidor"]
    regiones = ["Norte", "Sur", "Este", "Oeste"]
    
    ventas_totales = 0
    
    # Generar ventas para cada día
    fecha_actual = fecha_inicio
    while fecha_actual <= fecha_fin:
        # Más ventas en fines de semana
        factor_dia = 1.5 if fecha_actual.weekday() >= 5 else 1.0
        
        # Más ventas en invierno
        if fecha_actual.month in [11, 12, 1, 2]:
            factor_estacion = 1.3
        elif fecha_actual.month in [6, 7, 8]:
            factor_estacion = 0.8
        else:
            factor_estacion = 1.0
        
        # Generar entre 5 y 20 ventas por día
        num_ventas_dia = random.randint(5, 20)
        
        for _ in range(num_ventas_dia):
            cafe = random.choice(cafes)
            
            # El precio varía +/- 20% alrededor del costo_base * 2 (margen 100%)
            precio_base = cafe.costo_base * 2
            precio = round(precio_base * random.uniform(0.8, 1.2), 2)
            
            # Cantidad entre 1 y 10 unidades
            cantidad = random.randint(1, 10)
            
            # 30% de probabilidad de promoción
            promocion = random.random() < 0.3
            
            venta = Venta(
                cafe_id=cafe.id,
                fecha=fecha_actual,
                cantidad=cantidad,
                precio_unitario=precio,
                canal=random.choice(canales),
                region=random.choice(regiones),
                promocion=promocion,
                cliente_id=f"cli_{random.randint(1000, 9999)}"
            )
            db.add(venta)
            ventas_totales += 1
            
            # Commit cada 100 ventas para no saturar
            if ventas_totales % 100 == 0:
                db.commit()
                print(f"  → {ventas_totales} ventas generadas...")
        
        fecha_actual += timedelta(days=1)
    
    db.commit()
    print(f"✅ Generadas {ventas_totales} ventas en total")

def seed_escenarios_ejemplo(db):
    """Crear algunos escenarios de ejemplo"""
    print("🌱 Creando escenarios de ejemplo...")
    
    existing = db.query(Escenario).count()
    if existing > 0:
        print(f"⚠️ Ya existen {existing} escenarios. Omitiendo...")
        return
    
    escenarios = [
        {
            "nombre": "Subida general 10%",
            "descripcion": "Aumentar precio de todos los cafés un 10%",
            "cambios": {"todos": 1.10},
            "impacto_estimado": 8.5,
            "fecha_creacion": date.today()
        },
        {
            "nombre": "Promoción Colombia",
            "descripcion": "Bajar precio del café colombiano 15% para ganar volumen",
            "cambios": {"cafe_1": 0.85},
            "impacto_estimado": 5.2,
            "fecha_creacion": date.today()
        },
        {
            "nombre": "Premium Etiopía",
            "descripcion": "Subir precio del Etiopía Yirgacheffe 20%",
            "cambios": {"cafe_2": 1.20},
            "impacto_estimado": 12.0,
            "fecha_creacion": date.today()
        }
    ]
    
    for escenario_data in escenarios:
        escenario = Escenario(**escenario_data)
        db.add(escenario)
    
    db.commit()
    print(f"✅ Creados {len(escenarios)} escenarios de ejemplo")

def main():
    """Función principal"""
    print("🚀 Iniciando población de base de datos...")
    
    # Crear sesión
    db = SessionLocal()
    
    try:
        # Verificar conexión usando text()
        print("📡 Verificando conexión a base de datos...")
        db.execute(text("SELECT 1"))
        print("✅ Conexión exitosa")
        
        # Poblar cafés
        cafes = seed_cafes(db)
        
        if cafes:
            # Poblar ventas
            seed_ventas(db, cafes, años=2)
            
            # Poblar escenarios
            seed_escenarios_ejemplo(db)
        
        print("✨ ¡Población completada exitosamente!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
