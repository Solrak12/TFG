from pydantic import BaseModel, EmailStr
from datetime import datetime

#Validar los datos que entran y salen de la API.
class Enfermedad(BaseModel):
    id: int
    enfermedad: str
    anyo: int
    comunidad: str
    casos: int
    tasa_notificacion: float | None = None #None por si en la base de datos no tiene nada y se ponga por defecto.
    hombres: int | None = None
    mujeres: int | None = None
    rango_edad: str | None = None
    casos_edad: int | None = None
    class Config: #Permite transformar el objeto SQLAlchemy en un JSON de respuesta.
        from_attributes = True

#Define cuando un usuario envia un mensaje con el formulario.
class MensajeCrear(BaseModel):
    nombre: str
    email: EmailStr
    asunto: str
    mensaje: str

#Una vez creado el mensaje se añade el id y la hora en la que fue creado.
class MensajeRespuesta(MensajeCrear):
    id: int
    fecha: datetime
    class Config:
        from_attributes = True