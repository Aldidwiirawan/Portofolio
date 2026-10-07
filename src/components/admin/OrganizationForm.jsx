import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './OrganizationForm.css'

/**
 * OrganizationForm Component
 * Supports CREATE and UPDATE for public.organizations table.
 *
 * @param {Object} props
 * @param {Object|null} [props.organization] - Existing organization object
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function OrganizationForm({ organization = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(organization)

  const [formData, setFormData] = useState({
    name: organization?.name || '',
    role: organization?.role || '',
    start_date: organization?.start_date ? organization.start_date.split('T')[0] : '',
    end_date: organization?.end_date ? organization.end_date.split('T')[0] : '',
    description: organization?.description || '',
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

    if (!formData.name.trim()) {
      errors.name = 'Nama organisasi / kepanitiaan wajib diisi.'
    }

    if (!formData.role.trim()) {
      errors.role = 'Jabatan / Peran dalam organisasi wajib diisi.'
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        errors.end_date = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.'
      }
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
      name: formData.name.trim(),
      role: formData.role.trim(),
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      description: formData.description.trim() || null,
    }

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('organizations')
          .update(payload)
          .eq('id', organization.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui data organisasi.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      } else {
        const { data, error: dbError } = await supabase
          .from('organizations')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan organisasi baru.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan data organisasi.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-org-form-card" role="region" aria-labelledby="org-form-title">
      <div className="org-form-header">
        <div>
          <h3 id="org-form-title" className="org-form-title">
            {isEditMode ? 'Edit Pengalaman Organisasi' : 'Tambah Organisasi Baru'}
          </h3>
          <p className="org-form-subtitle">
            {isEditMode
              ? `Memperbarui pengalaman "${organization?.name}".`
              : 'Menambahkan data keikutsertaan organisasi, komunitas, atau kepanitiaan.'}
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
        <div className="org-form-alert org-form-alert-error" role="alert">
          <strong>Peringatan:</strong> {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="org-form-grid">
          {/* Organization Name */}
          <div className="form-group">
            <label htmlFor="org-name" className="form-label">
              <span>Nama Organisasi / Komunitas</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="org-name"
              name="name"
              type="text"
              className={`form-control-input ${fieldErrors.name ? 'has-error' : ''}`}
              placeholder="Contoh: Himpunan Mahasiswa Jurusan, BEM, GDSC"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              autoFocus
            />
            {fieldErrors.name && <p className="form-field-error">{fieldErrors.name}</p>}
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="org-role" className="form-label">
              <span>Jabatan / Peran</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="org-role"
              name="role"
              type="text"
              className={`form-control-input ${fieldErrors.role ? 'has-error' : ''}`}
              placeholder="Contoh: Koordinator Divisi Media, Anggota"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.role && <p className="form-field-error">{fieldErrors.role}</p>}
          </div>

          {/* Start Date */}
          <div className="form-group">
            <label htmlFor="org-start-date" className="form-label">
              <span>Tanggal Mulai</span>
            </label>
            <input
              id="org-start-date"
              name="start_date"
              type="date"
              className="form-control-input"
              value={formData.start_date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {/* End Date */}
          <div className="form-group">
            <label htmlFor="org-end-date" className="form-label">
              <span>Tanggal Selesai (Kosongkan jika aktif)</span>
            </label>
            <input
              id="org-end-date"
              name="end_date"
              type="date"
              className={`form-control-input ${fieldErrors.end_date ? 'has-error' : ''}`}
              value={formData.end_date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.end_date && <p className="form-field-error">{fieldErrors.end_date}</p>}
          </div>

          {/* Description */}
          <div className="form-group org-form-grid-full">
            <label htmlFor="org-desc" className="form-label">
              <span>Deskripsi Tanggung Jawab & Kontribusi (Opsional)</span>
            </label>
            <textarea
              id="org-desc"
              name="description"
              rows="3"
              className="form-control-textarea"
              placeholder="Jelaskan peran aktif, program kerja yang diselesaikan, atau kepanitiaan yang diampu..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="org-form-actions">
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
            {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Organisasi'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OrganizationForm
