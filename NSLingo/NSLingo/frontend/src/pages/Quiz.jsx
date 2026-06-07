import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getQuiz, getModules } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'
import Loader from '../components/Loader.jsx'

export default function Quiz() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const { recordQuiz } = useApp()

  const [questions, setQuestions] = useState(null)
  const [moduleTitle, setModuleTitle] = useState('')
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    getQuiz(moduleId).then(setQuestions)
    getModules().then((mods) => setModuleTitle(mods.find((m) => m.id === moduleId)?.title || ''))
  }, [moduleId])

  if (!questions) return <Loader label="Loading quiz…" />

  if (questions.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="ns-text-muted">No quiz available for this module yet.</p>
        <Link to="/dashboard" className="btn btn-primary">Back to Learning Path</Link>
      </div>
    )
  }

  const q = questions[idx]
  const isLast = idx === questions.length - 1

  const choose = (i) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    if (i === q.correctIndex) setScore((s) => s + 1)
  }

  const handleNext = () => {
    if (!isLast) {
      setIdx((i) => i + 1)
      setSelected(null)
      setAnswered(false)
      return
    }
    const finalScore = score // score already includes current question
    // recordQuiz rewards only improvement over the previous best and returns
    // the XP actually awarded this attempt.
    const earnedXp = recordQuiz(moduleId, finalScore, questions.length)
    navigate('/results', {
      state: {
        moduleId,
        moduleTitle,
        score: finalScore,
        total: questions.length,
        xp: earnedXp,
      },
    })
  }

  const optionClass = (i) => {
    if (!answered) return `ns-option ${selected === i ? 'selected' : ''}`
    if (i === q.correctIndex) return 'ns-option correct'
    if (i === selected) return 'ns-option wrong'
    return 'ns-option'
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 680 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Link to="/dashboard" className="ns-text-muted small">← {moduleTitle}</Link>
        <span className="ns-tag ns-tag--muted">Question {idx + 1} / {questions.length}</span>
      </div>

      <div className="progress mb-4" role="progressbar">
        <div className="progress-bar" style={{ width: `${((idx + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      {/* Scenario */}
      <div className="ns-scenario mb-4">
        <div className="ns-scenario__speaker">{q.speaker}</div>
        {q.scenario}
      </div>

      <h2 className="h5 fw-bold mb-3">{q.question}</h2>

      <div className="d-flex flex-column gap-2 mb-3">
        {q.options.map((opt, i) => (
          <button key={i} className={optionClass(i)} onClick={() => choose(i)} disabled={answered}>
            <span className="fw-bold me-2">{String.fromCharCode(65 + i)}.</span>{opt}
          </button>
        ))}
      </div>

      {/* Instant feedback */}
      {answered && (
        <div className={selected === q.correctIndex ? 'ns-feedback--correct mb-3' : 'ns-feedback--wrong mb-3'}>
          {selected === q.correctIndex ? '✅ Correct! ' : '❌ Not quite. '}
          {q.feedback}
        </div>
      )}

      <div className="d-flex justify-content-end">
        <button className="btn btn-primary px-4" onClick={handleNext} disabled={!answered}>
          {isLast ? 'See Results' : 'Next Question'}
        </button>
      </div>
    </div>
  )
}
