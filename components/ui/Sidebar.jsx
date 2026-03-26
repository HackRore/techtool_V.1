export default function Sidebar({ children, className = '' }) {
  return (
    <aside className={`w-[220px] flex flex-col gap-5 ${className}`}>
      {children}
    </aside>
  )
}

