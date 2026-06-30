import type { Department, IngredientCreate, MeasurementType, PantryItemCreate } from "../types";
import { CANONICAL_COUNT, CANONICAL_VOLUME, CANONICAL_WEIGHT, isVolumeUnit, isWeightUnit, parseQuantity, toCanonical, type VolumeUnit, type WeightUnit } from "./unitConverter";

export function ingredientCreateAdapter(item: string, unit: string, department: string): IngredientCreate {
  let measurement_type: MeasurementType = "count"
  let default_unit: string = CANONICAL_COUNT

  if (isWeightUnit(unit)) {
    measurement_type = "weight"
    default_unit = CANONICAL_WEIGHT
  } else if (isVolumeUnit(unit)) {
    measurement_type = "volume"
    default_unit = CANONICAL_VOLUME
  }

  return {
    name: item,
    measurement_type: measurement_type,
    default_unit: default_unit,
    department: department as Department,
  }
}

export function pantryItemCreateAdapter(amount: string, unit: string, ingredient_id: number): PantryItemCreate {
  const quantity = parseQuantity(amount)
  if (!quantity) {
    // TODO: throw proper error
    throw Error("Invalid amount")
  }
  const quantity_canonical = toCanonical(quantity, unit as WeightUnit | VolumeUnit)
  
  return {
    quantity_canonical: quantity_canonical,
    display_unit: unit,
    ingredient_id: ingredient_id,
  }
}