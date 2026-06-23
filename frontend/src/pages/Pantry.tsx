import Header from '../components/Header'
import { Plus, Search, LeafyGreen, Beef, EggFried, Croissant, IceCreamCone, Cylinder, ChefHat, Popcorn, CupSoda, Utensils, type LucideIcon } from 'lucide-react'

const DEPARTMENT_ICON_MAP: Record<string, LucideIcon> = {
  "Produce": LeafyGreen,
  "Meat": Beef,
  "Dairy/Eggs": EggFried,
  "Bakery": Croissant,
  "Frozen": IceCreamCone,
  "Canned": Cylinder,
  "Baking": ChefHat,
  "Snacks": Popcorn,
  "Beverages": CupSoda,
  "Other": Utensils
}

interface Item {
  item: string;
  quantity: number;
  unit: string;
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
      <div className='flex flex-row items-center gap-4 text-lg opacity-50'>
        <div>{quantity}</div>
        <div>{unit}</div>
      </div>
    </div>
  )
}

interface PantryDepartmentProps {
  department: string;
  items: Item[];
}

export function PantryDepartment({ department, items }: PantryDepartmentProps) {
  return (
    <div className='px-8 py-4'>
      <div className='text-xl opacity-50'>{department}</div>
      {items.map((i, idx) => (
        <PantryRow key={idx} item={i.item} quantity={i.quantity} unit={i.unit} department={department} />
      ))}
    </div>
  )
}

export default function Pantry() {
  const pantryData = {
    data: [
      {
        department: "Produce",
        items: [
          {
            item: "Apples",
            quantity: 2,
            unit: "count"
          },
          {
            item: "Carrots",
            quantity: 5,
            unit: "count"
          }
        ]
      },
      {
        department: "Meat",
        items: [
          {
            item: "Chicken Breast",
            quantity: 2,
            unit: "count"
          }
        ]
      },
      {
        department: "Dairy/Eggs",
        items: [
          {
            item: "Milk",
            quantity: 2,
            unit: "gal"
          }
        ]
      },
      {
        department: "Bakery",
        items: [
          {
            item: "French Bread",
            quantity: 3,
            unit: "loaves"
          }
        ]
      }
    ]
  }

  return (
    <>
      <Header leftIcon={null} leftAction={null} title='My Pantry' rightIcon={Plus} rightAction={() => {}} />

      <div className='flex flex-col items-center py-8'>
        <label className="input">
          <Search />
          <input type="search" className="grow" placeholder="Search" />
        </label>
      </div>

      {pantryData.data.map((dep, idx) => (
        <PantryDepartment key={idx} department={dep.department} items={dep.items} />
      ))}
    </>
  )
}
