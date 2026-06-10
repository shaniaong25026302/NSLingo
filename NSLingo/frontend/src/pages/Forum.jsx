import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getPosts, FORUM_TOPICS } from '../services/api.js'
import Loader from '../components/Loader.jsx'

// Turn an ISO date into a friendly "3h ago" / "2d ago" label.
function timeAgo(iso) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// Look up a topic's friendly label (e.g. 'bmt' -> 'BMT').
const topicLabel = (value) =>
  FORUM_TOPICS.find((t) => t.value === value)?.label || value

export default function Forum() {
  const [posts, setPosts] = useState(null)
  const [sort, setSort] = useState('new')   // 'new' | 'top'
  const [topic, setTopic] = useState('')     // '' = all topics

  // Re-fetch whenever the sort or topic filter changes.
  const load = useCallback(async () => {
    setPosts(null)
    const data = await getPosts({ sort, topic: topic || undefined })
    setPosts(data.posts)
  }, [sort, topic])

  useEffect(() => { load() }, [load])

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 760 }}>
      <div className="ns-pagehead d-flex justify-content-between align-items-start gap-2 flex-wrap">
        <div>
          <h1 className="h3">Community Forum</h1>
          <p className="mb-0">Share your NS experiences — stories, BMT tips, vocation life and more.</p>
        </div>
        <Link to="/forum/new" className="btn btn-primary">+ New Post</Link>
      </div>

      {/* Sort toggle (New / Top) */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <div className="btn-group" role="group" aria-label="Sort posts">
          <button
            className={`btn btn-sm ${sort === 'new' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSort('new')}
          >
            🆕 New
          </button>
          <button
            className={`btn btn-sm ${sort === 'top' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSort('top')}
          >
            🔥 Top
          </button>
        </div>
      </div>

      {/* Topic filter chips */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`ns-tag ns-forum-chip ${topic === '' ? 'ns-forum-chip--on' : ''}`}
          onClick={() => setTopic('')}
        >
          All
        </button>
        {FORUM_TOPICS.map((t) => (
          <button
            key={t.value}
            className={`ns-tag ns-forum-chip ${topic === t.value ? 'ns-forum-chip--on' : ''}`}
            onClick={() => setTopic(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {!posts ? (
        <Loader label="Loading forum…" />
      ) : posts.length === 0 ? (
        <div className="ns-card p-4 text-center ns-text-muted">
          No posts yet. Be the first to <Link to="/forum/new">start a discussion</Link>!
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {posts.map((p) => (
            <Link
              key={p._id}
              to={`/forum/${p._id}`}
              className="ns-card ns-card--interactive p-3 text-decoration-none text-reset"
            >
              <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                <span className="ns-tag ns-tag--amber">{topicLabel(p.topic)}</span>
                <span className="ns-text-muted small">{timeAgo(p.createdAt)}</span>
              </div>
              <div className="fw-bold mb-1" style={{ color: 'var(--ns-ink)' }}>{p.title}</div>
              <div className="ns-text-muted small d-flex flex-wrap gap-3">
                <span>👤 {p.author?.name || p.author?.email || 'Anonymous'}</span>
                <span>⬆️ {p.upvotes} upvotes</span>
                <span>💬 {p.commentCount} comments</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
