/* ============================================================
   NSLingo — API service layer
   Single place the UI talks to for data. When VITE_API_BASE_URL is
   configured it calls the real Express/MongoDB Atlas backend
   (endpoints from the spec). Otherwise it resolves the local mock
   data, so the frontend runs standalone (frontend-first mode).
   ============================================================ */
import axios from 'axios'
import {
  dictionaryTerms,
  modules,
  quizQuestions,
  translationExamples,
  badges,
  initialProgress,
} from '../data/mockData.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim()
export const USING_MOCK = !BASE_URL

const client = BASE_URL
  ? axios.create({ baseURL: BASE_URL, timeout: 10000 })
  : null

// Attach JWT to every request (spec: frontend sends JWT on protected routes).
if (client) {
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('ns_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
}

// Simulate latency so loading states are exercised in mock mode.
const mock = (data, ms = 250) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms))

/* ---------- Auth / token storage ---------- */
const TOKEN_KEY = 'ns_token'
const USER_KEY = 'ns_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}
function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Normalise an axios error into a readable message for the UI.
function authError(err, fallback) {
  return new Error(err?.response?.data?.error || err.message || fallback)
}

export async function register({ email, password, name }) {
  if (USING_MOCK) {
    const user = { email, name }
    setAuth('mock-token', user)
    return { token: 'mock-token', user }
  }
  try {
    const { data } = await client.post('/auth/register', { email, password, name })
    setAuth(data.token, data.user)
    return data
  } catch (err) {
    throw authError(err, 'Registration failed')
  }
}

export async function login({ email, password }) {
  if (USING_MOCK) {
    const user = { email }
    setAuth('mock-token', user)
    return { token: 'mock-token', user }
  }
  try {
    const { data } = await client.post('/auth/login', { email, password })
    setAuth(data.token, data.user)
    return data
  } catch (err) {
    throw authError(err, 'Login failed')
  }
}

/* ---------- Dictionary / Glossary ---------- */
export async function getDictionary() {
  if (USING_MOCK) return mock(dictionaryTerms)
  const { data } = await client.get('/dictionary')
  return data
}

/* ---------- Modules & lessons (learning path) ----------
   Not an explicit spec endpoint yet; served from mock for now.
   When the backend exposes /modules, swap the mock branch. */
export async function getModules() {
  if (USING_MOCK) return mock(modules)
  const { data } = await client.get('/modules')
  return data
}

/* ---------- Quiz ---------- */
export async function getQuiz(moduleId) {
  if (USING_MOCK) return mock(quizQuestions[moduleId] || [])
  const { data } = await client.get('/quiz', { params: { module: moduleId } })
  return data
}

/* ---------- Translator ---------- */
// Local term-based translator used in mock mode and for instant highlighting.
function localTranslate(text) {
  const map = {}
  for (const t of dictionaryTerms) map[t.term.toLowerCase()] = t.meaning
  // Add a few colloquial spellings.
  Object.assign(map, {
    kenna: 'to get / be subjected to', kena: 'to get / be subjected to',
    tekan: 'tough punishment / hard PT', wayang: 'putting on a show for superiors',
    'chao keng': 'faking illness to skip work', lobang: 'a good opportunity or tip',
    zai: 'capable / impressive', 'sai kang': 'menial undesirable work',
    arrow: 'assigned an extra task', '11b': 'SAF identity card',
  })

  const detected = []
  // Longest terms first so multi-word terms match before single words.
  const keys = Object.keys(map).sort((a, b) => b.length - a.length)
  let plain = ` ${text} `
  for (const k of keys) {
    const re = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    if (re.test(plain)) {
      detected.push({ term: k, meaning: map[k] })
      plain = plain.replace(re, `(${map[k]})`)
    }
  }
  return { input: text, output: plain.trim(), detected }
}

export async function translate(text) {
  if (USING_MOCK) return mock(localTranslate(text), 350)
  const { data } = await client.post('/translate', { text })
  return data
}

