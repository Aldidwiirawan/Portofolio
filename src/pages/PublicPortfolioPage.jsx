import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import SkillsSection from '../components/SkillsSection'
import ProjectsSection from '../components/ProjectsSection'
import ExperienceSection from '../components/ExperienceSection'
import EducationSection from '../components/EducationSection'
import ContactSection from '../components/ContactSection'

import { useProfile } from '../hooks/useProfile'
import { useProjects } from '../hooks/useProjects'
import { useSkills } from '../hooks/useSkills'
import { useExperiences } from '../hooks/useExperiences'
import { useEducations } from '../hooks/useEducations'
import {
  profileData,
  skillsData,
  projectsData,
  experiencesData,
  educationsData,
} from '../data/portfolioData'

/**
 * PublicPortfolioPage Component
 * Renders the public-facing single-page portfolio
 */
function PublicPortfolioPage() {
  const { profile: dbProfile } = useProfile()
  const { projects: dbProjects } = useProjects()
  const { skills: dbSkills } = useSkills()
  const { experiences: dbExperiences } = useExperiences()
  const { educations: dbEducations } = useEducations()

  const profile = dbProfile
    ? {
        ...profileData,
        ...dbProfile,
        title: dbProfile.tagline || profileData.title,
        bio: dbProfile.bio || profileData.bio,
        location: dbProfile.location || profileData.location,
        status: dbProfile.is_available
          ? 'Terbuka untuk Peluang Kerja & Kolaborasi Proyek'
          : 'Sedang Tidak Tersedia untuk Proyek Baru',
        social_links: {
          email: dbProfile.email || profileData.social_links.email,
          github: dbProfile.github_url || profileData.social_links.github,
          linkedin: dbProfile.linkedin_url || profileData.social_links.linkedin,
          instagram: dbProfile.instagram_url || profileData.social_links.instagram,
        },
      }
    : profileData

  const projects = dbProjects.length > 0 ? dbProjects : projectsData
  const skills = dbSkills.length > 0 ? dbSkills : skillsData
  const experiences = dbExperiences.length > 0 ? dbExperiences : experiencesData
  const educations = dbEducations.length > 0 ? dbEducations : educationsData

  return (
    <div className="portfolio-app">
      {/* 1. Sticky Navigation Header */}
      <Navbar />

      {/* 2. Main Content Sections */}
      <main className="portfolio-main">
        {/* Hero Section */}
        <HeroSection profile={profile} />

        {/* About Section */}
        <AboutSection profile={profile} />

        {/* Skills Section */}
        <SkillsSection skills={skills} />

        {/* Projects Section */}
        <ProjectsSection projects={projects} />

        {/* Experience Section */}
        <ExperienceSection experiences={experiences} />

        {/* Education Section */}
        <EducationSection educations={educations} />

        {/* Contact Section */}
        <ContactSection profile={profile} />
      </main>

      {/* 3. Footer with subtle admin discovery link */}
      <Footer profile={profile} />
    </div>
  )
}

export default PublicPortfolioPage
