import type { components } from "./api"

type Schemas = components["schemas"]

export type Ingredient = Schemas["IngredientPublic"]
export type IngredientCreate = Schemas["IngredientCreate"]
export type PantryItem = Schemas["PantryItemPublic"]
export type PantryItemCreate = Schemas["PantryItemCreate"]
