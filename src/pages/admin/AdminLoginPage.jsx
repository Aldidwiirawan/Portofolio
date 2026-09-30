import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  getCurrentUser,
  onAuthStateChange,
  signIn,
  signOut,
  verifyIsAdmin,
} from '../../lib/authService'
import './AdminLoginPage.css'

/**
 * AdminLoginPage Component
 * Provides authentication interface for portfolio owner / admin.
 * Verifies admin privileges before redirecting to dashboard.
 */
function AdminLoginPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState(location.state?.deniedMessage || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [nonAdminUser, setNonAdminUser] = useState(null)

  const destination = location.state?.from?.pathname || '/admin'

  useEffect(() => {
    let isMounted = true

    // Check existing session on mount
    async function checkExistingAuth() {
      try {
        const { user } = await getCurrentUser()
        if (isMounted) {
          if (user) {
            const isAdmin = await verifyIsAdmin(user.id)
            if (isAdmin) {
              navigate(destination, { replace: true })
              return
            } else {
              setNonAdminUser(user)
              setErrorMsg(
                'Akun Anda saat ini tidak terdaftar sebagai administrator portfolio.'
              )
            }
          }
          setIsCheckingAuth(false)
        }
      } catch {
        if (isMounted) {
          setIsCheckingAuth(false)
        }
      }
    }

    checkExistingAuth()

    const subscription = onAuthStateChange(async (_event, session) => {
      if (isMounted && session?.user) {
        const isAdmin = await verifyIsAdmin(session.user.id)
        if (isAdmin) {
          navigate(destination, { replace: true })
        } else {
          setNonAdminUser(session.user)
          setErrorMsg(
            'Akun Anda saat ini tidak terdaftar sebagai administrator portfolio.'
          )
        }
      }
    })

    return () => {
      isMounted = false
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [navigate, destination])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        setErrorMsg(error.message || 'Gagal masuk. Periksa kembali email dan password Anda.')
        setIsSubmitting(false)
        return
      }

      if (data?.user) {
        // Enforce admin profile verification
        const isAdmin = await verifyIsAdmin(data.user.id)

        if (!isAdmin) {
          await signOut()
          setErrorMsg(
            'Akses ditolak: Akun terotentikasi ini tidak terdaftar sebagai administrator portfolio.'
          )
          setIsSubmitting(false)
          return
        }

        navigate(destination, { replace: true })
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat mencoba autentikasi.')
      setIsSubmitting(false)
    }
  }

  const handleNonAdminSignOut = async () => {
    await signOut()
    setNonAdminUser(null)
    setErrorMsg('')
  }

  if (isCheckingAuth) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-loading-spinner" aria-hidden="true" />
        <p className="admin-loading-text">Memeriksa status login...</p>
      </div>
    )
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-login-badge">Portal CMS Portfolio</span>
          <h1 className="admin-login-title">Admin Login</h1>
          <p className="admin-login-subtitle">
            Masuk dengan akun pemilik portfolio untuk mengelola konten dan pesan masuk.
          </p>
        </div>

        {errorMsg && (
          <div className="admin-login-alert admin-login-alert-error" role="alert">
            {errorMsg}
          </div>
        )}

        {nonAdminUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Sedang login sebagai: <strong>{nonAdminUser.email}</strong> (Non-Admin). Silakan
              keluar untuk masuk dengan akun administrator.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg admin-login-btn"
              onClick={handleNonAdminSignOut}
            >
              Keluar dari Akun Ini
            </button>
          </div>
        ) : (
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="admin-email" className="admin-form-label">
                Email Admin
              </label>
              <input
                id="admin-email"
                type="email"
                className="admin-form-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password" className="admin-form-label">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                className="admin-form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg admin-login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        )}

        <div className="admin-login-footer">
          <Link to="/" className="admin-back-link">
            <span>&larr;</span> Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
