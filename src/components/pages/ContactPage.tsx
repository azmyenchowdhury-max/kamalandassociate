import React, { useState } from 'react';

interface ContactPageProps {
  setCurrentPage: (page: string) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitStatus('success');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

    setTimeout(() => setSubmitStatus('idle'), 5000);
  };

  const contactInfo = [
    { icon: 'fa-map-marker-alt', title: 'Address', content: 'House 45, Road 12, Banani\nDhaka 1213, Bangladesh' },
    { icon: 'fa-phone-alt', title: 'Phone', content: '+880 1713 456 800' },
    { icon: 'fa-envelope', title: 'Email', content: 'kamalandassociates.info@gmail.com\nlegal@kamalassociates.com.bd' },
    { icon: 'fa-clock', title: 'Office Hours', content: 'Sunday - Thursday\n9:00 AM - 6:00 PM' },
  ];

  return (
    <>
      {/* Page Header */}
      <div
        className="hero-wrap hero-wrap-2"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920')",
          minHeight: '50vh'
        }}
      >
        <div className="overlay"></div>
        <div className="container">
          <div className="row no-gutters slider-text align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
            <div className="col-md-8 text-center" data-aos="fade-up">
              <span className="subheading" style={{ color: '#AFA939' }}>Get In Touch</span>
              <h1 style={{ fontSize: '48px', marginTop: '15px' }}>Contact <span className="text-accent">Us</span></h1>
              <p className="breadcrumbs mt-3">
                <span>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} style={{ color: '#AFA939' }}>Home</a>
                  <i className="fas fa-chevron-right mx-3" style={{ fontSize: '12px', color: '#9CA3AF' }}></i>
                </span>
                <span style={{ color: '#ECECEC' }}>Contact</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <section className="ftco-section">
        <div className="container">
          <div className="row">
            {contactInfo.map((info, index) => (
              <div key={index} className="col-md-6 col-lg-3 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div style={{
                  background: '#1C1E20',
                  padding: '30px',
                  borderRadius: '12px',
                  border: '1px solid rgba(175, 169, 57, 0.15)',
                  height: '100%',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #AFA939 0%, #B48811 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <i className={`fas ${info.icon}`} style={{ fontSize: '24px', color: '#0F1113' }}></i>
                  </div>
                  <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>{info.title}</h4>
                  <p style={{ whiteSpace: 'pre-line', color: '#9CA3AF', margin: 0, lineHeight: '1.8' }}>{info.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="ftco-section ftco-no-pt contact-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right">
              <div className="heading-section mb-4">
                <span className="subheading">Send Us a Message</span>
                <h2>Get in <span className="text-accent">Touch</span></h2>
              </div>

              {submitStatus === 'success' && (
                <div style={{
                  background: 'rgba(175, 169, 57, 0.1)',
                  border: '1px solid #AFA939',
                  borderRadius: '8px',
                  padding: '15px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="fas fa-check-circle mr-3" style={{ color: '#AFA939', fontSize: '20px' }}></i>
                  <span>Thank you for your message! We will get back to you shortly.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Your Email *"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Your Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <select
                        className="form-control"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        style={{ color: formData.subject ? '#ECECEC' : '#9CA3AF' }}
                      >
                        <option value="">Select Subject *</option>
                        <option value="general">General Inquiry</option>
                        <option value="consultation">Request Consultation</option>
                        <option value="corporate">Corporate Law</option>
                        <option value="family">Family Law</option>
                        <option value="criminal">Criminal Defense</option>
                        <option value="property">Property Law</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    placeholder="Your Message *"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <i className="fas fa-paper-plane ml-2"></i>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="heading-section mb-4">
                <span className="subheading">Our Location</span>
                <h2>Find <span className="text-accent">Us</span></h2>
              </div>
              <div style={{
                width: '100%',
                height: '350px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(175, 169, 57, 0.15)'
              }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.7383!2d90.4!3d23.79!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ3JzI0LjAiTiA5MMKwMjQnMDAuMCJF!5e0!3m2!1sen!2sbd!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(100%) invert(90%)' }}
                  allowFullScreen
                  loading="lazy"
                  title="Office Location"
                ></iframe>
              </div>
              <div className="mt-4 p-4" style={{
                background: '#1C1E20',
                borderRadius: '12px',
                border: '1px solid rgba(175, 169, 57, 0.15)'
              }}>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h5 style={{ color: '#AFA939', marginBottom: '10px' }}>
                      <i className="fab fa-whatsapp mr-2"></i>
                      WhatsApp Support
                    </h5>
                    <p className="mb-0" style={{ color: '#9CA3AF' }}>For quick inquiries, reach us on WhatsApp</p>
                  </div>
                  <div className="col-md-4 text-md-right mt-3 mt-md-0">
                    <a
                      href="https://wa.me/8801711123456"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      <i className="fab fa-whatsapp mr-2"></i>
                      Chat Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="ftco-section bg-dark-custom">
        <div className="container">
          <div className="row justify-content-center mb-5" data-aos="fade-up">
            <div className="col-md-8 text-center">
              <div className="heading-section">
                <span className="subheading">Common Questions</span>
                <h2>Frequently Asked <span className="text-accent">Questions</span></h2>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {[
                { q: 'How do I schedule a consultation?', a: 'You can schedule a consultation by calling our office, filling out the contact form above, or using our online consultation booking system.' },
                { q: 'What are your consultation fees?', a: 'We offer a free initial consultation for most practice areas. Specific fees will be discussed during your first meeting based on your case requirements.' },
                { q: 'How long does a typical case take?', a: 'Case duration varies significantly depending on the complexity and type of legal matter. We provide estimated timelines during your initial consultation.' },
                { q: 'Do you offer payment plans?', a: 'Yes, we offer flexible payment plans for qualifying clients. Please discuss your needs with our team during your consultation.' }
              ].map((faq, idx) => (
                <div key={idx} className="mb-4" data-aos="fade-up" data-aos-delay={idx * 100}>
                  <div style={{
                    background: '#1C1E20',
                    borderRadius: '12px',
                    padding: '25px',
                    border: '1px solid rgba(175, 169, 57, 0.15)'
                  }}>
                    <h5 style={{ color: '#ECECEC', marginBottom: '10px' }}>
                      <i className="fas fa-question-circle mr-2" style={{ color: '#AFA939' }}></i>
                      {faq.q}
                    </h5>
                    <p style={{ color: '#9CA3AF', margin: 0, paddingLeft: '28px' }}>{faq.a}</p>
                  </div>
                </div>
              ))}
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
              <h2 className="mb-4">Need Immediate Legal <span className="text-accent">Assistance?</span></h2>
              <p className="mb-4" style={{ fontSize: '18px' }}>
                Schedule a free consultation with our expert attorneys today.
              </p>
              <a
                href="#"
                className="btn btn-primary"
                onClick={(e) => { e.preventDefault(); setCurrentPage('consultation'); }}
              >
                Schedule Free Consultation
                <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
