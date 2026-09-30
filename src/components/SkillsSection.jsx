import SectionTitle from './SectionTitle'
import SkillCard from './SkillCard'
import './SkillsSection.css'

/**
 * SkillsSection Component
 * Groups skills by category: Frontend, Backend, Database, Tools
 * @param {Object} props
 * @param {Array} props.skills - Array of skill objects
 */
function SkillsSection({ skills = [] }) {
  const categories = ['Frontend', 'Backend', 'Database', 'Tools']

  return (
    <section id="skills" className="portfolio-section">
      <div className="container">
        <SectionTitle
          tag="Keahlian"
          title="Teknologi & Keterampilan"
          description="Keterampilan teknis dan perangkat kerja yang dipelajari serta diterapkan dalam pengembangan sistem."
          align="center"
        />

        <div className="skills-categories-grid">
          {categories.map((category) => {
            const categorySkills = skills.filter(
              (item) => item.category.toLowerCase() === category.toLowerCase()
            )

            if (categorySkills.length === 0) return null

            return (
              <div key={category} className="skill-category-group">
                <h3 className="skill-category-title">
                  <span className="skill-category-title-dot" aria-hidden="true" />
                  <span>{category}</span>
                </h3>

                <div className="skills-items-grid">
                  {categorySkills.map((skill) => (
                    <SkillCard key={skill.id || skill.name} skill={skill} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default SkillsSection
