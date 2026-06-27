from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ingredients, pantry_items
from os import environ
from dotenv import load_dotenv

load_dotenv()
FRONTEND_ORIGIN = environ["FRONTEND_ORIGIN"].split(",")

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=FRONTEND_ORIGIN,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

@app.get("/")
def read_root():
  return {"status": "ok"}

app.include_router(ingredients.router)
app.include_router(pantry_items.router)