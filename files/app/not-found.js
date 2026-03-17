import Link from 'next/link'
import Sidebar from '../components/Sidebar'

export default function NotFound() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 80, fontWeight: 800, color: 'var(--border)', lineHeight: 1, marginBottom: 8 }}>404</div>
          <h2 style={{ marginBottom: 8 }}>Page not found</h2>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.7 }}>
            The page you are looking for does not exist.
          </p>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">Return to Dashboard</button>
          </Link>
        </div>
      </main>
    </div>
  )
}
