import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './SkillForm.css'

const CATEGORY_PRESETS = ['Frontend', 'Backend', 'Database', 'Tools']
const PROFICIENCY_PRESETS = ['Dasar', 'Menengah', 'Mahir', 'Dasar / Menengah']

/**
 * SkillForm Component
 * Supports both CREATE and UPDATE operations for public.skills table.
 *
 * @param {Object} props
 * @param {Object|null} [props.skill] - Existing skill object if in edit mode
 * @param {(savedSkill: Object) => void} props.onSuccess - Callback upon successful save
 * @param {() => void} props.onCancel - Callback when cancel button is clicked
 */
function SkillForm({ skill = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(skill)

  const [formData, setFormData] = useState({
    name: skill?.name || '',
    category: skill?.category || 'Frontend',
    proficiency: skill?.proficiency || 'Menengah',
    sort_order: skill?.sort_order ?? 0,
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

  const handleSelectCategoryPreset = (preset) => {
    setFormData((prev) => ({ ...prev, category: preset }))
    if (fieldErrors.category) {
      setFieldErrors((prev) => ({ ...prev, category: null }))
    }
  }

  const handleSelectProficiencyPreset = (preset) => {
    setFormData((prev) => ({ ...prev, proficiency: preset }))
  }

  const validate = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Nama skill wajib diisi.'
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Nama skill tidak boleh lebih dari 100 karakter.'
    }

    if (!formData.category.trim()) {
      errors.category = 'Kategori skill wajib dipilih atau diisi.'
    }

    const sortOrderVal = Number(formData.sort_order)
    if (isNaN(sortOrderVal) || !Number.isInteger(sortOrderVal) || sortOrderVal < 0) {
      errors.sort_order = 'Urutan harus berupa angka bulat positif (>= 0).'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setGeneralError(null)

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      proficiency: formData.proficiency.trim() || null,
      sort_order: parseInt(formData.sort_order, 10) || 0,
    }

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('skills')
          .update(payload)
          .eq('id', skill.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui skill di database.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      } else {
        const { data, error: dbError } = await supabase
          .from('skills')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan skill baru ke database.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem yang tidak terduga saat menyimpan data.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-skill-form-card">
      <div className="skill-form-header">
        <div>
          <h3 className="skill-form-title">
            {isEditMode ? 'Edit Keahlian (Skill)' : 'Tambah Keahlian Baru'}
          </h3>
          <p className="skill-form-subtitle">
            {isEditMode
              ? `Memperbarui data skill "${skill?.name}" di tabel public.skills.`
              : 'Menambahkan data keahlian teknologi ke tabel database public.skills.'}
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
        <div className="skill-form-alert skill-form-alert-error" role="alert">
          <strong>Peringatan:</strong> {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="skill-form-grid">
          {/* Skill Name */}
          <div className="form-group">
            <label htmlFor="skill-name" className="form-label">
              <span>Nama Keahlian / Teknologi</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="skill-name"
              name="name"
              type="text"
              className={`form-control-input ${fieldErrors.name ? 'has-error' : ''}`}
              placeholder="Contoh: React.js, PostgreSQL, Docker"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              autoFocus
            />
            {fieldErrors.name && (
              <p className="form-field-error">{fieldErrors.name}</p>
            )}
            <p className="form-field-helper">Nama teknologi, library, atau alat kerja.</p>
          </div>

          {/* Sort Order */}
          <div className="form-group">
            <label htmlFor="skill-sort-order" className="form-label">
              <span>Urutan Tampilan (Sort Order)</span>
            </label>
            <input
              id="skill-sort-order"
              name="sort_order"
              type="number"
              min="0"
              step="1"
              className={`form-control-input ${fieldErrors.sort_order ? 'has-error' : ''}`}
              value={formData.sort_order}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.sort_order && (
              <p className="form-field-error">{fieldErrors.sort_order}</p>
            )}
            <p className="form-field-helper">Angka lebih kecil akan ditampilkan lebih dahulu.</p>
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="skill-category" className="form-label">
              <span>Kategori</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="skill-category"
              name="category"
              type="text"
              className={`form-control-input ${fieldErrors.category ? 'has-error' : ''}`}
              placeholder="Frontend, Backend, Database, Tools..."
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.category && (
              <p className="form-field-error">{fieldErrors.category}</p>
            )}
            <div className="skill-category-presets" aria-label="Preset Kategori">
              {CATEGORY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`skill-preset-btn ${
                    formData.category.toLowerCase() === preset.toLowerCase() ? 'is-selected' : ''
                  }`}
                  onClick={() => handleSelectCategoryPreset(preset)}
                  disabled={isSubmitting}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Proficiency */}
          <div className="form-group">
            <label htmlFor="skill-proficiency" className="form-label">
              <span>Tingkat Kemahiran (Proficiency)</span>
            </label>
            <input
              id="skill-proficiency"
              name="proficiency"
              type="text"
              className="form-control-input"
              placeholder="Mahir, Menengah, Dasar..."
              value={formData.proficiency}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <div className="skill-category-presets" aria-label="Preset Kemahiran">
              {PROFICIENCY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`skill-preset-btn ${
                    formData.proficiency === preset ? 'is-selected' : ''
                  }`}
                  onClick={() => handleSelectProficiencyPreset(preset)}
                  disabled={isSubmitting}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="skill-form-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Menyimpan...'
              : isEditMode
              ? 'Simpan Perubahan'
              : 'Tambah Skill'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SkillForm
