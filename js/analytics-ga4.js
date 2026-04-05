/**
 * Google Analytics 4 & Conversion Tracking
 * Phase 9: Performance & Analytics
 * 
 * Tracks:
 * - Pageviews with custom dimensions
 * - Conversion events (CTA clicks, form submissions)
 * - Social metrics (shares, referrals)
 * - Newsletter signups
 * - Scroll depth, engagement time, scroll performance
 */

(function () {
  'use strict';

  // GA4 Measurement ID - configure via runtime config
  var GA_MEASUREMENT_ID = window.__GA_MEASUREMENT_ID__ || 'G-XXXXXXXXXX';
  
  // Initialize gtag if not already present
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  
  function gtag() {
    dataLayer.push(arguments);
  }
  
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    'anonymize_ip': true,
    'allow_google_signals': true,
    'allow_ad_personalization_signals': false
  });

  /**
   * Track page view with custom dimensions
   */
  function trackPageView() {
    var articleTitle = document.querySelector('h1.article-title') ? document.querySelector('h1.article-title').textContent.trim() : document.title;
    var articleCategory = document.querySelector('.article-category') ? document.querySelector('.article-category').textContent.trim() : 'general';
    var articleAuthor = document.querySelector('.meta-author-name') ? document.querySelector('.meta-author-name').textContent.trim() : 'unknown';
    
    gtag('event', 'page_view', {
      'page_title': articleTitle,
      'page_path': window.location.pathname,
      'article_category': articleCategory,
      'article_author': articleAuthor,
      'page_type': document.body.classList.contains('article-page') ? 'article' : 'landing'
    });
  }

  /**
   * Track CTA button clicks (consultation, contact, etc)
   */
  function trackCTAClick(event) {
    var button = event.target.closest('a, button');
    if (!button) return;
    
    var buttonText = button.textContent.trim();
    var buttonId = button.id || button.className || 'unnamed-cta';
    var ctaType = 'cta_click';
    
    if (buttonText.toLowerCase().indexOf('consultation') !== -1) {
      ctaType = 'consultation_click';
    } else if (buttonText.toLowerCase().indexOf('contact') !== -1) {
      ctaType = 'contact_click';
    } else if (buttonText.toLowerCase().indexOf('call') !== -1 || buttonText.toLowerCase().indexOf('phone') !== -1) {
      ctaType = 'phone_click';
    } else if (buttonText.toLowerCase().indexOf('email') !== -1) {
      ctaType = 'email_click';
    } else if (buttonText.toLowerCase().indexOf('share') !== -1) {
      ctaType = 'social_share_click';
    }
    
    gtag('event', ctaType, {
      'button_text': buttonText,
      'button_id': buttonId,
      'page_path': window.location.pathname
    });
  }

  /**
   * Track consultation form submission
   */
  function trackFormSubmission(formElement) {
    var formId = formElement.id || 'consultation-form';
    
    gtag('event', 'generate_lead', {
      'form_id': formId,
      'form_name': formElement.name || 'consultation',
      'conversion': true,
      'value': 1,
      'currency': 'BDT'
    });
  }

  /**
   * Track social share actions
   */
  function trackSocialShare(platform, imageUrl, title) {
    gtag('event', 'share', {
      'method': platform,
      'content_title': title,
      'content_url': window.location.href,
      'image_url': imageUrl
    });
  }

  /**
   * Track newsletter signup
   */
  function trackNewsletterSignup(email) {
    gtag('event', 'sign_up', {
      'method': 'newsletter',
      'email_provided': email ? true : false
    });
  }

  /**
   * Track scroll depth (25%, 50%, 75%, 100%)
   */
  function trackScrollDepth() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var scrollThresholds = [0.25, 0.5, 0.75, 1];
    var scrollTracked = {};

    window.addEventListener('scroll', function () {
      var scrollPercent = window.scrollY / docHeight;
      
      scrollThresholds.forEach(function (threshold) {
        var key = 'scroll_' + Math.round(threshold * 100);
        if (scrollPercent >= threshold && !scrollTracked[key]) {
          scrollTracked[key] = true;
          gtag('event', 'scroll', {
            'scroll_threshold': Math.round(threshold * 100) + '%',
            'page_title': document.title
          });
        }
      });
    }, { once: false, passive: true });
  }

  /**
   * Track engagement time on page
   */
  function trackEngagementTime() {
    var engagementStart = Date.now();
    var maxEngagementTime = 0;

    // Track when user is active
    var engagementEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    var userActive = false;

    engagementEvents.forEach(function (event) {
      document.addEventListener(event, function () {
        if (!userActive) {
          userActive = true;
          var currentTime = Date.now();
          var engagementTime = Math.round((currentTime - engagementStart) / 1000);
          maxEngagementTime = Math.max(maxEngagementTime, engagementTime);
        }
      }, { passive: true });
    });

    // Send engagement timing before page unload
    window.addEventListener('beforeunload', function () {
      var totalEngagementTime = Math.round((Date.now() - engagementStart) / 1000);
      if (totalEngagementTime > 0) {
        gtag('event', 'engagement', {
          'engagement_time_seconds': totalEngagementTime,
          'max_scroll_percentage': Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
        });
      }
    });
  }

  /**
   * Expose tracking functions globally
   */
  window.__analyticsGA4 = {
    trackPageView: trackPageView,
    trackCTAClick: trackCTAClick,
    trackFormSubmission: trackFormSubmission,
    trackSocialShare: trackSocialShare,
    trackNewsletterSignup: trackNewsletterSignup,
    trackScrollDepth: trackScrollDepth,
    trackEngagementTime: trackEngagementTime
  };

  /**
   * Initialize on DOM ready
   */
  document.addEventListener('DOMContentLoaded', function () {
    // Track initial page view
    trackPageView();

    // Track scroll depth
    trackScrollDepth();

    // Track engagement time
    trackEngagementTime();

    // Add event listeners to CTA buttons
    document.querySelectorAll('a[href*="consultation"], a[href*="contact"], button.btn-gold, .btn-cta').forEach(function (btn) {
      btn.addEventListener('click', trackCTAClick);
    });

    // Track social share buttons
    document.querySelectorAll('.share-button, .social-share').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var platform = btn.getAttribute('data-platform') || btn.className.match(/\b(facebook|twitter|linkedin|whatsapp)\b/)[0] || 'social';
        trackSocialShare(platform, window.location.href, document.title);
      });
    });

    // Track form submissions
    document.querySelectorAll('form[id*="consultation"], form[name*="contact"], form[name*="lead"]').forEach(function (form) {
      form.addEventListener('submit', function () {
        trackFormSubmission(form);
      });
    });

    // Track newsletter signup if available
    var newsletterForm = document.querySelector('form[id*="newsletter"], form[name*="newsletter"]');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function () {
        var email = newsletterForm.querySelector('input[type="email"]');
        trackNewsletterSignup(email ? email.value : null);
      });
    }
  });

  // Load Google Analytics Script
  (function () {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);
  })();

})();
