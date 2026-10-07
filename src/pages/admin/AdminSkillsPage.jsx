import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useSkills } from '../../hooks/useSkills'
import SkillForm from '../../components/admin/SkillForm'
import './AdminProjectsPage.css'
import './AdminSkillsPage.css'

/**
 * AdminSkillsPage Component (CRUD)
 * Allows owner/admin to manage technical skills stored in public.skills:
 * - Read skills with category grouping & filtering
 * - Create new skill
 * - Update existing skill
 * - Delete skill with confirmation modal
 */
function AdminSkillsPage() {
  const { skills, isLoading, error, refetch } = useSkills()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingSkill, setDeletingSkill] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Categories list for filter tabs
  const categories = useMemo(() => {
    const unique = new Set(skills.map((s) => s.category).filter(Boolean))
    return ['All', ...Array.from(unique)]
  }, [skills])

  // Filtered skills list
  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'All') return skills
    return skills.filter(
      (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
    )
  }, [skills, selectedCategory])

  // Keyboard accessibility: Escape closes delete modal
  useEffect(() => {
    if (!deletingSkill) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        setDeletingSkill(null)
        setDeleteError(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deletingSkill, isDeleting])

  const handleFormSuccess = (savedSkill) => {
    const isEdit = Boolean(editingSkill)
    setIsFormOpen(false)
    setEditingSkill(null)
    setSuccessMessage(
      isEdit
        ? `Skill "${savedSkill.name}" berhasil diperbarui!`
        : `Skill "${savedSkill.name}" berhasil ditambahkan!`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingSkill(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (skill) => {
    setEditingSkill(skill)
    setSuccessMessage(null)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingSkill(null)
  }

  const handleOpenDeleteModal = (skill) => {
    setDeletingSkill(skill)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingSkill(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingSkill) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbDeleteError } = await supabase
        .from('skills')
        .delete()
        .eq('id', deletingSkill.id)

      if (dbDeleteError) {
        throw new Error(dbDeleteError.message || 'Gagal menghapus skill dari database.')
      }

      if (editingSkill?.id === deletingSkill.id) {
        setEditingSkill(null)
        setIsFormOpen(false)
      }

      const deletedName = deletingSkill.name
      setDeletingSkill(null)
      setSuccessMessage(`Skill "${deletedName}" berhasil dihapus!`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus skill.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="admin-skills-page">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="container admin-navbar-inner">
          <div className="admin-nav-brand">
            <h1 className="admin-brand-title">Admin Portfolio CMS</h1>
            <span className="admin-badge-active">&bull; Skills</span>
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
          <div className="admin-skills-header-actions">
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
                  + Tambah Skill
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

          {/* Form Create / Edit Skill (Conditional) */}
          {isFormOpen && (
            <SkillForm
              key={editingSkill?.id || 'new-skill'}
              skill={editingSkill}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
            />
          )}

          {/* Title & Description */}
          <div className="admin-skills-title-box">
            <h2 className="admin-skills-heading">Manajemen Keahlian (Skills)</h2>
            <p className="admin-skills-subheading">
              Kelola keahlian teknologi dan perangkat kerja yang tersimpan di tabel database{' '}
              <code>public.skills</code>.
            </p>
          </div>

          {/* Summary Metrics */}
          <div className="admin-projects-summary-grid">
            <div className="admin-summary-card">
              <span className="admin-summary-label">Total Skills</span>
              <span className="admin-summary-value">{isLoading ? '—' : skills.length}</span>
            </div>

            <div className="admin-summary-card">
              <span className="admin-summary-label">Kategori</span>
              <span className="admin-summary-value">
                {isLoading ? '—' : Math.max(0, categories.length - 1)}
              </span>
            </div>

            <div className="admin-summary-card">
              <span className="admin-summary-label">Database Target</span>
              <span
                className="badge badge-primary"
                style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
              >
                public.skills
              </span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          {!isLoading && skills.length > 0 && (
            <div className="admin-skills-filter-bar" role="tablist" aria-label="Filter Kategori">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  className={`admin-filter-pill ${selectedCategory === cat ? 'is-active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'All' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          )}

          {/* Conditional State: LOADING */}
          {isLoading && (
            <div className="admin-projects-skeleton-list" aria-busy="true" aria-label="Memuat skills">
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
              <h3 className="admin-projects-error-title">Gagal Mengambil Data Skills</h3>
              <p className="admin-projects-error-desc">{error}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={refetch}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Conditional State: EMPTY */}
          {!isLoading && !error && skills.length === 0 && (
            <div className="admin-projects-empty-box">
              <h3 className="admin-projects-empty-title">Belum ada skill yang ditambahkan.</h3>
              <p className="admin-projects-empty-desc">
                Tabel <code>public.skills</code> saat ini belum memiliki record data. Klik tombol{' '}
                <strong>"+ Tambah Skill"</strong> di atas untuk menambahkan keahlian pertama Anda.
              </p>
            </div>
          )}

          {/* Conditional State: SUCCESS (Skills List) */}
          {!isLoading && !error && filteredSkills.length > 0 && (
            <div className="admin-skills-list-grid">
              {filteredSkills.map((skill) => (
                <div key={skill.id} className="admin-skill-card-item">
                  <div className="admin-skill-card-top">
                    <div>
                      <h3 className="admin-skill-item-name">{skill.name}</h3>
                      <div className="admin-skill-tags-row">
                        <span className="admin-skill-category-badge">{skill.category}</span>
                        {skill.proficiency && (
                          <span className="admin-skill-proficiency-badge">
                            {skill.proficiency}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="admin-skill-sort-badge">Urutan: {skill.sort_order ?? 0}</span>
                  </div>

                  <div className="admin-skill-card-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm admin-skill-action-btn admin-project-edit-btn"
                      onClick={() => handleOpenEditForm(skill)}
                      title={`Edit skill "${skill.name}"`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm admin-skill-action-btn admin-project-delete-btn"
                      onClick={() => handleOpenDeleteModal(skill)}
                      title={`Hapus skill "${skill.name}"`}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deletingSkill && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-skill-modal-title"
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
                <h3 id="delete-skill-modal-title" className="admin-modal-title">
                  Hapus Keahlian (Skill)
                </h3>
                <p className="admin-modal-subtitle">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="admin-modal-body">
              <p>
                Apakah Anda yakin ingin menghapus skill <strong>"{deletingSkill.name}"</strong>?
              </p>
              <p className="admin-modal-body-subtext">
                Record di tabel <code>public.skills</code> akan dihapus secara permanen.
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
                    <line x1="12" y1="16" x2="12.01" y2="16" />
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
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Skill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSkillsPage
