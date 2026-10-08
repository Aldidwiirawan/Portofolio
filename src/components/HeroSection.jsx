import { useState, useRef } from 'react'
import './HeroSection.css'

/**
 * HeroSection Component
 * Fusion of Technical Blueprint (Irfan) and Neo-Brutalist Statement (Styfen)
 * @param {Object} props
 * @param {Object} props.profile - Profile data matching profiles schema
 */
function HeroSection({ profile }) {
  const fullName = profile?.full_name || 'Aldi Dwi Irawan'
  const nameParts = fullName.trim().split(' ')
  const primaryName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullName
  const accentName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''

  const resumeUrl = profile?.resume_url || profile?.resume_link || ''
  const social = profile?.social_links || {}

  // 3D Tilt State for Hologram Card
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)
  const heroRef = useRef(null)

  // Mouse move on hero to update spotlight coordinates
  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    heroRef.current.style.setProperty('--mouse-x', `${x}%`)
    heroRef.current.style.setProperty('--mouse-y', `${y}%`)
  }

  // 3D Tilt calculations on holographic card
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotX = -(y / (rect.height / 2)) * 8
    const rotY = (x / (rect.width / 2)) * 8
    setTilt({ x: rotX, y: rotY })
  }

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  // Today's formatted date (e.g. "8 OKT 2026")
  const todayDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()

  const phoneDigits = (profile?.phone_number || profile?.phone || '').replace(/\D/g, '')
  const waUrl = phoneDigits
    ? `https://wa.me/${phoneDigits.startsWith('0') ? '62' + phoneDigits.slice(1) : phoneDigits}`
    : ''

  // Verified metrics
  const metrics = [
    {
      icon: '⚡',
      title: '3+ Solusi Web & IT Rilis',
      sub: 'Dinas Kominfo & CV Adisatya',
    },
    {
      icon: '🎓',
      title: 'D3 Manajemen Informatika',
      sub: 'Polinema • IPK 3.54 (Sangat Memuaskan)',
    },
    {
      icon: '🛡️',
      title: 'MikroTik Certified (MTCNA)',
      sub: 'Jaringan Komputer & IT Support',
    },
  ]

  return (
    <section
      id="hero"
      ref={heroRef}
      className="hero-section"
      onMouseMove={handleHeroMouseMove}
      aria-label="Beranda"
    >
      {/* 1. Ambient Background Spotlight */}
      <div className="hero-ambient-spotlight" aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* 2. Top Floating Tech Badges (Styfen Style) */}
        <div className="hero-capsules-bar" aria-label="Spesialisasi Kunci">
          <div className="hero-capsule-item capsule-accent">⚡ Junior Programmer</div>
          <div className="hero-capsule-item">🛡️ MikroTik MTCNA</div>
          <div className="hero-capsule-item">&lt;/&gt; Web Developer</div>
          <div className="hero-capsule-item">🎓 D3 Polinema (IPK 3.54)</div>
        </div>

        {/* 3. Giant Statement Headline */}
        <div className="hero-giant-headline">
          <h1 className="hero-giant-title">
            <span>{primaryName}</span>
            {accentName && <span className="hero-giant-title-accent">{accentName}</span>}
          </h1>
        </div>

        {/* 4. Split Grid Content */}
        <div className="hero-content-split">
          {/* Left Column: Holographic 3D Interactive Card */}
          <div className="hero-hologram-card-container">
            <div
              ref={cardRef}
              className="hero-hologram-card"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              }}
            >
              {/* Glossy holographic reflection */}
              <div className="hero-card-sheen" aria-hidden="true" />

              {/* Avatar Orbit Shield */}
              <div className="hero-avatar-wrapper">
                <div className="hero-avatar-orbit-ring" aria-hidden="true" />
                <div className="hero-avatar-glow-ring" aria-hidden="true" />
                <div className="hero-avatar-inner">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={fullName}
                      className="hero-avatar-img"
                    />
                  ) : (
                    <span className="hero-avatar-monogram">ADI</span>
                  )}
                </div>
              </div>

              {/* Identity Meta */}
              <div className="hero-card-meta">
                <span className="hero-card-name">{fullName}</span>
                <span className="hero-card-title">{profile?.title || 'Web Developer & IT Specialist'}</span>
              </div>

              {/* Verified Metrics Badges */}
              <div className="hero-metric-items">
                {metrics.map((m, idx) => (
                  <div key={idx} className="hero-metric-item">
                    <span className="hero-metric-icon" aria-hidden="true">{m.icon}</span>
                    <div>
                      <h2 className="hero-metric-title">{m.title}</h2>
                      <p className="hero-metric-sub">{m.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Lead Pitch & Actions */}
          <div className="hero-pitch-col">
            {/* Status Beacon */}
            <div className="hero-status-pill">
              <span className="hero-status-dot" aria-hidden="true" />
              <span>{profile?.status || 'TERBUKA UNTUK PELUANG KERJA & PROYEK'}</span>
            </div>

            {/* Pitch Bio */}
            <p className="hero-bio-lead">
              Membangun <span className="hero-bio-lead-highlight">solusi web full-stack</span>, manajemen basis data, dan konfigurasi jaringan terstandarisasi.
            </p>

            <p className="hero-bio-desc">
              {profile?.bio ||
                'Lulusan D3 Manajemen Informatika Politeknik Negeri Malang (IPK 3,54). Memiliki pengalaman nyata membangun Sistem Informasi Data Produk di Dinas Kominfo Kab. Kediri dan Sistem Monitoring Pengiriman berbasis Barcode di CV. Adisatya IT Consultant.'}
            </p>

            {/* CTAs */}
            <div className="hero-cta-group">
              <a href="#projects" className="hero-btn-primary">
                <span>Lihat Proyek Unggulan</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>

              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-btn-secondary"
                  download
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Unduh CV Resmi</span>
                </a>
              ) : (
                <a href="#contact" className="hero-btn-secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Hubungi Saya</span>
                </a>
              )}
            </div>

            {/* Social Dock */}
            <div className="hero-social-dock" aria-label="Tautan Sosial">
              {social.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-icon-btn"
                  aria-label="Profil GitHub"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
              )}

              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-icon-btn"
                  aria-label="Profil LinkedIn"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              )}

              {social.email && (
                <a
                  href={`mailto:${social.email}`}
                  className="hero-social-icon-btn"
                  aria-label="Kirim Email"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </a>
              )}

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-icon-btn"
                  aria-label="Hubungi WhatsApp"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Status Ticker Bar (Styfen Style) */}
      <div className="hero-bottom-ticker" aria-label="Status Cepat">
        <div className="container" style={{ padding: 0 }}>
          <div className="hero-ticker-grid">
            <div className="hero-ticker-item">
              <span style={{ color: '#10b981' }}>🟢</span>
              <strong style={{ color: '#ffffff' }}>Open to Work</strong>
            </div>

            <div className="hero-ticker-item">
              <span>📍</span>
              <span>Based in Kediri, ID</span>
            </div>

            <div className="hero-ticker-item">
              <span>📅</span>
              <span>Today: {todayDateStr}</span>
            </div>

            <div className="hero-ticker-item">
              <a href="#projects" className="hero-ticker-link">
                <span>⬇ Scroll to Explore</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
