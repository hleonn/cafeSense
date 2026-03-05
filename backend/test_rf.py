import joblib
import pandas as pd
import numpy as np
from sqlalchemy.orm import sessionmaker
from app.database.models import Cafe
from app.database.session import engine

# Cargar modelo
modelo = joblib.load('/app/ml/models/random_forest_v2.pkl')
scaler = joblib.load('/app/ml/models/scaler_v2.pkl')
feature_cols = joblib.load('/app/ml/models/feature_cols_v2.pkl')

Session = sessionmaker(bind=engine)
db = Session()

cafe = db.query(Cafe).filter(Cafe.id == 1).first()

# Probar diferentes precios
precios = [20, 25, 30, 35, 40]
for precio in precios:
    # Crear features (simplificado)
    data = {
        'precio_unitario': precio,
        'costo_base': cafe.costo_base,
        'mes': 3,
        'dia_semana': 2,
        'es_fin_semana': 0,
        'trimestre': 1,
        'precio_relativo': precio / (cafe.costo_base + 1),
        'canal_Web': 1,
        'canal_Tienda': 0,
        'canal_Distribuidor': 0,
        'region_Norte': 1,
        'region_Sur': 0,
        'region_Este': 0,
        'region_Oeste': 0,
        'origen_Colombia': 1,
        'origen_Etiopía': 0,
        'origen_Brasil': 0,
        # ... más features (necesitarías todas)
    }
    
    # Completar con ceros para features faltantes
    df = pd.DataFrame([data])
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0
    
    X = df[feature_cols]
    X_scaled = scaler.transform(X)
    pred = modelo.predict(X_scaled)[0]
    print(f"Precio ${precio}: demanda {pred:.1f} unidades")
