import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import contentRoutes from './routes/content.js'
import progressRoutes from './routes/progress.js'
import authRoutes from './routes/auth.js'

const app = express()

// ---- Middleware ----
const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
app.use(cors({ origin: origins, credentials: true }))
app.use(express.json())

// ---- Health check ----
app.get('/', (req, res) => res.json({ name: 'NSLingo API', status: 'ok' }))
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// ---- Routes (spec endpoints) ----
app.use('/', contentRoutes)            // /dictionary, /modules, /quiz, /translate, /badges
app.use('/progress', progressRoutes)   // /progress (JWT)
app.use('/auth', authRoutes)           // /auth/register, /auth/login

// ---- 404 + error handlers ----
app.use((req, res) => res.status(404).json({ error: 'Not found' }))
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

const PORT = process.env.PORT || 4000

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 NSLingo API running on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('❌ Failed to start:', err.message)
    process.exit(1)
  })
