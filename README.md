# ☕ CafeSense
Simulador de elasticidad de precios para café con modelo ML-Random Forest

✅Backend (Python)✅
Backend (FastAPI + PostgreSQL + ML)

Framework:
  - FastAPI: API REST asíncrona con documentación automática Swagger
  - Uvicorn: Servidor ASGI de alto rendimiento

Base de Datos:
  - PostgreSQL 16: Base de datos relacional
  - SQLAlchemy 2.0: ORM para modelos y consultas
  - Psycopg2-binary: Driver de PostgreSQL

Machine Learning:
  - Scikit-learn: RandomForestRegressor, GridSearchCV
  - Pandas: Manipulación y análisis de datos
  - NumPy: Operaciones matemáticas y arrays
  - Joblib: Persistencia de modelos entrenados

Modelos Implementados:
  - Lineal: Regresión log-log para elasticidad interpretable
  - Random Forest: Modelo multi-variable con feature importance

✅Frontend (React + TypeScript)✅
Core:
  - React 19: Biblioteca UI con hooks
  - TypeScript 5.9: Tipado estático
  - Vite 7: Build tool y servidor de desarrollo

UI y Estilos:
  - Tailwind CSS v4: Framework CSS utility-first
  - Headless UI: Componentes accesibles sin estilos
  - Heroicons: Iconos SVG personalizables
  - Recharts: Gráficos Reactivos

Estado y Peticiones:
  - Axios: Cliente HTTP para API calls
  - React Hooks: useState, useEffect, custom hooks
  - Context API (planeado): Estado global

Estructura de Componentes:
  - Common: Button, Card, Select (reutilizables)
  - Features: CafeSelector, PriceSlider (específicos)
  - Layout: MainLayout (estructura general)
    
✅DevOps e Infraestructura✅
Contenedores:
  - Docker: Contenedorización del backend
  - Docker Compose: Orquestación multi-contenedor
  - Colima: Runtime de contenedores en macOS

Base de Datos:
  - PostgreSQL local (desarrollo)
  - Host.docker.internal: Conexión contenedor-local

Versionado:
  - Git: Control de versiones
  - GitHub: Repositorio remoto
  - Conventional Commits: Mensajes descriptivos

✅ API REST con múltiples endpoints

✅ Modelo lineal interpretable (/simular)

✅ Modelo Random Forest preciso (/simular-rf)

✅ Base de datos con 8 cafés y 8799 ventas

Frontend (React + TypeScript + Tailwind)
✅ Dashboard responsivo con grid layout

✅ Selector de cafés con información detallada

✅ Slider interactivo para ajustar precio

✅ Comparación visual entre modelos

✅ KPIs y tabla de resultados

✅ Conexión con backend via proxy
