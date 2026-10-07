import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useOrganizations } from '../../hooks/useOrganizations'
import OrganizationForm from '../../components/admin/OrganizationForm'
import './AdminProjectsPage.css'
import './AdminOrganizationsPage.css'

/**
 * AdminOrganizationsPage Component (CRUD)
 * Allows owner/admin to manage organizations stored in public.organizations
 */
function AdminOrganizationsPage() {
  const { organizations, isLoading, error, refetch } = useOrganizations()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingOrg, setDeletingOrg] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOrgs = useMemo(() => {
    if (!searchQuery.trim()) return organizations
    const query = searchQuery.toLowerCase()
    return organizations.filter(
      (o) =>
        o.name?.toLowerCase().includes(query) ||
        o.role?.toLowerCase().includes(query)
    )
  }, [organizations, searchQuery])

  useEffect(() => {
    if (!deletingOrg) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        setDeletingOrg(null)
        setDeleteError(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deletingOrg, isDeleting])

  const handleFormSuccess = (saved) => {
    const isEdit = Boolean(editingOrg)
    setIsFormOpen(false)
    setEditingOrg(null)
    setSuccessMessage(
      isEdit
        ? `Organisasi "${saved.name}" berhasil diperbarui!`
        : `Organisasi "${saved.name}" berhasil ditambahkan!`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingOrg(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (item) => {
    setEditingOrg(item)
    setSuccessMessage(null)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingOrg(null)
  }

  const handleOpenDeleteModal = (item) => {
    setDeletingOrg(item)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingOrg(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingOrg) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', deletingOrg.id)

      if (dbError) {
        throw new Error(dbError.message || 'Gagal menghapus organisasi dari database.')
      }

      if (editingOrg?.id === deletingOrg.id) {
        setIsFormOpen(false)
        setEditingOrg(null)
      }

      const deletedTitle = deletingOrg.name
      setDeletingOrg(null)
      setIsDeleting(false)
      setSuccessMessage(`Organisasi "${deletedTitle}" berhasil dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menghapus organisasi.'
      )
      setIsDeleting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    } catch {
      return dateStr
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
            <h1 className="admin-projects-title">Kelola Organisasi & Komunitas</h1>
            <p className="admin-projects-desc">
              Manajemen pengalaman organisasi, kepanitiaan, dan ekstrakurikuler (
              <code>public.organizations</code>).
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
              disabled={isFormOpen && !editingOrg}
            >
              + Tambah Organisasi
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
            <OrganizationForm
              key={editingOrg?.id || 'new-org'}
              organization={editingOrg}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
            />
          )}

          <div className="admin-projects-summary-grid">
            <div className="admin-summary-card">
              <span className="admin-summary-label">Total Organisasi</span>
              <span className="admin-summary-value">{isLoading ? '—' : organizations.length}</span>
            </div>
            <div className="admin-summary-card">
              <span className="admin-summary-label">Database Target</span>
              <span
                className="badge badge-primary"
                style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
              >
                public.organizations
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="admin-search-box">
            <input
              type="text"
              className="form-control-input"
              placeholder="Cari organisasi atau jabatan..."
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
          {!isLoading && !error && filteredOrgs.length === 0 && (
            <div className="admin-empty-card">
              <h3 className="admin-empty-title">
                {searchQuery ? 'Tidak Ada Organisasi yang Cocok' : 'Belum Ada Organisasi'}
              </h3>
              <p className="admin-empty-desc">
                {searchQuery
                  ? `Tidak ditemukan organisasi dengan kata kunci "${searchQuery}".`
                  : 'Catat pengalaman organisasi, kepanitiaan kampus, atau komunitas IT yang pernah Anda ikuti.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenCreateForm}
                >
                  Tambah Organisasi Pertama
                </button>
              )}
            </div>
          )}

          {/* Cards */}
          {!isLoading && !error && filteredOrgs.length > 0 && (
            <div className="admin-cert-cards-grid">
              {filteredOrgs.map((item) => {
                const startText = formatDate(item.start_date)
                const endText = item.end_date ? formatDate(item.end_date) : 'Sekarang'
                const periodText = startText ? `${startText} — ${endText}` : ''

                return (
                  <article key={item.id} className="admin-cert-card">
                    <div className="admin-cert-card-header">
                      <div>
                        <h3 className="admin-cert-name">{item.name}</h3>
                        <p className="admin-cert-issuer">
                          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                            {item.role}
                          </span>
                          {periodText && (
                            <span className="admin-cert-date-dot"> &bull; {periodText}</span>
                          )}
                        </p>
                      </div>

                      {periodText && <span className="badge badge-primary">{periodText}</span>}
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
                          title={`Edit "${item.name}"`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm admin-project-delete-btn"
                          onClick={() => handleOpenDeleteModal(item)}
                          title={`Hapus "${item.name}"`}
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

      {/* Delete Modal */}
      {deletingOrg && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-org-modal-title"
        >
          <div className="admin-modal-dialog">
            <h2 id="delete-org-modal-title" className="admin-modal-title">
              Hapus Organisasi?
            </h2>
            <p className="admin-modal-desc">
              Apakah Anda yakin ingin menghapus <strong>"{deletingOrg.name}"</strong>? Data ini
              akan dihapus permanen dari database.
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

export default AdminOrganizationsPage
