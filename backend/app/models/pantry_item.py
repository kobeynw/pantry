from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING
from app.models.ingredient import IngredientPublic

if TYPE_CHECKING:
  from app.models.ingredient import Ingredient

class PantryItemBase(SQLModel):
  quantity_canonical: float
  display_unit: str
  ingredient_id: int = Field(foreign_key="ingredient.id", index=True)

class PantryItem(PantryItemBase, table=True):
  __tablename__: str = "pantry_item"  # pyright: ignore[reportIncompatibleVariableOverride]
  id: int | None = Field(default=None, primary_key=True)
  ingredient: "Ingredient" = Relationship(back_populates="pantry_items")

class PantryItemCreate(PantryItemBase):
  pass

class PantryItemPublic(PantryItemBase):
  id: int
  ingredient: IngredientPublic
