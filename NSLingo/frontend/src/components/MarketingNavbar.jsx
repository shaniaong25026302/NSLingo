import { NavLink, Link } from 'react-router-dom'

// Light marketing/onboarding navbar. When `step`/`totalSteps` are given,
// the centre links are replaced by a dot stepper (onboarding flow).
export default function MarketingNavbar({ step, totalSteps }) {
  const showStepper = typeof step === 'number' && typeof totalSteps === 'number'

  return (
    <nav className="navbar navbar-expand-lg ns-navbar ns-navbar--light">
      <div className="container">
        <Link className="navbar-brand ns-brand" to="/">NSLingo</Link>

        {showStepper ? (
          <div className="ns-stepper mx-auto" aria-label={`Step ${step + 1} of ${totalSteps}`}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`ns-stepper__dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              />
            ))}
          </div>
        ) : (
          <ul className="navbar-nav mx-auto gap-lg-2">
            <li className="nav-item"><NavLink className="nav-link" to="/learn">Lessons</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/glossary">Glossary</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/translator">Translator</NavLink></li>
          </ul>
        )}

        <div className="d-flex align-items-center gap-2">
          {!showStepper && <Link className="btn btn-outline-primary" to="/login">Log In</Link>}
          <Link className="btn btn-primary" to="/register">GET STARTED</Link>
        </div>
      </div>
    </nav>
  )
}
