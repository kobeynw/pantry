from fastapi import FastAPI
from app.routers import ingredients

app = FastAPI()

@app.get("/")
def read_root():
  return {"status": "ok"}

app.include_router(ingredients.router)
