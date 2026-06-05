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

// POST /translate — turn NS speak into plain English, highlighting detected terms.
router.post('/translate', async (req, res, next) => {
  try {
    const text = (req.body?.text || '').toString()
    if (!text.trim()) return res.status(400).json({ error: 'text is required' })

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

    res.json({ input: text, output: plain.trim(), detected })
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
