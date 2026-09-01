from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, String, DECIMAL, Text, DateTime
from sqlalchemy.sql import func

#Clase génerica base.
class Base(DeclarativeBase):
    pass

#Tabla enfermedades con todos sus campos y sus tipos.
class Enfermedad(Base):
    __tablename__ = "enfermedades"

    id = Column("id", Integer, primary_key=True, index=True)
    enfermedad = Column("Enfermedad", String(150))
    anyo = Column("Año", Integer)
    comunidad = Column("Comunidad", String(100))
    casos = Column("Casos", Integer)
    tasa_notificacion = Column("Tasa notificacion", DECIMAL(10, 3))
    hombres = Column("Hombres", String(20))
    mujeres = Column("Mujeres", String(20))
    rango_edad = Column("Rango edad", String(100))
    casos_edad = Column("Casos edad", String(20))

#Tabla mensajes con todos sus campos y sus tipos.
class Mensaje(Base):
    __tablename__ = "mensajes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)
    asunto = Column(String(200), nullable=False)
    mensaje = Column(Text, nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())