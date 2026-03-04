from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Cafe(Base):
    __tablename__ = "cafes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    origen = Column(String, nullable=False)  # Colombia, Etiopía, Brasil, etc.
    tipo = Column(String, nullable=False)    # Arábica, Robusta
    tostado = Column(String, nullable=False) # Claro, Medio, Oscuro
    formato = Column(String, nullable=False) # Grano, Molido, Cápsula
    costo_base = Column(Float, nullable=False)
    descripcion = Column(String)
    imagen_url = Column(String)
    
    # Relación con ventas
    ventas = relationship("Venta", back_populates="cafe", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Cafe {self.nombre} ({self.origen})>"

class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    cafe_id = Column(Integer, ForeignKey("cafes.id"), nullable=False)
    fecha = Column(Date, nullable=False, index=True)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Float, nullable=False)
    canal = Column(String, nullable=False)     # Web, Tienda, Distribuidor
    region = Column(String, nullable=False)    # Norte, Sur, Este, Oeste
    promocion = Column(Boolean, default=False)
    cliente_id = Column(String, nullable=True) # ID anónimo del cliente
    
    # Relación con café
    cafe = relationship("Cafe", back_populates="ventas")

    def __repr__(self):
        return f"<Venta {self.cafe_id} - {self.fecha} - {self.cantidad} unidades>"

class Escenario(Base):
    __tablename__ = "escenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    cambios = Column(JSON, nullable=False)  # Ej: {"cafe_id": nuevo_precio}
    impacto_estimado = Column(Float)
    fecha_creacion = Column(Date, nullable=False)
    usuario = Column(String, default="anonymous")
    
    def __repr__(self):
        return f"<Escenario {self.nombre} - Impacto: {self.impacto_estimado}%>"
