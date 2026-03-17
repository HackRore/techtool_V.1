import { useState } from 'react'

export default function Card({ children, className = '', accent, isOpen, onToggle, clickable = false, variant = 'default' }) {
  const [hovered, setHovered] = useState(false)
  
  const baseClasses = 'bg-white border border-gray-100 rounded-xl shadow-md p-6 overflow-hidden transition-all duration-200 hover:shadow-lg active:shadow-md'
  const clickableClasses = clickable ? 'cursor-pointer hover:bg-gray-50 active:scale-[0.99]' : ''
  const openClasses = isOpen ? 'shadow-xl ring-2 ring-blue-100' : ''

  return (
    <div 
      className={`${baseClasses} ${clickableClasses} ${openClasses} ${className}`}
      onClick={clickable ? onToggle : undefined}
      onMouseEnter={() => clickable && setHovered(true)}
      onMouseLeave={() => clickable && setHovered(false)}
    >
      {children}
    </div>
  )
}

