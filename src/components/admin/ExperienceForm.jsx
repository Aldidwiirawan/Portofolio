import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './ExperienceForm.css'

/**
 * ExperienceForm Component
 * Supports both CREATE and UPDATE operations for public.experiences table.
 *
 * @param {Object} props
 * @param {Object|null} [props.experience] - Existing experience object if editing
 * @param {(savedExp: Object) => void} props.onSuccess - Callback upon successful save
 * @param {() => void} props.onCancel - Callback when cancel button is clicked
 */
function ExperienceForm({ experience = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(experience)

  const [formData, setFormData] = useState({
    role: experience?.role || '',
    company: experience?.company || '',
    experience_type: experience?.experience_type || 'Kerja',
    location: experience?.location || '',
    start_date: experience?.start_date ? experience.start_date.split('T')[0] : '',
    end_date: experience?.end_date ? experience.end_date.split('T')[0] : '',
    is_current: experience?.is_current ?? false,
    description: experience?.description || '',
    sort_order: experience?.sort_order ?? 0,
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextVal = type === 'checkbox' ? checked : value

    setFormData((prev) => {
      const updated = { ...prev, [name]: nextVal }
      // If user marks is_current as true, clear end_date
      if (name === 'is_current' && checked) {
        updated.end_date = ''
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

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, experience_type: type }))
  }

  const validate = () => {
    const errors = {}

    if (!formData.role.trim()) {
      errors.role = 'Posisi / Peran wajib diisi.'
    } else if (formData.role.trim().length > 100) {
      errors.role = 'Posisi / Peran tidak boleh lebih dari 100 karakter.'
    }

    if (!formData.company.trim()) {
      errors.company = 'Perusahaan / Organisasi wajib diisi.'
    } else if (formData.company.trim().length > 100) {
      errors.company = 'Nama perusahaan/organisasi tidak boleh lebih dari 100 karakter.'
    }

    if (!formData.start_date) {
      errors.start_date = 'Tanggal mulai wajib dipilih.'
    }

    if (!formData.is_current && formData.end_date && formData.start_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        errors.end_date = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.'
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
      role: formData.role.trim(),
      company: formData.company.trim(),
      experience_type: formData.experience_type || 'Kerja',
      location: formData.location.trim() || null,
      start_date: formData.start_date,
      end_date: formData.is_current ? null : formData.end_date || null,
      is_current: Boolean(formData.is_current),
      description: formData.description.trim() || null,
      sort_order: parseInt(formData.sort_order, 10) || 0,
    }

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('experiences')
          .update(payload)
          .eq('id', experience.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui pengalaman di database.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      } else {
        const { data, error: dbError } = await supabase
          .from('experiences')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan pengalaman baru ke database.')
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
    <div className="admin-exp-form-card">
      <div className="exp-form-header">
        <div>
          <h3 className="exp-form-title">
            {isEditMode ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}
          </h3>
          <p className="exp-form-subtitle">
            {isEditMode
              ? `Memperbarui riwayat pengalaman "${experience?.role} di ${experience?.company}".`
              : 'Menambahkan riwayat pengalaman kerja atau proyek ke tabel database public.experiences.'}
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
        <div className="exp-form-alert exp-form-alert-error" role="alert">
          <strong>Peringatan:</strong> {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="exp-form-grid">
          {/* Experience Type (Kerja, Magang, PKL) */}
          <div className="form-group exp-form-grid-full">
            <label className="form-label">
              <span>Jenis Pengalaman</span>
              <span className="required-indicator">*</span>
            </label>
            <div className="exp-type-pills" role="radiogroup" aria-label="Pilih jenis pengalaman">
              {['Kerja', 'Magang', 'PKL'].map((type) => {
                const isSelected = formData.experience_type === type
                return (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`exp-type-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => handleTypeSelect(type)}
                    disabled={isSubmitting}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
            <p className="form-field-helper">Pilih jenis pengalaman: Kerja profesional, Magang, atau PKL.</p>
          </div>

          {/* Role / Position */}
          <div className="form-group">
            <label htmlFor="exp-role" className="form-label">
              <span>Posisi / Peran</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="exp-role"
              name="role"
              type="text"
              className={`form-control-input ${fieldErrors.role ? 'has-error' : ''}`}
              placeholder="Contoh: Web Developer, Frontend Intern"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting}
              autoFocus
            />
            {fieldErrors.role && <p className="form-field-error">{fieldErrors.role}</p>}
            <p className="form-field-helper">Judul posisi atau peran jabatan.</p>
          </div>

          {/* Company / Organization */}
          <div className="form-group">
            <label htmlFor="exp-company" className="form-label">
              <span>Perusahaan / Organisasi</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="exp-company"
              name="company"
              type="text"
              className={`form-control-input ${fieldErrors.company ? 'has-error' : ''}`}
              placeholder="Contoh: PT Solusi Web Mandiri"
              value={formData.company}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.company && <p className="form-field-error">{fieldErrors.company}</p>}
            <p className="form-field-helper">Nama tempat kerja, klien, atau institusi.</p>
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="exp-location" className="form-label">
              <span>Lokasi</span>
            </label>
            <input
              id="exp-location"
              name="location"
              type="text"
              className="form-control-input"
              placeholder="Contoh: Jakarta, Indonesia / Remote"
              value={formData.location}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <p className="form-field-helper">Kota, negara, atau metode kerja remote.</p>
          </div>

          {/* Sort Order */}
          <div className="form-group">
            <label htmlFor="exp-sort-order" className="form-label">
              <span>Urutan Tampilan (Sort Order)</span>
            </label>
            <input
              id="exp-sort-order"
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

          {/* Start Date */}
          <div className="form-group">
            <label htmlFor="exp-start-date" className="form-label">
              <span>Tanggal Mulai</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="exp-start-date"
              name="start_date"
              type="date"
              className={`form-control-input ${fieldErrors.start_date ? 'has-error' : ''}`}
              value={formData.start_date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.start_date && (
              <p className="form-field-error">{fieldErrors.start_date}</p>
            )}
          </div>

          {/* End Date & Current Checkbox */}
          <div className="form-group">
            <label htmlFor="exp-end-date" className="form-label">
              <span>Tanggal Selesai</span>
            </label>
            <input
              id="exp-end-date"
              name="end_date"
              type="date"
              className={`form-control-input ${fieldErrors.end_date ? 'has-error' : ''}`}
              value={formData.end_date}
              onChange={handleChange}
              disabled={isSubmitting || formData.is_current}
            />
            {fieldErrors.end_date && <p className="form-field-error">{fieldErrors.end_date}</p>}

            <label className="exp-checkbox-wrapper">
              <input
                type="checkbox"
                name="is_current"
                className="exp-checkbox-input"
                checked={formData.is_current}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span className="exp-checkbox-label">
                Saat ini masih aktif / bekerja di posisi ini
              </span>
            </label>
          </div>

          {/* Description */}
          <div className="form-group form-group-full">
            <label htmlFor="exp-description" className="form-label">
              <span>Deskripsi Tanggung Jawab & Pencapaian</span>
            </label>
            <textarea
              id="exp-description"
              name="description"
              rows="4"
              className="form-control-textarea"
              placeholder="Jelaskan peran, teknologi yang digunakan, serta kontribusi atau hasil pekerjaan..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <p className="form-field-helper">
              Teks penjelasan ringkas aktivitas atau hasil karya.
            </p>
          </div>
        </div>

        <div className="exp-form-actions">
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
              : 'Tambah Pengalaman'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ExperienceForm
