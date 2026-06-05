import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container text-center py-5">
      <div style={{ fontSize: '4rem' }}>🪖</div>
      <h1 className="ns-section-title">Page not found</h1>
      <p className="ns-text-muted">Looks like you marched to the wrong parade square.</p>
      <Link to="/" className="btn btn-primary px-4">Back to Base</Link>
    </div>
  )
}
