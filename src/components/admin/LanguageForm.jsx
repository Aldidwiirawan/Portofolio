import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './LanguageForm.css'

const PROFICIENCY_OPTIONS = ['Pemula', 'Menengah', 'Mahir', 'Penutur Asli']

/**
 * LanguageForm Component
 * Supports CREATE and UPDATE for public.languages table.
 *
 * @param {Object} props
 * @param {Object|null} [props.language] - Existing language object
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function LanguageForm({ language = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(language)

  const [formData, setFormData] = useState({
    language_name: language?.language_name || '',
    proficiency_level: language?.proficiency_level || 'Menengah',
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

  const handleSelectProficiency = (level) => {
    setFormData((prev) => ({ ...prev, proficiency_level: level }))
  }

  const validate = () => {
    const errors = {}

    if (!formData.language_name.trim()) {
      errors.language_name = 'Nama bahasa wajib diisi.'
    }

    if (!formData.proficiency_level) {
      errors.proficiency_level = 'Tingkat kemahiran bahasa wajib dipilih.'
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
      language_name: formData.language_name.trim(),
      proficiency_level: formData.proficiency_level,
    }

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('languages')
          .update(payload)
          .eq('id', language.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui data bahasa.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      } else {
        const { data, error: dbError } = await supabase
          .from('languages')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan bahasa baru.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan data bahasa.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-lang-form-card" role="region" aria-labelledby="lang-form-title">
      <div className="lang-form-header">
        <div>
          <h3 id="lang-form-title" className="lang-form-title">
            {isEditMode ? 'Edit Kemahiran Bahasa' : 'Tambah Bahasa Baru'}
          </h3>
          <p className="lang-form-subtitle">
            {isEditMode
              ? `Memperbarui data bahasa "${language?.language_name}".`
              : 'Menambahkan data penguasaan bahasa ke database.'}
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
        <div className="lang-form-alert lang-form-alert-error" role="alert">
          <strong>Peringatan:</strong> {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="lang-form-grid">
          {/* Language Name */}
          <div className="form-group">
            <label htmlFor="lang-name" className="form-label">
              <span>Nama Bahasa</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="lang-name"
              name="language_name"
              type="text"
              className={`form-control-input ${fieldErrors.language_name ? 'has-error' : ''}`}
              placeholder="Contoh: Bahasa Indonesia, Bahasa Inggris"
              value={formData.language_name}
              onChange={handleChange}
              disabled={isSubmitting}
              autoFocus
            />
            {fieldErrors.language_name && (
              <p className="form-field-error">{fieldErrors.language_name}</p>
            )}
          </div>

          {/* Proficiency Level Pills */}
          <div className="form-group">
            <label className="form-label">
              <span>Tingkat Kemahiran</span>
              <span className="required-indicator">*</span>
            </label>
            <div className="lang-level-pills" role="radiogroup" aria-label="Tingkat kemahiran">
              {PROFICIENCY_OPTIONS.map((level) => {
                const isSelected = formData.proficiency_level === level
                return (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`lang-level-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectProficiency(level)}
                    disabled={isSubmitting}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
            {fieldErrors.proficiency_level && (
              <p className="form-field-error">{fieldErrors.proficiency_level}</p>
            )}
          </div>
        </div>

        <div className="lang-form-actions">
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
            {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Bahasa'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LanguageForm
