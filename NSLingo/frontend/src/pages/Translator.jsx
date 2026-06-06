import { useState } from 'react'
import { translate, getTranslationExamples } from '../services/api.js'

export default function Translator() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const examples = getTranslationExamples()

  const handleTranslate = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      setResult(await translate(text))
    } finally {
      setLoading(false)
    }
  }

  // Render the original text with detected NS terms highlighted.
  const highlighted = (input, detected) => {
    if (!detected?.length) return input
    const terms = detected.map((d) => d.term).sort((a, b) => b.length - a.length)
    const re = new RegExp(`\\b(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi')
    const parts = input.split(re)
    return parts.map((part, i) => {
      const hit = detected.find((d) => d.term.toLowerCase() === part.toLowerCase())
      return hit
        ? <span key={i} className="ns-term-hl" title={hit.meaning}>{part}</span>
        : <span key={i}>{part}</span>
    })
  }

  return (
    <div className="theme-translator container-fluid px-0" style={{ maxWidth: 760 }}>
      <div className="ns-pagehead">
        <h1 className="h3">NS Translator</h1>
        <p>Paste NS speak and get it in plain English — detected terms are highlighted.</p>
      </div>

      <div className="ns-card p-3 p-lg-4 mb-3">
        <label className="form-label fw-semibold">NS speak</label>
        <textarea
          className="form-control mb-3"
          rows={3}
          placeholder="e.g. Later kena tekan because someone never stand by bed…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary px-4" onClick={handleTranslate} disabled={loading || !text.trim()}>
          {loading ? 'Translating…' : 'Translate'}
        </button>
      </div>

      {result && (
        <div className="ns-card p-3 p-lg-4 mb-4">
          <div className="d-flex justify-content-end mb-2">
            <span className={`ns-tag ${result.source === 'ai' ? '' : 'ns-tag--muted'}`}>
              {result.source === 'ai' ? '✨ AI-powered' : '📖 Dictionary'}
            </span>
          </div>
          <div className="mb-3">
            <div className="ns-text-muted small fw-semibold mb-1">YOU SAID</div>
            <div>{highlighted(result.input, result.detected)}</div>
          </div>
          <hr className="ns-divider" />
          <div className="mb-3">
            <div className="ns-text-muted small fw-semibold mb-1">PLAIN ENGLISH</div>
            <div className="fw-semibold">{result.output}</div>
          </div>
          {result.detected?.length > 0 && (
            <>
              <div className="ns-text-muted small fw-semibold mb-2">DETECTED TERMS</div>
              <div className="d-flex flex-wrap gap-2">
                {result.detected.map((d, i) => (
                  <span key={i} className="ns-tag" title={d.meaning}>{d.term}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Worked examples */}
      <h2 className="h5 ns-section-title mb-3">Worked examples</h2>
      <div className="d-flex flex-column gap-2">
        {examples.map((ex, i) => (
          <button
            key={i}
            className="ns-card ns-card--interactive p-3 text-start"
            onClick={() => { setText(ex.input); setResult(null) }}
          >
            <div className="fst-italic">"{ex.input}"</div>
            <div className="ns-text-muted small mt-1">→ {ex.output}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
