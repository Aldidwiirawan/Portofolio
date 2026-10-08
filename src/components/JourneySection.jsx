import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
import TimelineItem from './TimelineItem'
import './TimelineContainer.css'
import './CertificationsSection.css'
import './JourneySection.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  if (/^\d{4}$/.test(dateStr)) return dateStr
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

/**
 * JourneySection Component
 * Consolidates Experience, Education, Certifications, and Organizations
 * into a single unified interactive segmented tab interface.
 *
 * @param {Object} props
 * @param {Array} props.experiences
 * @param {Array} props.educations
 * @param {Array} props.certifications
 * @param {Array} [props.achievements]
 * @param {Array} [props.organizations]
 */
function JourneySection({
  experiences = [],
  educations = [],
  certifications = [],
  achievements = [],
  organizations = [],
}) {
  const [activeTab, setActiveTab] = useState('experience')

  // Listen to hash changes (e.g. #experience, #education, #certifications, #organizations)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (['experience', 'education', 'certifications', 'organizations'].includes(hash)) {
        setActiveTab(hash)
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const sortedExperiences = [...experiences].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  )

  const sortedEducations = [...educations].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  )

  const tabs = [
    {
      id: 'experience',
      label: 'Pengalaman',
      icon: '💼',
      count: sortedExperiences.length,
    },
    {
      id: 'education',
      label: 'Pendidikan',
      icon: '🎓',
      count: sortedEducations.length,
    },
    {
      id: 'certifications',
      label: 'Sertifikasi & Prestasi',
      icon: '📜',
      count: certifications.length + achievements.length,
    },
    {
      id: 'organizations',
      label: 'Organisasi',
      icon: '👥',
      count: organizations.length,
    },
  ]

  return (
    <section id="journey" className="portfolio-section journey-section" aria-label="Perjalanan Karier">
      {/* Anchor targets so legacy links don't break */}
      <div id="experience" style={{ position: 'absolute', top: '-80px' }} />
      <div id="education" style={{ position: 'absolute', top: '-80px' }} />
      <div id="certifications" style={{ position: 'absolute', top: '-80px' }} />
      <div id="organizations" style={{ position: 'absolute', top: '-80px' }} />

      <div className="container">
        <SectionTitle
          tag="Rekam Jejak"
          title="Perjalanan & Kredensial Profesional"
          description="Kombinasi pengalaman industri, pendidikan formal di bidang IT, sertifikasi jaringan & pemrograman, serta kontribusi organisasi."
          align="center"
        />

        {/* Segmented Tab Controls */}
        <div className="journey-tabs-wrapper">
          <div className="journey-tabs-list" role="tablist" aria-label="Kategori Rekam Jejak">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  className={`journey-tab-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count > 0 && <span className="journey-tab-badge">{tab.count}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="journey-tab-panel" id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {/* TAB 1: PENGALAMAN */}
          {activeTab === 'experience' && (
            <div className="timeline-container">
              {sortedExperiences.length === 0 ? (
                <div className="journey-empty-state">Belum ada data pengalaman kerja.</div>
              ) : (
                <div className="timeline-list">
                  {sortedExperiences.map((exp) => {
                    const startFormatted = formatDate(exp.start_date)
                    const endFormatted = formatDate(exp.end_date)
                    const period = exp.is_current
                      ? `${startFormatted} — Sekarang`
                      : `${startFormatted} — ${endFormatted || 'Selesai'}`

                    return (
                      <TimelineItem
                        key={exp.id}
                        title={exp.role || exp.position}
                        subtitle={exp.company}
                        period={period}
                        location={exp.location}
                        description={exp.description}
                        tag={exp.experience_type}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDIDIKAN */}
          {activeTab === 'education' && (
            <div className="timeline-container">
              {sortedEducations.length === 0 ? (
                <div className="journey-empty-state">Belum ada data riwayat pendidikan.</div>
              ) : (
                <div className="timeline-list">
                  {sortedEducations.map((edu) => {
                    const startDisplay = edu.start_year || edu.start_date
                    const endDisplay = edu.end_year || edu.end_date
                    const period = edu.is_current
                      ? `${startDisplay} — Sekarang`
                      : endDisplay
                      ? `${startDisplay} — ${endDisplay}`
                      : `${startDisplay}`

                    return (
                      <TimelineItem
                        key={edu.id}
                        title={`${edu.degree} — ${edu.field_of_study}`}
                        subtitle={edu.institution}
                        period={period}
                        description={edu.description}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SERTIFIKASI & PRESTASI */}
          {activeTab === 'certifications' && (
            <div className="credentials-layout-grid">
              {/* Certifications Sub-Column */}
              <div className="credentials-column">
                <div className="credentials-column-header">
                  <span className="credentials-header-dot" aria-hidden="true" />
                  <h3 className="credentials-column-title">Sertifikasi & Pelatihan Resmi</h3>
                </div>

                {certifications.length === 0 ? (
                  <div className="journey-empty-state">Belum ada data sertifikasi.</div>
                ) : (
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
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </a>
                          )}
                        </div>

                        {cert.description && (
                          <p className="credential-desc">{cert.description}</p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements Sub-Column */}
              <div className="credentials-column">
                <div className="credentials-column-header">
                  <span className="credentials-header-dot dot-accent" aria-hidden="true" />
                  <h3 className="credentials-column-title">Penghargaan & Prestasi</h3>
                </div>

                {achievements.length === 0 ? (
                  <div className="journey-empty-state">Belum ada data prestasi.</div>
                ) : (
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
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ORGANISASI */}
          {activeTab === 'organizations' && (
            <div className="timeline-container">
              {organizations.length === 0 ? (
                <div className="journey-empty-state">Belum ada data kegiatan organisasi.</div>
              ) : (
                <div className="timeline-list">
                  {organizations.map((org) => {
                    const startText = formatDate(org.start_date)
                    const endText = org.end_date ? formatDate(org.end_date) : 'Sekarang'
                    const period = startText ? `${startText} — ${endText}` : ''

                    return (
                      <TimelineItem
                        key={org.id}
                        title={org.role}
                        subtitle={org.name}
                        period={period}
                        description={org.description}
                        tag="Organisasi"
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default JourneySection
