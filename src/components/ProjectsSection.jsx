import SectionTitle from './SectionTitle'
import ProjectCard from './ProjectCard'
import './ProjectsSection.css'

/**
 * ProjectsSection Component
 * @param {Object} props
 * @param {Array} props.projects - Array of project objects matching schema
 */
function ProjectsSection({ projects = [] }) {
  // Sort by sort_order if provided
  const sortedProjects = [...projects].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  return (
    <section id="projects" className="portfolio-section portfolio-section-alt">
      <div className="container">
        <SectionTitle
          tag="Portofolio"
          title="Proyek Pilihan"
          description="Eksplorasi karya dan proyek aplikasi web yang dirancang dengan perhatian pada fungsionalitas dan arsitektur."
          align="center"
        />

        <div className="projects-grid">
          {sortedProjects.map((project) => (
            <ProjectCard key={project.id || project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProjectsSection
