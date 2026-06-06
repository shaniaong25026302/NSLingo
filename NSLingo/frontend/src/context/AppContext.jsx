import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getProgress, saveProgress, getModules } from '../services/api.js'
import { useAuth } from './AuthContext.jsx'

const AppContext = createContext(null)

// XP awarded per correct quiz answer.
const XP_PER_CORRECT = 10

// Complete progress shape (mirrors the backend defaults). Used to normalise
// loaded/updated progress so it's never partial — every page can safely read
// nested fields like `moduleProgress` and `completedModules`.
const DEFAULT_PROGRESS = {
  goal: 'Regular',
  readiness: 0,
  streak: 0,
  totalXp: 0,
  perfectScores: 0,
  completedModules: [],
  completedLessons: [],
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  moduleProgress: {},
  quizScores: {},
  lastActiveDate: null,
}

/* ---------- date helpers (local time, Mon=0 … Sun=6) ---------- */
function todayStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function dayIndexMonFirst(d = new Date()) {
  return (d.getDay() + 6) % 7 // JS: Sun=0 → we want Sun=6
}
function isYesterday(dateStr) {
  if (!dateStr) return false
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return todayStr(y) === dateStr
}

// Update streak + today's activity bar whenever the user earns XP.
function applyActivity(p, earnedXp) {
  const today = todayStr()
  let streak = p.streak || 0
  if (!p.lastActiveDate) {
    streak = Math.max(streak, 1) // first tracked activity — keep any seeded streak
  } else if (p.lastActiveDate === today) {
    // already active today — streak unchanged
  } else if (isYesterday(p.lastActiveDate)) {
    streak = streak + 1
  } else {
    streak = 1 // missed a day — reset
  }

  const weeklyActivity = [...p.weeklyActivity]
  const idx = dayIndexMonFirst()
  weeklyActivity[idx] = (weeklyActivity[idx] || 0) + earnedXp

  return { ...p, streak, weeklyActivity, lastActiveDate: today }
}

export function AppProvider({ children }) {
  const { token } = useAuth()
  const [progress, setProgress] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  // Load module structure once (public content). This is now the single
  // source of truth for readiness, unlock and badge math — no more mock import.
  useEffect(() => {
    let active = true
    getModules().then((m) => active && setModules(m || []))
    return () => { active = false }
  }, [])

  // Load the signed-in user's progress; clear it when they log out.
  useEffect(() => {
    if (!token) {
      setProgress(null)
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    getProgress()
      .then((p) => active && setProgress({ ...DEFAULT_PROGRESS, ...p }))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [token])

  // Persist whenever progress changes (only while signed in).
  useEffect(() => {
    if (progress && token) saveProgress(progress)
  }, [progress, token])

  const setGoal = useCallback((goal) => {
    setProgress((p) => ({ ...DEFAULT_PROGRESS, ...(p || {}), goal }))
  }, [])

  // Readiness = fraction of all lessons (across modules from the DB) completed.
  const totalLessons = modules.reduce((n, m) => n + (m.lessons?.length || 0), 0)
  const recomputeReadiness = useCallback(
    (completedLessons) => {
      if (!totalLessons) return 0
      return Math.round((completedLessons.length / totalLessons) * 100)
    },
    [totalLessons]
  )

  // Mark a lesson done; unlock module completion + readiness + activity.
  const completeLesson = useCallback(
    (moduleId, lessonId, xp = 0) => {
      setProgress((p) => {
        if (!p) return p
        const alreadyDone = p.completedLessons.includes(lessonId)
        const completedLessons = alreadyDone
          ? p.completedLessons
          : [...p.completedLessons, lessonId]

        const mod = modules.find((m) => m.id === moduleId)
        const moduleDone = mod && mod.lessons.every((l) => completedLessons.includes(l.id))
        const completedModules =
          moduleDone && !p.completedModules.includes(moduleId)
            ? [...p.completedModules, moduleId]
            : p.completedModules

        const lessonsDoneInModule = mod
          ? mod.lessons.filter((l) => completedLessons.includes(l.id)).length
          : 0
        const modulePct = mod ? Math.round((lessonsDoneInModule / mod.lessons.length) * 100) : 0

        const addedXp = alreadyDone ? 0 : xp

        let next = {
          ...p,
          completedLessons,
          completedModules,
          totalXp: p.totalXp + addedXp,
          readiness: recomputeReadiness(completedLessons),
          moduleProgress: { ...p.moduleProgress, [moduleId]: modulePct },
        }
        if (addedXp > 0) next = applyActivity(next, addedXp)
        return next
      })
    },
    [modules, recomputeReadiness]
  )

  // Record a quiz result. Rewards only the improvement over the previous best
  // for that module, so replaying a quiz can't farm XP or perfect-score counts.
  // Returns the XP actually awarded this attempt (for the Results screen).
  const recordQuiz = useCallback(
    (moduleId, score, total) => {
      const prevBest = progress?.quizScores?.[moduleId] ?? 0
      const awardedXp = Math.max(0, score - prevBest) * XP_PER_CORRECT

      setProgress((p) => {
        if (!p) return p
        const pb = p.quizScores?.[moduleId] ?? 0
        const improvement = Math.max(0, score - pb)
        const added = improvement * XP_PER_CORRECT
        const newlyPerfect = score === total && pb < total
        let next = {
          ...p,
          totalXp: p.totalXp + added,
          perfectScores: newlyPerfect ? p.perfectScores + 1 : p.perfectScores,
          quizScores: { ...(p.quizScores || {}), [moduleId]: Math.max(score, pb) },
        }
        if (added > 0) next = applyActivity(next, added)
        return next
      })

      return awardedXp
    },
    [progress]
  )

  // Module is unlocked if it's the first, or the previous module is complete.
  const isModuleUnlocked = useCallback(
    (moduleId) => {
      if (!progress) return false
      const ordered = [...modules].sort((a, b) => a.order - b.order)
      const idx = ordered.findIndex((m) => m.id === moduleId)
      if (idx <= 0) return true
      return progress.completedModules.includes(ordered[idx - 1].id)
    },
    [progress, modules]
  )

  const value = {
    progress, modules, loading, setProgress,
    setGoal, completeLesson, recordQuiz, isModuleUnlocked,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
