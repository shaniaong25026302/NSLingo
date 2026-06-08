import { Link } from 'react-router-dom'

const STEPS = [
  { emoji: '📘', title: 'Learn', desc: 'Bite-sized lessons on NS slang, acronyms and drill commands.' },
  { emoji: '🎯', title: 'Test', desc: 'Scenario quizzes framed like real bunk and parade-square moments.' },
  { emoji: '🏅', title: 'Earn', desc: 'Rack up XP, keep your streak, and unlock NS Readiness badges.' },
]

const FEATURES = [
  { emoji: '📖', title: 'Glossary', desc: 'Searchable A–Z of NS terms with meanings and examples.' },
  { emoji: '🌐', title: 'NS Translator', desc: 'Turn NS speak into plain English, with detected terms highlighted.' },
  { emoji: '🔥', title: 'Daily streaks', desc: 'Build a habit and watch your NS Readiness climb.' },
  { emoji: '🏆', title: 'Badges', desc: 'Earn achievements as you clear each module.' },
]

export default function Landing() {
  return (
    <div className="container py-4 py-lg-5">
      {/* Hero */}
      <section className="ns-hero p-4 p-lg-5 mb-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <span className="ns-tag mb-3">🇸🇬 For pre-enlistees</span>
            <h1 className="ns-hero__title mb-3">Don't Blur.<br />Learn NS Before NS.</h1>
            <p className="lead ns-text-muted mb-4" style={{ maxWidth: 520 }}>
              NSLingo teaches you Singapore National Service slang, acronyms and
              terminology through bite-sized lessons and real-scenario quizzes — so
              you book in already knowing the lingo.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/register" className="btn btn-primary btn-lg px-4">Get Started — it's free</Link>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="ns-card p-4">
              <div className="ns-scenario mb-3">
                <div className="ns-scenario__speaker">Your sergeant shouts</div>
                "Later kena tekan!"
              </div>
              <p className="fw-semibold mb-2">What does it mean?</p>
              <div className="ns-feedback--correct">
                ✅ <strong>Tekan</strong> = tough physical punishment. Brace yourself.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-5">
        <h2 className="ns-section-title text-center mb-2">How NSLingo Works</h2>
        <p className="text-center ns-text-muted mb-4">Learn → Test → Earn</p>
        <div className="row g-3">
          {STEPS.map((s, i) => (
            <div className="col-md-4" key={s.title}>
              <div className="ns-card h-100 p-4 text-center">
                <div style={{ fontSize: '2.5rem' }}>{s.emoji}</div>
                <h3 className="h5 fw-bold mt-2 mb-1">{i + 1}. {s.title}</h3>
                <p className="ns-text-muted mb-0">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ready to book in summary */}
      <section className="mb-5">
        <div className="ns-card p-4 p-lg-5">
          <h2 className="ns-section-title text-center mb-4">Ready to Book In</h2>
          <div className="row g-3">
            {FEATURES.map((f) => (
              <div className="col-sm-6 col-lg-3" key={f.title}>
                <div className="text-center">
                  <div style={{ fontSize: '2rem' }}>{f.emoji}</div>
                  <h3 className="h6 fw-bold mt-2 mb-1">{f.title}</h3>
                  <p className="ns-text-muted small mb-0">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