export async function getTranslationExamples() {
  if (USING_MOCK) return mock(translationExamples, 0)
  const { data } = await client.get('/translate/examples')
  return data
}

/* ---------- Progress (protected — requires JWT) ---------- */
export async function getProgress() {
  if (USING_MOCK) {
    const saved = localStorage.getItem('ns_progress')
    return mock(saved ? JSON.parse(saved) : initialProgress)
  }
  const { data } = await client.get('/progress')
  return data
}

export async function saveProgress(progress) {
  if (USING_MOCK) {
    localStorage.setItem('ns_progress', JSON.stringify(progress))
    return mock(progress, 0)
  }
  const { data } = await client.put('/progress', progress)
  return data
}

/* ---------- Badges ---------- */
export async function getBadges() {
  if (USING_MOCK) return mock(badges)
  const { data } = await client.get('/badges')
  return data
}

/* ============================================================
   COMMUNITY FORUM
   Talks to the Express forum routes (/api/posts, /api/vote, ...).
   In mock mode (no VITE_API_BASE_URL) everything is stored in
   localStorage so the forum still works when running the frontend
   on its own. The shapes returned here mirror the real API.
   ============================================================ */
export const FORUM_TOPICS = [
  { value: 'stories', label: 'Stories' },
  { value: 'bmt', label: 'BMT' },
  { value: 'vocation', label: 'Vocation Life' },
  { value: 'tips', label: 'Tips' },
  { value: 'general', label: 'General' },
]

/* ----- mock-mode storage helpers (only used when USING_MOCK) ----- */
const FORUM_KEY = 'ns_forum'
function readForum() {
  const raw = localStorage.getItem(FORUM_KEY)
  if (raw) return JSON.parse(raw)
  return { posts: [], comments: [], votes: [] } // votes: ["post:<id>", "comment:<id>"]
}
function writeForum(db) {
  localStorage.setItem(FORUM_KEY, JSON.stringify(db))
}
function mockUserName() {
  const u = getStoredUser()
  return { name: u?.name || u?.email || 'You', email: u?.email || '' }
}
// Tiny unique-id generator for mock posts/comments.
function mockId() {
  return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/* ----- Posts ----- */
export async function getPosts({ topic, sort = 'new', page = 1, limit = 10 } = {}) {
  if (USING_MOCK) {
    const db = readForum()
    let posts = db.posts.slice()
    if (topic) posts = posts.filter((p) => p.topic === topic)
    posts.sort((a, b) =>
      sort === 'top'
        ? b.upvotes - a.upvotes || new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    )
    const total = posts.length
    const start = (page - 1) * limit
    const pageItems = posts.slice(start, start + limit).map((p) => ({
      ...p,
      hasVoted: db.votes.includes(`post:${p._id}`),
    }))
    return mock({ posts: pageItems, page, limit, total, hasMore: start + limit < total })
  }
  const { data } = await client.get('/api/posts', { params: { topic, sort, page, limit } })
  return data
}

export async function getPost(id) {
  if (USING_MOCK) {
    const db = readForum()
    const post = db.posts.find((p) => p._id === id)
    if (!post) throw new Error('Post not found')
    const all = db.comments.filter((c) => c.post === id)
    const tag = (c) => ({ ...c, hasVoted: db.votes.includes(`comment:${c._id}`) })
    const topLevel = all.filter((c) => !c.parentComment).map(tag)
    const threaded = topLevel.map((c) => ({
      ...c,
      replies: all.filter((r) => r.parentComment === c._id).map(tag),
    }))
    return mock({ ...post, hasVoted: db.votes.includes(`post:${post._id}`), comments: threaded })
  }
  const { data } = await client.get(`/api/posts/${id}`)
  return data
}

export async function createPost({ title, body, topic }) {
  if (USING_MOCK) {
    const db = readForum()
    const post = {
      _id: mockId(), title, body, topic,
      author: mockUserName(), upvotes: 0, commentCount: 0,
      createdAt: new Date().toISOString(),
    }
    db.posts.push(post)
    writeForum(db)
    return mock(post, 0)
  }
  const { data } = await client.post('/api/posts', { title, body, topic })
  return data
}

/* ----- Comments ----- */
export async function addComment(postId, { body, parentComment = null }) {
  if (USING_MOCK) {
    const db = readForum()
    const post = db.posts.find((p) => p._id === postId)
    if (!post) throw new Error('Post not found')
    // Collapse replies-to-replies up to the top-level comment (one level only).
    let parentId = null
    if (parentComment) {
      const parent = db.comments.find((c) => c._id === parentComment)
      parentId = parent?.parentComment || parent?._id || null
    }
    const comment = {
      _id: mockId(), post: postId, author: mockUserName(),
      body, parentComment: parentId, upvotes: 0,
      createdAt: new Date().toISOString(),
    }
    db.comments.push(comment)
    post.commentCount += 1
    writeForum(db)
    return mock(comment, 0)
  }
  const { data } = await client.post(`/api/posts/${postId}/comments`, { body, parentComment })
  return data
}

/* ----- Votes (toggle upvote on a post or comment) ----- */
export async function vote(targetType, targetId) {
  if (USING_MOCK) {
    const db = readForum()
    const key = `${targetType}:${targetId}`
    const list = targetType === 'post' ? db.posts : db.comments
    const item = list.find((x) => x._id === targetId)
    if (!item) throw new Error('Target not found')
    let voted
    if (db.votes.includes(key)) {
      db.votes = db.votes.filter((k) => k !== key)
      item.upvotes = Math.max(0, item.upvotes - 1)
      voted = false
    } else {
      db.votes.push(key)
      item.upvotes += 1
      voted = true
    }
    writeForum(db)
    return mock({ voted, upvotes: item.upvotes }, 0)
  }
  const { data } = await client.post('/api/vote', { targetType, targetId })
  return data
}

/* ----- Reports ----- */
export async function report(targetType, targetId, reason) {
  if (USING_MOCK) return mock({ ok: true }, 0) // mock mode: nothing to moderate
  const { data } = await client.post('/api/report', { targetType, targetId, reason })
  return data
}

/* ----- "My posts": list and delete your own posts ----- */
export async function getMyPosts() {
  if (USING_MOCK) {
    const db = readForum()
    const me = mockUserName()
    const mine = db.posts
      .filter((p) => p.author?.email === me.email && p.author?.name === me.name)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((p) => ({ ...p, hasVoted: db.votes.includes(`post:${p._id}`) }))
    return mock(mine)
  }
  const { data } = await client.get('/api/posts/mine')
  return data
}

export async function deletePost(id) {
  if (USING_MOCK) {
    const db = readForum()
    // Remove the post, its comments, and any votes pointing at them.
    const commentIds = db.comments.filter((c) => c.post === id).map((c) => c._id)
    db.posts = db.posts.filter((p) => p._id !== id)
    db.comments = db.comments.filter((c) => c.post !== id)
    db.votes = db.votes.filter(
      (k) => k !== `post:${id}` && !commentIds.includes(k.replace('comment:', ''))
    )
    writeForum(db)
    return mock({ ok: true }, 0)
  }
  const { data } = await client.delete(`/api/posts/${id}`)
  return data
}

export async function deleteComment(id) {
  if (USING_MOCK) {
    const db = readForum()
    const comment = db.comments.find((c) => c._id === id)
    if (!comment) throw new Error('Comment not found')
    // A top-level comment takes its replies with it.
    const removeIds = [id, ...db.comments.filter((c) => c.parentComment === id).map((c) => c._id)]
    db.comments = db.comments.filter((c) => !removeIds.includes(c._id))
    db.votes = db.votes.filter((k) => !removeIds.includes(k.replace('comment:', '')))
    // Keep the post's comment count in sync.
    const post = db.posts.find((p) => p._id === comment.post)
    if (post) post.commentCount = Math.max(0, post.commentCount - removeIds.length)
    writeForum(db)
    return mock({ ok: true, removed: removeIds.length }, 0)
  }
  const { data } = await client.delete(`/api/comments/${id}`)
  return data
}
