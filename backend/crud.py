from models import Enfermedad, Mensaje
from sqlalchemy import distinct
import schemas
#Endpoint que selecciona los 3 campos para pintar el mapa, enfermedad, año y comunidad.
def buscar(db, enfermedad=None, anyo=None, comunidad=None):
    consulta = db.query(Enfermedad)
    if enfermedad:
        consulta = consulta.filter(Enfermedad.enfermedad == enfermedad)
    if anyo:
        consulta = consulta.filter(Enfermedad.anyo == anyo)
    if comunidad:
        consulta = consulta.filter(Enfermedad.comunidad == comunidad)

    consulta = consulta.filter((Enfermedad.rango_edad == None) |(Enfermedad.rango_edad == ""))
    return consulta.all()

#Endpoint que devuelve la lista de todas las enfermedades.
def obtener_enfermedades_lista(db):
    return db.query(distinct(Enfermedad.enfermedad)).all()

#Endpoint que devuelve la lista de los años disponibles
def obtener_anyos(db):
    return db.query(distinct(Enfermedad.anyo)).order_by(Enfermedad.anyo).all()

#Endpoint que obtiene el número de casos según su género
def obtener_genero(db, enfermedad, anyo):
    dato = db.query(Enfermedad).filter(  #Solo coge las lineas de la base de datos, donde pone España y el rango de edad es total, para no repetir datos.
        Enfermedad.enfermedad == enfermedad,
        Enfermedad.anyo == anyo,
        Enfermedad.comunidad == "España",
        Enfermedad.rango_edad == "Total"
    ).first()
    if not dato:
        return {"hombres": None,"mujeres": None}

    return {
        "hombres": int(dato.hombres) if dato.hombres not in (None, "") else None,
        "mujeres": int(dato.mujeres) if dato.mujeres not in (None, "") else None
    }

#Endpoint que obtiene el rango de edad más afectado
def obtener_edad(db, enfermedad, anyo):
    datos = db.query(Enfermedad).filter( #Solo selecciona las filas de la base de datos que tengan rango de edad
        Enfermedad.enfermedad == enfermedad,
        Enfermedad.anyo == anyo,
        Enfermedad.comunidad == "España",
        Enfermedad.rango_edad.isnot(None),
        Enfermedad.rango_edad != ""
    ).all()

    resultado = []
    for dato in datos:
        if dato.casos_edad not in (None, ""):
            resultado.append({"rango_edad": dato.rango_edad,"casos": int(dato.casos_edad)})
    return resultado

#Endpoint que obtiene todos los datos de la base de datos para el botón de descargar todo csv.
def obtener_todo(db):
    return db.query(Enfermedad).all()

#Endpoint que obtiene la información de la enferemdad para las tarjetas.
def obtener_informacion_enfermedad(db, nombre):
    return db.query(Enfermedad).filter(Enfermedad.enfermedad == nombre).first()

#Crea el mensaje del formulario de la pa´gina contacto para guardarlo en la tabla de mensajes en la base de datos
def crear_mensaje(db, mensaje: schemas.MensajeCrear):
    nuevo_mensaje = Mensaje(
        nombre=mensaje.nombre,
        email=mensaje.email,
        asunto=mensaje.asunto,
        mensaje=mensaje.mensaje
    )
    db.add(nuevo_mensaje)
    db.commit()
    db.refresh(nuevo_mensaje)
    return nuevo_mensaje