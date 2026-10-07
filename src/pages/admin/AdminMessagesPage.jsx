import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useMessages } from '../../hooks/useMessages'
import './AdminProjectsPage.css'
import './AdminMessagesPage.css'

/**
 * Helper: Formats timestamp into readable Indonesian DateTime
 * @param {string|null} dateStr
 * @returns {string}
 */
function formatMessageDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

/**
 * AdminMessagesPage Component (READ, UPDATE is_read, DELETE)
 * Allows owner/admin to manage messages submitted from contact form:
 * - View messages list with unread counter
 * - Filter by status (Semua, Belum Dibaca, Sudah Dibaca)
 * - Read detailed message in modal (auto-marks is_read = true)
 * - Toggle read/unread status
 * - Quick reply via email (mailto link)
 * - Delete message with confirmation modal
 */
function AdminMessagesPage() {
  const { messages, unreadCount, isLoading, error, refetch } = useMessages()
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'unread' | 'read'
  const [viewingMessage, setViewingMessage] = useState(null)
  const [deletingMessage, setDeletingMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Filtered messages
  const filteredMessages = useMemo(() => {
    if (filterStatus === 'unread') return messages.filter((m) => !m.is_read)
    if (filterStatus === 'read') return messages.filter((m) => m.is_read)
    return messages
  }, [messages, filterStatus])

  // Keyboard accessibility: Escape closes modal
  useEffect(() => {
    if (!viewingMessage && !deletingMessage) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deletingMessage && !isDeleting) {
          setDeletingMessage(null)
          setDeleteError(null)
        } else if (viewingMessage) {
          setViewingMessage(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewingMessage, deletingMessage, isDeleting])

  const handleOpenDetail = async (msg) => {
    setViewingMessage(msg)

    // Automatically mark as read if currently unread
    if (!msg.is_read) {
      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('id', msg.id)
        refetch()
      } catch (ex) {
        console.warn('Gagal menandai pesan sebagai dibaca:', ex)
      }
    }
  }

  const handleToggleReadStatus = async (msg, e) => {
    e.stopPropagation()
    try {
      const nextRead = !msg.is_read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: nextRead })
        .eq('id', msg.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setSuccessMessage(
        nextRead
          ? `Pesan dari "${msg.name}" ditandai sudah dibaca.`
          : `Pesan dari "${msg.name}" ditandai belum dibaca.`
      )
      refetch()
    } catch (err) {
      console.warn('Gagal mengubah status baca:', err)
    }
  }

  const handleOpenDeleteModal = (msg, e) => {
    e.stopPropagation()
    setDeletingMessage(msg)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingMessage(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingMessage) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbDeleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', deletingMessage.id)

      if (dbDeleteError) {
        throw new Error(dbDeleteError.message || 'Gagal menghapus pesan.')
      }

      if (viewingMessage?.id === deletingMessage.id) {
        setViewingMessage(null)
      }

      const senderName = deletingMessage.name
      setDeletingMessage(null)
      setSuccessMessage(`Pesan dari "${senderName}" berhasil dihapus!`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus pesan.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="admin-messages-page">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="container admin-navbar-inner">
          <div className="admin-nav-brand">
            <h1 className="admin-brand-title">Admin Portfolio CMS</h1>
            <span className="admin-badge-active">&bull; Inbox Messages</span>
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
          <div className="admin-msg-header-actions">
            <Link to="/admin" className="admin-back-btn">
              <span>&larr;</span> Kembali ke Dashboard
            </Link>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={refetch}
              disabled={isLoading}
              title="Segarkan pesan dari database"
            >
              {isLoading ? 'Memuat...' : 'Segarkan Data'}
            </button>
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

          {/* Title Box */}
          <div className="admin-msg-title-box">
            <h2 className="admin-msg-heading">Kotak Pesan Masuk (Messages / Inbox)</h2>
            <p className="admin-msg-subheading">
              Daftar pertanyaan, tawaran kerja, dan pesan yang dikirimkan oleh pengunjung melalui formulir kontak publik di tabel{' '}
              <code>public.messages</code>.
            </p>
          </div>

          {/* Summary Metrics */}
          <div className="admin-projects-summary-grid">
            <div className="admin-summary-card">
              <span className="admin-summary-label">Total Pesan</span>
              <span className="admin-summary-value">{isLoading ? '—' : messages.length}</span>
            </div>

            <div className="admin-summary-card">
              <span className="admin-summary-label">Pesan Belum Dibaca</span>
              <span
                className="admin-summary-value"
                style={{ color: unreadCount > 0 ? 'var(--color-primary)' : 'inherit' }}
              >
                {isLoading ? '—' : unreadCount}
              </span>
            </div>

            <div className="admin-summary-card">
              <span className="admin-summary-label">Database Target</span>
              <span
                className="badge badge-primary"
                style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
              >
                public.messages
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          {!isLoading && messages.length > 0 && (
            <div className="admin-msg-filter-bar" role="tablist" aria-label="Filter Status Pesan">
              <button
                type="button"
                role="tab"
                aria-selected={filterStatus === 'all'}
                className={`admin-filter-pill ${filterStatus === 'all' ? 'is-active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                Semua Pesan ({messages.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filterStatus === 'unread'}
                className={`admin-filter-pill ${filterStatus === 'unread' ? 'is-active' : ''}`}
                onClick={() => setFilterStatus('unread')}
              >
                Belum Dibaca ({unreadCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filterStatus === 'read'}
                className={`admin-filter-pill ${filterStatus === 'read' ? 'is-active' : ''}`}
                onClick={() => setFilterStatus('read')}
              >
                Sudah Dibaca ({messages.length - unreadCount})
              </button>
            </div>
          )}

          {/* Conditional State: LOADING */}
          {isLoading && (
            <div
              className="admin-projects-skeleton-list"
              aria-busy="true"
              aria-label="Memuat pesan masuk"
            >
              {[1, 2, 3].map((item) => (
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
              <h3 className="admin-projects-error-title">Gagal Mengambil Data Pesan</h3>
              <p className="admin-projects-error-desc">{error}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={refetch}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Conditional State: EMPTY */}
          {!isLoading && !error && messages.length === 0 && (
            <div className="admin-projects-empty-box">
              <h3 className="admin-projects-empty-title">Belum ada pesan masuk.</h3>
              <p className="admin-projects-empty-desc">
                Tabel <code>public.messages</code> saat ini belum memiliki pesan dari pengunjung.
                Ketika pengunjung mengirimkan pesan melalui formulir kontak di website publik, pesan
                akan tampil di sini.
              </p>
            </div>
          )}

          {/* Conditional State: Filter Empty */}
          {!isLoading && !error && messages.length > 0 && filteredMessages.length === 0 && (
            <div className="admin-projects-empty-box">
              <h3 className="admin-projects-empty-title">Tidak ada pesan dalam kategori ini.</h3>
              <p className="admin-projects-empty-desc">
                Tidak ada pesan dengan filter yang dipilih saat ini.
              </p>
            </div>
          )}

          {/* Messages List */}
          {!isLoading && !error && filteredMessages.length > 0 && (
            <div className="admin-msg-list-grid">
              {filteredMessages.map((msg) => (
                <article
                  key={msg.id}
                  className={`admin-msg-card-item ${!msg.is_read ? 'is-unread' : ''}`}
                  onClick={() => handleOpenDetail(msg)}
                >
                  <div className="admin-msg-card-top">
                    <div className="admin-msg-sender-info">
                      <h3 className="admin-msg-sender-name">
                        <span>{msg.name}</span>
                        {!msg.is_read && (
                          <span className="admin-msg-status-badge badge-unread">Baru</span>
                        )}
                      </h3>
                      <span className="admin-msg-sender-email">{msg.email}</span>
                    </div>

                    <div className="admin-msg-badges-row">
                      <span className="admin-msg-date-badge">
                        {formatMessageDate(msg.created_at)}
                      </span>
                    </div>
                  </div>

                  <h4 className="admin-msg-subject">{msg.subject || '(Tanpa Subjek)'}</h4>
                  <p className="admin-msg-preview-text">{msg.message}</p>

                  <div className="admin-msg-card-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm admin-project-edit-btn"
                      onClick={(e) => handleToggleReadStatus(msg, e)}
                    >
                      {msg.is_read ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
                    </button>

                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(
                        msg.subject || 'Portfolio Inquiry'
                      )}`}
                      className="btn btn-outline btn-sm admin-project-edit-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Balas Email
                    </a>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm admin-project-delete-btn"
                      onClick={(e) => handleOpenDeleteModal(msg, e)}
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

      {/* Message Detail View Modal */}
      {viewingMessage && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="msg-detail-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingMessage(null)
          }}
        >
          <div className="admin-modal-dialog" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <div>
                <h3 id="msg-detail-modal-title" className="admin-modal-title">
                  Detail Pesan Masuk
                </h3>
                <p className="admin-modal-subtitle">
                  Diterima pada {formatMessageDate(viewingMessage.created_at)}
                </p>
              </div>
            </div>

            <div className="admin-msg-detail-body">
              <div className="admin-msg-detail-meta">
                <div className="admin-msg-detail-row">
                  <span className="admin-msg-detail-label">Pengirim:</span>
                  <span className="admin-msg-detail-val">
                    <strong>{viewingMessage.name}</strong>
                  </span>
                </div>
                <div className="admin-msg-detail-row">
                  <span className="admin-msg-detail-label">Email:</span>
                  <span className="admin-msg-detail-val">
                    <a href={`mailto:${viewingMessage.email}`} style={{ color: 'var(--color-primary)' }}>
                      {viewingMessage.email}
                    </a>
                  </span>
                </div>
                <div className="admin-msg-detail-row">
                  <span className="admin-msg-detail-label">Subjek:</span>
                  <span className="admin-msg-detail-val">
                    {viewingMessage.subject || '(Tanpa Subjek)'}
                  </span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                  Isi Pesan:
                </h4>
                <div className="admin-msg-detail-content">{viewingMessage.message}</div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setViewingMessage(null)}
              >
                Tutup
              </button>
              <a
                href={`mailto:${viewingMessage.email}?subject=Re: ${encodeURIComponent(
                  viewingMessage.subject || 'Portfolio Inquiry'
                )}`}
                className="btn btn-primary btn-sm"
              >
                Balas via Email &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMessage && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-msg-modal-title"
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
                <h3 id="delete-msg-modal-title" className="admin-modal-title">
                  Hapus Pesan Masuk
                </h3>
                <p className="admin-modal-subtitle">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="admin-modal-body">
              <p>
                Apakah Anda yakin ingin menghapus pesan dari <strong>"{deletingMessage.name}"</strong>?
              </p>
              <p className="admin-modal-body-subtext">
                Record di tabel <code>public.messages</code> akan dihapus secara permanen.
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
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Pesan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMessagesPage
