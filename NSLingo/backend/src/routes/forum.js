/* ============================================================
   NSLingo — Community Forum routes
   Mounted at /api in server.js, so the paths below become
   /api/posts, /api/vote, /api/report, etc.

   The whole forum is for signed-in users, so EVERY route here is
   protected by requireAuth (see router.use below). That also means
   we always know who the current user is via req.userId — the same
   mechanism the rest of the app already uses (JWT -> req.userId).
   ============================================================ */
import { Router } from 'express'
import mongoose from 'mongoose'
import { ForumPost, Comment, Vote, Report, User } from '../models/index.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Everything in the forum requires a logged-in user.
router.use(requireAuth)

// The 5 topics a post can belong to (kept in sync with the model enum).
const TOPICS = ['stories', 'bmt', 'vocation', 'tips', 'general']

// Small helper: is `id` a valid MongoDB ObjectId? Guards against bad URLs.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

/* ============================================================
   POSTS
   ============================================================ */

// POST /api/posts — create a post (publishes immediately, no approval queue).
router.post('/posts', async (req, res, next) => {
  try {
    const { title, body, topic } = req.body || {}

    // Validate the required fields.
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'title and body are required' })
    }
    // If a topic is given it must be one we recognise; otherwise default it.
    const safeTopic = TOPICS.includes(topic) ? topic : 'general'

    const post = await ForumPost.create({
      title: title.trim(),
      body: body.trim(),
      topic: safeTopic,
      author: req.userId,
    })

    // Send back the author's name/email so the UI can show it immediately.
    await post.populate('author', 'name email')
    res.status(201).json(post)
  } catch (e) { next(e) }
})

// GET /api/posts — list posts.
//   ?topic=bmt        filter by topic (optional)
//   ?sort=new|top     new = newest first (default), top = most upvotes first
//   ?page=1&limit=10  pagination (defaults: page 1, 10 per page)
router.get('/posts', async (req, res, next) => {
  try {
    const { topic, sort } = req.query
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))

    const filter = {}
    if (topic && TOPICS.includes(topic)) filter.topic = topic

    // "top" => highest upvotes first; anything else => newest first.
    const order = sort === 'top' ? { upvotes: -1, createdAt: -1 } : { createdAt: -1 }

    const [posts, total] = await Promise.all([
      ForumPost.find(filter)
        .sort(order)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name email')
        .lean(),
      ForumPost.countDocuments(filter),
    ])

    // Tell the UI which of these posts the current user has already upvoted,
    // so the upvote button can show the correct "on/off" state.
    const votedIds = await votedTargetIds('post', posts.map((p) => p._id), req.userId)
    const withVote = posts.map((p) => ({ ...p, hasVoted: votedIds.has(String(p._id)) }))

    res.json({
      posts: withVote,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    })
  } catch (e) { next(e) }
})

// GET /api/posts/mine — list the posts created by the current user (newest
// first). NOTE: this MUST be declared before "/posts/:id" below, otherwise
// Express would treat "mine" as a post id.
router.get('/posts/mine', async (req, res, next) => {
  try {
    const posts = await ForumPost.find({ author: req.userId })
      .sort({ createdAt: -1 })
      .populate('author', 'name email')
      .lean()
    const votedIds = await votedTargetIds('post', posts.map((p) => p._id), req.userId)
    res.json(posts.map((p) => ({ ...p, hasVoted: votedIds.has(String(p._id)) })))
  } catch (e) { next(e) }
})

