import TechBadge from './TechBadge'
import './ProjectCard.css'

/**
 * Reusable ProjectCard component
 * @param {Object} props
 * @param {Object} props.project - Project object matching the database schema
 * @param {string} props.project.title
 * @param {string} props.project.slug
 * @param {string} props.project.description
 * @param {string|null} [props.project.thumbnail_url]
 * @param {string} [props.project.demo_url]
 * @param {string} [props.project.github_url]
 * @param {string[]} [props.project.tech_stack]
 * @param {boolean} [props.project.is_featured]
 */
function ProjectCard({ project }) {
  const {
    title,
    description,
    thumbnail_url,
    demo_url,
    github_url,
    tech_stack = [],
    is_featured,
  } = project

  return (
    <article className="project-card">
      <div className="project-card-media">
        {thumbnail_url ? (
          <img src={thumbnail_url} alt={title} className="project-thumbnail-img" />
        ) : (
          <div className="project-media-placeholder" aria-hidden="true">
            <svg
              className="project-placeholder-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="project-placeholder-label">Web Project Preview</span>
          </div>
        )}
        {is_featured && <span className="project-featured-tag">Featured</span>}
      </div>

      <div className="project-card-body">
        <h3 className="project-card-title">{title}</h3>
        <p className="project-card-description">{description}</p>

        {tech_stack && tech_stack.length > 0 && (
          <div className="project-tech-stack" aria-label="Teknologi yang digunakan">
            {tech_stack.map((tech) => (
              <TechBadge key={tech} name={tech} />
            ))}
          </div>
        )}

        <div className="project-card-footer">
          {demo_url && demo_url !== '#' && (
            <a
              href={demo_url}
              className="project-action-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Lihat demo ${title}`}
            >
              <span>Demo</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          )}
          {github_url && (
            <a
              href={github_url}
              className="project-action-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Lihat kode sumber ${title} di GitHub`}
            >
              <span>GitHub</span>
              <span aria-hidden="true">&nearr;</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
