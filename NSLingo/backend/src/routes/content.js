import { Router } from 'express'
import {
  DictionaryTerm,
  Module,
  QuizQuestion,
  TranslationExample,
  Badge,
} from '../models/index.js'

const router = Router()

// GET /dictionary — NS slang dictionary terms.
router.get('/dictionary', async (req, res, next) => {
  try {
    const terms = await DictionaryTerm.find().sort({ term: 1 }).lean()
    res.json(terms)
  } catch (e) { next(e) }
})

// GET /modules — learning path modules with lessons.
router.get('/modules', async (req, res, next) => {
  try {
    const modules = await Module.find().sort({ order: 1 }).lean()
    res.json(modules)
  } catch (e) { next(e) }
})

// GET /quiz?module=<id> — scenario quiz questions for a module.
router.get('/quiz', async (req, res, next) => {
  try {
    const filter = req.query.module ? { moduleId: req.query.module } : {}
    const questions = await QuizQuestion.find(filter).lean()
    res.json(questions)
  } catch (e) { next(e) }
})

// GET /badges — badge catalogue.
router.get('/badges', async (req, res, next) => {
  try {
    const badges = await Badge.find().lean()
    res.json(badges.map((b) => ({ ...b, id: b.badgeId })))
  } catch (e) { next(e) }
})

// Dictionary-based translation (fallback when AI is unavailable).
async function dictionaryTranslate(text) {
  const terms = await DictionaryTerm.find().lean()
  const map = {}
  for (const t of terms) map[t.term.toLowerCase()] = t.meaning
  // Common colloquial spellings not in the dictionary.
  Object.assign(map, {
    kenna: 'to get / be subjected to',
    tekan: 'tough punishment / hard PT',
    zai: 'capable / impressive',
  })

  const detected = []
  const keys = Object.keys(map).sort((a, b) => b.length - a.length)
  let plain = ` ${text} `
  for (const k of keys) {
    const re = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    if (re.test(plain)) {
      detected.push({ term: k, meaning: map[k] })
      plain = plain.replace(re, `(${map[k]})`)
    }
  }
  return { input: text, output: plain.trim(), detected, source: 'dictionary' }
}

// AI translation via Google Gemini (Generative Language API).
async function aiTranslate(text) {
  const key = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const prompt =
    'You are an expert in Singapore National Service (NS), army life, Singlish, ' +
    'and Hokkien/Malay loanwords used by soldiers. Translate the following "NS speak" ' +
    'into clear, plain English that a pre-enlistee would understand. Keep it natural and ' +
    'concise. Then list every NS slang term, acronym, or piece of jargon you detected, ' +
    'each with a short plain-English meaning.\n\nNS speak:\n"""' + text + '"""'

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          output: { type: 'string' },
          detected: {
            type: 'array',
            items: {
              type: 'object',
              properties: { term: { type: 'string' }, meaning: { type: 'string' } },
              required: ['term', 'meaning'],
            },
          },
        },
        required: ['output', 'detected'],
      },
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    throw new Error(`Gemini API ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }

  const data = await res.json()
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) throw new Error('Gemini returned no content')

  const parsed = JSON.parse(raw)
  return {
    input: text,
    output: parsed.output || '',
    detected: Array.isArray(parsed.detected) ? parsed.detected : [],
    source: 'ai',
  }
}

// POST /translate — AI-powered NS speak → plain English, with dictionary fallback.
router.post('/translate', async (req, res, next) => {
  try {
    const text = (req.body?.text || '').toString()
    if (!text.trim()) return res.status(400).json({ error: 'text is required' })

    if (process.env.GEMINI_API_KEY) {
      try {
        return res.json(await aiTranslate(text))
      } catch (err) {
        // Log and gracefully fall back so the feature never hard-fails.
        console.error('⚠️  AI translate failed, using dictionary fallback:', err.message)
      }
    }

    res.json(await dictionaryTranslate(text))
  } catch (e) { next(e) }
})

// GET /translate/examples — worked examples for the translator UI.
router.get('/translate/examples', async (req, res, next) => {
  try {
    const examples = await TranslationExample.find().lean()
    res.json(examples)
  } catch (e) { next(e) }
})

export default router
