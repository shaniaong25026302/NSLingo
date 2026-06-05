import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getModules } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'
import Loader from '../components/Loader.jsx'

export default function Lesson() {
  const { moduleId, lessonId } = useParams()
  const navigate = useNavigate()
  const { completeLesson } = useApp()
  const [modules, setModules] = useState(null)
  const [idx, setIdx] = useState(0)

  useEffect(() => { getModules().then(setModules) }, [])
  useEffect(() => { setIdx(0) }, [lessonId])

  if (!modules) return <Loader />

  const module = modules.find((m) => m.id === moduleId)
  const lesson = module?.lessons.find((l) => l.id === lessonId)

  if (!lesson) {
    return (
      <div className="text-center py-5">
        <p className="ns-text-muted">Lesson not found.</p>
        <Link to="/dashboard" className="btn btn-primary">Back to Learning Path</Link>
      </div>
    )
  }

  const total = lesson.cards.length
  const card = lesson.cards[idx]
  const isLast = idx === total - 1

  const handleNext = () => {
    if (!isLast) { setIdx((i) => i + 1); return }
    // Finished the cards → record completion, head to the quiz.
    completeLesson(moduleId, lessonId, lesson.xp)
    navigate(`/quiz/${moduleId}`)
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 680 }}>
      <Link to="/dashboard" className="ns-text-muted small d-inline-block mb-3">← {module.title}</Link>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h1 className="h4 ns-section-title mb-0">{lesson.title}</h1>
        <span className="ns-tag ns-tag--amber">+{lesson.xp} XP</span>
      </div>

      {/* Card progress */}
      <div className="progress mb-4" role="progressbar" aria-valuenow={idx + 1} aria-valuemin={0} aria-valuemax={total}>
        <div className="progress-bar" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      {/* Flashcard */}
      <div className="ns-card p-4 p-lg-5 text-center mb-3">
        <div className="ns-text-muted small mb-2">Term {idx + 1} of {total}</div>
        <div className="display-6 fw-bold mb-2" style={{ color: 'var(--ns-primary-dark)' }}>{card.term}</div>
        <p className="fs-5 mb-0">{card.meaning}</p>
      </div>

      {/* Pro tip on the last card */}
      {isLast && (
        <div className="ns-feedback--correct mb-3">
          💡 <strong>Pro tip:</strong> {lesson.proTip}
        </div>
      )}

      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-primary px-4"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
        >
          Previous
        </button>
        <button className="btn btn-primary px-4" onClick={handleNext}>
          {isLast ? 'Start Quiz 🎯' : 'Next'}
        </button>
      </div>
    </div>
  )
}
