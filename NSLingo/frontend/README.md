# NSLingo — Frontend

> *"Don't Blur. Learn NS Before NS."*

Duolingo-style web app that teaches Singapore National Service (NS) slang,
acronyms and terminology through bite-sized lessons and scenario quizzes.

This is the **React frontend** (the Presentation layer from the technical spec).
It currently runs **frontend-first** on local mock data, but every data call goes
through a single API service layer that switches to the real Express / MongoDB
Atlas backend the moment one is configured.

## Tech

- **React 18** + **Vite** (build tool)
- **React Router** (routing)
- **Bootstrap 5** + custom design tokens (`src/styles.css`)
- **axios** (API layer, JWT-ready)

## Getting started

```bash
cd NSLingo/frontend
npm install
npm run dev          # http://localhost:5173
```

Build for production (Vercel):

```bash
npm run build        # outputs to dist/
npm run preview      # preview the production build
```

## Connecting the backend later

The app uses mock data while `VITE_API_BASE_URL` is empty. To point it at the
Express/MongoDB Atlas backend, copy `.env.example` to `.env` and set:

```
VITE_API_BASE_URL=https://your-nslingo-api.onrender.com
```

The service layer ([src/services/api.js](src/services/api.js)) then calls the real
spec endpoints (`/dictionary`, `/translate`, `/quiz`, `/progress`, …) and attaches
the JWT from `localStorage` (`ns_token`) on every request. No component changes
needed.

## Project structure

```
src/
├── main.jsx              App entry (router + context + Bootstrap + styles)
├── App.jsx               Routes
├── styles.css            Design system (tokens, components, themes)
├── data/mockData.js      Mock data mirroring the Atlas collections
├── services/api.js       API layer (mock ↔ real backend switch)
├── context/AppContext.jsx  Progress/goal state + lesson/quiz logic
├── components/           Navbars, sidebar, layouts, loader
└── pages/               Landing, Onboarding, Dashboard, Lesson, Quiz,
                          Results, Glossary, Translator, Achievements, Profile
```

## Screens

| Route | Screen |
|---|---|
| `/` | Landing page |
| `/onboarding` | Set Goals → How it Works → Ready to Book In (stepper) |
| `/dashboard`, `/learn` | Learning Path (modules with XP + progress, locking) |
| `/lesson/:moduleId/:lessonId` | Lesson cards + pro tip → quiz |
| `/quiz/:moduleId` | Scenario MCQ with instant feedback |
| `/results` | Score, % correct, stars, XP, badge |
| `/glossary` | Searchable A–Z of NS terms |
| `/translator` | NS speak → plain English (blue theme) |
| `/achievements` | Badge catalogue |
| `/profile` | NS Recruit profile (purple theme) |

## Design system

The colour palette and component classes from the spec live in
[src/styles.css](src/styles.css) as CSS custom properties layered on Bootstrap.
Per-section accents re-theme by wrapping a page in `.theme-translator` (blue) or
`.theme-recruit` (purple).