// GET /api/posts/:id — one post WITH its comments.
// Comments come back as top-level comments, each with a `replies` array
// (one level of nesting only).
router.get('/posts/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) return res.status(404).json({ error: 'Post not found' })

    const post = await ForumPost.findById(id).populate('author', 'name email').lean()
    if (!post) return res.status(404).json({ error: 'Post not found' })

    // Grab every comment on this post in one query, oldest first.
    const comments = await Comment.find({ post: id })
      .sort({ createdAt: 1 })
      .populate('author', 'name email')
      .lean()

    // Build the one-level tree: top-level comments, with replies grouped under them.
    const topLevel = []
    const repliesByParent = {}
    for (const c of comments) {
      if (c.parentComment) {
        const key = String(c.parentComment)
        ;(repliesByParent[key] ||= []).push(c)
      } else {
        topLevel.push(c)
      }
    }
    const threaded = topLevel.map((c) => ({
      ...c,
      replies: repliesByParent[String(c._id)] || [],
    }))

    // Mark which items (post + every comment) the current user has upvoted.
    const postVoted = await votedTargetIds('post', [post._id], req.userId)
    const commentVoted = await votedTargetIds('comment', comments.map((c) => c._id), req.userId)
    const tagVote = (c) => ({ ...c, hasVoted: commentVoted.has(String(c._id)) })

    res.json({
      ...post,
      hasVoted: postVoted.has(String(post._id)),
      comments: threaded.map((c) => ({
        ...tagVote(c),
        replies: c.replies.map(tagVote),
      })),
    })
  } catch (e) { next(e) }
})

/* ============================================================
   COMMENTS
   ============================================================ */

// POST /api/posts/:id/comments — add a comment or a reply.
// Body: { body, parentComment? }  (parentComment set = it's a reply)
router.post('/posts/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params
    const { body, parentComment } = req.body || {}

    if (!isValidId(id)) return res.status(404).json({ error: 'Post not found' })
    if (!body?.trim()) return res.status(400).json({ error: 'body is required' })

    const post = await ForumPost.findById(id)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    // If this is a reply, make sure the parent exists, belongs to THIS post,
    // and is itself a top-level comment — that keeps nesting to one level.
    let parentId = null
    if (parentComment) {
      if (!isValidId(parentComment)) {
        return res.status(400).json({ error: 'Invalid parentComment' })
      }
      const parent = await Comment.findById(parentComment)
      if (!parent || String(parent.post) !== id) {
        return res.status(400).json({ error: 'Parent comment not found on this post' })
      }
      if (parent.parentComment) {
        // Replying to a reply would create a 2nd level — collapse it back up
        // to the top-level comment instead.
        parentId = parent.parentComment
      } else {
        parentId = parent._id
      }
    }

    const comment = await Comment.create({
      post: id,
      author: req.userId,
      body: body.trim(),
      parentComment: parentId,
    })

    // Keep the post's denormalised commentCount in sync.
    post.commentCount += 1
    await post.save()

    await comment.populate('author', 'name email')
    res.status(201).json(comment)
  } catch (e) { next(e) }
})

/* ============================================================
   VOTES  (upvote toggle — works for posts AND comments)
   ============================================================ */

// POST /api/vote — body: { targetType: 'post'|'comment', targetId }
// Toggles the current user's upvote and returns the new count.
router.post('/vote', async (req, res, next) => {
  try {
    const { targetType, targetId } = req.body || {}

    if (!['post', 'comment'].includes(targetType)) {
      return res.status(400).json({ error: 'targetType must be "post" or "comment"' })
    }
    if (!isValidId(targetId)) {
      return res.status(400).json({ error: 'Invalid targetId' })
    }

    const Model = targetType === 'post' ? ForumPost : Comment
    const target = await Model.findById(targetId)
    if (!target) return res.status(404).json({ error: 'Target not found' })

    // Already voted? Then this toggles the vote OFF.
    const existing = await Vote.findOne({ targetType, targetId, user: req.userId })
    if (existing) {
      await existing.deleteOne()
      target.upvotes = Math.max(0, target.upvotes - 1)
      await target.save()
      return res.json({ voted: false, upvotes: target.upvotes })
    }

    // Otherwise toggle the vote ON.
    await Vote.create({ targetType, targetId, user: req.userId })
    target.upvotes += 1
    await target.save()
    res.json({ voted: true, upvotes: target.upvotes })
  } catch (e) { next(e) }
})

/* ============================================================
   REPORTS  (reactive moderation)
   ============================================================ */

