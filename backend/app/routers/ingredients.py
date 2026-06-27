from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from app.models.ingredient import IngredientCreate, Ingredient, IngredientPublic
from app.db import SessionDep

router = APIRouter(prefix="/ingredients", tags=["ingredients"])

@router.post("", response_model=IngredientPublic)
def create_ingredient(ingredient: IngredientCreate, session: SessionDep):
  db_ingredient = Ingredient.model_validate(ingredient)
  session.add(db_ingredient)
  try:
    session.commit()
  except IntegrityError:
    session.rollback()
    raise HTTPException(status_code=409, detail="Ingredient name already exists")
  session.refresh(db_ingredient)

  return db_ingredient

@router.get("", response_model=list[IngredientPublic])
def get_ingredients(session: SessionDep):
  statement = select(Ingredient)
  ingredients = session.exec(statement).all()

  return ingredients
