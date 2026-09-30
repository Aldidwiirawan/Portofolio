import { useState } from 'react'
import './ContactForm.css'

/**
 * Reusable ContactForm component (Static / Development Mode)
 */
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [demoNotice, setDemoNotice] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Local demo simulation (No Supabase mutation yet)
    setDemoNotice(
      `Terima kasih, ${formData.name || 'Pengunjung'}! Formulir ini saat ini dalam mode demo (Tahap 2). Pengiriman pesan ke database Supabase akan dihubungkan pada tahap selanjutnya.`
    )
  }

  return (
    <div className="contact-form-wrapper">
      <div className="contact-dev-badge">
        <span>&bull;</span>
        <span>Mode Pengembangan (Tahap 2 — Statis)</span>
      </div>

      {demoNotice && (
        <div className="form-alert form-alert-info" role="status">
          {demoNotice}
        </div>
      )}

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contact-name" className="form-label">
              Nama Lengkap
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Contoh: Budi Santoso"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-email" className="form-label">
              Alamat Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="budi@example.com"
              value={formData.email}
              onChange={handleChange}
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
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact-message" className="form-label">
            Isi Pesan
          </label>
          <textarea
            id="contact-message"
            name="message"
            className="form-textarea"
            rows="5"
            placeholder="Tuliskan pesan, penawaran proyek, atau pertanyaan Anda di sini..."
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg contact-submit-btn">
          Kirim Pesan (Simulasi)
        </button>
      </form>
    </div>
  )
}

export default ContactForm
