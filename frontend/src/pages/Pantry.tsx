import Header from '../components/Header'
import { Plus, Search, LeafyGreen, Beef, EggFried, Croissant, IceCreamCone, Cylinder, ChefHat, Popcorn, CupSoda, Utensils, type LucideIcon } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react';
import { createPantryItem, getPantryItems } from '../api/pantryItems';
import type { IngredientCreate, PantryItem, PantryItemCreate } from "../types"
import { formatQuantity, fromCanonical, type VolumeUnit, type WeightUnit } from '../utils/unitConverter';
import Modal from '../components/Modal';
import { ingredientCreateAdapter, pantryItemCreateAdapter } from '../utils/modelAdapter';
import { createIngredient } from '../api/ingredients';

const DEPARTMENT_ICON_MAP: Record<string, LucideIcon> = {
  "produce": LeafyGreen,
  "meat": Beef,
  "dairy/eggs": EggFried,
  "bakery": Croissant,
  "frozen": IceCreamCone,
  "canned": Cylinder,
  "baking": ChefHat,
  "snacks": Popcorn,
  "beverages": CupSoda,
  "other": Utensils
}

interface Item {
  item: string;
  quantity: number;
  unit: string;
}

interface PantryDataItem {
  department: string;
  items: Item[];
}

interface PantryRowProps extends Item {
  department: string;
}

export function PantryRow({ item, quantity, unit, department }: PantryRowProps) {
  const Icon = DEPARTMENT_ICON_MAP[department]

  return (
    <div className='flex flex-row items-center justify-between border-b border-base-300'>
      <div className='flex flex-row items-center gap-4'>
        <div className='rounded-xl p-2 bg-accent-content'>{Icon && <Icon />}</div>
        <div className='py-4 text-2xl'>{item}</div>
      </div>
      <div className='flex flex-row items-center gap-4 text-xl opacity-50'>
        <div>{formatQuantity(quantity, unit as WeightUnit | VolumeUnit)}</div>
        <div>{unit}</div>
      </div>
    </div>
  )
}

interface PantryDepartmentProps extends PantryDataItem {}

export function PantryDepartment({ department, items }: PantryDepartmentProps) {
  return (
    <div className='px-8 py-4'>
      <div className='text-md opacity-50'>{department.toUpperCase()}</div>
      {items.map((i, idx) => (
        <PantryRow key={idx} item={i.item} quantity={i.quantity} unit={i.unit} department={department} />
      ))}
    </div>
  )
}

const convertResponseToData = (res: PantryItem[]) => {
  const groupedData = res.reduce<Record<string, Item[]>>((acc, item) => {
    const department = item.ingredient.department
    const quantity_display = fromCanonical(item.quantity_canonical, item.display_unit as WeightUnit | VolumeUnit)
    if (!acc[department]) acc[department] = []

    acc[department].push({
      item: item.ingredient.name,
      quantity: quantity_display,
      unit: item.display_unit
    })
    return acc
  }, {})

  const pantryData = Object.entries(groupedData).map(([department, items]) => ({
    department,
    items
  }))
  return pantryData
}

export default function Pantry() {
  const [pantryData, setPantryData] = useState<PantryDataItem[]>([])
  const [isModalOpen, setisModalOpen] = useState(false)

  const [item, setItem] = useState("")
  const [amount, setAmount] = useState("")
  const [unit, setUnit] = useState("")
  const [department, setDepartment] = useState("")

  const getItems = useCallback(async () => {
    try {
      const res = await getPantryItems()
      const data = convertResponseToData(res)
      setPantryData(data)
    }
    catch (e) {
      console.error(e)
      // TODO: handle error state
    }
  }, [])

  useEffect(() => {
    getItems()
  }, [getItems])

  const resetState = () => {
    setisModalOpen(false)
    setItem("")
    setAmount("")
    setUnit("")
    setDepartment("")
  }

  const handleAddItem = async () => {
    let ingredient_id = null
    try {
      const ingredient: IngredientCreate = ingredientCreateAdapter(item, unit, department)
      const ingredientRes = await createIngredient(ingredient)
      ingredient_id = ingredientRes.id
    } catch (e) {
      // TODO: handle failed ingredient creation
      console.error(e)
    }

    if (!ingredient_id) {
      // TODO: handle null ingredient_id
      console.error("null ingredient_id")
      return
    }

    try {
      const pantryItem: PantryItemCreate = pantryItemCreateAdapter(amount, unit, ingredient_id)
      await createPantryItem(pantryItem)

      await getItems()
      resetState()
    } catch (e) {
      // TODO: handle failed pantry item creation - need to delete ingredient?
      console.error(e)
    }
  }

  return (
    <>
      <Header leftIcon={null} leftAction={null} title='My Pantry' rightIcon={Plus} rightAction={() => setisModalOpen(true)} />

      {/* TODO: Add search functionality */}
      <div className='flex flex-col items-center py-8'>
        <label className="input">
          <Search />
          <input type="search" className="grow" placeholder="Search" />
        </label>
      </div>

      {pantryData.map((dep, idx) => (
        <PantryDepartment key={idx} department={dep.department} items={dep.items} />
      ))}

      <Modal isOpen={isModalOpen} onClose={() => setisModalOpen(false)} onSubmit={handleAddItem} title='Add Pantry Item'>
        <div className="py-4">
          <div className='text-lg'>Item</div>
          <input
            type="text"
            placeholder="Flour"
            className="input"
            value={item}
            onChange={(e) => {setItem(e.target.value)}}
          />
        </div>
        <div className="py-4">
          <div className='text-lg'>Amount</div>
          <input
            type="text"
            placeholder="3 1/2"
            className="input"
            value={amount}
            onChange={(e) => {setAmount(e.target.value)}}
          />
        </div>
        {/* TODO: Make unit a dropdown with all viable weights/volumes, defaulting to count (no unit) */}
        <div className="py-4">
          <div className='text-lg'>Unit</div>
          <input
            type="text"
            placeholder="cup"
            className="input"
            value={unit}
            onChange={(e) => {setUnit(e.target.value)}}
          />
        </div>
        {/* TODO: Make department a dropdown with all viable departments, defaulting to other */}
        <div className="py-4">
          <div className='text-lg'>Department</div>
          <input
            type="text"
            placeholder="Baking"
            className="input"
            value={department}
            onChange={(e) => {setDepartment(e.target.value)}}
          />
        </div>
      </Modal>
    </>
  )
}
