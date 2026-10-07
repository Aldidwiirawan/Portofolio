import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicPortfolioPage from './pages/PublicPortfolioPage'
import AdminRoute from './components/admin/AdminRoute'
import './App.css'

// Lazy load admin pages for clean code splitting and smaller initial bundle size
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'))
const AdminSkillsPage = lazy(() => import('./pages/admin/AdminSkillsPage'))
const AdminExperiencesPage = lazy(() => import('./pages/admin/AdminExperiencesPage'))
const AdminEducationsPage = lazy(() => import('./pages/admin/AdminEducationsPage'))
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'))
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'))
const AdminCertificationsPage = lazy(() => import('./pages/admin/AdminCertificationsPage'))
const AdminAchievementsPage = lazy(() => import('./pages/admin/AdminAchievementsPage'))
const AdminLanguagesPage = lazy(() => import('./pages/admin/AdminLanguagesPage'))
const AdminOrganizationsPage = lazy(() => import('./pages/admin/AdminOrganizationsPage'))

function PageFallback() {
  return (
    <div className="admin-auth-loading" role="status" aria-live="polite">
      <div className="admin-loading-spinner" aria-hidden="true" />
      <p className="admin-loading-text">Memuat halaman...</p>
    </div>
  )
}

/**
 * Root Application Component with Public & Admin Route Separation
 */
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Portfolio Route */}
          <Route path="/" element={<PublicPortfolioPage />} />

          {/* Admin Authentication Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin CMS Dashboard Route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          {/* Protected Admin Projects Module Route */}
          <Route
            path="/admin/projects"
            element={
              <AdminRoute>
                <AdminProjectsPage />
              </AdminRoute>
            }
          />

          {/* Protected Admin Skills Module Route */}
          <Route
            path="/admin/skills"
            element={
              <AdminRoute>
                <AdminSkillsPage />
              </AdminRoute>
            }
          />

          {/* Protected Admin Experiences Module Route */}
          <Route
            path="/admin/experiences"
            element={
              <AdminRoute>
                <AdminExperiencesPage />
              </AdminRoute>
            }
          />

          {/* Protected Admin Educations Module Route */}
          <Route
            path="/admin/educations"
            element={
              <AdminRoute>
                <AdminEducationsPage />
              </AdminRoute>
            }
          />

          {/* Protected Admin Profile Settings Module Route */}
          <Route
            path="/admin/profile"
            element={
              <AdminRoute>
                <AdminProfilePage />
              </AdminRoute>
            }
          />

          {/* Protected Admin Inbox Messages Module Route */}
          <Route
            path="/admin/messages"
            element={
              <AdminRoute>
                <AdminMessagesPage />
              </AdminRoute>
            }
          />

          {/* Protected Admin Certifications Module Route */}
          <Route
            path="/admin/certifications"
            element={
              <AdminRoute>
                <AdminCertificationsPage />
              </AdminRoute>
            }
          />

          {/* Protected Admin Achievements Module Route */}
          <Route
            path="/admin/achievements"
            element={
              <AdminRoute>
                <AdminAchievementsPage />
              </AdminRoute>
            }
          />

          {/* Protected Admin Languages Module Route */}
          <Route
            path="/admin/languages"
            element={
              <AdminRoute>
                <AdminLanguagesPage />
              </AdminRoute>
            }
          />

          {/* Protected Admin Organizations Module Route */}
          <Route
            path="/admin/organizations"
            element={
              <AdminRoute>
                <AdminOrganizationsPage />
              </AdminRoute>
            }
          />

          {/* Fallback Catch-All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
