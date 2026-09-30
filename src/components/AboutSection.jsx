import SectionTitle from './SectionTitle'
import './AboutSection.css'

/**
 * AboutSection Component
 * @param {Object} props
 * @param {Object} props.profile - Profile data object
 */
function AboutSection({ profile }) {
  return (
    <section id="about" className="portfolio-section portfolio-section-alt">
      <div className="container">
        <SectionTitle
          tag="Tentang Saya"
          title="Mengenal Lebih Dekat"
          description="Latar belakang pendidikan dan minat fokus dalam rekayasa perangkat lunak web."
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
              <h3 className="about-card-title">Lokasi</h3>
              <p className="about-card-desc">{profile.location || 'Indonesia'}</p>
            </div>

            <div className="about-info-card">
              <h3 className="about-card-title">Kesiapan Kerja</h3>
              <p className="about-card-desc">
                Siap berkontribusi secara profesional untuk proyek mandiri maupun tim.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
