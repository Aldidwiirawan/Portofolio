import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import SkillsSection from '../components/SkillsSection'
import ProjectsSection from '../components/ProjectsSection'
import ExperienceSection from '../components/ExperienceSection'
import EducationSection from '../components/EducationSection'
import CertificationsSection from '../components/CertificationsSection'
import OrganizationsSection from '../components/OrganizationsSection'
import ContactSection from '../components/ContactSection'

import { useProfile } from '../hooks/useProfile'
import { useProjects } from '../hooks/useProjects'
import { useSkills } from '../hooks/useSkills'
import { useExperiences } from '../hooks/useExperiences'
import { useEducations } from '../hooks/useEducations'
import { useCertifications } from '../hooks/useCertifications'
import { useAchievements } from '../hooks/useAchievements'
import { useLanguages } from '../hooks/useLanguages'
import { useOrganizations } from '../hooks/useOrganizations'
import {
  profileData,
  skillsData,
  projectsData,
  experiencesData,
  educationsData,
  certificationsData,
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
  const { certifications: dbCertifications } = useCertifications()
  const { achievements: dbAchievements } = useAchievements()
  const { languages: dbLanguages } = useLanguages()
  const { organizations: dbOrganizations } = useOrganizations()

  const profile = dbProfile
    ? {
        ...profileData,
        ...dbProfile,
        title: dbProfile.tagline || profileData.title,
        bio: dbProfile.bio || profileData.bio,
        location: dbProfile.location || profileData.location,
        full_address: dbProfile.full_address || profileData.address,
        phone_number: dbProfile.phone_number || profileData.phone,
        resume_link: dbProfile.resume_link || dbProfile.resume_url,
        resume_url: dbProfile.resume_url || dbProfile.resume_link,
        hobbies:
          Array.isArray(dbProfile.hobbies) && dbProfile.hobbies.length > 0
            ? dbProfile.hobbies
            : ['Coding', 'Jaringan Komputer', 'Badminton', 'Membaca Buku'],
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
  const certifications =
    dbCertifications.length > 0
      ? dbCertifications
      : (certificationsData || []).map((c) => ({
          ...c,
          name: c.title,
        }))
  const achievements = dbAchievements
  const languages =
    dbLanguages.length > 0
      ? dbLanguages
      : [
          { id: 'lang-1', language_name: 'Bahasa Indonesia', proficiency_level: 'Penutur Asli' },
          { id: 'lang-2', language_name: 'Bahasa Inggris', proficiency_level: 'Menengah (TOEIC)' },
        ]
  const organizations = dbOrganizations

  return (
    <div className="portfolio-app">
      {/* 1. Sticky Navigation Header */}
      <Navbar />

      {/* 2. Main Content Sections */}
      <main className="portfolio-main">
        {/* Hero Section */}
        <HeroSection profile={profile} />

        {/* About Section */}
        <AboutSection profile={profile} languages={languages} />

        {/* Skills Section */}
        <SkillsSection skills={skills} />

        {/* Projects Section */}
        <ProjectsSection projects={projects} />

        {/* Experience Section */}
        <ExperienceSection experiences={experiences} />

        {/* Education Section */}
        <EducationSection educations={educations} />

        {/* Certifications & Achievements Section */}
        <CertificationsSection
          certifications={certifications}
          achievements={achievements}
        />

        {/* Organizations & Community Section */}
        <OrganizationsSection organizations={organizations} />

        {/* Contact Section */}
        <ContactSection profile={profile} />
      </main>

      {/* 3. Footer with subtle admin discovery link */}
      <Footer profile={profile} />
    </div>
  )
}

export default PublicPortfolioPage
