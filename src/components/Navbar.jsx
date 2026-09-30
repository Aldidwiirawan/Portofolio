import { useState } from 'react'
import './Navbar.css'

/**
 * Navbar component with responsive anchor navigation
 */
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const navLinks = [
    { label: 'Tentang', href: '#about' },
    { label: 'Keahlian', href: '#skills' },
    { label: 'Proyek', href: '#projects' },
    { label: 'Pengalaman', href: '#experience' },
    { label: 'Pendidikan', href: '#education' },
  ]

  return (
    <header className="site-header">
      <div className="container navbar-container">
        <a href="#hero" className="brand-link" onClick={closeMenu} aria-label="Beranda Portfolio">
          <span>Aldi Dwi Irawan</span>
          <span className="brand-dot">.</span>
        </a>

        <button
          type="button"
          className={`nav-toggle-btn ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger-line line-top"></span>
          <span className="hamburger-line line-mid"></span>
          <span className="hamburger-line line-bot"></span>
        </button>

        <nav className={`site-nav ${isMenuOpen ? 'open' : ''}`} aria-label="Navigasi Utama">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="nav-link" onClick={closeMenu}>
                  {link.label}
                </a>
              </li>
            ))}
            <li className="nav-cta-item">
              <a href="#contact" className="btn btn-primary btn-sm nav-cta-btn" onClick={closeMenu}>
                Hubungi Saya
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
