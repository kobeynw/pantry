from fastapi import APIRouter
from app.models.ingredient import IngredientCreate, Ingredient, IngredientPublic
from app.db import SessionDep

router = APIRouter(prefix="/ingredients", tags=["ingredients"])

@router.post("", response_model=IngredientPublic)
def create_ingredient(ingredient: IngredientCreate, session: SessionDep):
  db_ingredient = Ingredient.model_validate(ingredient)
  session.add(db_ingredient)
  session.commit()
  session.refresh(db_ingredient)
  return db_ingredient
