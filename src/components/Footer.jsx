import { Link } from 'react-router-dom'
import './Footer.css'

/**
 * Footer component with semantic structure, navigation, copyright,
 * and a subtle discovery entry point to admin CMS.
 */
function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="footer-brand-title">Aldi Dwi Irawan</h3>
            <p className="footer-brand-desc">
              Web Developer & Software Engineer yang berfokus membangun aplikasi web modern, performan, dan mudah digunakan.
            </p>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-group-title">Navigasi Cepat</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="#hero" className="footer-nav-link">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#about" className="footer-nav-link">
                  Tentang Saya
                </a>
              </li>
              <li>
                <a href="#skills" className="footer-nav-link">
                  Keahlian
                </a>
              </li>
              <li>
                <a href="#projects" className="footer-nav-link">
                  Proyek
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-group-title">Lainnya</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="#experience" className="footer-nav-link">
                  Pengalaman
                </a>
              </li>
              <li>
                <a href="#education" className="footer-nav-link">
                  Pendidikan
                </a>
              </li>
              <li>
                <a href="#contact" className="footer-nav-link">
                  Hubungi
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} Aldi Dwi Irawan. All rights reserved.
          </p>
          <div className="footer-bottom-actions">
            <Link
              to="/admin/login"
              className="footer-admin-link"
              title="Akses Portal Admin"
              aria-label="Akses Portal Admin"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </Link>
            <a href="#hero" className="back-to-top-link" aria-label="Kembali ke atas halaman">
              <span>&uarr;</span> Kembali ke Atas
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
