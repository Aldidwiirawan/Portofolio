import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAchievements } from '../../hooks/useAchievements'
import AchievementForm from '../../components/admin/AchievementForm'
import './AdminProjectsPage.css'
import './AdminAchievementsPage.css'

/**
 * AdminAchievementsPage Component (CRUD)
 * Allows owner/admin to manage achievements stored in public.achievements
 */
function AdminAchievementsPage() {
  const { achievements, isLoading, error, refetch } = useAchievements()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAchieve, setEditingAchieve] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingAchieve, setDeletingAchieve] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return achievements
    const query = searchQuery.toLowerCase()
    return achievements.filter(
      (a) =>
        a.title?.toLowerCase().includes(query) ||
        a.event_name?.toLowerCase().includes(query) ||
        String(a.year).includes(query)
    )
  }, [achievements, searchQuery])

  useEffect(() => {
    if (!deletingAchieve) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        setDeletingAchieve(null)
        setDeleteError(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deletingAchieve, isDeleting])

  const handleFormSuccess = (saved) => {
    const isEdit = Boolean(editingAchieve)
    setIsFormOpen(false)
    setEditingAchieve(null)
    setSuccessMessage(
      isEdit
        ? `Prestasi "${saved.title}" berhasil diperbarui!`
        : `Prestasi "${saved.title}" berhasil ditambahkan!`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingAchieve(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (item) => {
    setEditingAchieve(item)
    setSuccessMessage(null)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingAchieve(null)
  }

  const handleOpenDeleteModal = (item) => {
    setDeletingAchieve(item)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingAchieve(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingAchieve) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbError } = await supabase
        .from('achievements')
        .delete()
        .eq('id', deletingAchieve.id)

      if (dbError) {
        throw new Error(dbError.message || 'Gagal menghapus pencapaian dari database.')
      }

      if (editingAchieve?.id === deletingAchieve.id) {
        setIsFormOpen(false)
        setEditingAchieve(null)
      }

      const deletedTitle = deletingAchieve.title
      setDeletingAchieve(null)
      setIsDeleting(false)
      setSuccessMessage(`Prestasi "${deletedTitle}" berhasil dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menghapus pencapaian.'
      )
      setIsDeleting(false)
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
            <h1 className="admin-projects-title">Kelola Pencapaian & Prestasi</h1>
            <p className="admin-projects-desc">
              Manajemen penghargaan, kompetisi, dan prestasi akademik/non-akademik (
              <code>public.achievements</code>).
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
              disabled={isFormOpen && !editingAchieve}
            >
              + Tambah Pencapaian
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
            <AchievementForm
              key={editingAchieve?.id || 'new-achieve'}
              achievement={editingAchieve}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
            />
          )}

          <div className="admin-projects-summary-grid">
            <div className="admin-summary-card">
              <span className="admin-summary-label">Total Pencapaian</span>
              <span className="admin-summary-value">{isLoading ? '—' : achievements.length}</span>
            </div>
            <div className="admin-summary-card">
              <span className="admin-summary-label">Tahun Terbaru</span>
              <span className="admin-summary-value">
                {isLoading || achievements.length === 0
                  ? '—'
                  : Math.max(...achievements.map((a) => a.year))}
              </span>
            </div>
            <div className="admin-summary-card">
              <span className="admin-summary-label">Database Target</span>
              <span
                className="badge badge-primary"
                style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
              >
                public.achievements
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="admin-search-box">
            <input
              type="text"
              className="form-control-input"
              placeholder="Cari prestasi, kompetisi, atau tahun..."
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
          {!isLoading && !error && filteredItems.length === 0 && (
            <div className="admin-empty-card">
              <h3 className="admin-empty-title">
                {searchQuery ? 'Tidak Ada Prestasi yang Cocok' : 'Belum Ada Prestasi'}
              </h3>
              <p className="admin-empty-desc">
                {searchQuery
                  ? `Tidak ditemukan prestasi dengan kata kunci "${searchQuery}".`
                  : 'Catat pencapaian, kejuaraan, atau penghargaan yang pernah Anda raih.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenCreateForm}
                >
                  Tambah Pencapaian Pertama
                </button>
              )}
            </div>
          )}

          {/* Cards */}
          {!isLoading && !error && filteredItems.length > 0 && (
            <div className="admin-cert-cards-grid">
              {filteredItems.map((item) => (
                <article key={item.id} className="admin-cert-card">
                  <div className="admin-cert-card-header">
                    <div>
                      <h3 className="admin-cert-name">{item.title}</h3>
                      <p className="admin-cert-issuer">
                        <span>{item.event_name}</span>
                        <span className="admin-cert-date-dot"> &bull; Tahun {item.year}</span>
                      </p>
                    </div>

                    <span className="badge badge-accent">🏆 {item.year}</span>
                  </div>

                  {item.description && (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                  )}

                  <div className="admin-cert-card-footer">
                    <span className="admin-sort-order-badge">
                      ID: {item.id.slice(0, 8)}...
                    </span>
                    <div className="admin-exp-footer-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenEditForm(item)}
                        title={`Edit "${item.title}"`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm admin-project-delete-btn"
                        onClick={() => handleOpenDeleteModal(item)}
                        title={`Hapus "${item.title}"`}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      {deletingAchieve && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-achieve-modal-title"
        >
          <div className="admin-modal-dialog">
            <h2 id="delete-achieve-modal-title" className="admin-modal-title">
              Hapus Pencapaian?
            </h2>
            <p className="admin-modal-desc">
              Apakah Anda yakin ingin menghapus <strong>"{deletingAchieve.title}"</strong>? Tindakan
              ini bersifat permanen di database.
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

export default AdminAchievementsPage
