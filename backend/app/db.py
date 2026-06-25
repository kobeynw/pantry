from sqlmodel import create_engine, Session
from sqlalchemy import event
from dotenv import load_dotenv
from os import environ
from typing import Annotated
from fastapi import Depends

load_dotenv()
DATABASE_URL = environ["DATABASE_URL"]

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Enable WAL mode to allow read and write concurrently
# Enable foreign keys on every connection (sqlite requires this to use foreign keys)
@event.listens_for(engine, "connect")
def set_pragmas(dbapi_conn, conn_record):
  cursor = dbapi_conn.cursor()
  cursor.execute("PRAGMA journal_mode=WAL")
  cursor.execute("PRAGMA foreign_keys=ON")
  cursor.close()

def get_session():
  with Session(engine) as session:
    yield session

SessionDep = Annotated[Session, Depends(get_session)]
