import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getModules } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'
import Loader from '../components/Loader.jsx'

export default function Dashboard() {
  const { progress, isModuleUnlocked } = useApp()
  const [modules, setModules] = useState(null)

  useEffect(() => { getModules().then(setModules) }, [])

  if (!modules || !progress) return <Loader label="Loading your learning path…" />

  const ordered = [...modules].sort((a, b) => a.order - b.order)

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 900 }}>
      <div className="ns-pagehead">
        <h1 className="h3">Learning Path</h1>
        <p>Clear each module to unlock the next. {progress.readiness}% NS Ready — keep going!</p>
      </div>

      {/* Quick stats */}
      <div className="row g-3 mb-4">
        <div className="col-4"><div className="ns-stat"><div className="ns-stat__value">{progress.totalXp}</div><div className="ns-stat__label">Total XP</div></div></div>
        <div className="col-4"><div className="ns-stat"><div className="ns-stat__value">🔥 {progress.streak}</div><div className="ns-stat__label">Day Streak</div></div></div>
        <div className="col-4"><div className="ns-stat"><div className="ns-stat__value">{progress.completedModules.length}/{modules.length}</div><div className="ns-stat__label">Modules Done</div></div></div>
      </div>

      {/* Module path */}
      <div className="d-flex flex-column gap-3">
        {ordered.map((m) => {
          const unlocked = isModuleUnlocked(m.id)
          const pct = progress.moduleProgress[m.id] ?? 0
          const done = pct === 100
          // Jump to the first lesson the user hasn't finished yet, so modules progress past lesson 1.
          const nextLesson = m.lessons.find((l) => !(progress.completedLessons || []).includes(l.id)) || m.lessons[0]

          const inner = (
            <div className={`ns-card ns-module ${unlocked ? 'ns-card--interactive' : 'ns-module--locked'}`}>
              <div className="ns-module__icon">{unlocked ? m.icon : '🔒'}</div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="fw-bold">{m.order}. {m.title}</span>
                  {done && <span className="ns-tag">✓ Complete</span>}
                  {!unlocked && <span className="ns-tag ns-tag--muted">Locked</span>}
                </div>
                <div className="ns-text-muted small mb-2">{m.blurb}</div>
                <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-bar" style={{ width: `${pct}%` }} />
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <span className="ns-text-muted small">{m.lessons.length} lessons</span>
                  <span className="ns-tag ns-tag--amber">+{m.xp} XP</span>
                </div>
              </div>
            </div>
          )

          return unlocked ? (
            <Link key={m.id} to={`/lesson/${m.id}/${nextLesson.id}`} className="text-reset text-decoration-none">
              {inner}
            </Link>
          ) : (
            <div key={m.id} title="Complete the previous module to unlock">{inner}</div>
          )
        })}
      </div>
    </div>
  )
}
