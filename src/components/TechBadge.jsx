import './TechBadge.css'

/**
 * Reusable TechBadge component for tags and tech stacks
 * @param {Object} props
 * @param {string} props.name - Technology or skill name
 * @param {'default' | 'primary' | 'accent'} [props.variant='default'] - Visual style variant
 */
function TechBadge({ name, variant = 'default' }) {
  const variantClass = variant !== 'default' ? `tech-badge-${variant}` : ''

  return <span className={`tech-badge ${variantClass}`.trim()}>{name}</span>
}

export default TechBadge
