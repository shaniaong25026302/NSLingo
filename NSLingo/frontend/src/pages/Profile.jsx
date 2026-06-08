import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getModules, getBadges } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { computeBadges } from '../utils/achievements.js'
import Loader from '../components/Loader.jsx'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Profile() {
  const { progress } = useApp()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [modules, setModules] = useState(null)
  const [badges, setBadges] = useState(null)

  useEffect(() => {
    getModules().then(setModules)
    getBadges().then(setBadges)
  }, [])

  if (!progress || !modules || !badges) return <Loader label="Loading profile…" />

  // Unlock state is computed live from the user's progress.
  const computedBadges = computeBadges(badges, progress, modules)

  const maxActivity = Math.max(...progress.weeklyActivity, 1)
  const displayName = user?.name || 'NS Recruit'
  const initial = (user?.name || user?.email || 'R').trim().charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="theme-recruit container-fluid px-0" style={{ maxWidth: 820 }}>
      {/* Header */}
      <div className="ns-pagehead d-flex align-items-center gap-3">
        <div className="ns-avatar" style={{ width: 56, height: 56, fontSize: '1.4rem' }}>{initial}</div>
        <div className="flex-grow-1">
          <h1 className="h3 mb-0">{displayName}</h1>
          <p className="mb-0">{user?.email ? `${user.email} · ` : ''}Goal: {progress.goal} · {progress.readiness}% NS Ready</p>
        </div>
        <button className="btn btn-light btn-sm btn-pill px-3" onClick={handleLogout}>Log Out</button>
      </div>

      {/* Readiness ring + key stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><div className="ns-stat"><div className="ns-stat__value">{progress.readiness}%</div><div className="ns-stat__label">NS Readiness</div></div></div>
        <div className="col-6 col-md-3"><div className="ns-stat"><div className="ns-stat__value">{progress.completedModules.length}/{modules.length}</div><div className="ns-stat__label">Modules Done</div></div></div>
        <div className="col-6 col-md-3"><div className="ns-stat"><div className="ns-stat__value">🔥 {progress.streak}</div><div className="ns-stat__label">Current Streak</div></div></div>
        <div className="col-6 col-md-3"><div className="ns-stat"><div className="ns-stat__value">{progress.perfectScores}</div><div className="ns-stat__label">Perfect Scores</div></div></div>
      </div>

      {/* Weekly activity chart */}
      <div className="ns-card p-3 p-lg-4 mb-4">
        <h2 className="h6 fw-bold mb-3">Weekly Activity (XP)</h2>
        <div className="d-flex align-items-end justify-content-between gap-2" style={{ height: 140 }}>
          {progress.weeklyActivity.map((xp, i) => (
            <div key={i} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: '100%' }}>
              <div className="d-flex align-items-end flex-grow-1 w-100 justify-content-center">
                <div
                  title={`${xp} XP`}
                  style={{
                    width: '70%',
                    height: `${(xp / maxActivity) * 100}%`,
                    minHeight: xp > 0 ? 6 : 2,
                    background: xp > 0 ? 'var(--ns-primary)' : 'var(--ns-border)',
                    borderRadius: 6,
                    transition: 'height 200ms ease',
                  }}
                />
              </div>
              <div className="ns-text-muted small mt-1">{DAYS[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-module progress */}
      <div className="ns-card p-3 p-lg-4 mb-4">
        <h2 className="h6 fw-bold mb-3">Per-Module Progress</h2>
        <div className="d-flex flex-column gap-3">
          {[...modules].sort((a, b) => a.order - b.order).map((m) => {
            const pct = progress.moduleProgress[m.id] ?? 0
            return (
              <div key={m.id}>
                <div className="d-flex justify-content-between small mb-1">
                  <span>{m.icon} {m.title}</span>
                  <span className="ns-text-muted">{pct}%</span>
                </div>
                <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-bar" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements preview */}
      <div className="ns-card p-3 p-lg-4">
        <h2 className="h6 fw-bold mb-3">Achievements</h2>
        <div className="row g-3">
          {computedBadges.map((b) => (
            <div className="col-4 col-md-3 col-lg-2" key={b.id}>
              <div className={`ns-badge-tile h-100 ${b.unlocked ? 'ns-badge-tile--unlocked' : 'ns-badge-tile--locked'}`}>
                <div className="ns-badge-tile__emoji">{b.unlocked ? b.emoji : '🔒'}</div>
                <div className="small fw-semibold mt-1">{b.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
