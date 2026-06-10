import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getMyPosts, deletePost, FORUM_TOPICS } from '../services/api.js'
import Loader from '../components/Loader.jsx'

const topicLabel = (value) =>
  FORUM_TOPICS.find((t) => t.value === value)?.label || value

function timeAgo(iso) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// Lists every post the signed-in user has created, with a delete button on each.
export default function MyPosts() {
  const [posts, setPosts] = useState(null)
  const [busyId, setBusyId] = useState(null) // id of the post currently deleting

  const load = useCallback(async () => {
    setPosts(await getMyPosts())
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    // Deleting also removes the post's comments — make sure the user means it.
    if (!window.confirm('Delete this post and all its comments? This cannot be undone.')) return
    setBusyId(id)
    try {
      await deletePost(id)
      // Drop it from the list without a full reload.
      setPosts((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      window.alert(err?.message || 'Could not delete the post. Please try again.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 760 }}>
      <div className="ns-pagehead">
        <Link to="/forum" className="text-white-50 small text-decoration-none">← Back to forum</Link>
        <h1 className="h3 mt-2">My Posts</h1>
        <p className="mb-0">Everything you've shared with the community. You can remove any of them here.</p>
      </div>

      {!posts ? (
        <Loader label="Loading your posts…" />
      ) : posts.length === 0 ? (
        <div className="ns-card p-4 text-center ns-text-muted">
          You haven't posted yet. <Link to="/forum/new">Start a discussion</Link>!
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {posts.map((p) => (
            <div key={p._id} className="ns-card p-3 d-flex justify-content-between align-items-start gap-3">
              {/* Clickable area -> the post detail page */}
              <Link to={`/forum/${p._id}`} className="text-decoration-none text-reset flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="ns-tag ns-tag--amber">{topicLabel(p.topic)}</span>
                  <span className="ns-text-muted small">{timeAgo(p.createdAt)}</span>
                </div>
                <div className="fw-bold mb-1" style={{ color: 'var(--ns-ink)' }}>{p.title}</div>
                <div className="ns-text-muted small d-flex flex-wrap gap-3">
                  <span>⬆️ {p.upvotes} upvotes</span>
                  <span>💬 {p.commentCount} comments</span>
                </div>
              </Link>

              {/* Delete button — separate from the link so clicking it doesn't navigate */}
              <button
                className="btn btn-sm btn-outline-danger flex-shrink-0"
                onClick={() => handleDelete(p._id)}
                disabled={busyId === p._id}
              >
                {busyId === p._id ? 'Deleting…' : '🗑 Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
