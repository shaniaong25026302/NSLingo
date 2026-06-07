import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getModules } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'
import Loader from '../components/Loader.jsx'

export default function ModuleOverview() {
  const { moduleId } = useParams()
  const { progress, isModuleUnlocked } = useApp()
  const [modules, setModules] = useState(null)

  useEffect(() => { getModules().then(setModules) }, [])

  if (!modules || !progress) return <Loader label="Loading module…" />

  const module = modules.find((m) => m.id === moduleId)
  if (!module) {
    return (
      <div className="text-center py-5">
        <p className="ns-text-muted">Module not found.</p>
        <Link to="/dashboard" className="btn btn-primary">Back to Learning Path</Link>
      </div>
    )
  }

  // Safety net: if reached while still locked, send them back.
  if (!isModuleUnlocked(moduleId)) {
    return (
      <div className="text-center py-5">
        <p className="ns-text-muted">🔒 Finish the previous module to unlock {module.title}.</p>
        <Link to="/dashboard" className="btn btn-primary">Back to Learning Path</Link>
      </div>
    )
  }

  const completed = progress.completedLessons || []
  const doneCount = module.lessons.filter((l) => completed.includes(l.id)).length
  const pct = Math.round((doneCount / module.lessons.length) * 100)
  const allDone = doneCount === module.lessons.length

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 760 }}>
      <Link to="/dashboard" className="ns-text-muted small d-inline-block mb-3">← Learning Path</Link>

      <div className="ns-pagehead">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <h1 className="h3 mb-0">{module.icon} {module.title}</h1>
          {allDone && <span className="ns-tag">✓ Complete</span>}
        </div>
        <p className="mb-0">{module.blurb}</p>
      </div>

      {/* Module progress */}
      <div className="ns-card p-3 mb-4">
        <div className="d-flex justify-content-between mb-1">
          <span className="ns-text-muted small">{doneCount} of {module.lessons.length} lessons done</span>
          <span className="ns-tag ns-tag--amber">+{module.xp} XP</span>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Lesson list */}
      <div className="d-flex flex-column gap-2 mb-4">
        {module.lessons.map((l, i) => {
          const isDone = completed.includes(l.id)
          return (
            <Link key={l.id} to={`/lesson/${module.id}/${l.id}`} className="text-reset text-decoration-none">
              <div className="ns-card ns-card--interactive d-flex align-items-center gap-3 p-3">
                <div className="ns-module__icon">{isDone ? '✅' : i + 1}</div>
                <div className="flex-grow-1">
                  <div className="fw-bold">{l.title}</div>
                  <div className="ns-text-muted small">{l.cards.length} terms · +{l.xp} XP</div>
                </div>
                <span className={`ns-tag ${isDone ? '' : 'ns-tag--muted'}`}>
                  {isDone ? 'Review' : 'Start'}
                </span>
              </div>
            </Link>
          )
        })}

        {/* Quiz */}
        <Link to={`/quiz/${module.id}`} className="text-reset text-decoration-none">
          <div className="ns-card ns-card--interactive d-flex align-items-center gap-3 p-3">
            <div className="ns-module__icon">🎯</div>
            <div className="flex-grow-1">
              <div className="fw-bold">Practice Quiz</div>
              <div className="ns-text-muted small">Test what you've learned</div>
            </div>
            <span className="ns-tag ns-tag--amber">Quiz</span>
          </div>
        </Link>
      </div>

      {module.lessons[0]?.proTip && (
        <div className="ns-feedback--correct">
          💡 <strong>Pro tip:</strong> {module.lessons[0].proTip}
        </div>
      )}
    </div>
  )
}
