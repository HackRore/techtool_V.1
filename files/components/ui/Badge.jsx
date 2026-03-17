export default function Badge({ val, cls, className = '' }) {
  if (!val) return null
  
  const clsMap = {
    pass: 'bg-green-100 text-green-800',
    fail: 'bg-red-100 text-red-800',
    warn: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    idle: 'bg-gray-100 text-gray-600',
  }
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium uppercase px-3 py-1 rounded-full ${clsMap[cls] || clsMap.idle} ${className}`}>
      {val}
    </span>
  )
}

