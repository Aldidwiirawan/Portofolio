import { useState, useEffect } from 'react'
import './GuestbookDrawer.css'

function formatRelativeDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Slide-over Drawer for Public Guestbook
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Array} props.entries
 * @param {Function} props.onAddEntry
 * @param {number} props.totalCount
 */
function GuestbookDrawer({ isOpen, onClose, entries = [], onAddEntry, totalCount = 0 }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successNote, setSuccessNote] = useState('')
  const [formError, setFormError] = useState('')

  // Close on ESC key & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccessNote('')

    if (!name.trim()) {
      setFormError('Silakan masukkan nama Anda.')
      return
    }

    if (!message.trim()) {
      setFormError('Silakan ketik pesan atau ucapan Anda.')
      return
    }

    try {
      setIsSubmitting(true)
      await onAddEntry({ name, message })
      setName('')
      setMessage('')
      setSuccessNote('Pesan Anda berhasil diterbitkan! Terima kasih sudah mampir 🙌')
      setTimeout(() => setSuccessNote(''), 4000)
    } catch (err) {
      setFormError(err.message || 'Gagal mengirim pesan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const MAX_CHAR = 240
  const charsRemaining = MAX_CHAR - message.length

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div
        className={`guestbook-overlay ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* 2. Slide Drawer Panel */}
      <aside
        className={`guestbook-drawer ${isOpen ? 'is-open' : ''}`}
        aria-label="Buku Tamu Publik"
        aria-hidden={!isOpen}
      >
        {/* Terminal Header */}
        <div className="guestbook-header">
          <div className="guestbook-terminal-title">
            <div className="guestbook-prompt-icon" aria-hidden="true">&gt;_</div>
            <div>
              <span className="guestbook-title-text">~/guestbook.log</span>
              <span className="guestbook-live-pill">LIVE</span>
            </div>
          </div>

          <button
            type="button"
            className="guestbook-close-btn"
            onClick={onClose}
            aria-label="Tutup buku tamu"
          >
            <span>ESC</span>
            <span>&times;</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="guestbook-body">
          {/* Form Box */}
          <form className="guestbook-form-box" onSubmit={handleSubmit}>
            <div className="guestbook-form-header">
              <h3 className="guestbook-form-title">Tinggalkan Catatan / Jejak</h3>
              <span className="guestbook-char-count">
                {totalCount} total tanda tangan
              </span>
            </div>

            {successNote && (
              <div className="guestbook-alert-success" role="status">
                {successNote}
              </div>
            )}

            {formError && (
              <div className="admin-alert-banner alert-banner-danger" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                {formError}
              </div>
            )}

            <input
              type="text"
              className="guestbook-input"
              placeholder="Nama Anda (atau @social)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
            />

            <div>
              <textarea
                className="guestbook-textarea"
                placeholder="Tulis pesan, kritik, atau saran untuk Aldi..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MAX_CHAR}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: charsRemaining < 20 ? '#f87171' : '#64748b' }}>
                  {charsRemaining} karakter tersisa
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="guestbook-submit-btn"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Menerbitkan...' : 'Kirim Catatan'}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>

          {/* List of Signatures */}
          <div className="guestbook-entries-list">
            {entries.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                Belum ada catatan. Jadilah yang pertama mengisi buku tamu!
              </p>
            ) : (
              entries.map((entry) => {
                const initial = entry.name ? entry.name.charAt(0).toUpperCase() : '?'
                return (
                  <article key={entry.id} className="guestbook-entry-card">
                    <div className="guestbook-author-row">
                      <div className="guestbook-author-info">
                        <div
                          className="guestbook-author-avatar"
                          style={{ backgroundColor: entry.avatar_color || '#38bdf8' }}
                          aria-hidden="true"
                        >
                          {initial}
                        </div>
                        <h4 className="guestbook-author-name">{entry.name}</h4>
                      </div>
                      <span className="guestbook-entry-date">
                        {formatRelativeDate(entry.created_at)}
                      </span>
                    </div>

                    <p className="guestbook-entry-message">{entry.message}</p>

                    {/* Admin Reply Thread */}
                    {entry.admin_reply && (
                      <div className="guestbook-reply-box">
                        <div className="guestbook-reply-header">
                          <span className="guestbook-reply-dev-badge">DEV</span>
                          <span>Aldi Dwi Irawan</span>
                          {entry.admin_reply_at && (
                            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
                              &bull; {formatRelativeDate(entry.admin_reply_at)}
                            </span>
                          )}
                        </div>
                        <p className="guestbook-reply-message">{entry.admin_reply}</p>
                      </div>
                    )}
                  </article>
                )
              })
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default GuestbookDrawer
