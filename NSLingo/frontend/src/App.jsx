import { Routes, Route, Navigate } from 'react-router-dom'
import MarketingLayout from './components/MarketingLayout.jsx'
import AppLayout from './components/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ModuleOverview from './pages/ModuleOverview.jsx'
import Lesson from './pages/Lesson.jsx'
import Quiz from './pages/Quiz.jsx'
import Results from './pages/Results.jsx'
import Glossary from './pages/Glossary.jsx'
import Translator from './pages/Translator.jsx'
import Achievements from './pages/Achievements.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public / onboarding (light navbar) */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      {/* Auth screens (no navbar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Onboarding — requires an account so the chosen goal is saved */}
      <Route
        path="/onboarding"
        element={<ProtectedRoute><Onboarding /></ProtectedRoute>}
      />

      {/* In-app screens (dark navbar + sidebar), all protected */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learn" element={<Dashboard />} />
        <Route path="/module/:moduleId" element={<ModuleOverview />} />
        <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
        <Route path="/quiz/:moduleId" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/translator" element={<Translator />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
