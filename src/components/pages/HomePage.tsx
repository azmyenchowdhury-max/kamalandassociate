import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [countersVisible, setCountersVisible] = useState(false);
  const [rotatingText, setRotatingText] = useState('Freedom.');
  const [activeTab, setActiveTab] = useState('all');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const rotatingWords = ['Freedom.', 'Rights.', 'Case.', 'Custody.'];
  const wordIndex = useRef(0);

  const stats = [
    { number: 40, suffix: '+', label: 'Years of Excellence', icon: 'fa-award' },
    { number: 1000, suffix: '+', label: 'Cases Completed', icon: 'fa-balance-scale' },
    { number: 2000, suffix: '+', label: 'Satisfied Clients', icon: 'fa-users' },
    { number: 98, suffix: '%', label: 'Success Rate', icon: 'fa-check-circle' },
  ];

  const whyChooseUs = [
    { 
      icon: 'fa-balance-scale', 
      title: 'Fight for Justice', 
      desc: "We stand firmly for our clients' rights, advocating with strength, precision, and purpose in every legal matter. Justice is not just our goal—it is our responsibility." 
    },
    { 
      icon: 'fa-chess', 
      title: 'Best Case Strategy', 
      desc: "Every case is approached with careful analysis and a tailored legal strategy designed to achieve the most favorable outcome. We combine legal insight with practical judgment." 
    },
    { 
      icon: 'fa-user-tie', 
      title: 'Experienced Attorneys', 
      desc: "Our attorneys bring extensive experience across diverse areas of law, backed by a strong track record of success. Clients benefit from seasoned legal professionals." 
    },
  ];

  const practiceAreas = [
    { 
      title: 'Corporate & Commercial', 
      icon: 'fa-briefcase',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
      description: 'Comprehensive corporate legal services including mergers, acquisitions, contracts, and business formation.'
    },
    { 
      title: 'Banking & Finance', 
      icon: 'fa-university',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
      description: 'Expert guidance on banking regulations, financial transactions, and investment compliance.'
    },
    { 
      title: 'Real Estate & Property', 
      icon: 'fa-home',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
      description: 'Full-service real estate law including transactions, disputes, and property development.'
    },
    { 
      title: 'Family Law', 
      icon: 'fa-heart',
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600',
      description: 'Compassionate representation in divorce, custody, adoption, and family matters.'
    },
    { 
      title: 'Criminal Defense', 
      icon: 'fa-shield-alt',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
      description: 'Aggressive defense strategies for all criminal charges with proven results.'
    },
    { 
      title: 'Intellectual Property', 
      icon: 'fa-lightbulb',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600',
      description: 'Protection of patents, trademarks, copyrights, and trade secrets.'
    },
  ];

  const caseStudies = [
    {
      title: 'Corporate Merger Success',
      category: 'corporate',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600',
      description: 'Successfully facilitated a $50M merger between two major corporations.',
      result: 'Case Won - $50M Deal Closed'
    },
    {
      title: 'Property Dispute Resolution',
      category: 'property',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
      description: 'Resolved a complex multi-party property dispute involving ancestral land.',
      result: 'Full Settlement Achieved'
    },
    {
      title: 'Criminal Defense Victory',
      category: 'criminal',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
      description: 'Secured acquittal for client wrongfully accused of financial fraud.',
      result: 'Client Acquitted'
    },
    {
      title: 'Family Custody Case',
      category: 'family',
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600',
      description: 'Won full custody rights for parent in complex international case.',
      result: 'Full Custody Granted'
    },
  ];

  const testimonials = [
    {
      name: 'Rahman Industries Ltd.',
      role: 'Corporate Client',
      content: 'Kamal & Associates provided exceptional guidance during our merger. Their expertise in corporate law and attention to detail ensured a smooth transaction. Highly recommended for any business legal needs.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
    },
    {
      name: 'Fatima Begum',
      role: 'Individual Client',
      content: 'During my property dispute, the team at Kamal & Associates showed remarkable dedication. They handled my case with professionalism and achieved the best outcome. I am forever grateful.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    },
    {
      name: 'Bangladesh Tech Solutions',
      role: 'Corporate Client',
      content: 'Outstanding intellectual property services. They helped us protect our innovations and navigate complex IP regulations with ease. Their expertise is unmatched in the industry.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
  ];

  const attorneys = [
    { name: 'Advocate Kamal Hossain', position: 'Senior Partner', image: 'https://images.unsplash.com/photo-1556157382-97edd2d9e772?w=400' },
    { name: 'Advocate Fatima Rahman', position: 'Managing Partner', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400' },
    { name: 'Advocate Rashid Ahmed', position: 'Partner', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' },
    { name: 'Advocate Nusrat Jahan', position: 'Associate Partner', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400' },
  ];

  const awards = [
    { title: 'Best Law Firm 2025', org: 'Bangladesh Legal Awards', icon: 'fa-trophy' },
    { title: 'Excellence in Corporate Law', org: 'Asia Legal Forum', icon: 'fa-award' },
    { title: 'Top 10 Criminal Defense', org: 'Legal 500', icon: 'fa-medal' },
    { title: 'Client Choice Award', org: 'Chambers & Partners', icon: 'fa-star' },
  ];

  // Text rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      wordIndex.current = (wordIndex.current + 1) % rotatingWords.length;
      setRotatingText(rotatingWords[wordIndex.current]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCountersVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) observer.observe(statsSection);

    return () => observer.disconnect();
  }, []);

  // Testimonial carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!countersVisible) return;
      
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [countersVisible, target]);

    return <span>{count}{suffix}</span>;
  };

  const filteredCaseStudies = activeTab === 'all' 
    ? caseStudies 
    : caseStudies.filter(cs => cs.category === activeTab);

  return (
    <>
      {/* Hero Section */}
      <div 
        className="hero-wrap js-fullheight" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920')" }}
      >
        <div className="overlay"></div>
        <div className="container">
          <div className="row no-gutters slider-text js-fullheight align-items-center">
            <div className="col-lg-7" data-aos="fade-up">
              <h2 className="subheading">Welcome To Kamal & Associates</h2>
              <h1>
                Our Attorneys Stand For Your{' '}
                <span className="txt-rotate">
                  <span className="wrap">{rotatingText}</span>
                </span>
              </h1>
              <p className="mb-4" style={{ maxWidth: '550px' }}>
                With a proven record of assisting thousands in overcoming wrongful denials nationwide, 
                <strong> Kamal & Associates</strong> stands as a trusted name in legal advocacy.
              </p>
              <div className="d-flex align-items-center flex-wrap" style={{ gap: '20px' }}>
                <Link to="/contact" className="btn btn-primary">
                  Get Legal Advice
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
                <div 
                  className="play-btn"
                  onClick={() => setShowVideoModal(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fas fa-play"></i>
                </div>
                <span className="text-light ml-2">Watch Our Story</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Select Us Section */}
      <section className="ftco-section ftco-no-pt">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 py-5" data-aos="fade-right">
              <div className="heading-section">
                <span className="subheading">Services</span>
                <h2 className="mb-4">Why Select <span className="text-accent">Us?</span></h2>
                <p>
                  We are committed to delivering strategic, ethical, and results-driven legal solutions 
                  tailored to each client's needs. Our reputation is built on integrity, expertise, and 
                  unwavering dedication to justice.
                </p>
                <p className="mt-4">
                  <Link to="/consultation" className="btn btn-primary">
                    Free Consultation
                  </Link>
                </p>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="row">
                {whyChooseUs.map((service, index) => (
                  <div key={index} className="col-md-4 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay={index * 100}>
                    <div className="services text-center">
                      <div className="icon d-flex justify-content-center align-items-center">
                        <i className={`fas ${service.icon}`}></i>
                      </div>
                      <div className="text">
                        <h3>{service.title}</h3>
                        <p>{service.desc}</p>
                      </div>
                      <Link to="/contact" className="btn-custom d-flex align-items-center justify-content-center">
                        <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Counter Section */}
      <section id="stats-section" className="ftco-counter">
        <div className="container">
          <div className="row">
            {stats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="counter-wrap">
                  <div className="icon-counter">
                    <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <div className="number">
                    <Counter target={stat.number} suffix={stat.suffix} />
                  </div>
                  <div className="caption">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Areas Section with Flip Cards */}
      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center mb-5" data-aos="fade-up">
            <div className="col-md-8 text-center">
              <div className="heading-section">
                <span className="subheading">What We Do</span>
                <h2>Our Practice <span className="text-accent">Areas</span></h2>
                <p>
                  Comprehensive legal services tailored to meet the diverse needs of individuals 
                  and businesses across Bangladesh.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            {practiceAreas.map((area, index) => (
              <div key={index} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-front" style={{ backgroundImage: `url(${area.image})` }}>
                      <div className="content">
                        <div className="icon-box">
                          <i className={`fas ${area.icon}`}></i>
                        </div>
                        <h3>{area.title}</h3>
                      </div>
                    </div>
                    <div className="flip-card-back">
                      <h3>{area.title}</h3>
                      <p>{area.description}</p>
                      <Link to="/practice-areas" className="btn-flip">
                        Learn More
                        <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="row mt-4">
            <div className="col-12 text-center">
              <Link to="/practice-areas" className="btn btn-outline-primary py-3 px-5">
                View All Practice Areas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section with Tabs — disabled site-wide */}
      {false && (
      <section className="ftco-section bg-dark-custom">
        <div className="container">
          <div className="row justify-content-center mb-5" data-aos="fade-up">
            <div className="col-md-8 text-center">
              <div className="heading-section">
                <span className="subheading">Our Success</span>
                <h2>Recent Case <span className="text-accent">Studies</span></h2>
                <p>
                  Explore our track record of successful cases across various practice areas.
                </p>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="row justify-content-center mb-4">
            <div className="col-auto">
              <ul className="nav nav-tabs-custom">
                {['all', 'corporate', 'property', 'criminal', 'family'].map((tab) => (
                  <li key={tab} className="nav-item">
                    <button
                      className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="row">
            {filteredCaseStudies.map((cs, index) => (
              <div key={index} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="case-study-card">
                  <div className="img" style={{ backgroundImage: `url(${cs.image})` }}>
                    <span className="badge-category">{cs.category}</span>
                  </div>
                  <div className="content">
                    <h3>{cs.title}</h3>
                    <p>{cs.description}</p>
                    <div className="result">
                      <i className="fas fa-check-circle"></i>
                      {cs.result}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-4">
            <div className="col-12 text-center">
              <Link to="/case-studies" className="btn btn-primary">
                View All Case Studies
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Awards Section */}
      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center mb-5" data-aos="fade-up">
            <div className="col-md-8 text-center">
              <div className="heading-section">
                <span className="subheading">Recognition</span>
                <h2>Awards & <span className="text-accent">Achievements</span></h2>
              </div>
            </div>
          </div>
          <div className="row">
            {awards.map((award, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="award-card">
                  <div className="icon">
                    <i className={`fas ${award.icon}`}></i>
                  </div>
                  <h4>{award.title}</h4>
                  <p>{award.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attorneys Section */}
      <section className="ftco-section bg-dark-custom">
        <div className="container">
          <div className="row justify-content-center mb-5" data-aos="fade-up">
            <div className="col-md-8 text-center">
              <div className="heading-section">
                <span className="subheading">Our Team</span>
                <h2>Meet Our <span className="text-accent">Attorneys</span></h2>
                <p>
                  Our team of experienced attorneys is dedicated to providing exceptional legal 
                  representation and personalized service.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            {attorneys.map((attorney, index) => (
              <div key={index} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="attorney">
                  <div className="img" style={{ backgroundImage: `url(${attorney.image})` }}>
                    <div className="social">
                      <a href="#"><i className="fab fa-facebook-f"></i></a>
                      <a href="#"><i className="fab fa-twitter"></i></a>
                      <a href="#"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                  </div>
                  <div className="text">
                    <h3>{attorney.name}</h3>
                    <span className="position">{attorney.position}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="row mt-4">
            <div className="col-12 text-center">
              <Link to="/attorneys" className="btn btn-outline-primary py-3 px-5">
                View All Attorneys
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="ftco-section testimony-section">
        <div className="container">
          <div className="row justify-content-center mb-5" data-aos="fade-up">
            <div className="col-md-8 text-center">
              <div className="heading-section">
                <span className="subheading">Testimonials</span>
                <h2>What Our <span className="text-accent">Clients Say</span></h2>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8" data-aos="fade-up">
              <div className="testimony-wrap">
                <div className="icon">
                  <i className="fas fa-quote-left"></i>
                </div>
                <div className="text">
                  <p>"{testimonials[currentTestimonial].content}"</p>
                </div>
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="d-flex align-items-center">
                    <img 
                      src={testimonials[currentTestimonial].image} 
                      alt={testimonials[currentTestimonial].name}
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        marginRight: '15px',
                        border: '3px solid var(--primary-color)'
                      }}
                    />
                    <div>
                      <p className="name mb-0">{testimonials[currentTestimonial].name}</p>
                      <span className="position">{testimonials[currentTestimonial].role}</span>
                    </div>
                  </div>
                  <div className="stars mt-3 mt-md-0">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star ml-1"></i>
                    ))}
                  </div>
                </div>
              </div>
              <div className="carousel-dots">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={index === currentTestimonial ? 'active' : ''}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ftco-section" style={{ 
        background: 'linear-gradient(135deg, rgba(175, 169, 57, 0.1) 0%, rgba(180, 136, 17, 0.1) 100%)',
        borderTop: '1px solid rgba(175, 169, 57, 0.2)',
        borderBottom: '1px solid rgba(175, 169, 57, 0.2)'
      }}>
        <div className="container">
          <div className="row justify-content-center" data-aos="fade-up">
            <div className="col-lg-8 text-center">
              <h2 className="mb-4">Ready to Discuss Your <span className="text-accent">Legal Needs?</span></h2>
              <p className="mb-4" style={{ fontSize: '18px' }}>
                Schedule a free consultation with our expert attorneys. We're here to help you 
                navigate your legal challenges with confidence and expertise.
              </p>
              <div className="d-flex justify-content-center flex-wrap" style={{ gap: '15px' }}>
                <Link to="/consultation" className="btn btn-primary">
                  Schedule Free Consultation
                  <i className="fas fa-calendar-alt ml-2"></i>
                </Link>
                <Link to="/contact" className="btn btn-outline-primary">
                  Contact Us
                  <i className="fas fa-envelope ml-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="video-modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setShowVideoModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
