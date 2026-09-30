import './SkillCard.css'

/**
 * Reusable SkillCard component
 * @param {Object} props
 * @param {Object} props.skill - Skill data object
 * @param {string} props.skill.name - Skill name
 * @param {string} props.skill.category - Skill category
 * @param {string} [props.skill.proficiency] - Skill proficiency level
 */
function SkillCard({ skill }) {
  return (
    <div className="skill-card">
      <div className="skill-card-header">
        <h4 className="skill-name">{skill.name}</h4>
        {skill.proficiency && (
          <span className="skill-level-badge">{skill.proficiency}</span>
        )}
      </div>
      <p className="skill-category-label">{skill.category}</p>
    </div>
  )
}

export default SkillCard
