import { useLocation, useNavigate, Link } from 'react-router-dom'

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // Guard against landing here directly with no quiz state.
  if (!state) {
    return (
      <div className="text-center py-5">
        <p className="ns-text-muted">No results to show.</p>
        <Link to="/learn" className="btn btn-primary">Back to Learning Path</Link>
      </div>
    )
  }

  const { moduleId, moduleTitle, score, total, xp } = state
  const backTo = moduleId ? `/module/${moduleId}` : '/learn'
  const pct = Math.round((score / total) * 100)
  const stars = pct === 100 ? 3 : pct >= 67 ? 2 : pct >= 34 ? 1 : 0

  const badge =
    pct === 100 ? { emoji: '🏅', label: 'Perfect Score!' }
    : pct >= 67 ? { emoji: '🎖️', label: 'Well Done!' }
    : { emoji: '💪', label: 'Keep Training!' }

  return (
    <div className="container-fluid px-0 text-center" style={{ maxWidth: 560 }}>
      <div className="ns-card p-4 p-lg-5">
        <div style={{ fontSize: '3.5rem' }}>{badge.emoji}</div>
        <h1 className="ns-section-title mt-2 mb-1">{badge.label}</h1>
        <p className="ns-text-muted mb-4">{moduleTitle} quiz complete</p>

        <div className="ns-stars mb-3">
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ opacity: i < stars ? 1 : 0.25 }}>⭐</span>
          ))}
        </div>

        <div className="row g-3 mb-4">
          <div className="col-4"><div className="ns-stat"><div className="ns-stat__value">{score}/{total}</div><div className="ns-stat__label">Score</div></div></div>
          <div className="col-4"><div className="ns-stat"><div className="ns-stat__value">{pct}%</div><div className="ns-stat__label">Correct</div></div></div>
          <div className="col-4"><div className="ns-stat"><div className="ns-stat__value">+{xp}</div><div className="ns-stat__label">XP Earned</div></div></div>
        </div>

        <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
          <button className="btn btn-outline-primary px-4" onClick={() => navigate(-1)}>Retry Quiz</button>
          <Link to={backTo} className="btn btn-primary px-4">Continue Learning</Link>
        </div>
      </div>
    </div>
  )
}
