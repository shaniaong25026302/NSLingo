import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Dark emerald in-app navbar with status chips + profile avatar.
export default function AppNavbar() {
  const { progress } = useApp()
  const { user } = useAuth()
  const streak = progress?.streak ?? 0
  const readiness = progress?.readiness ?? 0
  const initial = (user?.name || user?.email || 'R').trim().charAt(0).toUpperCase()

  return (
    <nav className="navbar ns-navbar ns-navbar--app sticky-top">
      <div className="container-fluid px-3 px-md-4">
        <Link className="navbar-brand ns-brand text-white" to="/dashboard">NSLingo</Link>

        <div className="d-flex align-items-center gap-2 gap-md-3">
          <span className="ns-chip">🔥 {streak} day streak</span>
          <span className="ns-chip d-none d-sm-inline-flex">🎯 {readiness}% NS Readiness</span>
          <Link to="/profile" className="ns-avatar" aria-label="Profile" title={user?.email || 'Profile'}>
            {initial}
          </Link>
        </div>
      </div>
    </nav>
  )
}
