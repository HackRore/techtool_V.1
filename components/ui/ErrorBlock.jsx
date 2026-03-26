export default function ErrorBlock({ children, className = '' }) {
  return (
    <div className={`font-mono text-[11px] text-red bg-red/5 border border-red/20 p-[10px_14px] rounded-[1px] mb-3 ${className}`}>
      ✗ {children}
    </div>
  )
}

