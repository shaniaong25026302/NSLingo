export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--ns-primary)' }} role="status" aria-hidden />
      <p className="ns-text-muted mt-3 mb-0">{label}</p>
    </div>
  )
}
