import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useCertifications } from '../../hooks/useCertifications'
import CertificationForm from '../../components/admin/CertificationForm'
import './AdminProjectsPage.css'
import './AdminCertificationsPage.css'

/**
 * AdminCertificationsPage Component (CRUD)
 * Allows owner/admin to manage certifications stored in public.certifications
 */
function AdminCertificationsPage() {
  const { certifications, isLoading, error, refetch } = useCertifications()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCert, setEditingCert] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingCert, setDeletingCert] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filtered certifications
  const filteredCerts = useMemo(() => {
    if (!searchQuery.trim()) return certifications
    const query = searchQuery.toLowerCase()
    return certifications.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.issuer?.toLowerCase().includes(query)
    )
  }, [certifications, searchQuery])

  // Escape closes delete modal
  useEffect(() => {
    if (!deletingCert) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        setDeletingCert(null)
        setDeleteError(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deletingCert, isDeleting])

  const handleFormSuccess = (saved) => {
    const isEdit = Boolean(editingCert)
    setIsFormOpen(false)
    setEditingCert(null)
    setSuccessMessage(
      isEdit
        ? `Sertifikasi "${saved.name}" berhasil diperbarui!`
        : `Sertifikasi "${saved.name}" berhasil ditambahkan!`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingCert(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (cert) => {
    setEditingCert(cert)
    setSuccessMessage(null)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingCert(null)
  }

  const handleOpenDeleteModal = (cert) => {
    setDeletingCert(cert)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingCert(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingCert) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbError } = await supabase
        .from('certifications')
        .delete()
        .eq('id', deletingCert.id)

      if (dbError) {
        throw new Error(dbError.message || 'Gagal menghapus sertifikasi dari database.')
      }

      if (editingCert?.id === deletingCert.id) {
        setIsFormOpen(false)
        setEditingCert(null)
      }

      const deletedTitle = deletingCert.name
      setDeletingCert(null)
      setIsDeleting(false)
      setSuccessMessage(`Sertifikasi "${deletedTitle}" berhasil dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menghapus sertifikasi.'
      )
      setIsDeleting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
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
            <h1 className="admin-projects-title">Kelola Sertifikasi & Pelatihan</h1>
            <p className="admin-projects-desc">
              Manajemen lisensi sertifikasi, pelatihan, dan kursus profesional (
              <code>public.certifications</code>).
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
              disabled={isFormOpen && !editingCert}
            >
              + Tambah Sertifikasi
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
            <CertificationForm
              key={editingCert?.id || 'new-cert'}
              certification={editingCert}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
            />
          )}

          <div className="admin-projects-summary-grid">
            <div className="admin-summary-card">
              <span className="admin-summary-label">Total Sertifikasi</span>
              <span className="admin-summary-value">{isLoading ? '—' : certifications.length}</span>
            </div>
            <div className="admin-summary-card">
              <span className="admin-summary-label">Memiliki Link Kredensial</span>
              <span className="admin-summary-value">
                {isLoading ? '—' : certifications.filter((c) => Boolean(c.credential_url)).length}
              </span>
            </div>
            <div className="admin-summary-card">
              <span className="admin-summary-label">Database Target</span>
              <span
                className="badge badge-primary"
                style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
              >
                public.certifications
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="admin-search-box">
            <input
              type="text"
              className="form-control-input"
              placeholder="Cari berdasarkan nama sertifikasi atau penyelenggara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Loading state */}
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

          {/* Error state */}
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

          {/* Empty state */}
          {!isLoading && !error && filteredCerts.length === 0 && (
            <div className="admin-empty-card">
              <h3 className="admin-empty-title">
                {searchQuery ? 'Tidak Ada Sertifikasi yang Cocok' : 'Belum Ada Sertifikasi'}
              </h3>
              <p className="admin-empty-desc">
                {searchQuery
                  ? `Tidak ditemukan sertifikasi dengan kata kunci "${searchQuery}".`
                  : 'Tambahkan data sertifikasi resmi atau kursus Anda untuk melengkapi portofolio.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenCreateForm}
                >
                  Tambah Sertifikasi Pertama
                </button>
              )}
            </div>
          )}

          {/* Certifications Card List */}
          {!isLoading && !error && filteredCerts.length > 0 && (
            <div className="admin-cert-cards-grid">
              {filteredCerts.map((cert) => (
                <article key={cert.id} className="admin-cert-card">
                  <div className="admin-cert-card-header">
                    <div>
                      <h3 className="admin-cert-name">{cert.name}</h3>
                      <p className="admin-cert-issuer">
                        <span>{cert.issuer}</span>
                        {cert.issue_date && (
                          <span className="admin-cert-date-dot">
                            &bull; {formatDate(cert.issue_date)}
                          </span>
                        )}
                      </p>
                    </div>

                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="badge badge-accent admin-cert-link-badge"
                        title="Buka link kredensial"
                      >
                        Lihat Kredensial &rarr;
                      </a>
                    )}
                  </div>

                  <div className="admin-cert-card-footer">
                    <span className="admin-sort-order-badge">
                      ID: {cert.id.slice(0, 8)}...
                    </span>
                    <div className="admin-exp-footer-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenEditForm(cert)}
                        title={`Edit "${cert.name}"`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm admin-project-delete-btn"
                        onClick={() => handleOpenDeleteModal(cert)}
                        title={`Hapus "${cert.name}"`}
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

      {/* Delete Confirmation Modal */}
      {deletingCert && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-cert-modal-title"
        >
          <div className="admin-modal-dialog">
            <h2 id="delete-cert-modal-title" className="admin-modal-title">
              Hapus Sertifikasi?
            </h2>
            <p className="admin-modal-desc">
              Apakah Anda yakin ingin menghapus <strong>"{deletingCert.name}"</strong>? Data ini
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

export default AdminCertificationsPage
