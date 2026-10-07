import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './CertificationForm.css'

/**
 * CertificationForm Component
 * Supports CREATE and UPDATE for public.certifications table.
 *
 * @param {Object} props
 * @param {Object|null} [props.certification] - Existing certification object
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function CertificationForm({ certification = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(certification)

  const [formData, setFormData] = useState({
    name: certification?.name || '',
    issuer: certification?.issuer || '',
    issue_date: certification?.issue_date ? certification.issue_date.split('T')[0] : '',
    credential_url: certification?.credential_url || '',
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
      errors.name = 'Nama sertifikasi / kursus wajib diisi.'
    }

    if (!formData.issuer.trim()) {
      errors.issuer = 'Penerbit / Penyelenggara sertifikat wajib diisi.'
    }

    if (formData.credential_url.trim()) {
      try {
        new URL(formData.credential_url.trim())
      } catch {
        errors.credential_url = 'Format tautan sertifikat harus berupa URL valid (http/https).'
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
      issuer: formData.issuer.trim(),
      issue_date: formData.issue_date || null,
      credential_url: formData.credential_url.trim() || null,
    }

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('certifications')
          .update(payload)
          .eq('id', certification.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui data sertifikasi.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      } else {
        const { data, error: dbError } = await supabase
          .from('certifications')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan sertifikasi baru.')
        }

        setIsSubmitting(false)
        onSuccess(data)
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan data sertifikasi.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-cert-form-card" role="region" aria-labelledby="cert-form-title">
      <div className="cert-form-header">
        <div>
          <h3 id="cert-form-title" className="cert-form-title">
            {isEditMode ? 'Edit Sertifikasi / Kursus' : 'Tambah Sertifikasi Baru'}
          </h3>
          <p className="cert-form-subtitle">
            {isEditMode
              ? `Memperbarui data sertifikasi "${certification?.name}".`
              : 'Menambahkan data sertifikasi, pelatihan, atau lisensi profesional ke database.'}
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
        <div className="cert-form-alert cert-form-alert-error" role="alert">
          <strong>Peringatan:</strong> {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="cert-form-grid">
          {/* Certification Name */}
          <div className="form-group cert-form-grid-full">
            <label htmlFor="cert-name" className="form-label">
              <span>Nama Sertifikasi / Pelatihan</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="cert-name"
              name="name"
              type="text"
              className={`form-control-input ${fieldErrors.name ? 'has-error' : ''}`}
              placeholder="Contoh: MikroTik Certified Network Associate (MTCNA)"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              autoFocus
            />
            {fieldErrors.name && <p className="form-field-error">{fieldErrors.name}</p>}
          </div>

          {/* Issuer */}
          <div className="form-group">
            <label htmlFor="cert-issuer" className="form-label">
              <span>Penerbit / Penyelenggara</span>
              <span className="required-indicator">*</span>
            </label>
            <input
              id="cert-issuer"
              name="issuer"
              type="text"
              className={`form-control-input ${fieldErrors.issuer ? 'has-error' : ''}`}
              placeholder="Contoh: MikroTik, Cisco, Coursera"
              value={formData.issuer}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.issuer && <p className="form-field-error">{fieldErrors.issuer}</p>}
          </div>

          {/* Issue Date */}
          <div className="form-group">
            <label htmlFor="cert-date" className="form-label">
              <span>Tanggal Terbit</span>
            </label>
            <input
              id="cert-date"
              name="issue_date"
              type="date"
              className="form-control-input"
              value={formData.issue_date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <p className="form-field-helper">Tanggal diterbitkannya sertifikat atau kursus.</p>
          </div>

          {/* Credential URL */}
          <div className="form-group cert-form-grid-full">
            <label htmlFor="cert-url" className="form-label">
              <span>Tautan Kredensial / Sertifikat (Opsional)</span>
            </label>
            <input
              id="cert-url"
              name="credential_url"
              type="url"
              className={`form-control-input ${fieldErrors.credential_url ? 'has-error' : ''}`}
              placeholder="https://..."
              value={formData.credential_url}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.credential_url && (
              <p className="form-field-error">{fieldErrors.credential_url}</p>
            )}
            <p className="form-field-helper">Tautan verifikasi resmi atau link dokumen sertifikat PDF.</p>
          </div>
        </div>

        <div className="cert-form-actions">
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
            {isSubmitting
              ? 'Menyimpan...'
              : isEditMode
              ? 'Simpan Perubahan'
              : 'Tambah Sertifikasi'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CertificationForm
