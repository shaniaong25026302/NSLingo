import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'

export default function Home() {
  const { progress, modules, isModuleUnlocked } = useApp()
  const { user } = useAuth()

  if (!progress || modules.length === 0) return <Loader label="Loading your home…" />

  const ordered = [...modules].sort((a, b) => a.order - b.order)
  const completed = progress.completedModules || []
  const allDone = ordered.every((m) => completed.includes(m.id))
  // Next module to work on: the first unlocked one that isn't finished yet.
  const current = ordered.find(
    (m) => isModuleUnlocked(m.id) && (progress.moduleProgress[m.id] ?? 0) < 100
  )

  const name = user?.name || 'recruit'

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 900 }}>
      <div className="ns-pagehead">
        <h1 className="h3">Welcome back, {name} 👋</h1>
        <p>
          {allDone
            ? "You've cleared every module — solid effort, soldier."
            : `You're ${progress.readiness}% NS ready. Let's keep going.`}
        </p>
      </div>

      {/* Continue / hero card */}
      <div className="ns-card p-4 mb-4">
        {allDone ? (
          <>
            <div className="fw-bold fs-5 mb-1">🎉 All modules complete</div>
            <p className="ns-text-muted mb-3">Sharpen up by revisiting a module or testing yourself in the glossary.</p>
            <Link to="/learn" className="btn btn-primary px-4">Review the Learning Path</Link>
          </>
        ) : current ? (
          <>
            <div className="ns-text-muted small mb-2">Continue where you left off</div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="ns-module__icon">{current.icon}</div>
              <div>
                <div className="fw-bold fs-5">{current.order}. {current.title}</div>
                <div className="ns-text-muted small">{current.blurb}</div>
              </div>
            </div>
            <Link to={`/module/${current.id}`} className="btn btn-primary px-4">Continue →</Link>
          </>
        ) : (
          <>
            <div className="fw-bold fs-5 mb-1">Ready to start?</div>
            <p className="ns-text-muted mb-3">Jump into your learning path and clear your first module.</p>
            <Link to="/learn" className="btn btn-primary px-4">Start Learning →</Link>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-4"><div className="ns-stat"><div className="ns-stat__value">{progress.totalXp}</div><div className="ns-stat__label">Total XP</div></div></div>
        <div className="col-4"><div className="ns-stat"><div className="ns-stat__value">🔥 {progress.streak}</div><div className="ns-stat__label">Day Streak</div></div></div>
        <div className="col-4"><div className="ns-stat"><div className="ns-stat__value">{progress.readiness}%</div><div className="ns-stat__label">NS Readiness</div></div></div>
      </div>

      {/* Quick links */}
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <Link to="/learn" className="text-reset text-decoration-none">
            <div className="ns-card ns-card--interactive p-3 h-100">
              <div className="fw-bold">📘 Learning Path</div>
              <div className="ns-text-muted small">Work through the modules.</div>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-4">
          <Link to="/translator" className="text-reset text-decoration-none">
            <div className="ns-card ns-card--interactive p-3 h-100">
              <div className="fw-bold">🌐 Translator</div>
              <div className="ns-text-muted small">Decode NS slang into plain English.</div>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-4">
          <Link to="/glossary" className="text-reset text-decoration-none">
            <div className="ns-card ns-card--interactive p-3 h-100">
              <div className="fw-bold">📖 Glossary</div>
              <div className="ns-text-muted small">Look up any term, A–Z.</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
