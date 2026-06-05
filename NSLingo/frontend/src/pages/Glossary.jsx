import { useEffect, useMemo, useState } from 'react'
import { getDictionary } from '../services/api.js'
import Loader from '../components/Loader.jsx'

export default function Glossary() {
  const [terms, setTerms] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => { getDictionary().then(setTerms) }, [])

  const grouped = useMemo(() => {
    if (!terms) return {}
    const q = query.trim().toLowerCase()
    const filtered = terms.filter(
      (t) => t.term.toLowerCase().includes(q) || t.meaning.toLowerCase().includes(q)
    )
    const sorted = [...filtered].sort((a, b) => a.term.localeCompare(b.term))
    return sorted.reduce((acc, t) => {
      const letter = t.term[0].toUpperCase()
      ;(acc[letter] ||= []).push(t)
      return acc
    }, {})
  }, [terms, query])

  if (!terms) return <Loader label="Loading glossary…" />

  const letters = Object.keys(grouped)

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 760 }}>
      <div className="ns-pagehead">
        <h1 className="h3">Glossary</h1>
        <p>Your A–Z of NS slang, acronyms and terminology.</p>
      </div>

      <input
        type="search"
        className="form-control form-control-lg mb-4"
        placeholder="🔍 Search terms or meanings…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {letters.length === 0 && (
        <p className="ns-text-muted text-center py-4">No terms match "{query}".</p>
      )}

      {letters.map((letter) => (
        <section key={letter}>
          <div className="ns-letter">{letter}</div>
          <div className="d-flex flex-column gap-2">
            {grouped[letter].map((t) => (
              <div key={t.term} className="ns-card p-3">
                <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                  <span className="fw-bold" style={{ color: 'var(--ns-primary-dark)' }}>{t.term}</span>
                  <span className="ns-tag ns-tag--muted">{t.category}</span>
                </div>
                <div className="mb-1">{t.meaning}</div>
                <div className="ns-text-muted small fst-italic">{t.example}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
