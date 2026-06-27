import api from "../api/client"
import type { PantryItem, PantryItemCreate } from "../types"

const BASE_PATH = "/pantry_items"

export async function createPantryItem(item: PantryItemCreate) {
  const path = BASE_PATH
  const init = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  }

  const pantryItemRes = await api<PantryItem>(path, init)
  return pantryItemRes
}

export async function getPantryItems() {
  const path = BASE_PATH
  const init = {
    method: "GET",
  }

  const pantryItemsRes = await api<PantryItem[]>(path, init)
  return pantryItemsRes
}

export async function getPantryItem(id: number) {
  const path = BASE_PATH + `/${id}`
  const init = {
    method: "GET",
  }

  const pantryItemRes = await api<PantryItem>(path, init)
  return pantryItemRes
}
