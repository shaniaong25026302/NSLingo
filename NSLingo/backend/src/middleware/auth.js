import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

/**
 * Verifies the JWT on protected routes (spec: /progress requires JWT).
 * Each request is scoped to the authenticated user, so progress is per-account.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.sub
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Gate forum moderation routes (list reports, delete content) to admins only.
 *
 * ⚠️ FLAGGED TO THE TEAM: the app had no existing role/permission system, so
 * this is the "simple check" the brief asked for. We added an `isAdmin` boolean
 * to the User model (default false). To make someone a moderator, set
 * `isAdmin: true` on their user document in MongoDB Atlas, e.g.
 *   db.users.updateOne({ email: 'you@example.com' }, { $set: { isAdmin: true } })
 *
 * Must run AFTER requireAuth (it relies on req.userId being set).
 */
export async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('isAdmin').lean()
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }
    return next()
  } catch (err) {
    return next(err)
  }
}
