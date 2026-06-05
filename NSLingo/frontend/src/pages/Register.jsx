import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthCard from '../components/AuthCard.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      await register({ name, email, password })
      // New accounts go through onboarding (set goal) before the dashboard.
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard
      title="Start your NS prep"
      subtitle="Create an account to save your progress, streaks and badges."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="ns-feedback--wrong mb-3">{error}</div>}

        <div className="mb-3">
          <label className="form-label fw-semibold">Name <span className="ns-text-muted fw-normal">(optional)</span></label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <div className="form-text">At least 6 characters.</div>
        </div>

        <button type="submit" className="btn btn-primary w-100 py-2" disabled={busy}>
          {busy ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </AuthCard>
  )
}
