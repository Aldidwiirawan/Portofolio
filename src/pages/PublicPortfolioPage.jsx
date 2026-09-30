import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import SkillsSection from '../components/SkillsSection'
import ProjectsSection from '../components/ProjectsSection'
import ExperienceSection from '../components/ExperienceSection'
import EducationSection from '../components/EducationSection'
import ContactSection from '../components/ContactSection'

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
  return (
    <div className="portfolio-app">
      {/* 1. Sticky Navigation Header */}
      <Navbar />

      {/* 2. Main Content Sections */}
      <main className="portfolio-main">
        {/* Hero Section */}
        <HeroSection profile={profileData} />

        {/* About Section */}
        <AboutSection profile={profileData} />

        {/* Skills Section */}
        <SkillsSection skills={skillsData} />

        {/* Projects Section */}
        <ProjectsSection projects={projectsData} />

        {/* Experience Section */}
        <ExperienceSection experiences={experiencesData} />

        {/* Education Section */}
        <EducationSection educations={educationsData} />

        {/* Contact Section */}
        <ContactSection profile={profileData} />
      </main>

      {/* 3. Footer with subtle admin discovery link */}
      <Footer />
    </div>
  )
}

export default PublicPortfolioPage
