/**
 * Analytics Dashboard & Metrics Summary
 * Phase 9: Performance & Analytics
 * 
 * Provides:
 * - Session tracking
 * - Device detection
 * - Referrer tracking
 * - Local storage of metrics for dashboard viewing
 */

(function () {
  'use strict';

  var analyticsData = {
    sessionStart: Date.now(),
    sessionId: generateSessionId(),
    deviceType: detectDeviceType(),
    referrer: document.referrer || 'direct',
    pageViews: [],
    engagementMetrics: {},
    conversionEvents: [],
    timestamp: new Date().toISOString()
  };

  /**
   * Generate unique session ID
   */
  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Detect device type
   */
  function detectDeviceType() {
    var userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * Track page navigation
   */
  function trackPageNavigation() {
    analyticsData.pageViews.push({
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      referrer: analyticsData.referrer
    });
  }

  /**
   * Track user engagement metrics
   */
  function trackEngagementMetrics() {
    var viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var connectionType = connection ? connection.effectiveType : 'unknown';

    analyticsData.engagementMetrics = {
      screenResolution: window.screen.width + 'x' + window.screen.height,
      viewport: viewport.width + 'x' + viewport.height,
      connectionType: connectionType,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      doNotTrack: navigator.doNotTrack === '1' ? true : false,
      isOnline: navigator.onLine
    };
  }

  /**
   * Detect referral source
   */
  function detectReferralSource() {
    var referrer = analyticsData.referrer;
    
    if (!referrer || referrer === '') return 'direct';
    if (referrer.indexOf('google') !== -1) return 'google';
    if (referrer.indexOf('facebook') !== -1) return 'facebook';
    if (referrer.indexOf('instagram') !== -1) return 'instagram';
    if (referrer.indexOf('linkedin') !== -1) return 'linkedin';
    if (referrer.indexOf('twitter') !== -1) return 'twitter';
    if (referrer.indexOf('youtube') !== -1) return 'youtube';
    if (referrer.indexOf('bing') !== -1) return 'bing';
    if (referrer.indexOf('yahoo') !== -1) return 'yahoo';
    
    try {
      var referrerUrl = new URL(referrer);
      return referrerUrl.hostname;
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Track conversion events
   */
  function trackConversionEvent(eventName, eventData) {
    analyticsData.conversionEvents.push({
      eventName: eventName,
      eventData: eventData,
      timestamp: new Date().toISOString()
    });
    
    // Save to localStorage for persistence
    saveMetricsToStorage();
  }

  /**
   * Save metrics to localStorage
   */
  function saveMetricsToStorage() {
    try {
      var storageKey = 'kamal_analytics_' + analyticsData.sessionId;
      var existingData = localStorage.getItem('kamal_analytics_sessions') || '[]';
      var sessionsArray = JSON.parse(existingData);
      
      var sessionData = {
        sessionId: analyticsData.sessionId,
        duration: Date.now() - analyticsData.sessionStart,
        pageViewCount: analyticsData.pageViews.length,
        conversionEventCount: analyticsData.conversionEvents.length,
        deviceType: analyticsData.deviceType,
        referralSource: detectReferralSource(),
        timestamp: analyticsData.timestamp,
        lastUpdated: new Date().toISOString()
      };
      
      // Keep last 100 sessions
      sessionsArray.push(sessionData);
      if (sessionsArray.length > 100) {
        sessionsArray = sessionsArray.slice(-100);
      }
      
      localStorage.setItem('kamal_analytics_sessions', JSON.stringify(sessionsArray));
      localStorage.setItem(storageKey, JSON.stringify(analyticsData));
    } catch (e) {
      // Silently fail if localStorage not available
    }
  }

  /**
   * Get analytics summary
   */
  function getAnalyticsSummary() {
    var duration = Date.now() - analyticsData.sessionStart;
    
    return {
      sessionId: analyticsData.sessionId,
      sessionDurationMs: duration,
      sessionDurationMin: (duration / 60000).toFixed(2),
      pageViewCount: analyticsData.pageViews.length,
      conversionEventCount: analyticsData.conversionEvents.length,
      deviceType: analyticsData.deviceType,
      referralSource: detectReferralSource(),
      engagementMetrics: analyticsData.engagementMetrics,
      lastPageView: analyticsData.pageViews[analyticsData.pageViews.length - 1] || null
    };
  }

  /**
   * Get session analytics from localStorage
   */
  function getStoredSessions(limit) {
    limit = limit || 10;
    try {
      var sessionsData = localStorage.getItem('kamal_analytics_sessions') || '[]';
      var sessions = JSON.parse(sessionsData);
      return sessions.slice(-limit).reverse();
    } catch (e) {
      return [];
    }
  }

  /**
   * Calculate aggregate metrics
   */
  function getAggregateMetrics() {
    var sessions = getStoredSessions(100);
    
    var metrics = {
      totalSessions: sessions.length,
      totalPageViews: 0,
      totalConversions: 0,
      avgSessionDuration: 0,
      deviceDistribution: {},
      referralDistribution: {},
      conversionRate: 0
    };

    sessions.forEach(function (session) {
      metrics.totalPageViews += session.pageViewCount || 0;
      metrics.totalConversions += session.conversionEventCount || 0;
      metrics.avgSessionDuration += session.duration || 0;
      
      var device = session.deviceType || 'unknown';
      metrics.deviceDistribution[device] = (metrics.deviceDistribution[device] || 0) + 1;
      
      var source = session.referralSource || 'direct';
      metrics.referralDistribution[source] = (metrics.referralDistribution[source] || 0) + 1;
    });

    if (sessions.length > 0) {
      metrics.avgSessionDuration = Math.round(metrics.avgSessionDuration / sessions.length);
      metrics.conversionRate = ((metrics.totalConversions / sessions.length) * 100).toFixed(2);
    }

    return metrics;
  }

  /**
   * Display analytics in console
   */
  function logAnalyticsSummary() {
    console.group('📈 Analytics Summary');
    console.table(getAnalyticsSummary());
    console.groupEnd();
    
    console.group('📊 Aggregate Metrics (Last 100 Sessions)');
    console.table(getAggregateMetrics());
    console.groupEnd();
  }

  /**
   * Initialize analytics dashboard
   */
  function initializeDashboard() {
    trackPageNavigation();
    trackEngagementMetrics();
    
    // Save on page unload
    window.addEventListener('beforeunload', function () {
      saveMetricsToStorage();
    });

    // Periodic saves every 30 seconds
    setInterval(function () {
      saveMetricsToStorage();
    }, 30000);

    // Log summary if debug mode
    if (window.location.search.includes('analytics-debug')) {
      logAnalyticsSummary();
    }
  }

  /**
   * Expose analytics functions globally
   */
  window.__analyticsDashboard = {
    getAnalyticsSummary: getAnalyticsSummary,
    getStoredSessions: getStoredSessions,
    getAggregateMetrics: getAggregateMetrics,
    trackConversionEvent: trackConversionEvent,
    logAnalyticsSummary: logAnalyticsSummary,
    sessionId: analyticsData.sessionId,
    deviceType: analyticsData.deviceType
  };

  /**
   * Auto-initialize
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
  } else {
    initializeDashboard();
  }

})();
