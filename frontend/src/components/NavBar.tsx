import { Apple, BookOpen, ShoppingCart, History } from 'lucide-react'

export default function NavBar() {
  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t-2 border-base-300 pb-[env(safe-area-inset-bottom)]'>
      <div className='flex flex-row justify-between px-12 py-4 items-center'>
        <div className='flex flex-col items-center'>
          <Apple />
          <div>Pantry</div>
        </div>
        <div className='flex flex-col items-center'>
          <BookOpen />
          <div>Recipes</div>
        </div>
        <div className='flex flex-col items-center'>
          <ShoppingCart />
          <div>Shopping</div>
        </div>
        <div className='flex flex-col items-center'>
          <History />
          <div>History</div>
        </div>
      </div>
    </div>
  )
}