// POST /api/report — body: { targetType, targetId, reason }
router.post('/report', async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body || {}

    if (!['post', 'comment'].includes(targetType)) {
      return res.status(400).json({ error: 'targetType must be "post" or "comment"' })
    }
    if (!isValidId(targetId)) {
      return res.status(400).json({ error: 'Invalid targetId' })
    }

    const report = await Report.create({
      targetType,
      targetId,
      reporter: req.userId,
      reason: (reason || '').trim(),
    })
    res.status(201).json({ ok: true, report })
  } catch (e) { next(e) }
})

// GET /api/reports — ADMIN only: list reports (newest first).
router.get('/reports', requireAdmin, async (req, res, next) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate('reporter', 'name email')
      .lean()
    res.json(reports)
  } catch (e) { next(e) }
})

/* ============================================================
   ADMIN content removal
   ============================================================ */

// DELETE /api/posts/:id — remove a post and everything attached to it (its
// comments, and all votes/reports pointing at the post or those comments) so
// nothing is left dangling.
//
// Who can delete: the post's OWN author (manage their own content), OR an
// admin (reactive moderation). Anyone else gets 403.
router.delete('/posts/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) return res.status(404).json({ error: 'Post not found' })

    const post = await ForumPost.findById(id)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    // Allow the author themselves; otherwise the requester must be an admin.
    const isOwner = String(post.author) === String(req.userId)
    if (!isOwner) {
      const user = await User.findById(req.userId).select('isAdmin').lean()
      if (!user?.isAdmin) {
        return res.status(403).json({ error: 'You can only delete your own posts' })
      }
    }

    const comments = await Comment.find({ post: id }).select('_id').lean()
    const commentIds = comments.map((c) => c._id)
    const allTargetIds = [post._id, ...commentIds]

    await Promise.all([
      Comment.deleteMany({ post: id }),
      Vote.deleteMany({ targetId: { $in: allTargetIds } }),
      Report.deleteMany({ targetId: { $in: allTargetIds } }),
      post.deleteOne(),
    ])

    res.json({ ok: true })
  } catch (e) { next(e) }
})

// DELETE /api/comments/:id — remove a comment. If it's a top-level comment we
// also remove its replies. The post's commentCount is adjusted.
//
// Who can delete: the comment's OWN author, OR an admin (moderation).
router.delete('/comments/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) return res.status(404).json({ error: 'Comment not found' })

    const comment = await Comment.findById(id)
    if (!comment) return res.status(404).json({ error: 'Comment not found' })

    // Allow the author themselves; otherwise the requester must be an admin.
    const isOwner = String(comment.author) === String(req.userId)
    if (!isOwner) {
      const user = await User.findById(req.userId).select('isAdmin').lean()
      if (!user?.isAdmin) {
        return res.status(403).json({ error: 'You can only delete your own comments' })
      }
    }

    // Gather the comment + any replies to it (only top-level comments have replies).
    const replies = await Comment.find({ parentComment: id }).select('_id').lean()
    const ids = [comment._id, ...replies.map((r) => r._id)]

    await Promise.all([
      Comment.deleteMany({ _id: { $in: ids } }),
      Vote.deleteMany({ targetType: 'comment', targetId: { $in: ids } }),
      Report.deleteMany({ targetType: 'comment', targetId: { $in: ids } }),
    ])

    // Keep the post's comment count accurate.
    await ForumPost.findByIdAndUpdate(comment.post, {
      $inc: { commentCount: -ids.length },
    })

    res.json({ ok: true, removed: ids.length })
  } catch (e) { next(e) }
})

/* ------------------------------------------------------------
   Helper: of the given target ids, which has THIS user upvoted?
   Returns a Set of id-strings for quick lookup.
   ------------------------------------------------------------ */
async function votedTargetIds(targetType, ids, userId) {
  if (!ids.length) return new Set()
  const votes = await Vote.find({
    targetType,
    targetId: { $in: ids },
    user: userId,
  }).select('targetId').lean()
  return new Set(votes.map((v) => String(v.targetId)))
}

export default router
