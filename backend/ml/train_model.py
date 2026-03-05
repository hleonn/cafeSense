#!/usr/bin/env python3
"""
Entrenar modelo Random Forest para predicción de demanda
Ejecutar: python -m ml.train_model
"""

import sys
import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler

# Añadir directorio padre al path de Python
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.database.session import engine
    print("✅ Módulos importados correctamente")
except ImportError as e:
    print(f"❌ Error importando módulos: {e}")
    sys.exit(1)

def preparar_features(df_ventas):
    """Preparar features para el modelo"""
    print("🔧 Preparando features...")
    print(f"📊 Columnas disponibles en df_ventas: {df_ventas.columns.tolist()}")
    
    # Crear copia para no modificar original
    df = df_ventas.copy()
    
    # Features temporales
    df['fecha'] = pd.to_datetime(df['fecha'])
    df['mes'] = df['fecha'].dt.month
    df['dia_semana'] = df['fecha'].dt.dayofweek
    df['es_fin_semana'] = (df['dia_semana'] >= 5).astype(int)
    df['trimestre'] = df['fecha'].dt.quarter
    
    # Identificar todas las columnas categóricas (tipo object)
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    print(f"📊 Todas las columnas categóricas detectadas: {categorical_cols}")
    
    # One-hot encoding para TODAS las variables categóricas
    if categorical_cols:
        df_encoded = pd.get_dummies(df, columns=categorical_cols, prefix=categorical_cols, dummy_na=False)
        print(f"✅ One-hot encoding completado. Nuevas columnas: {len(df_encoded.columns)}")
    else:
        df_encoded = df.copy()
    
    # Eliminar columnas que no sean numéricas (por si acaso)
    numeric_cols = df_encoded.select_dtypes(include=[np.number]).columns.tolist()
    df_numeric = df_encoded[numeric_cols]
    
    # Asegurar que tenemos precio_relativo
    if 'costo_base' in df_numeric.columns and 'precio_unitario' in df_numeric.columns:
        df_numeric['precio_relativo'] = df_numeric['precio_unitario'] / (df_numeric['costo_base'] + 1)
    
    print(f"✅ Features numéricas finales: {df_numeric.shape}")
    return df_numeric

def entrenar_modelo():
    """Entrenar modelo Random Forest"""
    print("🚀 Iniciando entrenamiento del modelo...")
    
    # Cargar datos con todas las columnas necesarias
    print("📥 Cargando datos desde PostgreSQL...")
    query = text("""
    SELECT 
        v.cafe_id,
        v.fecha,
        v.cantidad,
        v.precio_unitario,
        v.canal,
        v.region,
        v.promocion,
        c.origen,
        c.tipo,
        c.tostado,
        c.formato,
        c.costo_base
    FROM ventas v
    JOIN cafes c ON v.cafe_id = c.id
    """)
    
    try:
        with engine.connect() as conn:
            df = pd.read_sql(query, conn)
        print(f"✅ Datos cargados: {len(df)} ventas")
        print(f"📊 Columnas: {df.columns.tolist()}")
    except Exception as e:
        print(f"❌ Error cargando datos: {e}")
        return None
    
    if len(df) == 0:
        print("❌ No hay datos en la base de datos")
        return None
    
    print(f"📊 Muestra de datos:")
    print(df[['cafe_id', 'fecha', 'cantidad', 'precio_unitario', 'origen']].head())
    
    # Preparar features (ahora solo numéricas)
    df_features = preparar_features(df)
    
    # Verificar que todas las columnas son numéricas
    print(f"🔍 Verificando tipos de datos:")
    print(df_features.dtypes.value_counts())
    
    # Definir features y target
    feature_cols = [col for col in df_features.columns if col not in [
        'cafe_id', 'cantidad'  # 'fecha' ya no está porque la eliminamos
    ]]
    target_col = 'cantidad'
    
    X = df_features[feature_cols]
    y = df_features[target_col]
    
    print(f"🎯 Features: {len(feature_cols)}")
    print(f"📊 Primeras features: {feature_cols[:5]}")
    
    # Verificar que X no contiene valores no numéricos
    print(f"✅ X es numérico: {pd.api.types.is_numeric_dtype(pd.DataFrame(X).stack())}")
    
    # Split de datos
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Escalar features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Entrenar modelo base
    print("🌲 Entrenando Random Forest base...")
    rf_base = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_leaf=5,  # Añadido para evitar overfitting
        random_state=42,
        n_jobs=-1
    )
    rf_base.fit(X_train_scaled, y_train)
    
    # Evaluación base
    y_pred_base = rf_base.predict(X_test_scaled)
    mae_base = mean_absolute_error(y_test, y_pred_base)
    r2_base = r2_score(y_test, y_pred_base)
    
    print(f"📊 Resultados modelo base:")
    print(f"  - MAE: {mae_base:.2f} unidades")
    print(f"  - R2: {r2_base:.3f}")
    
    # Grid Search simplificado
    print("🔍 Optimizando hiperparámetros...")
    param_grid = {
        'n_estimators': [50, 100],
        'max_depth': [10, 15],
        'min_samples_leaf': [5, 10]
    }
    
    rf = RandomForestRegressor(random_state=42, n_jobs=-1)
    grid_search = GridSearchCV(
        rf, param_grid, cv=2, 
        scoring='neg_mean_absolute_error',
        n_jobs=-1, verbose=0
    )
    grid_search.fit(X_train_scaled, y_train)
    
    # Mejor modelo
    best_rf = grid_search.best_estimator_
    y_pred_best = best_rf.predict(X_test_scaled)
    mae_best = mean_absolute_error(y_test, y_pred_best)
    r2_best = r2_score(y_test, y_pred_best)
    
    print(f"\n✨ Mejores hiperparámetros: {grid_search.best_params_}")
    print(f"📊 Resultados optimizados: MAE={mae_best:.2f}, R2={r2_best:.3f}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': best_rf.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🔝 Top 10 features más importantes:")
    print(feature_importance.head(10).to_string(index=False))
    
    # Guardar modelo
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    # Guardar como v2 para no sobrescribir el anterior
    joblib.dump(best_rf, os.path.join(model_dir, 'random_forest_v2.pkl'))
    joblib.dump(scaler, os.path.join(model_dir, 'scaler_v2.pkl'))
    joblib.dump(feature_cols, os.path.join(model_dir, 'feature_cols_v2.pkl'))
    
    print(f"\n💾 Modelo guardado en: {model_dir}")
    return best_rf, scaler, feature_cols

if __name__ == "__main__":
    entrenar_modelo()
