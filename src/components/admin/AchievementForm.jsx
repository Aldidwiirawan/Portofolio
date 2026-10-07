import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './AchievementForm.css'

/**
 * AchievementForm Component
 * Supports CREATE and UPDATE for public.achievements table.
 *
 * @param {Object} props
 * @param {Object|null} [props.achievement] - Existing achievement object
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function AchievementForm({ achievement = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(achievement)

  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    event_name: achievement?.event_name || '',
    year: achievement?.year ?? new Date().getFullYear(),
    description: achievement?.description || '',
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (generalError) {
      setGeneralError(null)
    }
  }

  const validate = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = 'Judul prestasi / pencapaian wajib diisi.'
    }

    if (!formData.event_name.trim()) {
      errors.event_name = 'Nama acara / ajang kompetisi wajib diisi.'
    }

    const yearVal = Number(formData.year)
    if (!formData.year || isNaN(yearVal) || yearVal < 1990 || yearVal > 2100) {
      errors.year = 'Tahun harus berupa 4 digit angka yang valid (contoh: 2025).'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setGeneralError(null)

    const payload = {
      title: formData.title.trim(),
      event_name: formData.event_name.trim(),
      year: parseInt(formData.year, 10),
      description: formData.description.trim() || null,
    }

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('achievements')
          .update(payload)
          .eq('id', achievement.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui data pencapaian.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      } else {
        const { data, error: dbError } = await supabase
          .from('achievements')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan pencapaian baru.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan data pencapaian.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-achieve-form-card" role="region" aria-labelledby="achieve-form-title">
      <div className="achieve-form-header">
        <div>
          <h3 id="achieve-form-title" className="achieve-form-title">
            {isEditMode ? 'Edit Pencapaian' : 'Tambah Pencapaian Baru'}
          </h3>
          <p className="achieve-form-subtitle">
            {isEditMode
              ? `Memperbarui prestasi "${achievement?.title}".`
              : 'Menambahkan data prestasi, penghargaan, atau kompetisi ke database.'}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Tutup Form
        </button>
      </div>

      {generalError && (
        <div className="achieve-form-alert achieve-form-alert-error" role="alert">
          <strong>Peringatan:</strong> {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="achieve-form-grid">
          {/* Title */}
          <div className="form-group achieve-form-grid-full">
            <label htmlFor="achieve-title" className="form-label">
              <span>Judul Prestasi / Penghargaan</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="achieve-title"
              name="title"
              type="text"
              className={`form-control-input ${fieldErrors.title ? 'has-error' : ''}`}
              placeholder="Contoh: Juara 1 Hackathon Mahasiswa Nasional"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              autoFocus
            />
            {fieldErrors.title && <p className="form-field-error">{fieldErrors.title}</p>}
          </div>

          {/* Event Name */}
          <div className="form-group">
            <label htmlFor="achieve-event" className="form-label">
              <span>Nama Acara / Penyelenggara</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="achieve-event"
              name="event_name"
              type="text"
              className={`form-control-input ${fieldErrors.event_name ? 'has-error' : ''}`}
              placeholder="Contoh: Dies Natalis Polinema / Baparekraf"
              value={formData.event_name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.event_name && (
              <p className="form-field-error">{fieldErrors.event_name}</p>
            )}
          </div>

          {/* Year */}
          <div className="form-group">
            <label htmlFor="achieve-year" className="form-label">
              <span>Tahun</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="achieve-year"
              name="year"
              type="number"
              min="1990"
              max="2100"
              className={`form-control-input ${fieldErrors.year ? 'has-error' : ''}`}
              value={formData.year}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.year && <p className="form-field-error">{fieldErrors.year}</p>}
          </div>

          {/* Description */}
          <div className="form-group achieve-form-grid-full">
            <label htmlFor="achieve-desc" className="form-label">
              <span>Deskripsi Singkat (Opsional)</span>
            </label>
            <textarea
              id="achieve-desc"
              name="description"
              rows="3"
              className="form-control-textarea"
              placeholder="Jelaskan peran, kontribusi, atau detail penghargaan ini..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="achieve-form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Pencapaian'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AchievementForm
