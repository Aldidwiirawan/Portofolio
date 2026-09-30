import SectionTitle from './SectionTitle'
import ContactForm from './ContactForm'
import './ContactSection.css'

/**
 * ContactSection Component
 * @param {Object} props
 * @param {Object} props.profile - Profile data object
 */
function ContactSection({ profile }) {
  return (
    <section id="contact" className="portfolio-section">
      <div className="container">
        <SectionTitle
          tag="Kontak"
          title="Mari Berdiskusi"
          description="Terbuka untuk peluang kerja, proyek kolaboratif, atau sekadar bertukar ide mengenai pengembangan web."
          align="center"
        />

        <div className="contact-layout-grid">
          <div className="contact-info-panel">
            <h3 className="contact-info-title">Informasi & Ketersediaan</h3>
            <p className="contact-info-text">
              Jika Anda memiliki pertanyaan seputar proyek, penawaran kerja, atau ingin berdiskusi
              lebih lanjut mengenai teknologi web yang saya kembangkan, silakan hubungi melalui
              formulir atau saluran berikut.
            </p>

            <ul className="contact-details-list">
              <li className="contact-detail-item">
                <svg
                  className="contact-detail-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <div>
                  <span className="contact-detail-label">Email Kontak</span>
                  <span className="contact-detail-value">
                    {profile.social_links?.email || 'contact@example.com'}
                  </span>
                </div>
              </li>

              <li className="contact-detail-item">
                <svg
                  className="contact-detail-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <span className="contact-detail-label">Domisili</span>
                  <span className="contact-detail-value">{profile.location || 'Indonesia'}</span>
                </div>
              </li>

              <li className="contact-detail-item">
                <svg
                  className="contact-detail-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <span className="contact-detail-label">Status</span>
                  <span className="contact-detail-value">{profile.status}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="contact-form-column">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
