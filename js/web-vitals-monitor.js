/**
 * Web Vitals & Performance Monitor
 * Phase 9: Performance & Analytics
 * 
 * Tracks Core Web Vitals:
 * - LCP (Largest Contentful Paint) - target < 2.5s
 * - FID (First Input Delay) - target < 100ms
 * - CLS (Cumulative Layout Shift) - target < 0.1
 * - INP (Interaction to Next Paint) - target < 200ms
 * 
 * Also tracks:
 * - Page load time
 * - Resource timing
 * - Navigation timing
 * - Performance score
 */

(function () {
  'use strict';

  var vitalsData = {
    lcp: null,
    fid: null,
    cls: null,
    inp: null,
    pageLoadTime: null,
    resourceTiming: [],
    performanceScore: 0,
    timestamp: new Date().toISOString()
  };

  /**
   * Track Largest Contentful Paint (LCP)
   * @returns {Promise}
   */
  function trackLCP() {
    return new Promise(function (resolve) {
      if ('PerformanceObserver' in window) {
        try {
          var observer = new PerformanceObserver(function (list) {
            var entries = list.getEntries();
            var lastEntry = entries[entries.length - 1];
            vitalsData.lcp = {
              value: lastEntry.renderTime || lastEntry.loadTime,
              element: lastEntry.element ? lastEntry.element.tagName : 'unknown',
              url: lastEntry.url || 'inline',
              rating: lastEntry.renderTime || lastEntry.loadTime <= 2500 ? 'good' : 'needs-improvement'
            };
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // LCP reporting finishes at 5 seconds for mobile, 4 seconds for desktop
          setTimeout(function () {
            observer.disconnect();
            resolve();
          }, 5000);
        } catch (e) {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * Track First Input Delay (FID)
   * @returns {Promise}
   */
  function trackFID() {
    return new Promise(function (resolve) {
      if ('PerformanceObserver' in window) {
        try {
          var observer = new PerformanceObserver(function (list) {
            var entries = list.getEntries();
            entries.forEach(function (entry) {
              vitalsData.fid = {
                value: entry.processingDuration,
                inputDelay: entry.startTime - entry.timeStamp || 0,
                rating: entry.processingDuration <= 100 ? 'good' : 'needs-improvement'
              };
              observer.disconnect();
              resolve();
            });
          });
          observer.observe({ entryTypes: ['first-input'], buffered: true });
          
          // FID is user-initiated, so we timeout after reasonable wait
          setTimeout(function () {
            observer.disconnect();
            if (!vitalsData.fid) {
              vitalsData.fid = { value: null, rating: 'no-user-input' };
            }
            resolve();
          }, 10000);
        } catch (e) {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * Track Cumulative Layout Shift (CLS)
   * @returns {Promise}
   */
  function trackCLS() {
    return new Promise(function (resolve) {
      if ('PerformanceObserver' in window) {
        try {
          var clsValue = 0;
          var sessionValue = 0;
          var sessionTimeout = null;

          var observer = new PerformanceObserver(function (list) {
            list.getEntries().forEach(function (entry) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                sessionValue += entry.value;

                clearTimeout(sessionTimeout);
                sessionTimeout = setTimeout(function () {
                  sessionValue = 0;
                }, 1000);
              }
            });
          });

          observer.observe({ entryTypes: ['layout-shift'], buffered: true });

          setTimeout(function () {
            observer.disconnect();
            vitalsData.cls = {
              value: clsValue,
              sessionValue: sessionValue,
              rating: clsValue <= 0.1 ? 'good' : 'needs-improvement'
            };
            resolve();
          }, 10000);
        } catch (e) {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * Track Interaction to Next Paint (INP)
   * @returns {Promise}
   */
  function trackINP() {
    return new Promise(function (resolve) {
      if ('PerformanceObserver' in window) {
        try {
          var inpValue = 0;
          var observer = new PerformanceObserver(function (list) {
            list.getEntries().forEach(function (entry) {
              inpValue = Math.max(inpValue, entry.duration);
            });
          });
          observer.observe({ entryTypes: ['event'], buffered: true });

          setTimeout(function () {
            observer.disconnect();
            vitalsData.inp = {
              value: inpValue,
              rating: inpValue <= 200 ? 'good' : 'needs-improvement'
            };
            resolve();
          }, 15000);
        } catch (e) {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * Track page load time
   */
  function trackPageLoadTime() {
    if (window.performance && window.performance.timing) {
      var navigationStart = performance.timing.navigationStart;
      var loadEventEnd = performance.timing.loadEventEnd;
      
      if (loadEventEnd > navigationStart) {
        vitalsData.pageLoadTime = {
          totalTime: loadEventEnd - navigationStart,
          dns: performance.timing.domainLookupEnd - performance.timing.domainLookupStart,
          tcp: performance.timing.connectEnd - performance.timing.connectStart,
          ttfb: performance.timing.responseStart - navigationStart,
          dom: performance.timing.domContentLoadedEventEnd - navigationStart,
          rating: (loadEventEnd - navigationStart) <= 3000 ? 'good' : 'needs-improvement'
        };
      }
    }
  }

  /**
   * Track resource timing (images, scripts, styles)
   */
  function trackResourceTiming() {
    if (window.performance && window.performance.getEntriesByType) {
      var resources = performance.getEntriesByType('resource');
      vitalsData.resourceTiming = resources.map(function (r) {
        return {
          name: r.name,
          duration: r.duration,
          size: r.transferSize || 0,
          type: r.initiatorType
        };
      });
    }
  }

  /**
   * Calculate overall performance score (0-100)
   */
  function calculatePerformanceScore() {
    var score = 100;
    
    // LCP score (max -30 points)
    if (vitalsData.lcp && vitalsData.lcp.value) {
      var lcpMs = vitalsData.lcp.value;
      score -= Math.min(30, Math.max(0, (lcpMs - 2500) / 2500 * 30));
    }
    
    // FID score (max -20 points)
    if (vitalsData.fid && vitalsData.fid.value) {
      var fidMs = vitalsData.fid.value;
      score -= Math.min(20, Math.max(0, (fidMs - 100) / 100 * 20));
    }
    
    // CLS score (max -25 points)
    if (vitalsData.cls && vitalsData.cls.value) {
      var clsVal = vitalsData.cls.value;
      score -= Math.min(25, Math.max(0, (clsVal - 0.1) / 0.25 * 25));
    }
    
    // Page load time score (max -25 points)
    if (vitalsData.pageLoadTime && vitalsData.pageLoadTime.totalTime) {
      var pageLoadMs = vitalsData.pageLoadTime.totalTime;
      score -= Math.min(25, Math.max(0, (pageLoadMs - 3000) / 3000 * 25));
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Send vitals to analytics (if GA4 available)
   */
  function sendVitalsToAnalytics() {
    if (window.__analyticsGA4 && window.dataLayer) {
      window.dataLayer.push({
        'event': 'web_vitals',
        'lcp_value': vitalsData.lcp ? vitalsData.lcp.value : null,
        'lcp_rating': vitalsData.lcp ? vitalsData.lcp.rating : null,
        'fid_value': vitalsData.fid ? vitalsData.fid.value : null,
        'fid_rating': vitalsData.fid ? vitalsData.fid.rating : null,
        'cls_value': vitalsData.cls ? vitalsData.cls.value : null,
        'cls_rating': vitalsData.cls ? vitalsData.cls.rating : null,
        'inp_value': vitalsData.inp ? vitalsData.inp.value : null,
        'inp_rating': vitalsData.inp ? vitalsData.inp.rating : null,
        'page_load_ms': vitalsData.pageLoadTime ? vitalsData.pageLoadTime.totalTime : null,
        'performance_score': vitalsData.performanceScore
      });
    }
  }

  /**
   * Display performance metrics in console (dev mode)
   */
  function logPerformanceMetrics() {
    if (window.__DEV_MODE__ !== true && !window.location.search.includes('debug')) return;
    
    console.group('📊 Web Vitals & Performance Metrics');
    console.table({
      'Largest Contentful Paint (LCP)': vitalsData.lcp ? vitalsData.lcp.value.toFixed(0) + 'ms' : 'N/A',
      'First Input Delay (FID)': vitalsData.fid ? vitalsData.fid.value + 'ms' : 'N/A',
      'Cumulative Layout Shift (CLS)': vitalsData.cls ? vitalsData.cls.value.toFixed(3) : 'N/A',
      'Interaction to Next Paint (INP)': vitalsData.inp ? vitalsData.inp.value + 'ms' : 'N/A',
      'Page Load Time': vitalsData.pageLoadTime ? vitalsData.pageLoadTime.totalTime + 'ms' : 'N/A',
      'Performance Score': vitalsData.performanceScore + '/100'
    });
    console.groupEnd();
  }

  /**
   * Initialize performance monitoring
   */
  async function initializeMonitoring() {
    // Track page load time on window load
    window.addEventListener('load', function () {
      trackPageLoadTime();
      trackResourceTiming();
    });

    // Track vitals
    await Promise.all([
      trackLCP(),
      trackFID(),
      trackCLS(),
      trackINP()
    ]);

    // Calculate final score
    vitalsData.performanceScore = calculatePerformanceScore();

    // Send to analytics
    setTimeout(function () {
      sendVitalsToAnalytics();
      logPerformanceMetrics();
    }, 1000);
  }

  /**
   * Expose vitals data globally
   */
  window.__webVitalsData = vitalsData;
  window.__webVitalsInit = initializeMonitoring;

  /**
   * Auto-initialize on DOM load
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMonitoring);
  } else {
    initializeMonitoring();
  }

})();
