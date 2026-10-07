import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useLanguages } from '../../hooks/useLanguages'
import LanguageForm from '../../components/admin/LanguageForm'
import './AdminProjectsPage.css'
import './AdminLanguagesPage.css'

/**
 * AdminLanguagesPage Component (CRUD)
 * Allows owner/admin to manage language proficiencies stored in public.languages
 */
function AdminLanguagesPage() {
  const { languages, isLoading, error, refetch } = useLanguages()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLang, setEditingLang] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingLang, setDeletingLang] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return languages
    const query = searchQuery.toLowerCase()
    return languages.filter(
      (l) =>
        l.language_name?.toLowerCase().includes(query) ||
        l.proficiency_level?.toLowerCase().includes(query)
    )
  }, [languages, searchQuery])

  useEffect(() => {
    if (!deletingLang) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        setDeletingLang(null)
        setDeleteError(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deletingLang, isDeleting])

  const handleFormSuccess = (saved) => {
    const isEdit = Boolean(editingLang)
    setIsFormOpen(false)
    setEditingLang(null)
    setSuccessMessage(
      isEdit
        ? `Bahasa "${saved.language_name}" berhasil diperbarui!`
        : `Bahasa "${saved.language_name}" berhasil ditambahkan!`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingLang(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (item) => {
    setEditingLang(item)
    setSuccessMessage(null)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingLang(null)
  }

  const handleOpenDeleteModal = (item) => {
    setDeletingLang(item)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingLang(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingLang) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbError } = await supabase
        .from('languages')
        .delete()
        .eq('id', deletingLang.id)

      if (dbError) {
        throw new Error(dbError.message || 'Gagal menghapus bahasa dari database.')
      }

      if (editingLang?.id === deletingLang.id) {
        setIsFormOpen(false)
        setEditingLang(null)
      }

      const deletedTitle = deletingLang.language_name
      setDeletingLang(null)
      setIsDeleting(false)
      setSuccessMessage(`Bahasa "${deletedTitle}" berhasil dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menghapus bahasa.'
      )
      setIsDeleting(false)
    }
  }

  const getProficiencyBadgeClass = (level) => {
    switch (level) {
      case 'Penutur Asli':
        return 'badge-success'
      case 'Mahir':
        return 'badge-primary'
      case 'Menengah':
        return 'badge-accent'
      default:
        return 'badge-muted'
    }
  }

  return (
    <div className="admin-projects-page">
      <header className="admin-projects-header">
        <div className="container admin-projects-header-inner">
          <div className="admin-header-left">
            <Link to="/admin" className="admin-back-link">
              &larr; Kembali ke Dashboard
            </Link>
            <h1 className="admin-projects-title">Kelola Kemampuan Bahasa</h1>
            <p className="admin-projects-desc">
              Manajemen bahasa komunikasi dan tingkat kemahiran (
              <code>public.languages</code>).
            </p>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={refetch}
              disabled={isLoading}
              title="Segarkan data dari database"
            >
              Segarkan
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenCreateForm}
              disabled={isFormOpen && !editingLang}
            >
              + Tambah Bahasa
            </button>
          </div>
        </div>
      </header>

      <main className="container admin-projects-content">
        <div className="admin-projects-body">
          {successMessage && (
            <div className="admin-alert admin-alert-success" role="status">
              <span>{successMessage}</span>
              <button
                type="button"
                className="admin-alert-dismiss"
                onClick={() => setSuccessMessage(null)}
                aria-label="Tutup notifikasi"
              >
                &times;
              </button>
            </div>
          )}

          {isFormOpen && (
            <LanguageForm
              key={editingLang?.id || 'new-lang'}
              language={editingLang}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
            />
          )}

          <div className="admin-projects-summary-grid">
            <div className="admin-summary-card">
              <span className="admin-summary-label">Total Bahasa</span>
              <span className="admin-summary-value">{isLoading ? '—' : languages.length}</span>
            </div>
            <div className="admin-summary-card">
              <span className="admin-summary-label">Mahir / Penutur Asli</span>
              <span className="admin-summary-value">
                {isLoading
                  ? '—'
                  : languages.filter((l) =>
                      ['Mahir', 'Penutur Asli'].includes(l.proficiency_level)
                    ).length}
              </span>
            </div>
            <div className="admin-summary-card">
              <span className="admin-summary-label">Database Target</span>
              <span
                className="badge badge-primary"
                style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
              >
                public.languages
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="admin-search-box">
            <input
              type="text"
              className="form-control-input"
              placeholder="Cari bahasa atau tingkat kemahiran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="admin-projects-skeleton-list">
              {[1, 2].map((item) => (
                <div key={item} className="admin-project-skeleton-card">
                  <div className="skeleton-shimmer skeleton-title-bar" />
                  <div className="skeleton-shimmer skeleton-desc-line" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="admin-alert admin-alert-error" role="alert">
              <div>
                <strong>Gagal Memuat Data:</strong> {error}
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={refetch}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && filteredLanguages.length === 0 && (
            <div className="admin-empty-card">
              <h3 className="admin-empty-title">
                {searchQuery ? 'Tidak Ada Bahasa yang Cocok' : 'Belum Ada Bahasa'}
              </h3>
              <p className="admin-empty-desc">
                {searchQuery
                  ? `Tidak ditemukan bahasa dengan kata kunci "${searchQuery}".`
                  : 'Tambahkan penguasaan bahasa (Indonesia, Inggris, dll.) beserta levelnya.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenCreateForm}
                >
                  Tambah Bahasa Pertama
                </button>
              )}
            </div>
          )}

          {/* Cards */}
          {!isLoading && !error && filteredLanguages.length > 0 && (
            <div className="admin-lang-cards-grid">
              {filteredLanguages.map((item) => (
                <article key={item.id} className="admin-lang-card">
                  <div className="admin-lang-card-main">
                    <h3 className="admin-lang-name">{item.language_name}</h3>
                    <span className={`badge ${getProficiencyBadgeClass(item.proficiency_level)}`}>
                      {item.proficiency_level}
                    </span>
                  </div>

                  <div className="admin-exp-footer-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenEditForm(item)}
                      title={`Edit "${item.language_name}"`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm admin-project-delete-btn"
                      onClick={() => handleOpenDeleteModal(item)}
                      title={`Hapus "${item.language_name}"`}
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      {deletingLang && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-lang-modal-title"
        >
          <div className="admin-modal-dialog">
            <h2 id="delete-lang-modal-title" className="admin-modal-title">
              Hapus Bahasa?
            </h2>
            <p className="admin-modal-desc">
              Apakah Anda yakin ingin menghapus bahasa <strong>"{deletingLang.language_name}"</strong>?
              Data ini akan dihapus permanen dari database.
            </p>

            {deleteError && (
              <div className="admin-alert admin-alert-error" role="alert">
                <strong>Error:</strong> {deleteError}
              </div>
            )}

            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLanguagesPage
