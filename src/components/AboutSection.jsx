import SectionTitle from './SectionTitle'
import './AboutSection.css'

/**
 * AboutSection Component
 * @param {Object} props
 * @param {Object} props.profile - Profile data object
 * @param {Array} [props.languages] - Array of language objects
 */
function AboutSection({ profile, languages = [] }) {
  const resumeUrl = profile.resume_link || profile.resume_url

  return (
    <section id="about" className="portfolio-section portfolio-section-alt">
      <div className="container">
        <SectionTitle
          tag="Tentang Saya"
          title="Mengenal Lebih Dekat"
          description="Latar belakang pendidikan, keahlian, dan informasi profil profesional lengkap."
          align="center"
        />

        <div className="about-content-grid">
          <div className="about-text-column">
            <p className="about-bio-lead">{profile.bio}</p>
            <p className="about-bio-text">
              Sebagai lulusan program D3 Manajemen Informatika, saya mempelajari integrasi antara
              logika bisnis, pemodelan data relasional, dan implementasi aplikasi berbasis web.
              Saya antusias mempelajari arsitektur teknologi web modern, menjaga standar kode yang
              bersih, serta membangun antarmuka yang intuitif.
            </p>

            {resumeUrl && (
              <div className="about-resume-box">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm about-resume-btn"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Lihat / Unduh Dokumen CV (PDF)</span>
                </a>
              </div>
            )}

            {/* Hobbies / Interests */}
            {Array.isArray(profile.hobbies) && profile.hobbies.length > 0 && (
              <div className="about-hobbies-section">
                <h4 className="about-sub-label">Minat & Hobi:</h4>
                <div className="about-pills-list">
                  {profile.hobbies.map((hobby, idx) => (
                    <span key={idx} className="about-hobby-pill">
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div className="about-languages-section">
                <h4 className="about-sub-label">Kemampuan Bahasa:</h4>
                <div className="about-pills-list">
                  {languages.map((lang) => (
                    <span key={lang.id} className="about-lang-pill">
                      <strong>{lang.language_name}</strong> &bull; {lang.proficiency_level}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="about-cards-grid">
            <div className="about-info-card">
              <h3 className="about-card-title">Pendidikan</h3>
              <p className="about-card-desc">
                D3 Manajemen Informatika dengan fokus komputasi terapan dan sistem informasi.
              </p>
            </div>

            <div className="about-info-card">
              <h3 className="about-card-title">Fokus Bidang</h3>
              <p className="about-card-desc">
                Pengembangan web modern, integrasi API, dan pengelolaan basis data.
              </p>
            </div>

            <div className="about-info-card">
              <h3 className="about-card-title">Lokasi & Alamat</h3>
              <p className="about-card-desc">
                {profile.full_address || profile.location || 'Kediri, Jawa Timur, Indonesia'}
              </p>
            </div>

            <div className="about-info-card">
              <h3 className="about-card-title">Kontak Langsung</h3>
              <p className="about-card-desc">
                {profile.phone_number && <span>{profile.phone_number} &bull; </span>}
                <span>{profile.email || profile.social_links?.email || 'aldidwiirawan2004@gmail.com'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
