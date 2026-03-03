from fastapi import FastAPI

app = FastAPI(
    title="CafeSense API",
    description="API para simulación de elasticidad de precios",
    version="0.1.0"
)

@app.get("/")
async def root():
    return {
        "message": "☕ CafeSense API",
        "status": "funcionando",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
