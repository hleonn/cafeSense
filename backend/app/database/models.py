from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Cafe(Base):
    __tablename__ = "cafes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    origen = Column(String)
    tipo = Column(String)
    tostado = Column(String)
    formato = Column(String)
    costo_base = Column(Float)
    descripcion = Column(String)
    imagen_url = Column(String)
    
    ventas = relationship("Venta", back_populates="cafe")

class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    cafe_id = Column(Integer, ForeignKey("cafes.id"))
    fecha = Column(Date, nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Float, nullable=False)
    canal = Column(String)
    region = Column(String)
    promocion = Column(Boolean, default=False)
    cliente_id = Column(String)
    
    cafe = relationship("Cafe", back_populates="ventas")

class Escenario(Base):
    __tablename__ = "escenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    cafe_id = Column(Integer, nullable=True)
    cafe_nombre = Column(String, nullable=True)
    precio_original = Column(Float, nullable=True)
    precio_nuevo = Column(Float, nullable=True)
    porcentaje_cambio = Column(Float, nullable=True)
    impacto_lineal = Column(Float, nullable=True)
    impacto_rf = Column(Float, nullable=True)
    recomendacion = Column(String, nullable=True)
    cambios = Column(JSON, nullable=False)
    impacto_estimado = Column(Float)
    fecha_creacion = Column(Date, nullable=False)
    
    def __repr__(self):
        return f"<Escenario {self.nombre} - Impacto: {self.impacto_estimado}%>"
