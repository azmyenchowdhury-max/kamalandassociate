import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const practiceAreas = [
    'Corporate & Commercial',
    'Banking & Finance',
    'Real Estate & Property',
    'Family Law',
    'Criminal Defense',
    'Intellectual Property',
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Attorneys', path: '/attorneys' },
    { name: 'Practice Areas', path: '/practice-areas' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <footer className="ftco-footer">
      <div className="container">
        <div className="row">
          {/* About Column */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="ftco-footer-widget">
              <div className="d-flex align-items-center mb-4">
                <div className="d-flex align-items-center justify-content-center mr-3" style={{ 
                  width: '50px', 
                  height: '50px', 
                  border: '2px solid #AFA939',
                  borderRadius: '8px',
                  background: 'rgba(175, 169, 57, 0.1)'
                }}>
                  <i className="fas fa-balance-scale" style={{ fontSize: '24px', color: '#AFA939' }}></i>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>KAMAL & ASSOCIATES</h4>
                  <span style={{ fontSize: '12px', color: '#AFA939', letterSpacing: '2px' }}>DEFENDER OF JUSTICE</span>
                </div>
              </div>
              <p style={{ color: '#9CA3AF', lineHeight: 1.8 }}>
                Kamal & Associates is a premier full-service law firm in Bangladesh, 
                providing exceptional legal services since 1985. We are committed to 
                delivering justice with integrity and excellence.
              </p>
              <ul className="ftco-footer-social list-unstyled d-flex mt-4">
                <li>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter"></i>
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram"></i>
                  </a>
                </li>
                <li>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-youtube"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Practice Areas Column */}
          <div className="col-lg-2 col-md-6 mb-4">
            <div className="ftco-footer-widget">
              <h2>Practice Areas</h2>
              <ul className="list-unstyled">
                {practiceAreas.map((area, index) => (
                  <li key={index}>
                    <Link to="/practice-areas">
                      <i className="fas fa-chevron-right mr-2" style={{ fontSize: '10px', color: '#AFA939' }}></i>
                      {area}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-lg-2 col-md-6 mb-4">
            <div className="ftco-footer-widget">
              <h2>Quick Links</h2>
              <ul className="list-unstyled">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>
                      <i className="fas fa-chevron-right mr-2" style={{ fontSize: '10px', color: '#AFA939' }}></i>
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/consultation">
                    <i className="fas fa-chevron-right mr-2" style={{ fontSize: '10px', color: '#AFA939' }}></i>
                    Free Consultation
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info Column */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="ftco-footer-widget">
              <h2>Contact Info</h2>
              <div className="contact-info">
                <div className="d-flex mb-3">
                  <div className="icon mr-3" style={{ 
                    minWidth: '45px', 
                    height: '45px', 
                    background: 'rgba(175, 169, 57, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-map-marker-alt" style={{ color: '#AFA939' }}></i>
                  </div>
                  <div>
                    <h6 style={{ margin: 0, color: '#ECECEC', fontSize: '14px' }}>Address</h6>
                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '13px' }}>
                      House 45, Road 12, Banani<br />
                      Dhaka 1213, Bangladesh
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="icon mr-3" style={{ 
                    minWidth: '45px', 
                    height: '45px', 
                    background: 'rgba(175, 169, 57, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-phone-alt" style={{ color: '#AFA939' }}></i>
                  </div>
                  <div>
                    <h6 style={{ margin: 0, color: '#ECECEC', fontSize: '14px' }}>Phone</h6>
                    <p style={{ margin: 0 }}>
                      <a href="tel:+8802-9821234" style={{ color: '#9CA3AF', fontSize: '13px' }}>+880 2-9821234</a>
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="icon mr-3" style={{ 
                    minWidth: '45px', 
                    height: '45px', 
                    background: 'rgba(175, 169, 57, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-envelope" style={{ color: '#AFA939' }}></i>
                  </div>
                  <div>
                    <h6 style={{ margin: 0, color: '#ECECEC', fontSize: '14px' }}>Email</h6>
                    <p style={{ margin: 0 }}>
                      <a href="mailto:info@kamalassociates.com.bd" style={{ color: '#9CA3AF', fontSize: '13px' }}>info@kamalassociates.com.bd</a>
                    </p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="icon mr-3" style={{ 
                    minWidth: '45px', 
                    height: '45px', 
                    background: 'rgba(175, 169, 57, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-clock" style={{ color: '#AFA939' }}></i>
                  </div>
                  <div>
                    <h6 style={{ margin: 0, color: '#ECECEC', fontSize: '14px' }}>Working Hours</h6>
                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '13px' }}>Sun - Thu: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="row mt-5 pt-4" style={{ borderTop: '1px solid rgba(175, 169, 57, 0.15)' }}>
          <div className="col-lg-6 mb-4 mb-lg-0">
            <h5 style={{ color: '#ECECEC', marginBottom: '10px' }}>Subscribe to Our Newsletter</h5>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>
              Stay updated with the latest legal news and insights.
            </p>
          </div>
          <div className="col-lg-6">
            <form className="d-flex" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }}>
              <input 
                type="email" 
                className="form-control mr-2" 
                placeholder="Enter your email"
                style={{ 
                  background: 'rgba(175, 169, 57, 0.1)',
                  border: '1px solid rgba(175, 169, 57, 0.2)',
                  borderRadius: '8px',
                  color: '#ECECEC'
                }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-left mb-3 mb-md-0">
              <p style={{ margin: 0 }}>
                Copyright &copy; {new Date().getFullYear()} <span style={{ color: '#AFA939' }}>Kamal & Associates</span>. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-right">
              <p style={{ margin: 0 }}>
                <a href="/privacy-policy.html" style={{ color: '#9CA3AF' }}>Privacy Policy</a>
                <span className="mx-2" style={{ color: 'rgba(175, 169, 57, 0.3)' }}>|</span>
                <a href="/terms-of-service.html" style={{ color: '#9CA3AF' }}>Terms of Service</a>
                <span className="mx-2" style={{ color: 'rgba(175, 169, 57, 0.3)' }}>|</span>
                <a href="/disclaimer.html" style={{ color: '#9CA3AF' }}>Disclaimer</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
