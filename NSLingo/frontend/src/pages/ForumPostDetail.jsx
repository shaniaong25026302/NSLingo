import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost, addComment, vote, report, FORUM_TOPICS } from '../services/api.js'
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

/* A reusable upvote button. `targetType` is 'post' or 'comment'.
   It keeps its own count/voted state and updates the server on click. */
function UpvoteButton({ targetType, targetId, upvotes, hasVoted }) {
  const [count, setCount] = useState(upvotes)
  const [voted, setVoted] = useState(hasVoted)
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await vote(targetType, targetId)
      setVoted(res.voted)
      setCount(res.upvotes)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      className={`ns-vote ${voted ? 'ns-vote--on' : ''}`}
      onClick={toggle}
      disabled={busy}
      aria-pressed={voted}
      title={voted ? 'Remove upvote' : 'Upvote'}
    >
      ⬆️ <span className="fw-semibold">{count}</span>
    </button>
  )
}

/* A small "report" link. Asks for an optional reason then sends the report. */
function ReportButton({ targetType, targetId }) {
  const [done, setDone] = useState(false)

  const handleReport = async () => {
    const reason = window.prompt('Why are you reporting this? (optional)')
    if (reason === null) return // user cancelled the prompt
    await report(targetType, targetId, reason)
    setDone(true)
  }

  if (done) return <span className="ns-text-muted small">✓ Reported</span>
  return (
    <button className="btn btn-link btn-sm p-0 ns-report-link" onClick={handleReport}>
      🚩 Report
    </button>
  )
}

/* A box for writing a comment or a reply.
   `parentComment` is null for a top-level comment, or a comment id for a reply. */
function CommentBox({ postId, parentComment = null, placeholder, onAdded }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!text.trim() || busy) return
    setBusy(true)
    try {
      const comment = await addComment(postId, { body: text.trim(), parentComment })
      setText('')
      onAdded(comment)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="d-flex flex-column gap-2">
      <textarea
        className="form-control"
        rows={2}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div>
        <button className="btn btn-sm btn-primary" onClick={submit} disabled={!text.trim() || busy}>
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}

export default function ForumPostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')
  // Tracks which top-level comment currently has its reply box open.
  const [replyingTo, setReplyingTo] = useState(null)

  const load = useCallback(async () => {
    try {
      setPost(await getPost(id))
    } catch (err) {
      setError(err?.message || 'Post not found')
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (error) {
    return (
      <div className="container-fluid px-0" style={{ maxWidth: 720 }}>
        <div className="ns-card p-4 text-center ns-text-muted">
          {error}. <Link to="/forum">Back to forum</Link>
        </div>
      </div>
    )
  }
  if (!post) return <Loader label="Loading post…" />

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 720 }}>
      <Link to="/forum" className="ns-text-muted small text-decoration-none">← Back to forum</Link>

      {/* ===== The post ===== */}
      <div className="ns-card p-3 p-lg-4 mt-2 mb-4">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <span className="ns-tag ns-tag--amber">{topicLabel(post.topic)}</span>
          <span className="ns-text-muted small">{timeAgo(post.createdAt)}</span>
        </div>
        <h1 className="h4">{post.title}</h1>
        <div className="ns-text-muted small mb-3">
          👤 {post.author?.name || post.author?.email || 'Anonymous'}
        </div>
        <p style={{ whiteSpace: 'pre-wrap' }}>{post.body}</p>
        <div className="d-flex align-items-center gap-3 mt-3">
          <UpvoteButton targetType="post" targetId={post._id} upvotes={post.upvotes} hasVoted={post.hasVoted} />
          <ReportButton targetType="post" targetId={post._id} />
        </div>
      </div>

      {/* ===== Add a top-level comment ===== */}
      <h2 className="h6 ns-section-title mb-2">💬 {post.comments.length} Comment{post.comments.length === 1 ? '' : 's'}</h2>
      <div className="ns-card p-3 mb-4">
        <CommentBox
          postId={post._id}
          placeholder="Add a comment…"
          onAdded={() => load()}
        />
      </div>

      {/* ===== Comment thread (one level of nesting) ===== */}
      <div className="d-flex flex-column gap-3">
        {post.comments.map((c) => (
          <div key={c._id} className="ns-card p-3">
            {/* Top-level comment */}
            <CommentRow comment={c} />
            <div className="d-flex align-items-center gap-3 mt-2">
              <UpvoteButton targetType="comment" targetId={c._id} upvotes={c.upvotes} hasVoted={c.hasVoted} />
              <button
                className="btn btn-link btn-sm p-0 ns-report-link"
                onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)}
              >
                ↩ Reply
              </button>
              <ReportButton targetType="comment" targetId={c._id} />
            </div>

            {/* Reply composer for this comment */}
            {replyingTo === c._id && (
              <div className="mt-3 ns-reply">
                <CommentBox
                  postId={post._id}
                  parentComment={c._id}
                  placeholder={`Reply to ${c.author?.name || 'this comment'}…`}
                  onAdded={() => { setReplyingTo(null); load() }}
                />
              </div>
            )}

            {/* Replies — indented one level under their parent */}
            {c.replies?.length > 0 && (
              <div className="ns-reply mt-3 d-flex flex-column gap-3">
                {c.replies.map((r) => (
                  <div key={r._id}>
                    <CommentRow comment={r} />
                    <div className="d-flex align-items-center gap-3 mt-2">
                      <UpvoteButton targetType="comment" targetId={r._id} upvotes={r.upvotes} hasVoted={r.hasVoted} />
                      <ReportButton targetType="comment" targetId={r._id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* The author + body of a single comment (shared by comments and replies). */
function CommentRow({ comment }) {
  return (
    <div>
      <div className="ns-text-muted small mb-1">
        👤 {comment.author?.name || comment.author?.email || 'Anonymous'} · {timeAgo(comment.createdAt)}
      </div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{comment.body}</div>
    </div>
  )
}
