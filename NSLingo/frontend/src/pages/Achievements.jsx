import { useEffect, useState } from 'react'
import { getBadges, getModules } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'
import { computeBadges } from '../utils/achievements.js'
import Loader from '../components/Loader.jsx'

export default function Achievements() {
  const { progress } = useApp()
  const [baseBadges, setBaseBadges] = useState(null)
  const [modules, setModules] = useState([])

  useEffect(() => {
    getBadges().then(setBaseBadges)
    getModules().then((m) => setModules(m || []))
  }, [])

  if (!baseBadges || !progress) return <Loader label="Loading achievements…" />

  // Unlock state is computed live from the user's progress.
  const badges = computeBadges(baseBadges, progress, modules)
  const unlocked = badges.filter((b) => b.unlocked).length

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 760 }}>
      <div className="ns-pagehead">
        <h1 className="h3">Achievements</h1>
        <p>{unlocked} of {badges.length} badges unlocked. Clear modules to earn more.</p>
      </div>

      <div className="row g-3">
        {badges.map((b) => (
          <div className="col-6 col-md-4 col-lg-3" key={b.id}>
            <div className={`ns-badge-tile h-100 ${b.unlocked ? 'ns-badge-tile--unlocked' : 'ns-badge-tile--locked'}`}>
              <div className="ns-badge-tile__emoji">{b.unlocked ? b.emoji : '🔒'}</div>
              <div className="fw-bold mt-1">{b.title}</div>
              <div className="ns-text-muted small">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
