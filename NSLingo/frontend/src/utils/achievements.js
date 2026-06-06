/* ============================================================
   Badge unlock rules — derive each badge's `unlocked` flag from
   the user's live progress instead of a hardcoded seed value.
   Keyed by badge id (matches both mock data and the backend's
   /badges response, which maps badgeId -> id).
   ============================================================ */

export function computeBadges(badges, progress, modules) {
  if (!badges) return []
  if (!progress) return badges.map((b) => ({ ...b, unlocked: false }))

  // Count distinct terms taught by the lessons the user has completed.
  const completed = new Set(progress.completedLessons || [])
  let termsLearned = 0
  for (const m of modules || []) {
    for (const l of m.lessons || []) {
      if (completed.has(l.id)) termsLearned += l.cards?.length || 0
    }
  }

  const rules = {
    'first-steps': (p) => (p.completedLessons?.length || 0) >= 1,
    'sharp-shooter': (p) => (p.perfectScores || 0) >= 1,
    'streak-5': (p) => (p.streak || 0) >= 5,
    commando: (p) => (p.completedModules || []).includes('basic-commands'),
    linguist: () => termsLearned >= 25,
    'rank-up': (p) => (p.completedModules || []).includes('rank-structure'),
    'field-ready': (p) => (p.completedModules || []).includes('equipment-terms'),
    'ns-ready': (p) => (p.readiness || 0) >= 100,
  }

  return badges.map((b) => ({
    ...b,
    unlocked: rules[b.id] ? rules[b.id](progress) : !!b.unlocked,
  }))
}
