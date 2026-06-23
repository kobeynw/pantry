import { type LucideIcon } from 'lucide-react'

interface HeaderProps {
  title: string
  leftIcon: LucideIcon | null
  leftAction: (() => void) | null
  rightIcon: LucideIcon | null
  rightAction: (() => void) | null
}

export default function Header({ title, leftIcon: LeftIcon, leftAction, rightIcon: RightIcon, rightAction }: HeaderProps) {
  return (
    <div className='flex flex-row justify-between px-12 py-8 items-center border-b-2 border-base-300'>
      {!!LeftIcon && !!leftAction && (
        <div>
          <button
            className='btn btn-circle btn-accent'
            onClick={leftAction}
          >
            <LeftIcon />
          </button>
        </div>
      )}

      <div className='text-content text-3xl'>
        {title}
      </div>

      <div>
        {!!RightIcon && !!rightAction && (
          <button
            className='btn btn-circle btn-accent'
            onClick={rightAction}
          >
            <RightIcon />
          </button>
        )}
      </div>
    </div>
  )
}
