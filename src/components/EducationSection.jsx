import SectionTitle from './SectionTitle'
import TimelineItem from './TimelineItem'
import './TimelineContainer.css'

/**
 * EducationSection Component
 * @param {Object} props
 * @param {Array} props.educations - Array of education objects
 */
function EducationSection({ educations = [] }) {
  const sortedEducations = [...educations].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  )

  return (
    <section id="education" className="portfolio-section portfolio-section-alt">
      <div className="container">
        <SectionTitle
          tag="Pendidikan"
          title="Latar Belakang Akademis"
          description="Pendidikan formal yang mendasari pemahaman logika algoritma, basis data, dan rekayasa perangkat lunak."
          align="center"
        />

        <div className="timeline-container">
          <div className="timeline-list">
            {sortedEducations.map((edu) => {
              const period = edu.end_date
                ? `${edu.start_date} — ${edu.end_date}`
                : `${edu.start_date} — Sekarang`

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
        </div>
      </div>
    </section>
  )
}

export default EducationSection
