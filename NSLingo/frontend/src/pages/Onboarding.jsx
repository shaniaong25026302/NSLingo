import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MarketingNavbar from '../components/MarketingNavbar.jsx'
import { useApp } from '../context/AppContext.jsx'
import { goalOptions } from '../data/mockData.js'

const TOTAL_STEPS = 3

export default function Onboarding() {
  const navigate = useNavigate()
  const { progress, setGoal } = useApp()
  const [step, setStep] = useState(0)
  const [chosenGoal, setChosenGoal] = useState(progress?.goal || 'Regular')

  const next = () => {
    if (step === 0) setGoal(chosenGoal)
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1)
    else navigate('/dashboard')
  }
  const back = () => (step > 0 ? setStep((s) => s - 1) : navigate('/'))

  return (
    <>
      <MarketingNavbar step={step} totalSteps={TOTAL_STEPS} />
      <div className="container py-4 py-lg-5" style={{ maxWidth: 760 }}>

        {step === 0 && (
          <section>
            <h1 className="ns-section-title text-center mb-2">Set Your Goal</h1>
            <p className="text-center ns-text-muted mb-4">
              How much do you want to commit each day? You can change this later.
            </p>
            <div className="d-flex flex-column gap-3">
              {goalOptions.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setChosenGoal(g.id)}
                  className={`ns-card ns-card--interactive p-3 d-flex align-items-center gap-3 text-start border-2 ${chosenGoal === g.id ? 'border-2' : ''}`}
                  style={{ borderColor: chosenGoal === g.id ? 'var(--ns-primary)' : 'var(--ns-border)' }}
                >
                  <div style={{ fontSize: '2rem' }}>{g.emoji}</div>
                  <div className="flex-grow-1">
                    <div className="fw-bold">{g.label} · {g.minutes} min/day</div>
                    <div className="ns-text-muted small">{g.desc}</div>
                  </div>
                  <div className="fs-4">{chosenGoal === g.id ? '✅' : '⚪'}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="text-center">
            <h1 className="ns-section-title mb-2">How NSLingo Works</h1>
            <p className="ns-text-muted mb-4">Three simple steps.</p>
            <div className="row g-3">
              {[
                { emoji: '📘', t: 'Learn', d: 'Short lessons on slang, acronyms and commands.' },
                { emoji: '🎯', t: 'Test', d: 'Scenario quizzes with instant feedback.' },
                { emoji: '🏅', t: 'Earn', d: 'XP, streaks and NS Readiness badges.' },
              ].map((s) => (
                <div className="col-md-4" key={s.t}>
                  <div className="ns-card h-100 p-4">
                    <div style={{ fontSize: '2.5rem' }}>{s.emoji}</div>
                    <h3 className="h5 fw-bold mt-2 mb-1">{s.t}</h3>
                    <p className="ns-text-muted mb-0 small">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="text-center">
            <h1 className="ns-section-title mb-2">Ready to Book In</h1>
            <p className="ns-text-muted mb-4">Here's everything waiting for you.</p>
            <div className="row g-3 text-start">
              {[
                { emoji: '📘', t: '6 Lesson Modules', d: 'From Basic Commands to Admin Speak.' },
                { emoji: '🔥', t: 'Daily Streaks', d: `Your goal: ${chosenGoal} commitment.` },
                { emoji: '🌐', t: 'NS Translator', d: 'Decode NS speak into plain English.' },
                { emoji: '🏆', t: 'Badges', d: 'Unlock achievements as you progress.' },
              ].map((f) => (
                <div className="col-sm-6" key={f.t}>
                  <div className="ns-card h-100 p-3 d-flex gap-3 align-items-center">
                    <div style={{ fontSize: '1.8rem' }}>{f.emoji}</div>
                    <div>
                      <div className="fw-bold">{f.t}</div>
                      <div className="ns-text-muted small">{f.d}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nav controls */}
        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-outline-primary px-4" onClick={back}>Back</button>
          <button className="btn btn-primary px-4" onClick={next}>
            {step < TOTAL_STEPS - 1 ? 'Continue' : "Let's Go 🚀"}
          </button>
        </div>
      </div>
    </>
  )
}
