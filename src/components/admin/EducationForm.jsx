import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './EducationForm.css'

const DEGREE_PRESETS = ['Diploma III (D3)', 'Sarjana (S1)', 'Magister (S2)', 'SMK / SMA']

/**
 * EducationForm Component
 * Supports both CREATE and UPDATE operations for public.educations table.
 *
 * @param {Object} props
 * @param {Object|null} [props.education] - Existing education object if editing
 * @param {(savedEdu: Object) => void} props.onSuccess - Callback upon successful save
 * @param {() => void} props.onCancel - Callback when cancel button is clicked
 */
function EducationForm({ education = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(education)

  const [formData, setFormData] = useState({
    institution: education?.institution || '',
    degree: education?.degree || 'Diploma III (D3)',
    field_of_study: education?.field_of_study || '',
    start_year: education?.start_year ?? new Date().getFullYear() - 3,
    end_year: education?.end_year ?? new Date().getFullYear(),
    is_current: education?.is_current ?? false,
    description: education?.description || '',
    sort_order: education?.sort_order ?? 0,
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextVal = type === 'checkbox' ? checked : value

    setFormData((prev) => {
      const updated = { ...prev, [name]: nextVal }
      if (name === 'is_current' && checked) {
        updated.end_year = ''
      }
      return updated
    })

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (generalError) {
      setGeneralError(null)
    }
  }

  const handleSelectDegreePreset = (preset) => {
    setFormData((prev) => ({ ...prev, degree: preset }))
    if (fieldErrors.degree) {
      setFieldErrors((prev) => ({ ...prev, degree: null }))
    }
  }

  const validate = () => {
    const errors = {}

    if (!formData.institution.trim()) {
      errors.institution = 'Nama institusi / perguruan tinggi wajib diisi.'
    } else if (formData.institution.trim().length > 150) {
      errors.institution = 'Nama institusi tidak boleh lebih dari 150 karakter.'
    }

    if (!formData.degree.trim()) {
      errors.degree = 'Gelar / jenjang pendidikan wajib diisi.'
    }

    if (!formData.field_of_study.trim()) {
      errors.field_of_study = 'Jurusan / bidang studi wajib diisi.'
    }

    const startYearNum = Number(formData.start_year)
    if (isNaN(startYearNum) || startYearNum < 1950 || startYearNum > 2100) {
      errors.start_year = 'Tahun masuk harus antara tahun 1950 dan 2100.'
    }

    if (!formData.is_current && formData.end_year) {
      const endYearNum = Number(formData.end_year)
      if (isNaN(endYearNum) || endYearNum < 1950 || endYearNum > 2100) {
        errors.end_year = 'Tahun lulus harus antara tahun 1950 dan 2100.'
      } else if (endYearNum < startYearNum) {
        errors.end_year = 'Tahun lulus tidak boleh lebih awal dari tahun masuk.'
      }
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
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      field_of_study: formData.field_of_study.trim(),
      start_year: parseInt(formData.start_year, 10),
      end_year: formData.is_current ? null : formData.end_year ? parseInt(formData.end_year, 10) : null,
      is_current: Boolean(formData.is_current),
      description: formData.description.trim() || null,
      sort_order: parseInt(formData.sort_order, 10) || 0,
    }

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('educations')
          .update(payload)
          .eq('id', education.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui data pendidikan di database.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      } else {
        const { data, error: dbError } = await supabase
          .from('educations')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan riwayat pendidikan baru ke database.')
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
    <div className="admin-edu-form-card">
      <div className="edu-form-header">
        <div>
          <h3 className="edu-form-title">
            {isEditMode ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan'}
          </h3>
          <p className="edu-form-subtitle">
            {isEditMode
              ? `Memperbarui data studi "${education?.degree} ${education?.field_of_study}".`
              : 'Menambahkan riwayat pendidikan formal ke tabel database public.educations.'}
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
        <div className="edu-form-alert edu-form-alert-error" role="alert">
          <strong>Peringatan:</strong> {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="edu-form-grid">
          {/* Institution */}
          <div className="form-group form-group-full">
            <label htmlFor="edu-institution" className="form-label">
              <span>Nama Institusi / Universitas / Sekolah</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="edu-institution"
              name="institution"
              type="text"
              className={`form-control-input ${fieldErrors.institution ? 'has-error' : ''}`}
              placeholder="Contoh: Universitas Dian Nuswantoro, Politeknik Negeri"
              value={formData.institution}
              onChange={handleChange}
              disabled={isSubmitting}
              autoFocus
            />
            {fieldErrors.institution && (
              <p className="form-field-error">{fieldErrors.institution}</p>
            )}
          </div>

          {/* Degree */}
          <div className="form-group">
            <label htmlFor="edu-degree" className="form-label">
              <span>Gelar / Jenjang Pendidikan</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="edu-degree"
              name="degree"
              type="text"
              className={`form-control-input ${fieldErrors.degree ? 'has-error' : ''}`}
              placeholder="Contoh: Diploma III (D3), Sarjana (S1)"
              value={formData.degree}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.degree && <p className="form-field-error">{fieldErrors.degree}</p>}
            <div className="edu-degree-presets" aria-label="Preset Jenjang">
              {DEGREE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`skill-preset-btn ${
                    formData.degree.toLowerCase() === preset.toLowerCase() ? 'is-selected' : ''
                  }`}
                  onClick={() => handleSelectDegreePreset(preset)}
                  disabled={isSubmitting}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Field of Study */}
          <div className="form-group">
            <label htmlFor="edu-field-of-study" className="form-label">
              <span>Jurusan / Program Studi</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="edu-field-of-study"
              name="field_of_study"
              type="text"
              className={`form-control-input ${fieldErrors.field_of_study ? 'has-error' : ''}`}
              placeholder="Contoh: Manajemen Informatika, Teknik Informatika"
              value={formData.field_of_study}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.field_of_study && (
              <p className="form-field-error">{fieldErrors.field_of_study}</p>
            )}
          </div>

          {/* Start Year */}
          <div className="form-group">
            <label htmlFor="edu-start-year" className="form-label">
              <span>Tahun Masuk / Mulai</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="edu-start-year"
              name="start_year"
              type="number"
              min="1950"
              max="2100"
              className={`form-control-input ${fieldErrors.start_year ? 'has-error' : ''}`}
              value={formData.start_year}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.start_year && (
              <p className="form-field-error">{fieldErrors.start_year}</p>
            )}
          </div>

          {/* End Year & Current Checkbox */}
          <div className="form-group">
            <label htmlFor="edu-end-year" className="form-label">
              <span>Tahun Lulus / Selesai</span>
            </label>
            <input
              id="edu-end-year"
              name="end_year"
              type="number"
              min="1950"
              max="2100"
              className={`form-control-input ${fieldErrors.end_year ? 'has-error' : ''}`}
              value={formData.end_year}
              onChange={handleChange}
              disabled={isSubmitting || formData.is_current}
            />
            {fieldErrors.end_year && (
              <p className="form-field-error">{fieldErrors.end_year}</p>
            )}

            <label className="edu-checkbox-wrapper">
              <input
                type="checkbox"
                name="is_current"
                className="edu-checkbox-input"
                checked={formData.is_current}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span className="edu-checkbox-label">
                Masih aktif menempuh studi saat ini
              </span>
            </label>
          </div>

          {/* Sort Order */}
          <div className="form-group">
            <label htmlFor="edu-sort-order" className="form-label">
              <span>Urutan Tampilan (Sort Order)</span>
            </label>
            <input
              id="edu-sort-order"
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
            <p className="form-field-helper">Angka lebih kecil akan ditampilkan lebih atas.</p>
          </div>

          {/* Description */}
          <div className="form-group form-group-full">
            <label htmlFor="edu-description" className="form-label">
              <span>Deskripsi / Fokus Pembelajaran</span>
            </label>
            <textarea
              id="edu-description"
              name="description"
              rows="3"
              className="form-control-textarea"
              placeholder="Jelaskan fokus studi, mata kuliah inti, skripsi/tugas akhir, atau capaian akademis..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="edu-form-actions">
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
              : 'Tambah Riwayat Pendidikan'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EducationForm
