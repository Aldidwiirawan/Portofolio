import SectionTitle from './SectionTitle'
import TimelineItem from './TimelineItem'
import './TimelineContainer.css'

/**
 * ExperienceSection Component
 * @param {Object} props
 * @param {Array} props.experiences - Array of experience objects
 */
function ExperienceSection({ experiences = [] }) {
  const sortedExperiences = [...experiences].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  )

  return (
    <section id="experience" className="portfolio-section">
      <div className="container">
        <SectionTitle
          tag="Pengalaman"
          title="Perjalanan & Aktivitas"
          description="Aktivitas pengembangan perangkat lunak, eksplorasi proyek praktikum, dan implementasi teknologi."
          align="center"
        />

        <div className="timeline-container">
          <div className="timeline-notice-box">
            <strong>Catatan Pengembangan:</strong> Bagian ini menampilkan data aktivitas dan
            pengalaman belajar mandiri/akademis secara statis dan siap dipetakan ke tabel{' '}
            <code>experiences</code> pada tahap integrasi.
          </div>

          <div className="timeline-list">
            {sortedExperiences.map((exp) => {
              const period = exp.is_current
                ? `${exp.start_date} — Sekarang`
                : `${exp.start_date} — ${exp.end_date || 'Selesai'}`

              return (
                <TimelineItem
                  key={exp.id}
                  title={exp.position}
                  subtitle={exp.company}
                  period={period}
                  location={exp.location}
                  description={exp.description}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceSection
