import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser, onAuthStateChange, verifyIsAdmin } from '../../lib/authService'
import './AdminRoute.css'

/**
 * AdminRoute Component (Auth & Role Guard)
 * Protects the /admin route. Enforces two-layer security check:
 * 1. User must possess an active Supabase Auth session.
 * 2. User's auth UID must match an existing row in public.profiles.user_id.
 */
function AdminRoute({ children }) {
  // Three primary states: 'checking' | 'authenticated_admin' | 'authenticated_non_admin' | 'unauthenticated'
  const [authState, setAuthState] = useState('checking')
  const location = useLocation()
  const lastVerifiedUserId = useRef(null)

  useEffect(() => {
    let isMounted = true

    async function evaluateUser(user) {
      if (!user) {
        lastVerifiedUserId.current = null
        if (isMounted) setAuthState('unauthenticated')
        return
      }

      // Avoid redundant queries if user ID has already been verified
      if (lastVerifiedUserId.current === user.id) {
        return
      }

      const isAdmin = await verifyIsAdmin(user.id)

      if (isMounted) {
        if (isAdmin) {
          lastVerifiedUserId.current = user.id
          setAuthState('authenticated_admin')
        } else {
          lastVerifiedUserId.current = null
          setAuthState('authenticated_non_admin')
        }
      }
    }

    // 1. Initial verification on mount
    async function initCheck() {
      try {
        const { user } = await getCurrentUser()
        await evaluateUser(user)
      } catch {
        if (isMounted) setAuthState('unauthenticated')
      }
    }

    initCheck()

    // 2. Subscribe to auth state transitions
    const subscription = onAuthStateChange(async (_event, session) => {
      await evaluateUser(session?.user ?? null)
    })

    // 3. Proper listener cleanup
    return () => {
      isMounted = false
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [])

  // State 1: Checking authentication & admin authorization
  if (authState === 'checking') {
    return (
      <div className="admin-auth-loading" role="status" aria-live="polite">
        <div className="admin-loading-spinner" aria-hidden="true" />
        <p className="admin-loading-text">Memverifikasi hak akses administrator...</p>
      </div>
    )
  }

  // State 2: Unauthenticated (no session) -> redirect to login
  if (authState === 'unauthenticated') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // State 3: Authenticated but NOT an admin (user_id not in public.profiles)
  if (authState === 'authenticated_non_admin') {
    return (
      <Navigate
        to="/admin/login"
        state={{
          from: location,
          accessDenied: true,
          deniedMessage:
            'Akses ditolak: Akun terautentikasi Anda tidak terdaftar sebagai administrator portfolio.',
        }}
        replace
      />
    )
  }

  // State 4: Authenticated Admin -> render protected dashboard
  return children
}

export default AdminRoute
