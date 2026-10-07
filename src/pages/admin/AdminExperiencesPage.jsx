import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useExperiences } from '../../hooks/useExperiences'
import ExperienceForm from '../../components/admin/ExperienceForm'
import './AdminProjectsPage.css'
import './AdminExperiencesPage.css'

/**
 * Helper: Formats ISO date (YYYY-MM-DD) into Indonesian Month & Year
 * @param {string|null} dateStr
 * @returns {string}
 */
function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

/**
 * AdminExperiencesPage Component (CRUD)
 * Allows owner/admin to manage professional & academic experiences in public.experiences:
 * - Read experiences with period & active status indicators
 * - Create new experience
 * - Update existing experience
 * - Delete experience with custom confirmation modal
 */
function AdminExperiencesPage() {
  const { experiences, isLoading, error, refetch } = useExperiences()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExp, setEditingExp] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingExp, setDeletingExp] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const activeCount = experiences.filter((e) => e.is_current).length

  // Keyboard accessibility: Escape key closes delete modal
  useEffect(() => {
    if (!deletingExp) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        setDeletingExp(null)
        setDeleteError(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deletingExp, isDeleting])

  const handleFormSuccess = (savedExp) => {
    const isEdit = Boolean(editingExp)
    setIsFormOpen(false)
    setEditingExp(null)
    setSuccessMessage(
      isEdit
        ? `Pengalaman "${savedExp.role}" di ${savedExp.company} berhasil diperbarui!`
        : `Pengalaman "${savedExp.role}" di ${savedExp.company} berhasil ditambahkan!`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingExp(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (exp) => {
    setEditingExp(exp)
    setSuccessMessage(null)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingExp(null)
  }

  const handleOpenDeleteModal = (exp) => {
    setDeletingExp(exp)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingExp(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingExp) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbDeleteError } = await supabase
        .from('experiences')
        .delete()
        .eq('id', deletingExp.id)

      if (dbDeleteError) {
        throw new Error(
          dbDeleteError.message || 'Gagal menghapus pengalaman dari database.'
        )
      }

      if (editingExp?.id === deletingExp.id) {
        setEditingExp(null)
        setIsFormOpen(false)
      }

      const deletedTitle = `${deletingExp.role} di ${deletingExp.company}`
      setDeletingExp(null)
      setSuccessMessage(`Pengalaman "${deletedTitle}" berhasil dihapus!`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus pengalaman.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="admin-experiences-page">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="container admin-navbar-inner">
          <div className="admin-nav-brand">
            <h1 className="admin-brand-title">Admin Portfolio CMS</h1>
            <span className="admin-badge-active">&bull; Experiences</span>
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
          <div className="admin-exp-header-actions">
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
                  + Tambah Pengalaman
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

          {/* Form Create / Edit Experience (Conditional) */}
          {isFormOpen && (
            <ExperienceForm
              key={editingExp?.id || 'new-experience'}
              experience={editingExp}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
            />
          )}

          {/* Title & Description */}
          <div className="admin-exp-title-box">
            <h2 className="admin-exp-heading">Manajemen Pengalaman (Experiences)</h2>
            <p className="admin-exp-subheading">
              Kelola riwayat karir, posisi magang, proyek mandiri, dan kegiatan akademik di tabel{' '}
              <code>public.experiences</code>.
            </p>
          </div>

          {/* Summary Metrics */}
          <div className="admin-projects-summary-grid">
            <div className="admin-summary-card">
              <span className="admin-summary-label">Total Pengalaman</span>
              <span className="admin-summary-value">
                {isLoading ? '—' : experiences.length}
              </span>
            </div>

            <div className="admin-summary-card">
              <span className="admin-summary-label">Posisi Aktif (Saat Ini)</span>
              <span className="admin-summary-value">{isLoading ? '—' : activeCount}</span>
            </div>

            <div className="admin-summary-card">
              <span className="admin-summary-label">Database Target</span>
              <span
                className="badge badge-primary"
                style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
              >
                public.experiences
              </span>
            </div>
          </div>

          {/* Conditional State: LOADING */}
          {isLoading && (
            <div
              className="admin-projects-skeleton-list"
              aria-busy="true"
              aria-label="Memuat riwayat pengalaman"
            >
              {[1, 2].map((item) => (
                <div key={item} className="admin-project-skeleton-card">
                  <div className="skeleton-shimmer skeleton-title-bar" />
                  <div className="skeleton-shimmer skeleton-desc-line" />
                  <div className="skeleton-shimmer skeleton-desc-line-short" />
                </div>
              ))}
            </div>
          )}

          {/* Conditional State: ERROR */}
          {!isLoading && error && (
            <div className="admin-projects-error-box" role="alert">
              <h3 className="admin-projects-error-title">Gagal Mengambil Data Pengalaman</h3>
              <p className="admin-projects-error-desc">{error}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={refetch}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Conditional State: EMPTY */}
          {!isLoading && !error && experiences.length === 0 && (
            <div className="admin-projects-empty-box">
              <h3 className="admin-projects-empty-title">Belum ada pengalaman yang ditambahkan.</h3>
              <p className="admin-projects-empty-desc">
                Tabel <code>public.experiences</code> saat ini belum memiliki record data. Klik
                tombol <strong>"+ Tambah Pengalaman"</strong> di atas untuk menambahkan riwayat
                pertama Anda.
              </p>
            </div>
          )}

          {/* Conditional State: SUCCESS (Experiences List) */}
          {!isLoading && !error && experiences.length > 0 && (
            <div className="admin-exp-list-grid">
              {experiences.map((exp) => {
                const periodText = exp.is_current
                  ? `${formatDateDisplay(exp.start_date)} — Sekarang`
                  : `${formatDateDisplay(exp.start_date)} — ${
                      formatDateDisplay(exp.end_date) || 'Selesai'
                    }`

                return (
                  <article
                    key={exp.id}
                    className={`admin-exp-card-item ${
                      exp.is_current ? 'is-current-active' : ''
                    }`}
                  >
                    <div className="admin-exp-card-header">
                      <div>
                        <h3 className="admin-exp-role-title">{exp.role}</h3>
                        <p className="admin-exp-company-sub">
                          <span>{exp.company}</span>
                          {exp.location && (
                            <span className="admin-exp-location-dot">
                              &bull; {exp.location}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="admin-exp-meta-badges">
                        <span className="badge badge-primary">
                          {exp.experience_type || 'Kerja'}
                        </span>
                        <span className="admin-exp-period-badge">{periodText}</span>
                        {exp.is_current && (
                          <span className="admin-exp-current-badge">Aktif</span>
                        )}
                      </div>
                    </div>

                    {exp.description && (
                      <p className="admin-exp-desc-text">{exp.description}</p>
                    )}

                    <div className="admin-exp-footer-bar">
                      <span className="admin-sort-order-badge">
                        Urutan: {exp.sort_order ?? 0}
                      </span>

                      <div className="admin-exp-footer-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm admin-project-edit-btn"
                          onClick={() => handleOpenEditForm(exp)}
                          title={`Edit pengalaman "${exp.role} di ${exp.company}"`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm admin-project-delete-btn"
                          onClick={() => handleOpenDeleteModal(exp)}
                          title={`Hapus pengalaman "${exp.role} di ${exp.company}"`}
                        >
                          Hapus
                        </button>
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
      {deletingExp && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-exp-modal-title"
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
                <h3 id="delete-exp-modal-title" className="admin-modal-title">
                  Hapus Pengalaman
                </h3>
                <p className="admin-modal-subtitle">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="admin-modal-body">
              <p>
                Apakah Anda yakin ingin menghapus riwayat pengalaman{' '}
                <strong>
                  "{deletingExp.role} di {deletingExp.company}"
                </strong>
                ?
              </p>
              <p className="admin-modal-body-subtext">
                Record di tabel <code>public.experiences</code> akan dihapus secara permanen.
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
                    <line x1="12" y1="8" x2="12.01" y2="16" />
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
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Pengalaman'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminExperiencesPage
