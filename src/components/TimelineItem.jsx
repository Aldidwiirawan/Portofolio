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
function TimelineItem({ title, subtitle, period, location, description, tag }) {
  return (
    <div className="timeline-item">
      <div className="timeline-dot" aria-hidden="true" />
      <div className="timeline-content-card">
        <div className="timeline-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <h3 className="timeline-title">{title}</h3>
              {tag && <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>{tag}</span>}
            </div>
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
