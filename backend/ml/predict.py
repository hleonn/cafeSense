"""
Módulo de predicción usando Random Forest
"""

import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.preprocessing import StandardScaler

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

modelo = None
scaler = None
feature_cols = None
VENTAS_POR_MES = 30  # Aproximadamente 1 venta por día

def cargar_modelo():
    global modelo, scaler, feature_cols
    
    modelo_path = os.path.join(MODEL_DIR, 'random_forest_v2.pkl')
    scaler_path = os.path.join(MODEL_DIR, 'scaler_v2.pkl')
    features_path = os.path.join(MODEL_DIR, 'feature_cols_v2.pkl')
    
    if os.path.exists(modelo_path):
        modelo = joblib.load(modelo_path)
        scaler = joblib.load(scaler_path)
        feature_cols = joblib.load(features_path)
        print("✅ Modelo Random Forest v2 cargado")
        return True
    return False

cargar_modelo()

def predecir_demanda_mensual(cafe_id, nuevo_precio, fecha=None, canal='Web', region='Norte', promocion=False, db=None):
    """
    Predecir demanda total mensual
    """
    if modelo is None:
        return None
    
    # Obtener información del café
    from app.database.models import Cafe
    cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()
    if not cafe:
        return None
    
    if fecha is None:
        fecha = datetime.now().date()
    
    # Crear features
    data = {
        'precio_unitario': nuevo_precio,
        'costo_base': cafe.costo_base,
        'mes': fecha.month,
        'dia_semana': fecha.weekday(),
        'es_fin_semana': 1 if fecha.weekday() >= 5 else 0,
        'trimestre': (fecha.month - 1) // 3 + 1,
        'precio_relativo': nuevo_precio / (cafe.costo_base + 1)
    }
    
    # One-hot encoding
    data['canal_Web'] = 1 if canal == 'Web' else 0
    data['canal_Tienda'] = 1 if canal == 'Tienda' else 0
    data['canal_Distribuidor'] = 1 if canal == 'Distribuidor' else 0
    
    data['region_Norte'] = 1 if region == 'Norte' else 0
    data['region_Sur'] = 1 if region == 'Sur' else 0
    data['region_Este'] = 1 if region == 'Este' else 0
    data['region_Oeste'] = 1 if region == 'Oeste' else 0
    
    data[f'origen_{cafe.origen}'] = 1
    data[f'tipo_{cafe.tipo}'] = 1
    data[f'tostado_{cafe.tostado}'] = 1
    data[f'formato_{cafe.formato}'] = 1
    
    df = pd.DataFrame([data])
    
    # Completar features faltantes
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0
    
    X = df[feature_cols]
    X_scaled = scaler.transform(X)
    
    # Predecir demanda POR VENTA y convertir a mensual
    demanda_por_venta = modelo.predict(X_scaled)[0]
    demanda_mensual = demanda_por_venta * VENTAS_POR_MES
    
    return max(1, int(round(demanda_mensual)))

def calcular_elasticidad(cafe_id, precio_actual, db):
    """
    Calcular elasticidad usando el modelo
    """
    try:
        # Probar diferentes precios
        precios = [precio_actual * 0.8, precio_actual * 0.9, precio_actual, 
                  precio_actual * 1.1, precio_actual * 1.2]
        demandas = []
        
        for precio in precios:
            demanda = predecir_demanda_mensual(cafe_id, precio, db=db)
            if demanda:
                demandas.append(demanda)
            else:
                demandas.append(100)  # fallback
        
        if len(demandas) > 1:
            log_precios = np.log(precios)
            log_demandas = np.log(demandas)
            coef = np.polyfit(log_precios, log_demandas, 1)
            return coef[0]
    except:
        pass
    
    return -1.2  # valor por defecto
