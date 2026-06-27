from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.models.pantry_item import PantryItemCreate, PantryItem, PantryItemPublic
from app.models.ingredient import Ingredient
from app.db import SessionDep

router = APIRouter(prefix="/pantry_items", tags=["pantry_item"])

@router.post("", response_model=PantryItemPublic)
def create_pantry_item(pantry_item: PantryItemCreate, session: SessionDep):
  ingredient = session.get(Ingredient, pantry_item.ingredient_id)
  if ingredient is None:
    raise HTTPException(status_code=400, detail="Invalid ingredient_id value")
  
  db_pantry_item = PantryItem.model_validate(pantry_item)
  session.add(db_pantry_item)
  session.commit()
  session.refresh(db_pantry_item)

  return db_pantry_item

@router.get("", response_model=list[PantryItemPublic])
def get_pantry_items(session: SessionDep):
  statement = select(PantryItem)
  pantry_items = session.exec(statement).all()

  return pantry_items

@router.get("/{id}", response_model=PantryItemPublic)
def get_pantry_item(id: int, session: SessionDep):
  pantry_item = session.get(PantryItem, id)
  if pantry_item is None:
    raise HTTPException(status_code=404, detail="Pantry item not found")

  return pantry_item
