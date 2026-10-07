import SectionTitle from './SectionTitle'
import TimelineItem from './TimelineItem'
import './TimelineContainer.css'

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
 * OrganizationsSection Component
 * Displays leadership, campus organizations, and community involvement
 * @param {Object} props
 * @param {Array} props.organizations
 */
function OrganizationsSection({ organizations = [] }) {
  if (organizations.length === 0) {
    return null
  }

  return (
    <section id="organizations" className="portfolio-section portfolio-section-alt">
      <div className="container">
        <SectionTitle
          tag="Organisasi"
          title="Pengalaman Organisasi & Komunitas"
          description="Aktivitas kepanitiaan, kepengurusan himpunan, dan kontribusi dalam komunitas teknologi."
          align="center"
        />

        <div className="timeline-container">
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
        </div>
      </div>
    </section>
  )
}

export default OrganizationsSection
