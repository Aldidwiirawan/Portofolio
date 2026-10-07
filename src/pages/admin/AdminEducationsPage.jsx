import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useEducations } from '../../hooks/useEducations'
import EducationForm from '../../components/admin/EducationForm'
import './AdminProjectsPage.css'
import './AdminEducationsPage.css'

/**
 * AdminEducationsPage Component (CRUD)
 * Allows owner/admin to manage academic credentials in public.educations:
 * - Read educations with period & active study status
 * - Create new education record
 * - Update existing education
 * - Delete education with custom confirmation modal
 */
function AdminEducationsPage() {
  const { educations, isLoading, error, refetch } = useEducations()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEdu, setEditingEdu] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingEdu, setDeletingEdu] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const activeCount = educations.filter((e) => e.is_current).length

  // Keyboard accessibility: Escape key closes delete modal
  useEffect(() => {
    if (!deletingEdu) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        setDeletingEdu(null)
        setDeleteError(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deletingEdu, isDeleting])

  const handleFormSuccess = (savedEdu) => {
    const isEdit = Boolean(editingEdu)
    setIsFormOpen(false)
    setEditingEdu(null)
    setSuccessMessage(
      isEdit
        ? `Riwayat pendidikan "${savedEdu.degree} - ${savedEdu.field_of_study}" berhasil diperbarui!`
        : `Riwayat pendidikan "${savedEdu.degree} - ${savedEdu.field_of_study}" berhasil ditambahkan!`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingEdu(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (edu) => {
    setEditingEdu(edu)
    setSuccessMessage(null)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingEdu(null)
  }

  const handleOpenDeleteModal = (edu) => {
    setDeletingEdu(edu)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingEdu(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingEdu) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbDeleteError } = await supabase
        .from('educations')
        .delete()
        .eq('id', deletingEdu.id)

      if (dbDeleteError) {
        throw new Error(
          dbDeleteError.message || 'Gagal menghapus data pendidikan dari database.'
        )
      }

      if (editingEdu?.id === deletingEdu.id) {
        setEditingEdu(null)
        setIsFormOpen(false)
      }

      const deletedTitle = `${deletingEdu.degree} - ${deletingEdu.field_of_study} (${deletingEdu.institution})`
      setDeletingEdu(null)
      setSuccessMessage(`Riwayat pendidikan "${deletedTitle}" berhasil dihapus!`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus data pendidikan.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="admin-educations-page">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="container admin-navbar-inner">
          <div className="admin-nav-brand">
            <h1 className="admin-brand-title">Admin Portfolio CMS</h1>
            <span className="admin-badge-active">&bull; Educations</span>
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
          <div className="admin-edu-header-actions">
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
                  + Tambah Pendidikan
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

          {/* Form Create / Edit Education (Conditional) */}
          {isFormOpen && (
            <EducationForm
              key={editingEdu?.id || 'new-education'}
              education={editingEdu}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
            />
          )}

          {/* Title & Description */}
          <div className="admin-edu-title-box">
            <h2 className="admin-edu-heading">Manajemen Pendidikan (Educations)</h2>
            <p className="admin-edu-subheading">
              Kelola riwayat pendidikan formal dan sertifikasi akademis di tabel database{' '}
              <code>public.educations</code>.
            </p>
          </div>

          {/* Summary Metrics */}
          <div className="admin-projects-summary-grid">
            <div className="admin-summary-card">
              <span className="admin-summary-label">Total Pendidikan</span>
              <span className="admin-summary-value">{isLoading ? '—' : educations.length}</span>
            </div>

            <div className="admin-summary-card">
              <span className="admin-summary-label">Sedang Ditempuh (Aktif)</span>
              <span className="admin-summary-value">{isLoading ? '—' : activeCount}</span>
            </div>

            <div className="admin-summary-card">
              <span className="admin-summary-label">Database Target</span>
              <span
                className="badge badge-primary"
                style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
              >
                public.educations
              </span>
            </div>
          </div>

          {/* Conditional State: LOADING */}
          {isLoading && (
            <div
              className="admin-projects-skeleton-list"
              aria-busy="true"
              aria-label="Memuat riwayat pendidikan"
            >
              {[1, 2].map((item) => (
                <div key={item} className="admin-project-skeleton-card">
                  <div className="skeleton-shimmer skeleton-title-bar" />
                  <div className="skeleton-shimmer skeleton-desc-line" />
                </div>
              ))}
            </div>
          )}

          {/* Conditional State: ERROR */}
          {!isLoading && error && (
            <div className="admin-projects-error-box" role="alert">
              <h3 className="admin-projects-error-title">Gagal Mengambil Data Pendidikan</h3>
              <p className="admin-projects-error-desc">{error}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={refetch}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Conditional State: EMPTY */}
          {!isLoading && !error && educations.length === 0 && (
            <div className="admin-projects-empty-box">
              <h3 className="admin-projects-empty-title">Belum ada riwayat pendidikan.</h3>
              <p className="admin-projects-empty-desc">
                Tabel <code>public.educations</code> saat ini belum memiliki record data. Klik
                tombol <strong>"+ Tambah Pendidikan"</strong> di atas untuk menambahkan riwayat
                pertama Anda.
              </p>
            </div>
          )}

          {/* Conditional State: SUCCESS (Educations List) */}
          {!isLoading && !error && educations.length > 0 && (
            <div className="admin-edu-list-grid">
              {educations.map((edu) => {
                const periodText = edu.is_current
                  ? `${edu.start_year} — Sekarang`
                  : edu.end_year
                  ? `${edu.start_year} — ${edu.end_year}`
                  : `${edu.start_year}`

                return (
                  <article
                    key={edu.id}
                    className={`admin-edu-card-item ${
                      edu.is_current ? 'is-current-active' : ''
                    }`}
                  >
                    <div className="admin-edu-card-header">
                      <div>
                        <h3 className="admin-edu-degree-title">
                          {edu.degree} — {edu.field_of_study}
                        </h3>
                        <p className="admin-edu-institution-sub">{edu.institution}</p>
                      </div>

                      <div className="admin-edu-meta-badges">
                        <span className="admin-edu-period-badge">{periodText}</span>
                        {edu.is_current && (
                          <span className="admin-edu-current-badge">Aktif</span>
                        )}
                      </div>
                    </div>

                    {edu.description && (
                      <p className="admin-edu-desc-text">{edu.description}</p>
                    )}

                    <div className="admin-edu-footer-bar">
                      <span className="admin-sort-order-badge">
                        Urutan: {edu.sort_order ?? 0}
                      </span>

                      <div className="admin-edu-footer-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm admin-project-edit-btn"
                          onClick={() => handleOpenEditForm(edu)}
                          title={`Edit pendidikan "${edu.degree} - ${edu.field_of_study}"`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm admin-project-delete-btn"
                          onClick={() => handleOpenDeleteModal(edu)}
                          title={`Hapus pendidikan "${edu.degree} - ${edu.field_of_study}"`}
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
      {deletingEdu && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-edu-modal-title"
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
                <h3 id="delete-edu-modal-title" className="admin-modal-title">
                  Hapus Riwayat Pendidikan
                </h3>
                <p className="admin-modal-subtitle">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="admin-modal-body">
              <p>
                Apakah Anda yakin ingin menghapus data pendidikan{' '}
                <strong>
                  "{deletingEdu.degree} - {deletingEdu.field_of_study} ({deletingEdu.institution})"
                </strong>
                ?
              </p>
              <p className="admin-modal-body-subtext">
                Record di tabel <code>public.educations</code> akan dihapus secara permanen.
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
                    <line x1="12" y1="8" x2="12" y2="12" />
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
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Pendidikan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEducationsPage
