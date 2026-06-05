import { Link } from 'react-router-dom'

// Centered card shell shared by the Login and Register screens.
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="ns-hero" style={{ minHeight: '100vh' }}>
      <div className="container d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
        <Link to="/" className="ns-brand mb-4" style={{ color: 'var(--ns-primary-dark)', fontSize: '1.8rem' }}>
          NSLingo
        </Link>
        <div className="ns-card p-4 p-lg-5 w-100" style={{ maxWidth: 420 }}>
          <h1 className="h4 ns-section-title mb-1">{title}</h1>
          {subtitle && <p className="ns-text-muted mb-4">{subtitle}</p>}
          {children}
        </div>
        {footer && <div className="mt-3 ns-text-muted">{footer}</div>}
      </div>
    </div>
  )
}
