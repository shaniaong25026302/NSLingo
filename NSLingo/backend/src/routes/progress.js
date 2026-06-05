import { Router } from 'express'
import { UserProgress } from '../models/index.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// All progress routes are protected (spec: /progress requires JWT).
router.use(requireAuth)

// GET /progress — the authenticated user's progress.
router.get('/', async (req, res, next) => {
  try {
    let progress = await UserProgress.findOne({ user: req.userId }).lean()
    if (!progress) {
      progress = (await UserProgress.create({ user: req.userId })).toObject()
    }
    res.json(progress)
  } catch (e) { next(e) }
})

// PUT /progress — replace the user's progress (upsert).
router.put('/', async (req, res, next) => {
  try {
    const allowed = [
      'goal', 'readiness', 'streak', 'totalXp', 'perfectScores',
      'completedModules', 'completedLessons', 'weeklyActivity', 'moduleProgress',
    ]
    const update = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key]
    }

    const progress = await UserProgress.findOneAndUpdate(
      { user: req.userId },
      { $set: update },
      { new: true, upsert: true }
    ).lean()

    res.json(progress)
  } catch (e) { next(e) }
})

export default router
