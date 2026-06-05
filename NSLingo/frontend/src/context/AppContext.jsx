import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getProgress, saveProgress } from '../services/api.js'
import { useAuth } from './AuthContext.jsx'
import { modules } from '../data/mockData.js'

const AppContext = createContext(null)

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
}

export function AppProvider({ children }) {
  const { token } = useAuth()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

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

  // Recompute readiness as fraction of all lessons completed.
  const recomputeReadiness = (completedLessons) => {
    const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0)
    return Math.round((completedLessons.length / totalLessons) * 100)
  }

  // Mark a lesson done; unlock module completion + readiness.
  const completeLesson = useCallback((moduleId, lessonId, xp = 0) => {
    setProgress((p) => {
      if (!p) return p
      const completedLessons = p.completedLessons.includes(lessonId)
        ? p.completedLessons
        : [...p.completedLessons, lessonId]

      const mod = modules.find((m) => m.id === moduleId)
      const moduleDone = mod && mod.lessons.every((l) => completedLessons.includes(l.id))
      const completedModules = moduleDone && !p.completedModules.includes(moduleId)
        ? [...p.completedModules, moduleId]
        : p.completedModules

      const lessonsDoneInModule = mod
        ? mod.lessons.filter((l) => completedLessons.includes(l.id)).length
        : 0
      const modulePct = mod ? Math.round((lessonsDoneInModule / mod.lessons.length) * 100) : 0

      const addedXp = p.completedLessons.includes(lessonId) ? 0 : xp

      return {
        ...p,
        completedLessons,
        completedModules,
        totalXp: p.totalXp + addedXp,
        readiness: recomputeReadiness(completedLessons),
        moduleProgress: { ...p.moduleProgress, [moduleId]: modulePct },
      }
    })
  }, [])

  // Record a quiz result.
  const recordQuiz = useCallback((moduleId, score, total, xp = 0) => {
    setProgress((p) => {
      if (!p) return p
      const perfect = score === total
      return {
        ...p,
        totalXp: p.totalXp + xp,
        perfectScores: perfect ? p.perfectScores + 1 : p.perfectScores,
      }
    })
  }, [])

  // Module is unlocked if it's the first, or the previous module is complete.
  const isModuleUnlocked = useCallback((moduleId) => {
    if (!progress) return false
    const ordered = [...modules].sort((a, b) => a.order - b.order)
    const idx = ordered.findIndex((m) => m.id === moduleId)
    if (idx <= 0) return true
    return progress.completedModules.includes(ordered[idx - 1].id)
  }, [progress])

  const value = {
    progress, loading, setProgress,
    setGoal, completeLesson, recordQuiz, isModuleUnlocked,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
