import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGuestbook } from '../../hooks/useGuestbook'
import './AdminGuestbookPage.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
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
 * AdminGuestbookPage Component
 * Manages public guestbook comments and replies
 */
function AdminGuestbookPage() {
  const { entries, totalCount, replyEntry, deleteEntry } = useGuestbook()
  const [replyTexts, setReplyTexts] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  const handleReplyChange = (id, val) => {
    setReplyTexts((prev) => ({ ...prev, [id]: val }))
  }

  const handleSaveReply = async (id) => {
    const text = replyTexts[id] ?? entries.find((e) => e.id === id)?.admin_reply ?? ''
    if (!text.trim()) return

    setSavingId(id)
    try {
      await replyEntry(id, text.trim())
      setToastMsg('Balasan resmi [DEV ALDI] berhasil disimpan!')
      setTimeout(() => setToastMsg(''), 3000)
    } catch {
      setToastMsg('Gagal menyimpan balasan.')
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus catatan tamu ini?')) {
      await deleteEntry(id)
      setToastMsg('Catatan tamu berhasil dihapus.')
      setTimeout(() => setToastMsg(''), 3000)
    }
  }

  return (
    <div className="admin-guestbook-page">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="container admin-navbar-inner">
          <div className="admin-nav-brand">
            <h1 className="admin-brand-title">Admin Guestbook CMS</h1>
            <span className="admin-badge-active">&bull; {totalCount} Catatan</span>
          </div>
          <div className="admin-nav-actions">
            <Link to="/admin" className="btn btn-outline btn-sm">
              &larr; Dashboard
            </Link>
            <Link to="/" className="btn btn-primary btn-sm">
              Situs Publik
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main-content">
        <div className="container">
          <div className="admin-guestbook-header">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                Daftar Buku Tamu Publik
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
                Pengunjung website dapat meninggalkan pesan secara publik. Anda dapat membalas dengan status terverifikasi <strong>[DEV]</strong>.
              </p>
            </div>
          </div>

          {toastMsg && (
            <div className="admin-alert-banner alert-banner-success" style={{ marginBottom: '1.5rem' }}>
              {toastMsg}
            </div>
          )}

          <div className="admin-guestbook-list">
            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                Belum ada catatan buku tamu yang masuk.
              </div>
            ) : (
              entries.map((entry) => {
                const initial = entry.name ? entry.name.charAt(0).toUpperCase() : '?'
                const currentReplyVal =
                  replyTexts[entry.id] !== undefined
                    ? replyTexts[entry.id]
                    : entry.admin_reply || ''

                return (
                  <article key={entry.id} className="admin-guestbook-card">
                    <div className="admin-guestbook-card-head">
                      <div className="admin-guestbook-author">
                        <div
                          className="admin-guestbook-avatar"
                          style={{ backgroundColor: entry.avatar_color || '#38bdf8' }}
                        >
                          {initial}
                        </div>
                        <div>
                          <h3 className="admin-guestbook-name">{entry.name}</h3>
                          <span className="admin-guestbook-date">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(entry.id)}
                        title="Hapus catatan ini"
                      >
                        Hapus
                      </button>
                    </div>

                    <p className="admin-guestbook-msg">{entry.message}</p>

                    {/* Reply Section */}
                    <div className="admin-guestbook-reply-section">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                        Balasan Resmi Pemilik Web [DEV ALDI]:
                      </label>
                      <input
                        type="text"
                        className="admin-guestbook-reply-input"
                        placeholder="Ketik balasan untuk pengunjung ini..."
                        value={currentReplyVal}
                        onChange={(e) => handleReplyChange(entry.id, e.target.value)}
                      />
                      <div className="admin-guestbook-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSaveReply(entry.id)}
                          disabled={savingId === entry.id}
                        >
                          {savingId === entry.id ? 'Menyimpan...' : 'Simpan Balasan'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminGuestbookPage
