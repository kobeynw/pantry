from sqlmodel import SQLModel, Field, Column, Relationship
from sqlmodel import Enum as SAEnum
from enum import Enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from app.models.pantry_item import PantryItem

class MeasurementType(str, Enum):
  WEIGHT = "weight"
  VOLUME = "volume"
  COUNT = "count"

class Department(str, Enum):
  PRODUCE = "produce"
  MEAT = "meat"
  DAIRY_EGGS = "dairy/eggs"
  BAKERY = "bakery"
  FROZEN = "frozen"
  CANNED = "canned"
  BAKING = "baking"
  SNACKS = "snacks"
  BEVERAGES = "beverages"
  OTHER = "other"

# Base class that the sqlite table class, endpoint request class, and endpoint response class inherit from
class IngredientBase(SQLModel):
  name: str = Field(unique=True, index=True)
  measurement_type: MeasurementType
  default_unit: str
  department: Department

# sqlite table model
class Ingredient(IngredientBase, table=True):
  id: int | None = Field(default=None, primary_key=True)
  measurement_type: MeasurementType = Field(
    sa_column=Column(
      SAEnum(MeasurementType, values_callable=lambda e: [m.value for m in e]),
      nullable=False
    )
  )
  department: Department = Field(
    sa_column=Column(
      SAEnum(Department, values_callable=lambda e: [m.value for m in e]),
      nullable=False
    )
  )
  pantry_items: list["PantryItem"] = Relationship(back_populates="ingredient")

# Endpoint request model
class IngredientCreate(IngredientBase):
  pass

class IngredientPublic(IngredientBase):
  id: int
