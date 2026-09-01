from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

#Conecta la API con la base de datos usando SQLAlchemy
DATABASE_URL = "mysql+pymysql://root:@localhost/enfermedades_emergentes"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)