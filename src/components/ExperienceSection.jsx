import SectionTitle from './SectionTitle'
import TimelineItem from './TimelineItem'
import './TimelineContainer.css'

function formatPeriodDate(dateStr) {
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
          <div className="timeline-list">
            {sortedExperiences.map((exp) => {
              const startFormatted = formatPeriodDate(exp.start_date)
              const endFormatted = formatPeriodDate(exp.end_date)

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
