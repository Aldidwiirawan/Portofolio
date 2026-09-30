import './SectionTitle.css'

/**
 * Reusable SectionTitle component for portfolio sections
 * @param {Object} props
 * @param {string} [props.tag] - Optional small badge tag above title
 * @param {string} props.title - Primary heading text
 * @param {string} [props.description] - Optional subtext or description
 * @param {'center' | 'left'} [props.align='center'] - Alignment mode
 */
function SectionTitle({ tag, title, description, align = 'center' }) {
  return (
    <div className={`section-title-wrapper align-${align}`}>
      {tag && <span className="section-tag">{tag}</span>}
      <h2 className="section-heading">{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  )
}

export default SectionTitle
