import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const LINKS = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/learn', icon: '📘', label: 'Learn' },
  { to: '/translator', icon: '🌐', label: 'Translator' },
  { to: '/glossary', icon: '📖', label: 'Glossary' },
  { to: '/achievements', icon: '🏆', label: 'Achievements' },
  { to: '/profile', icon: '👤', label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="ns-sidebar h-100 d-flex flex-column">
      <div className="flex-grow-1 d-flex flex-column gap-1">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} className="ns-sidebar__link">
            <span aria-hidden>{l.icon}</span> {l.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--ns-border)' }}>
        {user && (
          <div className="ns-text-muted small mb-2 px-2 text-truncate" title={user.email}>
            {user.name || user.email}
          </div>
        )}
        <button className="ns-sidebar__link w-100 border-0 bg-transparent text-start" onClick={handleLogout}>
          <span aria-hidden>🚪</span> Log Out
        </button>
      </div>
    </aside>
  )
}
