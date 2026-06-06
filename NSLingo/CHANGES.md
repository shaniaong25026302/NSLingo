# NSLingo — fixes (v2, rebased on the current `main`)

These are the same gameplay/data fixes as before, but rebased onto the code that's
**currently on GitHub** — so they keep the team's recent work intact:

- ✅ The AI-powered translator (Gemini) in `backend/src/routes/content.js` is **untouched**.
- ✅ `frontend/vercel.json` is **untouched**.
- ✅ The "✨ AI-powered / 📖 Dictionary" badge in the Translator is **kept**.

## How to apply
The folder structure here mirrors the repo (files live under `NSLingo/`). Unzip
`nslingo-fixes-v2.zip` at the **repo root**, so each file lands in place. Then
`git diff` to review, commit, and push. Because Vercel + Render auto-deploy from
GitHub, the live site updates on its own after the push.

## Files changed (9)

| File | Change |
|---|---|
| `NSLingo/backend/src/models/index.js` | Added `quizScores` + `lastActiveDate` to `userProgress`. |
| `NSLingo/backend/src/routes/progress.js` | Allow those two fields through `PUT /progress`. |
| `NSLingo/frontend/src/context/AppContext.jsx` | **Rewritten.** Reads modules from the backend (not the mock file); updates streak + weekly activity; quiz XP no longer farmable. |
| `NSLingo/frontend/src/utils/achievements.js` | **New file.** Computes badge unlocks from live progress. |
| `NSLingo/frontend/src/pages/Achievements.jsx` | Uses the live badge logic. |
| `NSLingo/frontend/src/pages/Profile.jsx` | Uses the live badge logic. |
| `NSLingo/frontend/src/pages/Quiz.jsx` | New `recordQuiz` (returns XP actually awarded). |
| `NSLingo/frontend/src/services/api.js` | `getTranslationExamples()` fetches from the backend in API mode. |
| `NSLingo/frontend/src/pages/Translator.jsx` | Loads examples asynchronously **and** keeps the AI/Dictionary badge. |

## What these fix
1. **Streak + weekly activity now update** when you earn XP (same day = no change,
   next day = +1, missed a day = reset). A seeded streak is preserved.
2. **Badges unlock from real progress** — no more brand-new accounts showing badges
   they didn't earn.
3. **Quiz XP can't be farmed** — replaying only rewards beating your previous best.
4. **Modules are a single source of truth** — progress math follows the database, not
   the mock file.
5. **Translator examples come from the DB** when connected.

## Test after pushing (on the live URL, fresh account)
- [ ] New account starts at 0 XP / 0 streak / 0 badges (not pre-unlocked).
- [ ] Finish a lesson → XP up, today's weekly bar grows, "First Steps" unlocks.
- [ ] Perfect quiz → "Sharp Shooter" unlocks; replay it → +0 XP (no farming).
- [ ] Refresh + log out/in → progress persists; confirm in Atlas `userprogress`.
- [ ] Translator still works and shows the AI or Dictionary badge.

## Note
No `.env` values changed. The Gemini AI translator only activates when
`GEMINI_API_KEY` is set on Render; without it, it safely uses the dictionary.
