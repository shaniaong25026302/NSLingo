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
        <Link to="/learn" className="btn btn-primary">Back to Learning Path</Link>
      </div>
    )
  }

  const total = lesson.cards.length
  const card = lesson.cards[idx]
  const isLast = idx === total - 1
  // The next lesson in this module, if any (undefined when this is the last lesson).
  const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId)
  const nextLesson = module.lessons[lessonIndex + 1]

  // On a lesson switch, idx is briefly stale and can point past the new lesson's cards.
  // Skip rendering for that one frame instead of crashing (the effect below resets idx to 0).
  if (!card) return <Loader />

  const handleNext = () => {
    if (!isLast) { setIdx((i) => i + 1); return }
    // Finished this lesson's cards → record completion.
    completeLesson(moduleId, lessonId, lesson.xp)
    // If there's another lesson in this module, go to it; only the last lesson leads to the quiz.
    if (nextLesson) navigate(`/lesson/${moduleId}/${nextLesson.id}`)
    else navigate(`/quiz/${moduleId}`)
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 680 }}>
      <Link to={`/module/${moduleId}`} className="ns-text-muted small d-inline-block mb-3">← {module.title}</Link>

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
          {isLast ? (nextLesson ? 'Next Lesson →' : 'Start Quiz 🎯') : 'Next'}
        </button>
      </div>
    </div>
  )
}
