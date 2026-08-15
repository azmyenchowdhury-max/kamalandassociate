import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatBot from './ChatBot';

const MainLayout: React.FC = () => {
  const location = useLocation();

  // Update document title based on current route
  useEffect(() => {
    const pageTitles: { [key: string]: string } = {
      '/': 'Kamal & Associates | Defender Of Justice',
      '/about': 'About Us | Kamal & Associates',
      '/attorneys': 'Our Attorneys | Kamal & Associates',
      '/practice-areas': 'Practice Areas | Kamal & Associates',
      '/case-studies': 'Case Studies | Kamal & Associates',
      '/blog': 'Legal Blog | Kamal & Associates',
      '/contact': 'Contact Us | Kamal & Associates',
      '/consultation': 'Free Consultation | Kamal & Associates'
    };
    document.title = pageTitles[location.pathname] || 'Kamal & Associates';
  }, [location.pathname]);

  // Initialize AOS on mount
  useEffect(() => {
    // @ts-ignore
    if (typeof AOS !== 'undefined') {
      // @ts-ignore
      AOS.init({
        duration: 800,
        easing: 'slide',
        once: true
      });
    }
  }, []);

  // Refresh AOS on route change and scroll to top
  useEffect(() => {
    // @ts-ignore
    if (typeof AOS !== 'undefined') {
      // @ts-ignore
      AOS.refresh();
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
      <ChatBot />
    </div>
  );
};

export default MainLayout;
