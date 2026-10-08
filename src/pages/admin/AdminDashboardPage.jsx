import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser, onAuthStateChange, signOut } from '../../lib/authService'
import './AdminDashboardPage.css'

/**
 * AdminDashboardPage Component (Placeholder for Stage 3 routing setup)
 * Displays active session status, admin email, logout button, and CMS module placeholders.
 */
function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      const { user } = await getCurrentUser()
      if (isMounted) {
        setCurrentUser(user)
      }
    }

    loadUser()

    const subscription = onAuthStateChange((_event, session) => {
      if (isMounted) {
        if (!session?.user) {
          navigate('/admin/login', { replace: true })
        } else {
          setCurrentUser(session.user)
        }
      }
    })

    return () => {
      isMounted = false
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [navigate])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      // Navigasi ke /admin/login setelah sesi dibersihkan
      navigate('/admin/login', { replace: true })
    } catch {
      setIsLoggingOut(false)
    }
  }

  const cmsModules = [
    {
      name: 'Profile',
      description: 'Pengelolaan data biografi, status ketersediaan, kontak, dan tautan sosial.',
      table: 'public.profiles',
    },
    {
      name: 'Projects',
      description: 'Pengelolaan daftar karya proyek, thumbnail, deskripsi, demo, dan repository.',
      table: 'public.projects',
    },
    {
      name: 'Skills',
      description: 'Pengelompokan keahlian teknis (Frontend, Backend, Database, Tools).',
      table: 'public.skills',
    },
    {
      name: 'Experiences',
      description: 'Pengelolaan riwayat pengalaman kerja dan proyek pengembangan.',
      table: 'public.experiences',
    },
    {
      name: 'Educations',
      description: 'Pengelolaan riwayat akademis dan sertifikasi formal.',
      table: 'public.educations',
    },
    {
      name: 'Messages',
      description: 'Melihat dan meninjau pesan masuk dari formulir kontak publik.',
      table: 'public.messages',
    },
    {
      name: 'Certifications',
      description: 'Pengelolaan sertifikasi profesional, kursus, lisensi, dan tautan kredensial.',
      table: 'public.certifications',
    },
    {
      name: 'Achievements',
      description: 'Pengelolaan prestasi, kejuaraan kompetisi, dan penghargaan yang diraih.',
      table: 'public.achievements',
    },
    {
      name: 'Languages',
      description: 'Pengelolaan bahasa komunikasi dan tingkat kemahiran (profisiensi).',
      table: 'public.languages',
    },
    {
      name: 'Organizations',
      description: 'Pengelolaan pengalaman organisasi kampus, komunitas IT, dan kepanitiaan.',
      table: 'public.organizations',
    },
    {
      name: 'Guestbook',
      description: 'Pengelolaan buku tamu publik dan memberikan balasan resmi [DEV ALDI].',
      table: 'public.guestbooks',
    },
  ]

  return (
    <div className="admin-dashboard-page">
      {/* Admin Navbar */}
      <header className="admin-navbar">
        <div className="container admin-navbar-inner">
          <div className="admin-nav-brand">
            <h1 className="admin-brand-title">Admin Portfolio CMS</h1>
            <span className="admin-badge-active">&bull; Terautentikasi</span>
          </div>

          <div className="admin-nav-actions">
            {currentUser?.email && (
              <div className="admin-user-info">
                <span>Login sebagai: </span>
                <span className="admin-user-email">{currentUser.email}</span>
              </div>
            )}

            <Link to="/" className="btn btn-outline btn-sm" title="Lihat website portfolio">
              Situs Publik
            </Link>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Keluar...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="admin-main-content">
        <div className="container">
          <div className="admin-welcome-banner">
            <h2 className="admin-welcome-title">Selamat Datang di Panel CMS Portfolio</h2>
            <p className="admin-welcome-desc">
              Arsitektur routing terproteksi dan sesi autentikasi Supabase Auth telah aktif. Sesi ini
              dibatasi hanya untuk akun pemilik portfolio terdaftar. Seluruh operasi CRUD untuk
              modul di bawah terhubung langsung ke database Supabase.
            </p>
          </div>

          <h3 className="admin-modules-title">Modul Pengelolaan Konten</h3>
          <div className="admin-modules-grid">
            {cmsModules.map((module) => {
              const routeMap = {
                Profile: '/admin/profile',
                Projects: '/admin/projects',
                Skills: '/admin/skills',
                Experiences: '/admin/experiences',
                Educations: '/admin/educations',
                Messages: '/admin/messages',
                Certifications: '/admin/certifications',
                Achievements: '/admin/achievements',
                Languages: '/admin/languages',
                Organizations: '/admin/organizations',
                Guestbook: '/admin/guestbook',
              }
              const targetPath = routeMap[module.name]

              if (targetPath) {
                return (
                  <Link
                    key={module.name}
                    to={targetPath}
                    className="admin-module-card clickable"
                    title={`Buka Manajemen ${module.name}`}
                    aria-label={`Buka Manajemen ${module.name}`}
                  >
                    <div className="admin-module-header">
                      <h4 className="admin-module-name">{module.name}</h4>
                      <span className="admin-module-status">Buka Modul &rarr;</span>
                    </div>
                    <p className="admin-module-desc">{module.description}</p>
                    <div className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>
                      {module.table}
                    </div>
                  </Link>
                )
              }

              return (
                <div key={module.name} className="admin-module-card">
                  <div className="admin-module-header">
                    <h4 className="admin-module-name">{module.name}</h4>
                    <span className="admin-module-status">Tahap Berikutnya</span>
                  </div>
                  <p className="admin-module-desc">{module.description}</p>
                  <div className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>
                    {module.table}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboardPage
