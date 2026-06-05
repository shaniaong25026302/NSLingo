import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User, UserProgress } from '../models/index.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

// POST /auth/register — create an account, start with empty progress, return a JWT.
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash, name })
    await UserProgress.create({ user: user._id })

    res.status(201).json({ token: signToken(user), user: { email: user.email, name: user.name } })
  } catch (e) { next(e) }
})

// POST /auth/login — verify credentials, return a JWT.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {}
    const user = await User.findOne({ email: (email || '').toLowerCase() })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password || '', user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    res.json({ token: signToken(user), user: { email: user.email, name: user.name } })
  } catch (e) { next(e) }
})

export default router
