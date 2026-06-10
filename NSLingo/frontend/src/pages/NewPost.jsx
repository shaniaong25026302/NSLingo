import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createPost, FORUM_TOPICS } from '../services/api.js'

// "New Post" form. Uses React state + an onClick handler (NOT an HTML <form>
// submit) so the page never reloads — a single-page-app friendly approach.
export default function NewPost() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [topic, setTopic] = useState('general')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Disable the button until both required fields have content.
  const canPost = title.trim() && body.trim() && !saving

  const handlePost = async () => {
    if (!canPost) return
    setSaving(true)
    setError('')
    try {
      const post = await createPost({ title: title.trim(), body: body.trim(), topic })
      // Posts publish immediately — jump straight to the new post.
      navigate(`/forum/${post._id}`)
    } catch (err) {
      setError(err?.message || 'Could not publish your post. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 680 }}>
      <div className="ns-pagehead">
        <Link to="/forum" className="text-white-50 small text-decoration-none">← Back to forum</Link>
        <h1 className="h3 mt-2">New Post</h1>
        <p className="mb-0">Posts go live immediately. Keep it respectful — others can report posts.</p>
      </div>

      <div className="ns-card p-3 p-lg-4">
        {/* Title */}
        <label className="form-label fw-semibold">Title</label>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="e.g. My first week in BMT…"
          value={title}
          maxLength={140}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Topic */}
        <label className="form-label fw-semibold">Topic</label>
        <select
          className="form-select mb-3"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          {FORUM_TOPICS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Body */}
        <label className="form-label fw-semibold">Your story</label>
        <textarea
          className="form-control mb-3"
          rows={6}
          placeholder="Share the details — what happened, tips, lessons learnt…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        {error && <div className="ns-feedback--wrong mb-3">{error}</div>}

        <div className="d-flex gap-2">
          <button className="btn btn-primary px-4" onClick={handlePost} disabled={!canPost}>
            {saving ? 'Publishing…' : 'Publish Post'}
          </button>
          <Link to="/forum" className="btn btn-outline-primary">Cancel</Link>
        </div>
      </div>
    </div>
  )
}
