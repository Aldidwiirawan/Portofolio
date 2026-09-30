import './TimelineItem.css'

/**
 * Reusable TimelineItem component for Experience and Education sections
 * @param {Object} props
 * @param {string} props.title - Position or Degree
 * @param {string} props.subtitle - Company or Institution
 * @param {string} props.period - Time period / dates
 * @param {string} [props.location] - Optional location
 * @param {string} props.description - Description or highlights
 */
function TimelineItem({ title, subtitle, period, location, description }) {
  return (
    <div className="timeline-item">
      <div className="timeline-dot" aria-hidden="true" />
      <div className="timeline-content-card">
        <div className="timeline-header">
          <div>
            <h3 className="timeline-title">{title}</h3>
            <p className="timeline-subtitle">{subtitle}</p>
          </div>
          <div className="timeline-meta">
            <span className="timeline-period">{period}</span>
            {location && <span className="timeline-location">&bull; {location}</span>}
          </div>
        </div>
        <p className="timeline-desc">{description}</p>
      </div>
    </div>
  )
}

export default TimelineItem
