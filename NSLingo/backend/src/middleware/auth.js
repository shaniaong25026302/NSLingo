import jwt from 'jsonwebtoken'

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
