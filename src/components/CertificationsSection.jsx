import SectionTitle from './SectionTitle'
import './CertificationsSection.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

/**
 * CertificationsSection Component
 * Displays certifications, licenses, courses, and achievements
 * @param {Object} props
 * @param {Array} props.certifications
 * @param {Array} [props.achievements]
 */
function CertificationsSection({ certifications = [], achievements = [] }) {
  if (certifications.length === 0 && achievements.length === 0) {
    return null
  }

  return (
    <section id="certifications" className="portfolio-section">
      <div className="container">
        <SectionTitle
          tag="Kredensial"
          title="Sertifikasi & Prestasi"
          description="Sertifikasi kompetensi resmi, lisensi teknis, serta pencapaian prestasi akademik dan profesional."
          align="center"
        />

        <div className="credentials-layout-grid">
          {/* Certifications Group */}
          {certifications.length > 0 && (
            <div className="credentials-column">
              <div className="credentials-column-header">
                <span className="credentials-header-dot" aria-hidden="true" />
                <h3 className="credentials-column-title">Sertifikasi & Pelatihan</h3>
              </div>

              <div className="credentials-list">
                {certifications.map((cert) => (
                  <article key={cert.id} className="credential-card">
                    <div className="credential-card-header">
                      <div>
                        <h4 className="credential-title">{cert.name}</h4>
                        <p className="credential-issuer">
                          <span>{cert.issuer}</span>
                          {cert.issue_date && (
                            <span className="credential-date-dot">
                              &bull; {formatDate(cert.issue_date)}
                            </span>
                          )}
                        </p>
                      </div>

                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="credential-verify-link"
                          title="Buka bukti kredensial sertifikat"
                        >
                          <span>Kredensial</span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Group */}
          {achievements.length > 0 && (
            <div className="credentials-column">
              <div className="credentials-column-header">
                <span className="credentials-header-dot dot-accent" aria-hidden="true" />
                <h3 className="credentials-column-title">Penghargaan & Prestasi</h3>
              </div>

              <div className="credentials-list">
                {achievements.map((item) => (
                  <article key={item.id} className="credential-card">
                    <div className="credential-card-header">
                      <div>
                        <h4 className="credential-title">{item.title}</h4>
                        <p className="credential-issuer">
                          <span>{item.event_name}</span>
                          <span className="credential-date-dot">
                            &bull; Tahun {item.year}
                          </span>
                        </p>
                      </div>

                      <span className="badge badge-accent">🏆 {item.year}</span>
                    </div>

                    {item.description && (
                      <p className="credential-desc">{item.description}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CertificationsSection
