import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const ConsultationPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    caseType: '',
    urgency: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    consultationType: 'office',
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFreeConsultation, setIsFreeConsultation] = useState(true);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fallback eligibility check function
  const checkEligibilityFallback = async (email: string, phone: string) => {
    try {
      const consultationHistory = JSON.parse(localStorage.getItem('consultationHistory') || '{}');
      const userKey = `${email}_${phone}`;
      
      if (consultationHistory[userKey]) {
        return {
          freeConsultationUsed: true,
          consultationFee: 2000,
          consultationCount: consultationHistory[userKey].count || 1
        };
      }
      
      return {
        freeConsultationUsed: false,
        consultationFee: 2000,
        consultationCount: 0
      };
    } catch (err) {
      console.error('Fallback check error:', err);
      return {
        freeConsultationUsed: false,
        consultationFee: 2000,
        consultationCount: 0
      };
    }
  };

  // Check eligibility when email and phone are filled
  useEffect(() => {
    const checkEligibility = async () => {
      if (formData.email && formData.phone && formData.email.includes('@')) {
        setIsCheckingEligibility(true);
        try {
          let data;
          try {
            const result = await supabase.functions.invoke('consultation-check', {
              body: { email: formData.email, phone: formData.phone }
            });
            data = result.data;
          } catch (apiError) {
            console.warn('Edge Function unavailable, using fallback:', apiError);
            data = await checkEligibilityFallback(formData.email, formData.phone);
          }
          
          if (data) {
            setIsFreeConsultation(!data.freeConsultationUsed);
          }
        } catch (err) {
          console.error('Error checking eligibility:', err);
          setIsFreeConsultation(true); // Default to free if error occurs
        }
        setIsCheckingEligibility(false);
      }
    };

    const debounce = setTimeout(checkEligibility, 500);
    return () => clearTimeout(debounce);
  }, [formData.email, formData.phone]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-consultation', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          practiceArea: formData.caseType,
          urgency: formData.urgency,
          message: formData.description,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          consultationType: formData.consultationType,
          additionalNotes: formData.additionalNotes,
          isFree: isFreeConsultation
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setIsSubmitted(true);
      } else {
        setError(data?.error || 'Failed to submit consultation request');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const caseTypes = [
    'Corporate & Commercial',
    'Banking & Finance',
    'Real Estate & Property',
    'Family Law',
    'Criminal Defense',
    'Intellectual Property',
    'Tax & Revenue',
    'Immigration Law',
    'Labor & Employment',
    'International Trade',
    'Other'
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  if (isSubmitted) {
    return (
      <>
        <div 
          className="hero-wrap hero-wrap-2" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920')",
            minHeight: '50vh'
          }}
        >
          <div className="overlay"></div>
          <div className="container">
            <div className="row no-gutters slider-text align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
              <div className="col-md-8 text-center">
                <span className="subheading" style={{ color: '#AFA939' }}>Thank You</span>
                <h1 style={{ fontSize: '48px', marginTop: '15px' }}>Consultation <span className="text-accent">Scheduled</span></h1>
              </div>
            </div>
          </div>
        </div>

        <section className="ftco-section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div className="p-5" style={{ 
                  background: '#1C1E20', 
                  borderRadius: '16px',
                  border: '1px solid rgba(175, 169, 57, 0.15)' 
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #AFA939 0%, #B48811 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 30px'
                  }}>
                    <i className="fas fa-check" style={{ fontSize: '48px', color: '#0F1113' }}></i>
                  </div>
                  <h2 className="mb-4">Your Consultation Has Been Scheduled!</h2>
                  <p className="mb-4" style={{ fontSize: '18px' }}>
                    Thank you for choosing Kamal & Associates. We have received your consultation request 
                    and will contact you shortly to confirm your appointment.
                  </p>
                  <div className="p-4 mb-4" style={{ 
                    background: 'rgba(175, 169, 57, 0.1)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(175, 169, 57, 0.2)',
                    textAlign: 'left'
                  }}>
                    <h5 style={{ color: '#AFA939', marginBottom: '20px' }}>Appointment Details</h5>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <span style={{ color: '#9CA3AF' }}>Name:</span>
                        <p style={{ margin: 0, fontWeight: '500' }}>{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div className="col-md-6 mb-2">
                        <span style={{ color: '#9CA3AF' }}>Case Type:</span>
                        <p style={{ margin: 0, fontWeight: '500' }}>{formData.caseType}</p>
                      </div>
                      <div className="col-md-6 mb-2">
                        <span style={{ color: '#9CA3AF' }}>Preferred Date:</span>
                        <p style={{ margin: 0, fontWeight: '500' }}>{formData.preferredDate}</p>
                      </div>
                      <div className="col-md-6 mb-2">
                        <span style={{ color: '#9CA3AF' }}>Preferred Time:</span>
                        <p style={{ margin: 0, fontWeight: '500' }}>{formData.preferredTime}</p>
                      </div>
                      <div className="col-md-6 mb-2">
                        <span style={{ color: '#9CA3AF' }}>Consultation Type:</span>
                        <p style={{ margin: 0, fontWeight: '500' }}>{formData.consultationType === 'office' ? 'In-Office' : formData.consultationType === 'video' ? 'Video Call' : 'Phone Call'}</p>
                      </div>
                      <div className="col-md-6 mb-2">
                        <span style={{ color: '#9CA3AF' }}>Fee:</span>
                        <p style={{ margin: 0, fontWeight: '500', color: isFreeConsultation ? '#38a169' : '#AFA939' }}>
                          {isFreeConsultation ? 'FREE' : '৳2,000'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: '#9CA3AF' }} className="mb-4">
                    A confirmation email has been sent to <span style={{ color: '#AFA939' }}>{formData.email}</span>
                  </p>
                  <Link to="/" className="btn btn-primary">
                    Return to Home
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div 
        className="hero-wrap hero-wrap-2" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920')",
          minHeight: '50vh'
        }}
      >
        <div className="overlay"></div>
        <div className="container">
          <div className="row no-gutters slider-text align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
            <div className="col-md-8 text-center" data-aos="fade-up">
              <span className="subheading" style={{ color: '#AFA939' }}>Schedule Your</span>
              <h1 style={{ fontSize: '48px', marginTop: '15px' }}>
                {isFreeConsultation ? 'Free' : 'Paid'} <span className="text-accent">Consultation</span>
              </h1>
              <p className="breadcrumbs mt-3">
                <span>
                  <Link to="/" style={{ color: '#AFA939' }}>Home</Link>
                  <i className="fas fa-chevron-right mx-3" style={{ fontSize: '12px', color: '#9CA3AF' }}></i>
                </span>
                <span style={{ color: '#ECECEC' }}>Consultation</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Eligibility Notice */}
              {!isFreeConsultation && (
                <div className="alert mb-4" style={{
                  background: 'rgba(214, 158, 46, 0.1)',
                  border: '1px solid rgba(214, 158, 46, 0.3)',
                  borderRadius: '12px',
                  color: '#d69e2e'
                }}>
                  <i className="fas fa-info-circle mr-2"></i>
                  You have already used your free consultation. This consultation will cost <strong>৳2,000</strong>.
                </div>
              )}

              {/* Progress Steps */}
              <div className="d-flex justify-content-between mb-5 position-relative" data-aos="fade-up">
                <div style={{
                  position: 'absolute',
                  top: '25px',
                  left: '15%',
                  right: '15%',
                  height: '2px',
                  background: 'rgba(175, 169, 57, 0.2)',
                  zIndex: 0
                }}>
                  <div style={{
                    width: `${(step - 1) * 50}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #AFA939, #B48811)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                
                {[1, 2, 3].map((s) => (
                  <div key={s} className="text-center flex-fill position-relative" style={{ zIndex: 1 }}>
                    <div 
                      className="d-inline-flex align-items-center justify-content-center mb-2"
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: step >= s ? 'linear-gradient(135deg, #AFA939 0%, #B48811 100%)' : '#1C1E20',
                        border: `2px solid ${step >= s ? 'transparent' : 'rgba(175, 169, 57, 0.3)'}`,
                        color: step >= s ? '#0F1113' : '#AFA939',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {step > s ? <i className="fas fa-check"></i> : s}
                    </div>
                    <p className="mb-0" style={{ fontSize: '14px', color: step >= s ? '#AFA939' : '#9CA3AF' }}>
                      {s === 1 ? 'Personal Info' : s === 2 ? 'Case Details' : 'Schedule'}
                    </p>
                  </div>
                ))}
              </div>

              {error && (
                <div className="alert alert-danger mb-4" style={{
                  background: 'rgba(229, 62, 62, 0.1)',
                  border: '1px solid rgba(229, 62, 62, 0.3)',
                  borderRadius: '12px',
                  color: '#fc8181'
                }}>
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </div>
              )}

              <div className="p-4 p-md-5" style={{ 
                background: '#1C1E20', 
                borderRadius: '16px',
                border: '1px solid rgba(175, 169, 57, 0.15)' 
              }} data-aos="fade-up">
                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <>
                      <h4 style={{ color: '#AFA939', marginBottom: '25px' }}>Personal Information</h4>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label style={{ color: '#ECECEC', marginBottom: '8px' }}>First Name *</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label style={{ color: '#ECECEC', marginBottom: '8px' }}>Last Name *</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label style={{ color: '#ECECEC', marginBottom: '8px' }}>Email Address *</label>
                            <input 
                              type="email" 
                              className="form-control" 
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label style={{ color: '#ECECEC', marginBottom: '8px' }}>Phone Number *</label>
                            <input 
                              type="tel" 
                              className="form-control" 
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                            />
                            {isCheckingEligibility && (
                              <small style={{ color: '#9CA3AF' }}>
                                <i className="fas fa-spinner fa-spin mr-1"></i> Checking eligibility...
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h4 style={{ color: '#AFA939', marginBottom: '25px' }}>Case Information</h4>
                      <div className="form-group">
                        <label style={{ color: '#ECECEC', marginBottom: '8px' }}>Type of Legal Matter *</label>
                        <select 
                          className="form-control"
                          name="caseType"
                          value={formData.caseType}
                          onChange={handleChange}
                          required
                          style={{ color: formData.caseType ? '#ECECEC' : '#9CA3AF' }}
                        >
                          <option value="">Select Case Type</option>
                          {caseTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label style={{ color: '#ECECEC', marginBottom: '8px' }}>Urgency Level *</label>
                        <select 
                          className="form-control"
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleChange}
                          required
                          style={{ color: formData.urgency ? '#ECECEC' : '#9CA3AF' }}
                        >
                          <option value="">Select Urgency</option>
                          <option value="low">Low - General Inquiry</option>
                          <option value="medium">Medium - Need Advice Soon</option>
                          <option value="high">High - Urgent Matter</option>
                          <option value="critical">Critical - Immediate Attention Required</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label style={{ color: '#ECECEC', marginBottom: '8px' }}>Brief Description of Your Case *</label>
                        <textarea 
                          className="form-control" 
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={5}
                          placeholder="Please provide a brief overview of your legal matter..."
                          required
                        ></textarea>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h4 style={{ color: '#AFA939', marginBottom: '25px' }}>Schedule Your Consultation</h4>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label style={{ color: '#ECECEC', marginBottom: '8px' }}>Preferred Date *</label>
                            <input 
                              type="date" 
                              className="form-control" 
                              name="preferredDate"
                              value={formData.preferredDate}
                              onChange={handleChange}
                              min={new Date().toISOString().split('T')[0]}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label style={{ color: '#ECECEC', marginBottom: '8px' }}>Preferred Time *</label>
                            <select 
                              className="form-control"
                              name="preferredTime"
                              value={formData.preferredTime}
                              onChange={handleChange}
                              required
                              style={{ color: formData.preferredTime ? '#ECECEC' : '#9CA3AF' }}
                            >
                              <option value="">Select Time</option>
                              {timeSlots.map((time, index) => (
                                <option key={index} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label style={{ color: '#ECECEC', marginBottom: '15px' }}>Consultation Type *</label>
                        <div className="row">
                          {[
                            { value: 'office', label: 'In-Office', icon: 'fa-building' },
                            { value: 'video', label: 'Video Call', icon: 'fa-video' },
                            { value: 'phone', label: 'Phone Call', icon: 'fa-phone' }
                          ].map((option) => (
                            <div key={option.value} className="col-md-4 mb-3">
                              <div 
                                className="p-3 text-center"
                                style={{
                                  background: formData.consultationType === option.value ? 'rgba(175, 169, 57, 0.15)' : 'transparent',
                                  border: `2px solid ${formData.consultationType === option.value ? '#AFA939' : 'rgba(175, 169, 57, 0.2)'}`,
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease'
                                }}
                                onClick={() => setFormData({ ...formData, consultationType: option.value })}
                              >
                                <i className={`fas ${option.icon} mb-2`} style={{ 
                                  fontSize: '28px', 
                                  color: formData.consultationType === option.value ? '#AFA939' : '#9CA3AF' 
                                }}></i>
                                <p className="mb-0" style={{ 
                                  color: formData.consultationType === option.value ? '#ECECEC' : '#9CA3AF' 
                                }}>{option.label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label style={{ color: '#ECECEC', marginBottom: '8px' }}>Additional Notes (Optional)</label>
                        <textarea 
                          className="form-control" 
                          name="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Any additional information you'd like us to know..."
                        ></textarea>
                      </div>

                      {/* Fee Summary */}
                      <div className="p-3 mt-4" style={{
                        background: 'rgba(175, 169, 57, 0.1)',
                        border: '1px solid rgba(175, 169, 57, 0.2)',
                        borderRadius: '12px'
                      }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span style={{ color: '#ECECEC' }}>Consultation Fee:</span>
                          <span style={{ 
                            fontSize: '24px', 
                            fontWeight: '700', 
                            color: isFreeConsultation ? '#38a169' : '#AFA939' 
                          }}>
                            {isFreeConsultation ? 'FREE' : '৳2,000'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="d-flex justify-content-between mt-4">
                    {step > 1 ? (
                      <button 
                        type="button" 
                        className="btn btn-outline-primary"
                        onClick={handlePrev}
                      >
                        <i className="fas fa-arrow-left mr-2"></i> Previous
                      </button>
                    ) : (
                      <div></div>
                    )}
                    
                    {step < 3 ? (
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handleNext}
                      >
                        Next <i className="fas fa-arrow-right ml-2"></i>
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                            Scheduling...
                          </>
                        ) : (
                          <>
                            Schedule Consultation <i className="fas fa-calendar-check ml-2"></i>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ftco-section bg-dark-custom">
        <div className="container">
          <div className="row justify-content-center mb-5" data-aos="fade-up">
            <div className="col-md-8 text-center">
              <div className="heading-section">
                <span className="subheading">Why Choose Us</span>
                <h2>What to <span className="text-accent">Expect</span></h2>
              </div>
            </div>
          </div>
          <div className="row">
            {[
              { icon: 'fa-comments', title: 'Confidential Discussion', desc: 'Your consultation is completely confidential. Share your concerns freely.' },
              { icon: 'fa-user-tie', title: 'Expert Assessment', desc: 'Our experienced attorneys will assess your case and provide honest advice.' },
              { icon: 'fa-file-alt', title: 'Clear Action Plan', desc: 'Receive a clear outline of your legal options and recommended next steps.' },
              { icon: 'fa-hand-holding-usd', title: 'Transparent Pricing', desc: 'Get a clear understanding of potential costs with no hidden fees.' },
            ].map((item, index) => (
              <div key={index} className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="services text-center">
                  <div className="icon d-flex justify-content-center align-items-center">
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <div className="text">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ConsultationPage;
