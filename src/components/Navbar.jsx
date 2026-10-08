import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

/**
 * Navbar component with streamlined modern navigation,
 * Guestbook trigger button, and temporary quick admin login
 *
 * @param {Object} props
 * @param {Function} [props.onOpenGuestbook]
 * @param {number} [props.guestbookCount]
 */
function Navbar({ onOpenGuestbook, guestbookCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const navLinks = [
    { label: 'Beranda', href: '#hero' },
    { label: 'Proyek', href: '#projects' },
    { label: 'Tentang', href: '#about' },
    { label: 'Keahlian', href: '#skills' },
    { label: 'Rekam Jejak', href: '#journey' },
  ]

  return (
    <header className="site-header">
      <div className="container navbar-container">
        <a href="#hero" className="brand-link" onClick={closeMenu} aria-label="Beranda Portfolio">
          <span className="brand-monogram">AD</span>
          <span className="brand-name">Aldi Dwi Irawan</span>
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

            {/* Tombol Buku Tamu / Guestbook */}
            <li className="nav-guestbook-item">
              <button
                type="button"
                className="btn-guestbook-nav"
                onClick={() => {
                  closeMenu()
                  if (onOpenGuestbook) onOpenGuestbook()
                }}
                title="Buka Buku Tamu (Guestbook)"
              >
                <span>💬 Buku Tamu</span>
                {guestbookCount > 0 && (
                  <span className="nav-guestbook-badge">{guestbookCount}</span>
                )}
              </button>
            </li>

            <li className="nav-cta-item">
              <a href="#contact" className="btn btn-primary btn-sm nav-cta-btn" onClick={closeMenu}>
                Hubungi Saya
              </a>
            </li>

            {/* Tombol kecil sementara untuk Login Admin */}
            <li className="nav-admin-item">
              <Link
                to="/admin/login"
                className="btn-admin-quick-login"
                onClick={closeMenu}
                title="Login Admin CMS (Sementara)"
                aria-label="Login Admin CMS"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Login Admin</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
