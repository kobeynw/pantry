import api from "../api/client"
import type { Ingredient, IngredientCreate } from "../types"

const BASE_PATH = "/ingredients"

export async function createIngredient(ingredient: IngredientCreate) {
  const path = BASE_PATH
  const init = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ingredient),
  }

  const ingredientRes = await api<Ingredient>(path, init)
  return ingredientRes
}

export async function getIngredients() {
  const path = BASE_PATH
  const init = {
    method: "GET",
  }

  const ingredientsRes = await api<Ingredient[]>(path, init)
  return ingredientsRes
}
