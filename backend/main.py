from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from typing import Optional
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
import crud
import schemas
import json

app = FastAPI()
#Permite la conexión con el frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Abre y cierra una sesiónd e la base de datos antes de cada petición.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#Ruta raiz.
@app.get("/")
def inicio():
    return {
        "mensaje": "API funcionando"
    }

#Endpoint para los filtros que pintan el mapa.
@app.get("/buscar")
def buscar(
    enfermedad: Optional[str] = None,
    anyo: Optional[int] = None,
    comunidad: Optional[str] = None,
    db: Session = Depends(get_db)
): return crud.buscar(db, enfermedad, anyo, comunidad)

#Endpoint que devuelve el listado de las enfermedades de la base de datos.
@app.get("/enfermedades_lista")
def enfermedades_lista(db: Session = Depends(get_db)):
    datos = crud.obtener_enfermedades_lista(db)
    return [fila[0] for fila in datos]

#Endpoint que devuelve la lista de años disponibles.
@app.get("/anyos")
def anyos(db: Session = Depends(get_db)):
    datos = crud.obtener_anyos(db)
    return [fila[0] for fila in datos]

#Obtiene la ruta de la carpeta donde se encuentra main.py
BASE_DIR = Path(__file__).resolve().parent

#Lee los archivos JSON de las tarjetas de las enfermedades y los devuelve.
@app.get("/informacion/{enfermedad}")
def informacion(enfermedad: str):
    carpeta = BASE_DIR / "datos"
    for ruta in carpeta.glob("*.json"):
        try:
            with open(ruta, encoding="utf-8") as f:
                datos = json.load(f)

            if datos.get("nombre", "").strip().lower() == enfermedad.strip().lower():
                return datos
        except (json.JSONDecodeError, OSError):
            continue
    return {"error": "Enfermedad no encontrada"}

#Endpoint que consulta y devuelve los casos por género de una enfermedad y año concretos.
@app.get("/genero/{enfermedad}/{anyo}")
def genero(
    enfermedad: str,
    anyo: int,
    db: Session = Depends(get_db)
): return crud.obtener_genero(db,enfermedad,anyo)

#Endpoint que consulta y devuelve los casos por rango de edad de una enfermedad y año concretos.
@app.get("/edad/{enfermedad}/{anyo}")
def edad(
    enfermedad: str,
    anyo: int,
    db: Session = Depends(get_db)
): return crud.obtener_edad(db,enfermedad,anyo)

#Endpoint que devuelve la tabla completa de enfermedades.
@app.get("/obtener_todo")
def obtener_todo(db: Session = Depends(get_db)):
    return crud.obtener_todo(db)

#Endpoint que recibe los datos del formulario y los guarda en la base de datos.
@app.post("/contacto", response_model=schemas.MensajeRespuesta, status_code=201)
def crear_contacto(mensaje: schemas.MensajeCrear, db: Session = Depends(get_db)):
    return crud.crear_mensaje(db=db, mensaje=mensaje)