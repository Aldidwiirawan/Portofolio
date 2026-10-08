import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import ProjectsSection from '../components/ProjectsSection'
import AboutSection from '../components/AboutSection'
import SkillsSection from '../components/SkillsSection'
import JourneySection from '../components/JourneySection'
import ContactSection from '../components/ContactSection'
import GuestbookDrawer from '../components/GuestbookDrawer'
import CustomCursor from '../components/CustomCursor'

import { useProfile } from '../hooks/useProfile'
import { useProjects } from '../hooks/useProjects'
import { useSkills } from '../hooks/useSkills'
import { useExperiences } from '../hooks/useExperiences'
import { useEducations } from '../hooks/useEducations'
import { useCertifications } from '../hooks/useCertifications'
import { useAchievements } from '../hooks/useAchievements'
import { useLanguages } from '../hooks/useLanguages'
import { useOrganizations } from '../hooks/useOrganizations'
import { useGuestbook } from '../hooks/useGuestbook'
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
 * Renders the public-facing single-page portfolio with Luxury Tech layout
 */
function PublicPortfolioPage() {
  const [isGuestbookOpen, setIsGuestbookOpen] = useState(false)

  const { profile: dbProfile } = useProfile()
  const { projects: dbProjects } = useProjects()
  const { skills: dbSkills } = useSkills()
  const { experiences: dbExperiences } = useExperiences()
  const { educations: dbEducations } = useEducations()
  const { certifications: dbCertifications } = useCertifications()
  const { achievements: dbAchievements } = useAchievements()
  const { languages: dbLanguages } = useLanguages()
  const { organizations: dbOrganizations } = useOrganizations()
  const { entries: guestbookEntries, totalCount: guestbookCount, addEntry: addGuestbookEntry } = useGuestbook()

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
      {/* 0. Custom Animated Tech Cursor (Desktop Only) */}
      <CustomCursor />

      {/* 1. Modern Header */}
      <Navbar
        onOpenGuestbook={() => setIsGuestbookOpen(true)}
        guestbookCount={guestbookCount}
      />

      {/* 2. Main Content Streamlined Hierarchy */}
      <main className="portfolio-main">
        {/* Hero Section — Blueprint grid, giant statement, 3D card */}
        <HeroSection profile={profile} />

        {/* Projects Section — Elevated for recruiters */}
        <ProjectsSection projects={projects} />

        {/* About Section — Biography, Languages & Hobbies */}
        <AboutSection profile={profile} languages={languages} />

        {/* Skills Section — Frontend, Backend, Tools */}
        <SkillsSection skills={skills} />

        {/* Journey Section — Unified interactive tabs */}
        <JourneySection
          experiences={experiences}
          educations={educations}
          certifications={certifications}
          achievements={achievements}
          organizations={organizations}
        />

        {/* Contact Section — Direct contact form */}
        <ContactSection profile={profile} />
      </main>

      {/* 3. Footer */}
      <Footer profile={profile} />

      {/* 4. Slide-over Drawer Guestbook */}
      <GuestbookDrawer
        isOpen={isGuestbookOpen}
        onClose={() => setIsGuestbookOpen(false)}
        entries={guestbookEntries}
        onAddEntry={addGuestbookEntry}
        totalCount={guestbookCount}
      />

      {/* 5. Floating Bottom-Right Guestbook Trigger Pill (Styfen Style) */}
      {!isGuestbookOpen && (
        <button
          type="button"
          className="guestbook-floating-trigger"
          onClick={() => setIsGuestbookOpen(true)}
          title="Buka Buku Tamu (Guestbook)"
          aria-label="Buka Buku Tamu"
        >
          <span>💬 Guestbook</span>
          <span className="guestbook-floating-badge">{guestbookCount}</span>
        </button>
      )}
    </div>
  )
}

export default PublicPortfolioPage
