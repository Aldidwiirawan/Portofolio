import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { extractStoragePath } from '../../lib/storageUtils'
import './ProjectForm.css'

/**
 * Helper: Converts text into a clean URL-friendly slug
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_-]+/g, '-') // collapse spaces and underscores to hyphens
    .replace(/^-+|-+$/g, '') // trim leading and trailing hyphens
}

/**
 * Helper: Checks if a string is a valid web URL
 * @param {string} string
 * @returns {boolean}
 */
function isValidUrl(string) {
  if (!string || string.trim() === '') return true
  try {
    const url = new URL(string.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Helper: Formats file size in readable bytes, KB, or MB
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * ProjectForm Component
 * Handles input validation, storage image upload, and explicit INSERT or UPDATE into public.projects table.
 * Supports both CREATE and UPDATE modes seamlessly.
 *
 * @param {Object} props
 * @param {Object|null} [props.project] - Existing project data if editing, or null if creating
 * @param {(savedProject: Object) => void} props.onSuccess - Callback on successful insert or update
 * @param {() => void} props.onCancel - Callback on cancel button click
 */
function ProjectForm({ project = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(project?.id)

  const [title, setTitle] = useState(project?.title || '')
  const [slug, setSlug] = useState(project?.slug || '')
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEditMode)
  const [description, setDescription] = useState(project?.description || '')
  const [content, setContent] = useState(project?.content || '')
  const [demoUrl, setDemoUrl] = useState(project?.demo_url || '')
  const [githubUrl, setGithubUrl] = useState(project?.github_url || '')
  const [techStackInput, setTechStackInput] = useState(
    Array.isArray(project?.tech_stack) ? project.tech_stack.join(', ') : ''
  )
  const [isFeatured, setIsFeatured] = useState(Boolean(project?.is_featured))
  const [sortOrder, setSortOrder] = useState(String(project?.sort_order ?? 0))

  // Existing thumbnail URL from database (if in edit mode)
  const existingThumbnailUrl = project?.thumbnail_url || null

  // New thumbnail file and preview state
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const fileInputRef = useRef(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Revoke preview object URL when component unmounts or preview changes to prevent memory leak
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
    }
  }, [thumbnailPreview])

  // Handle title change and auto-generate slug if not manually customized
  const handleTitleChange = (e) => {
    const val = e.target.value
    setTitle(val)
    if (!isSlugManuallyEdited) {
      setSlug(slugify(val))
    }
    if (fieldErrors.title) {
      setFieldErrors((prev) => ({ ...prev, title: null }))
    }
  }

  // Handle manual slug input
  const handleSlugChange = (e) => {
    setIsSlugManuallyEdited(true)
    const val = e.target.value.toLowerCase().replace(/\s+/g, '-')
    setSlug(val)
    if (fieldErrors.slug) {
      setFieldErrors((prev) => ({ ...prev, slug: null }))
    }
  }

  // Handle thumbnail image selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      setFieldErrors((prev) => ({
        ...prev,
        thumbnail: 'File harus berupa gambar.',
      }))
      return
    }

    // Validate file size limit: 2 MB = 2097152 bytes
    if (file.size > 2097152) {
      setFieldErrors((prev) => ({
        ...prev,
        thumbnail: 'Ukuran gambar maksimal 2 MB.',
      }))
      return
    }

    // Clear previous error
    setFieldErrors((prev) => ({ ...prev, thumbnail: null }))

    // Clean up previous object URL if any
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }

    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  // Remove selected new thumbnail image (reverts to existing thumbnail in edit mode)
  const handleRemoveThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setThumbnailFile(null)
    setThumbnailPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFieldErrors((prev) => ({ ...prev, thumbnail: null }))
  }

  // Validate form inputs before submission
  const validateForm = () => {
    const errors = {}

    // Title validation
    if (!title.trim()) {
      errors.title = 'Judul project wajib diisi.'
    }

    // Slug validation
    const trimmedSlug = slug.trim()
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!trimmedSlug) {
      errors.slug = 'Slug project wajib diisi.'
    } else if (!slugRegex.test(trimmedSlug)) {
      errors.slug = 'Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung (-), tanpa spasi.'
    }

    // Description validation
    if (!description.trim()) {
      errors.description = 'Deskripsi singkat wajib diisi.'
    }

    // URL validations
    if (demoUrl.trim() && !isValidUrl(demoUrl)) {
      errors.demoUrl = 'Format Demo URL tidak valid (harus diawali http:// atau https://).'
    }
    if (githubUrl.trim() && !isValidUrl(githubUrl)) {
      errors.githubUrl = 'Format GitHub URL tidak valid (harus diawali http:// atau https://).'
    }

    // Thumbnail size re-check if selected
    if (thumbnailFile && thumbnailFile.size > 2097152) {
      errors.thumbnail = 'Ukuran gambar maksimal 2 MB.'
    }

    // Sort order validation
    const parsedSortOrder = parseInt(sortOrder, 10)
    if (isNaN(parsedSortOrder) || parsedSortOrder < 0) {
      errors.sortOrder = 'Urutan tampilan harus berupa angka 0 atau lebih besar.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    let uploadedFilePath = null
    let finalThumbnailUrl = isEditMode ? existingThumbnailUrl : null

    // 1. Upload thumbnail to Supabase Storage if user chose a new file
    if (thumbnailFile) {
      const fileExt = thumbnailFile.name.split('.').pop().toLowerCase() || 'png'
      const filePath = `projects/${crypto.randomUUID()}.${fileExt}`
      uploadedFilePath = filePath

      try {
        const { error: uploadError } = await supabase.storage
          .from('portfolio-assets')
          .upload(uploadedFilePath, thumbnailFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          setGeneralError(
            uploadError.message || 'Gagal mengunggah thumbnail ke storage.'
          )
          setIsSubmitting(false)
          return
        }

        const { data: urlData } = supabase.storage
          .from('portfolio-assets')
          .getPublicUrl(uploadedFilePath)

        finalThumbnailUrl = urlData?.publicUrl || null
      } catch (err) {
        setGeneralError(
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat mengunggah thumbnail.'
        )
        setIsSubmitting(false)
        return
      }
    }

    // 2. Parse tech_stack from comma-separated string into clean array TEXT[]
    const techStackArray = techStackInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    // 3. Prepare controlled and explicit payload (no id, no timestamps)
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      content: content.trim() ? content.trim() : null,
      thumbnail_url: finalThumbnailUrl,
      demo_url: demoUrl.trim() ? demoUrl.trim() : null,
      github_url: githubUrl.trim() ? githubUrl.trim() : null,
      tech_stack: techStackArray,
      is_featured: Boolean(isFeatured),
      sort_order: parseInt(sortOrder, 10) || 0,
    }

    // 4. Execute database mutation (UPDATE or INSERT)
    try {
      const query = isEditMode
        ? supabase.from('projects').update(payload).eq('id', project.id)
        : supabase.from('projects').insert(payload)

      const { data, error: dbError } = await query
        .select(
          'id, title, slug, description, content, thumbnail_url, demo_url, github_url, tech_stack, is_featured, sort_order, created_at, updated_at'
        )
        .single()

      if (dbError) {
        // Orphan file cleanup: remove newly uploaded file if DB operation fails
        let cleanupWarning = ''
        if (uploadedFilePath) {
          try {
            const { error: cleanupError } = await supabase.storage
              .from('portfolio-assets')
              .remove([uploadedFilePath])

            if (cleanupError) {
              console.warn(
                `[Storage Cleanup Warning] Gagal membersihkan file orphan '${uploadedFilePath}':`,
                cleanupError.message
              )
              cleanupWarning = ` (Peringatan: File thumbnail '${uploadedFilePath}' tidak dapat dibersihkan otomatis: ${cleanupError.message})`
            }
          } catch (cleanupEx) {
            console.warn(
              `[Storage Cleanup Exception] Gagal saat menghapus file orphan '${uploadedFilePath}':`,
              cleanupEx
            )
            cleanupWarning = ` (Peringatan: Terjadi error saat membersihkan file thumbnail '${uploadedFilePath}')`
          }
        }

        // Handle unique constraint duplicate slug error (PostgreSQL error code 23505)
        if (
          dbError.code === '23505' ||
          dbError.message?.toLowerCase().includes('slug') ||
          dbError.message?.toLowerCase().includes('duplicate')
        ) {
          setGeneralError(
            `Slug sudah digunakan. Silakan gunakan slug yang berbeda.${cleanupWarning}`
          )
          setFieldErrors((prev) => ({
            ...prev,
            slug: 'Slug ini sudah terdaftar di database.',
          }))
        } else {
          setGeneralError(
            `${dbError.message || (isEditMode ? 'Gagal memperbarui project.' : 'Gagal menyimpan project ke database.')}${cleanupWarning}`
          )
        }
        setIsSubmitting(false)
        return
      }

      // 5. Best-effort cleanup of old thumbnail if replaced in edit mode
      if (isEditMode && uploadedFilePath && existingThumbnailUrl) {
        const oldFilePath = extractStoragePath(existingThumbnailUrl)
        if (oldFilePath && oldFilePath !== uploadedFilePath) {
          try {
            const { error: oldRemoveError } = await supabase.storage
              .from('portfolio-assets')
              .remove([oldFilePath])

            if (oldRemoveError) {
              console.warn(
                `[Storage Cleanup] Gagal menghapus thumbnail lama '${oldFilePath}':`,
                oldRemoveError.message
              )
            }
          } catch (ex) {
            console.warn(
              `[Storage Cleanup] Exception saat menghapus thumbnail lama:`,
              ex
            )
          }
        }
      }

      // Success
      setIsSubmitting(false)
      onSuccess(data)
    } catch (err) {
      // Orphan file cleanup on unexpected exceptions
      let cleanupWarning = ''
      if (uploadedFilePath) {
        try {
          const { error: cleanupError } = await supabase.storage
            .from('portfolio-assets')
            .remove([uploadedFilePath])

          if (cleanupError) {
            console.warn(
              `[Storage Cleanup Warning] Gagal membersihkan file orphan '${uploadedFilePath}':`,
              cleanupError.message
            )
            cleanupWarning = ` (Peringatan: File thumbnail '${uploadedFilePath}' tidak dapat dibersihkan otomatis: ${cleanupError.message})`
          }
        } catch (cleanupEx) {
          console.warn(
            `[Storage Cleanup Exception] Gagal saat menghapus file orphan '${uploadedFilePath}':`,
            cleanupEx
          )
          cleanupWarning = ` (Peringatan: Terjadi error saat membersihkan file thumbnail '${uploadedFilePath}')`
        }
      }

      setGeneralError(
        `${
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan sistem yang tidak terduga saat menyimpan data.'
        }${cleanupWarning}`
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-project-form-card">
      <div className="project-form-header">
        <div>
          <h3 className="project-form-title">
            {isEditMode ? 'Edit Project' : 'Tambah Project Baru'}
          </h3>
          <p className="project-form-subtitle">
            {isEditMode
              ? 'Perbarui informasi portofolio untuk disimpan ke tabel public.projects.'
              : 'Masukkan informasi detail portofolio untuk disimpan ke tabel public.projects.'}
          </p>
        </div>
      </div>

      {generalError && (
        <div className="project-form-alert project-form-alert-error" role="alert">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="project-form-grid">
          {/* Title */}
          <div className="form-group-full">
            <label htmlFor="project-title" className="form-label">
              Judul Project <span className="required-indicator">*</span>
            </label>
            <input
              id="project-title"
              type="text"
              className={`form-control-input ${fieldErrors.title ? 'has-error' : ''}`}
              placeholder="Contoh: Warehouse Management System"
              value={title}
              onChange={handleTitleChange}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.title && <p className="form-field-error">{fieldErrors.title}</p>}
          </div>

          {/* Slug */}
          <div className="form-group-full">
            <label htmlFor="project-slug" className="form-label">
              Slug URL <span className="required-indicator">*</span>
            </label>
            <input
              id="project-slug"
              type="text"
              className={`form-control-input ${fieldErrors.slug ? 'has-error' : ''}`}
              placeholder="warehouse-management-system"
              value={slug}
              onChange={handleSlugChange}
              disabled={isSubmitting}
              required
            />
            <div className="slug-preview-box">
              <span>Preview URL: /projects/</span>
              <strong>{slug || 'slug-url'}</strong>
            </div>
            {fieldErrors.slug ? (
              <p className="form-field-error">{fieldErrors.slug}</p>
            ) : (
              <p className="form-field-helper">
                {isEditMode
                  ? 'Slug digunakan sebagai identifier unik project pada URL.'
                  : 'Otomatis dibuat dari judul. Hanya huruf kecil, angka, dan tanda hubung (-).'}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="form-group-full">
            <label htmlFor="project-desc" className="form-label">
              Deskripsi Singkat <span className="required-indicator">*</span>
            </label>
            <textarea
              id="project-desc"
              rows="3"
              className={`form-control-textarea ${fieldErrors.description ? 'has-error' : ''}`}
              placeholder="Ringkasan singkat mengenai tujuan, masalah yang diselesaikan, atau fitur utama proyek..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (fieldErrors.description) {
                  setFieldErrors((prev) => ({ ...prev, description: null }))
                }
              }}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.description && (
              <p className="form-field-error">{fieldErrors.description}</p>
            )}
          </div>

          {/* Tech Stack */}
          <div className="form-group-full">
            <label htmlFor="project-tech" className="form-label">
              Tech Stack (Pisahkan dengan koma)
            </label>
            <input
              id="project-tech"
              type="text"
              className="form-control-input"
              placeholder="Contoh: React, JavaScript, Supabase, PostgreSQL, CSS3"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="form-field-helper">
              Masukkan nama teknologi yang dipisahkan tanda koma. Akan disimpan sebagai array string (TEXT[]).
            </p>
          </div>

          {/* Demo URL */}
          <div>
            <label htmlFor="project-demo" className="form-label">
              Demo URL (Opsional)
            </label>
            <input
              id="project-demo"
              type="url"
              className={`form-control-input ${fieldErrors.demoUrl ? 'has-error' : ''}`}
              placeholder="https://demo-aplikasi.com"
              value={demoUrl}
              onChange={(e) => {
                setDemoUrl(e.target.value)
                if (fieldErrors.demoUrl) {
                  setFieldErrors((prev) => ({ ...prev, demoUrl: null }))
                }
              }}
              disabled={isSubmitting}
            />
            {fieldErrors.demoUrl && <p className="form-field-error">{fieldErrors.demoUrl}</p>}
          </div>

          {/* GitHub URL */}
          <div>
            <label htmlFor="project-github" className="form-label">
              GitHub Repository URL (Opsional)
            </label>
            <input
              id="project-github"
              type="url"
              className={`form-control-input ${fieldErrors.githubUrl ? 'has-error' : ''}`}
              placeholder="https://github.com/username/project-repo"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value)
                if (fieldErrors.githubUrl) {
                  setFieldErrors((prev) => ({ ...prev, githubUrl: null }))
                }
              }}
              disabled={isSubmitting}
            />
            {fieldErrors.githubUrl && <p className="form-field-error">{fieldErrors.githubUrl}</p>}
          </div>

          {/* Upload Thumbnail Image */}
          <div className="form-group-full">
            <label htmlFor="project-thumb-upload" className="form-label">
              Upload Thumbnail Image (Opsional)
            </label>
            <input
              ref={fileInputRef}
              id="project-thumb-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleThumbnailChange}
              disabled={isSubmitting}
            />
            <div className="thumbnail-upload-container">
              {thumbnailPreview ? (
                // Skenario 1: User telah memilih file gambar baru
                <div className="thumbnail-preview-card">
                  <img
                    src={thumbnailPreview}
                    alt="Preview thumbnail baru"
                    className="thumbnail-preview-image"
                  />
                  <div className="thumbnail-preview-meta">
                    <div className="thumbnail-preview-header">
                      <span className="thumbnail-preview-name" title={thumbnailFile?.name}>
                        {thumbnailFile?.name}
                      </span>
                      {isEditMode && (
                        <span className="thumbnail-badge thumbnail-badge-new">
                          Baru (Belum Disimpan)
                        </span>
                      )}
                    </div>
                    <span className="thumbnail-preview-size">
                      {thumbnailFile ? formatFileSize(thumbnailFile.size) : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="thumbnail-remove-btn"
                    onClick={handleRemoveThumbnail}
                    disabled={isSubmitting}
                    title={isEditMode && existingThumbnailUrl ? 'Batal memilih file baru' : 'Hapus pilihan gambar'}
                  >
                    {isEditMode && existingThumbnailUrl ? 'Batal' : 'Hapus'}
                  </button>
                </div>
              ) : isEditMode && existingThumbnailUrl ? (
                // Skenario 2: Mode edit dengan thumbnail lama yang sudah tersimpan
                <div className="thumbnail-preview-card">
                  <img
                    src={existingThumbnailUrl}
                    alt="Thumbnail tersimpan saat ini"
                    className="thumbnail-preview-image"
                  />
                  <div className="thumbnail-preview-meta">
                    <div className="thumbnail-preview-header">
                      <span className="thumbnail-preview-name">Thumbnail Saat Ini</span>
                      <span className="thumbnail-badge thumbnail-badge-saved">Tersimpan</span>
                    </div>
                    <span className="thumbnail-preview-size">
                      Thumbnail lama tetap digunakan kecuali Anda memilih file baru.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm thumbnail-change-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    Ganti Gambar
                  </button>
                </div>
              ) : (
                // Skenario 3: Belum ada file dipilih dan belum ada thumbnail tersimpan
                <div
                  role="button"
                  tabIndex={0}
                  className={`thumbnail-file-dropzone ${fieldErrors.thumbnail ? 'has-error' : ''} ${
                    isSubmitting ? 'disabled' : ''
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                >
                  <span className="thumbnail-dropzone-icon" aria-hidden="true">
                    📷
                  </span>
                  <span className="thumbnail-dropzone-text">
                    Pilih file gambar thumbnail dari perangkat
                  </span>
                  <span className="thumbnail-dropzone-subtext">
                    Format yang didukung: PNG, JPG, WebP, SVG (Maks. 2 MB)
                  </span>
                </div>
              )}
            </div>
            {fieldErrors.thumbnail ? (
              <p className="form-field-error">{fieldErrors.thumbnail}</p>
            ) : (
              <p className="form-field-helper">
                {isEditMode
                  ? 'Jika memilih gambar baru, thumbnail lama akan diganti setelah perubahan disimpan.'
                  : 'File akan otomatis diunggah ke folder projects/ pada Supabase Storage dan public URL-nya disimpan ke database.'}
              </p>
            )}
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="project-sort" className="form-label">
              Urutan Tampilan (Sort Order)
            </label>
            <input
              id="project-sort"
              type="number"
              min="0"
              className={`form-control-input ${fieldErrors.sortOrder ? 'has-error' : ''}`}
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value)
                if (fieldErrors.sortOrder) {
                  setFieldErrors((prev) => ({ ...prev, sortOrder: null }))
                }
              }}
              disabled={isSubmitting}
            />
            {fieldErrors.sortOrder ? (
              <p className="form-field-error">{fieldErrors.sortOrder}</p>
            ) : (
              <p className="form-field-helper">Angka prioritas urutan (0 adalah urutan pertama).</p>
            )}
          </div>

          {/* Content (Detailed description) */}
          <div className="form-group-full">
            <label htmlFor="project-content" className="form-label">
              Konten / Penjelasan Detail (Opsional)
            </label>
            <textarea
              id="project-content"
              rows="5"
              className="form-control-textarea"
              placeholder="Tuliskan latar belakang pengembangan, arsitektur sistem, atau panduan implementasi lebih lanjut jika diperlukan..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Is Featured Checkbox */}
          <div className="form-group-full">
            <label className="checkbox-label-wrapper">
              <input
                type="checkbox"
                className="form-checkbox-custom"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                disabled={isSubmitting}
              />
              <div className="checkbox-text-group">
                <span className="checkbox-title">Jadikan Proyek Unggulan (Featured)</span>
                <span className="checkbox-desc">
                  Proyek featured akan selalu diprioritaskan di baris teratas tampilan.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="project-form-actions">
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
              ? isEditMode
                ? 'Menyimpan Perubahan...'
                : 'Menyimpan...'
              : isEditMode
              ? 'Simpan Perubahan'
              : 'Simpan Project'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
