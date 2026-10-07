import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useProfile } from '../../hooks/useProfile'
import './AdminProjectsPage.css'
import './AdminProfilePage.css'

/**
 * ProfileEditor Component
 * Internal form and preview manager keyed to profile data
 */
function ProfileEditor({ profile, onSaveSuccess }) {
  const [formData, setFormData] = useState(() => ({
    full_name: profile?.full_name || '',
    tagline: profile?.tagline || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    full_address: profile?.full_address || '',
    phone_number: profile?.phone_number || '',
    email: profile?.email || '',
    github_url: profile?.github_url || '',
    linkedin_url: profile?.linkedin_url || '',
    instagram_url: profile?.instagram_url || '',
    resume_url: profile?.resume_url || profile?.resume_link || '',
    resume_link: profile?.resume_link || profile?.resume_url || '',
    hobbies: Array.isArray(profile?.hobbies) ? profile.hobbies.join(', ') : '',
    avatar_url: profile?.avatar_url || '',
    is_available: profile?.is_available ?? true,
  }))

  const [isSaving, setIsSaving] = useState(false)
  const [generalError, setGeneralError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (generalError) setGeneralError(null)
  }

  const handleToggleAvailable = () => {
    setFormData((prev) => ({
      ...prev,
      is_available: !prev.is_available,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.full_name.trim()) {
      setGeneralError('Nama lengkap wajib diisi.')
      return
    }

    setIsSaving(true)
    setGeneralError(null)

    const hobbiesArray = formData.hobbies
      ? formData.hobbies
          .split(',')
          .map((h) => h.trim())
          .filter(Boolean)
      : []

    const resumeLinkVal = formData.resume_url.trim() || formData.resume_link.trim() || null

    const payload = {
      full_name: formData.full_name.trim(),
      tagline: formData.tagline.trim() || null,
      bio: formData.bio.trim() || null,
      location: formData.location.trim() || null,
      full_address: formData.full_address.trim() || null,
      phone_number: formData.phone_number.trim() || null,
      email: formData.email.trim() || null,
      github_url: formData.github_url.trim() || null,
      linkedin_url: formData.linkedin_url.trim() || null,
      instagram_url: formData.instagram_url.trim() || null,
      resume_url: resumeLinkVal,
      resume_link: resumeLinkVal,
      hobbies: hobbiesArray,
      avatar_url: formData.avatar_url.trim() || null,
      is_available: Boolean(formData.is_available),
      updated_at: new Date().toISOString(),
    }

    try {
      if (profile?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', profile.id)

        if (updateError) {
          throw new Error(updateError.message || 'Gagal memperbarui profil.')
        }
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([payload])

        if (insertError) {
          throw new Error(insertError.message || 'Gagal menyimpan profil baru.')
        }
      }

      onSaveSuccess()
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat memperbarui profil.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const initials = formData.full_name
    ? formData.full_name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD'

  return (
    <div className="admin-profile-layout">
      {/* Form Column */}
      <form onSubmit={handleSubmit} className="admin-profile-form-column" noValidate>
        {generalError && (
          <div className="admin-modal-error-alert" style={{ marginBottom: 'var(--space-2)' }}>
            <span>{generalError}</span>
          </div>
        )}

        {/* Section 1: Informasi Utama */}
        <div className="admin-profile-section-card">
          <h3 className="admin-profile-section-title">Informasi Dasar</h3>
          <p className="admin-profile-section-desc">
            Data utama yang muncul pada bagian Hero dan About di halaman beranda portofolio.
          </p>

          <div className="admin-profile-grid-2">
            <div className="form-group">
              <label htmlFor="profile-full-name" className="form-label">
                <span>Nama Lengkap</span>
                <span className="required-indicator">*</span>
              </label>
              <input
                id="profile-full-name"
                name="full_name"
                type="text"
                className="form-control-input"
                value={formData.full_name}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Aldi Dwi Irawan"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-tagline" className="form-label">
                <span>Tagline / Profesi</span>
              </label>
              <input
                id="profile-tagline"
                name="tagline"
                type="text"
                className="form-control-input"
                value={formData.tagline}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Web Developer & IT Graduate"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-location" className="form-label">
                <span>Domisili / Lokasi</span>
              </label>
              <input
                id="profile-location"
                name="location"
                type="text"
                className="form-control-input"
                value={formData.location}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Indonesia / Semarang, Jawa Tengah"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-email" className="form-label">
                <span>Email Kontak</span>
              </label>
              <input
                id="profile-email"
                name="email"
                type="email"
                className="form-control-input"
                value={formData.email}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="kontak@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-phone" className="form-label">
                <span>Nomor Telepon / WhatsApp</span>
              </label>
              <input
                id="profile-phone"
                name="phone_number"
                type="tel"
                className="form-control-input"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="082331318598"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-address" className="form-label">
                <span>Alamat Lengkap</span>
              </label>
              <input
                id="profile-address"
                name="full_address"
                type="text"
                className="form-control-input"
                value={formData.full_address}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Bandar Lor Gg. IX No. 69, Kota Kediri"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
            <label htmlFor="profile-bio" className="form-label">
              <span>Biografi Singkat (Bio)</span>
            </label>
            <textarea
              id="profile-bio"
              name="bio"
              rows="4"
              className="form-control-textarea"
              value={formData.bio}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Ceritakan latar belakang, fokus teknologi, dan visi profesional Anda..."
            />
          </div>

          <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
            <label htmlFor="profile-hobbies" className="form-label">
              <span>Hobi & Minat (Pisahkan dengan tanda koma)</span>
            </label>
            <input
              id="profile-hobbies"
              name="hobbies"
              type="text"
              className="form-control-input"
              value={formData.hobbies}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Contoh: Coding, Jaringan Komputer, Badminton, Membaca Buku"
            />
            <p className="form-field-helper">
              Daftar hobi/minat yang akan disimpan sebagai array data di database.
            </p>
          </div>
        </div>

        {/* Section 2: Ketersediaan Karir */}
        <div className="admin-profile-section-card">
          <h3 className="admin-profile-section-title">Status Ketersediaan</h3>
          <p className="admin-profile-section-desc">
            Menentukan badge status kesiapan kerja yang ditampilkan pada Hero banner publik.
          </p>

          <div className="admin-toggle-wrapper">
            <div className="admin-toggle-text">
              <span className="admin-toggle-title">
                {formData.is_available
                  ? 'Terbuka untuk Peluang Kerja & Proyek'
                  : 'Sedang Tidak Tersedia untuk Proyek Baru'}
              </span>
              <span className="admin-toggle-sub">
                {formData.is_available
                  ? 'Pengunjung situs akan melihat badge status aktif berwarna hijau.'
                  : 'Badge akan dinonaktifkan sementara.'}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={formData.is_available}
              className={`admin-switch-btn ${formData.is_available ? 'is-active' : ''}`}
              onClick={handleToggleAvailable}
              disabled={isSaving}
            >
              <span className="admin-switch-thumb" />
            </button>
          </div>
        </div>

        {/* Section 3: Media Sosial & Resume */}
        <div className="admin-profile-section-card">
          <h3 className="admin-profile-section-title">Tautan Media Sosial & CV</h3>
          <p className="admin-profile-section-desc">
            Tautan profil profesional yang disematkan pada panel kontak dan footer.
          </p>

          <div className="admin-profile-grid-2">
            <div className="form-group">
              <label htmlFor="profile-github" className="form-label">
                <span>URL GitHub</span>
              </label>
              <input
                id="profile-github"
                name="github_url"
                type="url"
                className="form-control-input"
                value={formData.github_url}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="https://github.com/username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-linkedin" className="form-label">
                <span>URL LinkedIn</span>
              </label>
              <input
                id="profile-linkedin"
                name="linkedin_url"
                type="url"
                className="form-control-input"
                value={formData.linkedin_url}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-instagram" className="form-label">
                <span>URL Instagram</span>
              </label>
              <input
                id="profile-instagram"
                name="instagram_url"
                type="url"
                className="form-control-input"
                value={formData.instagram_url}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="https://instagram.com/username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-resume" className="form-label">
                <span>URL Resume / CV</span>
              </label>
              <input
                id="profile-resume"
                name="resume_url"
                type="url"
                className="form-control-input"
                value={formData.resume_url}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button Bar */}
        <div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSaving}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isSaving ? 'Menyimpan Profil...' : 'Simpan Perubahan Profil'}
          </button>
        </div>
      </form>

      {/* Live Preview Column */}
      <aside className="admin-profile-preview-card" aria-label="Pratinjau Live Profil">
        <div className="admin-preview-header">
          <span className="admin-preview-badge-label">&bull; Pratinjau Tampilan Publik</span>
          <span className="badge badge-primary">Hero Preview</span>
        </div>

        <div className="admin-preview-avatar-box">
          {formData.avatar_url ? (
            <img
              src={formData.avatar_url}
              alt={formData.full_name || 'Avatar'}
              className="admin-preview-avatar-img"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div
          className={`admin-preview-status-pill ${
            formData.is_available ? 'is-open' : 'is-closed'
          }`}
        >
          <span className="hero-badge-pulse" aria-hidden="true" />
          <span>
            {formData.is_available
              ? 'Terbuka untuk Peluang Kerja'
              : 'Sedang Tidak Tersedia'}
          </span>
        </div>

        <div>
          <h3 className="admin-preview-name">
            {formData.full_name || 'Nama Lengkap'}
          </h3>
          <p className="admin-preview-tagline">
            {formData.tagline || 'Tagline / Keahlian'}
          </p>
        </div>

        <p className="admin-preview-bio">
          {formData.bio ||
            'Biografi singkat Anda akan ditampilkan di sini sebagai penjelasan profil profesional.'}
        </p>

        <div className="admin-preview-links">
          {formData.location && (
            <div className="admin-preview-link-row">
              <span>📍</span>
              <span>{formData.location}</span>
            </div>
          )}
          {formData.email && (
            <div className="admin-preview-link-row">
              <span>✉️</span>
              <span>{formData.email}</span>
            </div>
          )}
          {formData.github_url && (
            <div className="admin-preview-link-row">
              <span>🐙</span>
              <span>GitHub terhubung</span>
            </div>
          )}
          {formData.linkedin_url && (
            <div className="admin-preview-link-row">
              <span>💼</span>
              <span>LinkedIn terhubung</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

/**
 * AdminProfilePage Component (READ & UPDATE)
 * Provides comprehensive portfolio personal profile settings
 */
function AdminProfilePage() {
  const { profile, isLoading, error, refetch } = useProfile()
  const [successMessage, setSuccessMessage] = useState(null)

  const handleSaveSuccess = () => {
    setSuccessMessage('Data profil berhasil diperbarui!')
    refetch()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="admin-profile-page">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="container admin-navbar-inner">
          <div className="admin-nav-brand">
            <h1 className="admin-brand-title">Admin Portfolio CMS</h1>
            <span className="admin-badge-active">&bull; Profile Settings</span>
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
          <div className="admin-profile-header-actions">
            <Link to="/admin" className="admin-back-btn">
              <span>&larr;</span> Kembali ke Dashboard
            </Link>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={refetch}
              disabled={isLoading}
              title="Segarkan data profil dari database"
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
          <div className="admin-profile-title-box">
            <h2 className="admin-profile-heading">Pengaturan Profil & Bio (Profile CMS)</h2>
            <p className="admin-profile-subheading">
              Kelola informasi personal, tagline, biografi, status ketersediaan kerja, dan tautan sosial di tabel{' '}
              <code>public.profiles</code>.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="admin-projects-skeleton-list" aria-busy="true" aria-label="Memuat profil">
              <div className="admin-project-skeleton-card">
                <div className="skeleton-shimmer skeleton-title-bar" />
                <div className="skeleton-shimmer skeleton-desc-line" />
                <div className="skeleton-shimmer skeleton-desc-line-short" />
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="admin-projects-error-box" role="alert">
              <h3 className="admin-projects-error-title">Gagal Mengambil Data Profil</h3>
              <p className="admin-projects-error-desc">{error}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={refetch}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Editor Content */}
          {!isLoading && !error && (
            <ProfileEditor
              key={profile?.id || 'new-profile'}
              profile={profile}
              onSaveSuccess={handleSaveSuccess}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminProfilePage
