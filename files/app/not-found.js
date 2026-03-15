import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 80, fontWeight: 700, color: 'var(--surface-4)', lineHeight: 1, marginBottom: 8 }}>404</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '2px', marginBottom: 20 }}>SIGNAL LOST</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Page not found</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 36, maxWidth: 360, lineHeight: 1.7 }}>
        The page you're looking for doesn't exist. Head back to the workbench.
      </div>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <button className="btn-amber" style={{ padding: '10px 28px' }}>← RETURN TO HOME</button>
      </Link>
    </div>
  )
}
