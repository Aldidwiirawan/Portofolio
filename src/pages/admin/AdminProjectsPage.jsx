import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { extractStoragePath } from '../../lib/storageUtils'
import { useProjects } from '../../hooks/useProjects'
import TechBadge from '../../components/TechBadge'
import ProjectForm from '../../components/admin/ProjectForm'
import './AdminProjectsPage.css'

/**
 * AdminProjectsPage Component (READ, CREATE, UPDATE, DELETE)
 * Provides comprehensive portfolio project management for owner/admin:
 * 1. Fetches projects from public.projects via Supabase client.
 * 2. Allows inserting and updating projects via controlled ProjectForm with validation.
 * 3. Supports safe deletion of projects with custom confirmation modal and thumbnail cleanup.
 */
function AdminProjectsPage() {
  const { projects, isLoading, error, refetch } = useProjects()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingProject, setDeletingProject] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const featuredCount = projects.filter((p) => p.is_featured).length

  // Keyboard accessibility: Close delete modal on Escape key press
  useEffect(() => {
    if (!deletingProject) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        setDeletingProject(null)
        setDeleteError(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deletingProject, isDeleting])

  const handleFormSuccess = (savedProject) => {
    const isEdit = Boolean(editingProject)
    setIsFormOpen(false)
    setEditingProject(null)
    setSuccessMessage(
      isEdit
        ? `Project "${savedProject.title}" berhasil diperbarui!`
        : `Project "${savedProject.title}" berhasil ditambahkan!`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingProject(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (project) => {
    setEditingProject(project)
    setSuccessMessage(null)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingProject(null)
  }

  const handleOpenDeleteModal = (project) => {
    setDeletingProject(project)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingProject(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingProject) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      // 1. Delete project from public.projects
      const { error: dbDeleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', deletingProject.id)

      if (dbDeleteError) {
        throw new Error(dbDeleteError.message || 'Gagal menghapus project dari database.')
      }

      // 2. Best-effort storage cleanup of thumbnail if exists
      if (deletingProject.thumbnail_url) {
        const storagePath = extractStoragePath(deletingProject.thumbnail_url)
        if (storagePath) {
          try {
            const { error: storageDeleteError } = await supabase.storage
              .from('portfolio-assets')
              .remove([storagePath])

            if (storageDeleteError) {
              console.warn(
                `[Storage Cleanup] Gagal menghapus thumbnail '${storagePath}':`,
                storageDeleteError.message
              )
            }
          } catch (storageEx) {
            console.warn(
              `[Storage Cleanup] Exception saat menghapus thumbnail '${storagePath}':`,
              storageEx
            )
          }
        }
      }

      // 3. Close edit form if current deleted project was being edited
      if (editingProject?.id === deletingProject.id) {
        setEditingProject(null)
        setIsFormOpen(false)
      }

      const deletedTitle = deletingProject.title
      setDeletingProject(null)
      setSuccessMessage(`Project "${deletedTitle}" berhasil dihapus!`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus project.'
      )
    } finally {
      setIsDeleting(false)
    }
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
                  onClick={handleOpenCreateForm}
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

          {/* Form Create / Edit Project Section (Conditional) */}
          {isFormOpen && (
            <ProjectForm
              key={editingProject?.id || 'new-project'}
              project={editingProject}
              onSuccess={handleFormSuccess}
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

                      <div className="admin-project-footer-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm admin-project-edit-btn"
                          onClick={() => handleOpenEditForm(project)}
                          title={`Edit project "${project.title}"`}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline btn-sm admin-project-delete-btn"
                          onClick={() => handleOpenDeleteModal(project)}
                          title={`Hapus project "${project.title}"`}
                        >
                          Hapus
                        </button>

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
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDeleteModal()
          }}
        >
          <div className="admin-modal-dialog">
            <div className="admin-modal-header">
              <div className="admin-modal-icon-warning" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 id="delete-modal-title" className="admin-modal-title">
                  Hapus Project
                </h3>
                <p className="admin-modal-subtitle">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="admin-modal-body">
              <p>
                Apakah Anda yakin ingin menghapus project{' '}
                <strong>"{deletingProject.title}"</strong>?
              </p>
              <p className="admin-modal-body-subtext">
                Record di tabel <code>public.projects</code> serta aset thumbnail terkait akan
                dihapus secara permanen.
              </p>

              {deleteError && (
                <div className="admin-modal-error-alert" role="alert">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm admin-modal-confirm-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProjectsPage
