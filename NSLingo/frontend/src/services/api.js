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

export function getTranslationExamples() {
  return translationExamples
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
