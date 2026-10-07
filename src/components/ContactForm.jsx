import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './ContactForm.css'

/**
 * Reusable ContactForm component connected to Supabase public.messages
 */
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const name = formData.name.trim()
    const email = formData.email.trim()
    const subject = formData.subject.trim()
    const message = formData.message.trim()

    if (!name || !email || !message) {
      setStatus('error')
      setFeedbackMessage('Mohon lengkapi semua field yang wajib diisi.')
      return
    }

    setStatus('submitting')
    setFeedbackMessage('')

    try {
      const { error } = await supabase.from('messages').insert([
        {
          name,
          email,
          subject: subject || null,
          message,
        },
      ])

      if (error) {
        console.warn('Gagal menyimpan pesan ke Supabase:', error)
        // Check if RLS prevents public anon insert
        if (
          error.code === '42501' ||
          error.message?.toLowerCase().includes('policy') ||
          error.message?.toLowerCase().includes('row-level security')
        ) {
          setStatus('error')
          setFeedbackMessage(
            'Pengiriman pesan formulir saat ini dibatasi oleh kebijakan server (RLS). Silakan kirimkan email langsung ke kontak kami.'
          )
        } else {
          setStatus('error')
          setFeedbackMessage(
            `Gagal mengirim pesan: ${error.message || 'Terjadi gangguan koneksi.'}`
          )
        }
        return
      }

      setStatus('success')
      setFeedbackMessage(
        'Pesan Anda berhasil dikirim! Terima kasih telah menghubungi saya. Saya akan segera merespons melalui email.'
      )
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } catch (err) {
      console.error('Error saat submit contact form:', err)
      setStatus('error')
      setFeedbackMessage('Terjadi kesalahan yang tidak terduga. Silakan coba kembali nanti.')
    }
  }

  return (
    <div className="contact-form-wrapper">
      {status === 'success' && (
        <div className="form-alert form-alert-success" role="status">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>{feedbackMessage}</div>
        </div>
      )}

      {status === 'error' && (
        <div className="form-alert form-alert-error" role="alert">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>{feedbackMessage}</div>
        </div>
      )}

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contact-name" className="form-label">
              Nama Lengkap <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Contoh: Budi Santoso"
              value={formData.name}
              onChange={handleChange}
              disabled={status === 'submitting'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-email" className="form-label">
              Alamat Email <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="budi@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={status === 'submitting'}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contact-subject" className="form-label">
            Subjek Pesan
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            className="form-input"
            placeholder="Judul atau topik pesan..."
            value={formData.subject}
            onChange={handleChange}
            disabled={status === 'submitting'}
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact-message" className="form-label">
            Isi Pesan <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            className="form-textarea"
            rows="5"
            placeholder="Tuliskan pesan, penawaran proyek, atau pertanyaan Anda di sini..."
            value={formData.message}
            onChange={handleChange}
            disabled={status === 'submitting'}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg contact-submit-btn"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? (
            <>
              <span className="spinner-border" aria-hidden="true" />
              <span>Mengirim Pesan...</span>
            </>
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>Kirim Pesan</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default ContactForm
