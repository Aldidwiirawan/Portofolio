import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../../hooks/useProjects'
import TechBadge from '../../components/TechBadge'
import ProjectForm from '../../components/admin/ProjectForm'
import './AdminProjectsPage.css'

/**
 * AdminProjectsPage Component (READ + CREATE)
 * Provides comprehensive portfolio project management for owner/admin:
 * 1. Fetches projects from public.projects via Supabase client.
 * 2. Allows inserting new projects via controlled ProjectForm with validation.
 */
function AdminProjectsPage() {
  const { projects, isLoading, error, refetch } = useProjects()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const featuredCount = projects.filter((p) => p.is_featured).length

  const handleCreateSuccess = (newProject) => {
    setIsFormOpen(false)
    setSuccessMessage(`Project "${newProject.title}" berhasil ditambahkan!`)
    refetch()
  }

  const handleOpenForm = () => {
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
  }

  return (
    <div className="admin-projects-page">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="container admin-navbar-inner">
          <div className="admin-nav-brand">
            <h1 className="admin-brand-title">Admin Portfolio CMS</h1>
            <span className="admin-badge-active">&bull; Projects</span>
          </div>

          <div className="admin-nav-actions">
            <Link to="/admin" className="btn btn-outline btn-sm">
              &larr; Dashboard
            </Link>
            <Link to="/" className="btn btn-outline btn-sm" title="Lihat website portfolio">
              Situs Publik
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <div className="container">
          {/* Header Action Bar */}
          <div className="admin-projects-header-actions">
            <Link to="/admin" className="admin-back-btn">
              <span>&larr;</span> Kembali ke Dashboard
            </Link>

            <div className="admin-header-button-group">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={refetch}
                disabled={isLoading}
                title="Segarkan data dari database"
              >
                {isLoading ? 'Memuat...' : 'Segarkan Data'}
              </button>

              {!isFormOpen && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenForm}
                >
                  + Tambah Project
                </button>
              )}
            </div>
          </div>

          {/* Success Banner Notification */}
          {successMessage && (
            <div className="admin-projects-success-banner" role="status">
              <span>{successMessage}</span>
              <button
                type="button"
                className="admin-banner-close-btn"
                onClick={() => setSuccessMessage(null)}
                aria-label="Tutup notifikasi"
              >
                &times;
              </button>
            </div>
          )}

          {/* Form Create Project Section (Conditional) */}
          {isFormOpen && (
            <ProjectForm
              onSuccess={handleCreateSuccess}
              onCancel={handleCancelForm}
            />
          )}

          {/* Title & Description */}
          <div className="admin-projects-title-box">
            <h2 className="admin-projects-heading">Manajemen Projects</h2>
            <p className="admin-projects-subheading">
              Kelola daftar portofolio proyek yang tersimpan di tabel database{' '}
              <code>public.projects</code>.
            </p>
          </div>

          {/* Summary Metrics */}
          <div className="admin-projects-summary-grid">
            <div className="admin-summary-card">
              <span className="admin-summary-label">Total Projects</span>
              <span className="admin-summary-value">{isLoading ? '—' : projects.length}</span>
            </div>

            <div className="admin-summary-card">
              <span className="admin-summary-label">Featured Projects</span>
              <span className="admin-summary-value">{isLoading ? '—' : featuredCount}</span>
            </div>

            <div className="admin-summary-card">
              <span className="admin-summary-label">Database Target</span>
              <span className="badge badge-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}>
                public.projects
              </span>
            </div>
          </div>

          {/* Conditional State: LOADING */}
          {isLoading && (
            <div className="admin-projects-skeleton-list" aria-busy="true" aria-label="Memuat daftar projects">
              {[1, 2, 3].map((item) => (
                <div key={item} className="admin-project-skeleton-card">
                  <div className="skeleton-shimmer skeleton-title-bar" />
                  <div className="skeleton-shimmer skeleton-desc-line" />
                  <div className="skeleton-shimmer skeleton-desc-line-short" />
                  <div className="skeleton-tags-row">
                    <div className="skeleton-shimmer skeleton-tag" />
                    <div className="skeleton-shimmer skeleton-tag" />
                    <div className="skeleton-shimmer skeleton-tag" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Conditional State: ERROR */}
          {!isLoading && error && (
            <div className="admin-projects-error-box" role="alert">
              <svg
                className="admin-projects-error-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3 className="admin-projects-error-title">Gagal Mengambil Data Projects</h3>
              <p className="admin-projects-error-desc">{error}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={refetch}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Conditional State: EMPTY */}
          {!isLoading && !error && projects.length === 0 && (
            <div className="admin-projects-empty-box">
              <svg
                className="admin-projects-empty-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <h3 className="admin-projects-empty-title">Belum ada project yang ditambahkan.</h3>
              <p className="admin-projects-empty-desc">
                Tabel <code>public.projects</code> saat ini belum memiliki record data. Klik tombol{' '}
                <strong>"+ Tambah Project"</strong> di atas untuk menambahkan portofolio pertama Anda.
              </p>
            </div>
          )}

          {/* Conditional State: SUCCESS (Projects List) */}
          {!isLoading && !error && projects.length > 0 && (
            <div className="admin-projects-list-grid">
              {projects.map((project) => {
                const techList = Array.isArray(project.tech_stack) ? project.tech_stack : []

                return (
                  <article
                    key={project.id}
                    className={`admin-project-item-card ${
                      project.is_featured ? 'is-featured-project' : ''
                    }`}
                  >
                    <div className="admin-project-card-header">
                      <div className="admin-project-title-wrapper">
                        <h3 className="admin-project-item-title">{project.title}</h3>
                        {project.slug && <span className="admin-project-slug">/{project.slug}</span>}
                      </div>

                      <div className="admin-project-badges-row">
                        {project.is_featured && (
                          <span className="admin-featured-badge">Featured</span>
                        )}
                        <span className="admin-sort-order-badge">
                          Urutan: {project.sort_order ?? 0}
                        </span>
                      </div>
                    </div>

                    <p className="admin-project-description">
                      {project.description || 'Tidak ada deskripsi singkat.'}
                    </p>

                    {techList.length > 0 && (
                      <div className="admin-project-tech-stack-row" aria-label="Teknologi">
                        {techList.map((tech) => (
                          <TechBadge key={tech} name={tech} />
                        ))}
                      </div>
                    )}

                    <div className="admin-project-card-footer">
                      <div className="admin-project-links">
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            className="admin-project-link-item"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>Demo Live</span>
                            <span aria-hidden="true">&rarr;</span>
                          </a>
                        )}

                        {project.github_url && (
                          <a
                            href={project.github_url}
                            className="admin-project-link-item"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>GitHub</span>
                            <span aria-hidden="true">&nearr;</span>
                          </a>
                        )}

                        {!project.demo_url && !project.github_url && (
                          <span style={{ color: 'var(--color-text-muted)' }}>Tautan belum tersedia</span>
                        )}
                      </div>

                      {project.created_at && (
                        <span className="admin-project-meta-date">
                          {new Date(project.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminProjectsPage
