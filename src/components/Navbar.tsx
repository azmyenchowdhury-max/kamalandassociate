import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Attorneys', path: '/attorneys' },
    { name: 'Practice Areas', path: '/practice-areas' },
    // { name: 'Case Studies', path: '/case-studies' }, // disabled site-wide
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navbar px-md-0 navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light ${isScrolled ? 'scrolled' : ''}`} id="ftco-navbar">
      <div className="container-fluid px-md-5">
        <Link 
          className="navbar-brand d-flex align-items-center" 
          to="/"
        >
          <div className="d-flex align-items-center justify-content-center mr-3" style={{ 
            width: '50px', 
            height: '50px', 
            border: '2px solid #AFA939',
            borderRadius: '8px',
            background: 'rgba(175, 169, 57, 0.1)'
          }}>
            <i className="fas fa-balance-scale" style={{ fontSize: '24px', color: '#AFA939' }}></i>
          </div>

          <div className="brand-text">
            KAMAL & ASSOCIATES
            <span>Defender Of Justice</span>
          </div>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i> Menu
        </button>

        <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} id="ftco-nav">
          <ul className="navbar-nav ml-auto">
            {navLinks.map((link) => (
              <li key={link.path} className={`nav-item ${isActive(link.path) ? 'active' : ''}`}>
                <Link 
                  to={link.path} 
                  className="nav-link"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="nav-item cta">
              <Link 
                to="/consultation" 
                className="nav-link"
              >
                Free Consultation
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
