/**
 * HeroSection Component
 * @param {Object} props
 * @param {Object} props.profile - Profile data matching profiles table schema
 */
function HeroSection({ profile }) {
  return (
    <section id="hero" className="portfolio-section hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-pulse" aria-hidden="true" />
            <span>{profile.status}</span>
          </div>

          <h1 className="hero-title">
            Halo, saya <span className="hero-title-highlight">{profile.full_name}</span>
            <br />
            {profile.title}
          </h1>

          <p className="hero-description">{profile.bio}</p>

          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary btn-lg">
              Lihat Proyek
            </a>
            <a href="#contact" className="btn btn-outline btn-lg">
              Hubungi Saya
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
