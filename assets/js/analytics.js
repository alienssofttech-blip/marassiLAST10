// MARASSI Logistics - Analytics and Monitoring
(function() {
    'use strict';

    const Analytics = {
        init: function() {
            this.trackPageViews();
            this.trackUserInteractions();
            this.trackPerformance();
            this.trackErrors();
        },

        trackPageViews: function() {
            // Track page views
            if (typeof gtag !== 'undefined') {
                gtag('config', 'GA_MEASUREMENT_ID', {
                    page_title: document.title,
                    page_location: window.location.href
                });
            }
        },

        trackUserInteractions: function() {
            // Track button clicks
            document.addEventListener('click', function(e) {
                const button = e.target.closest('button, .btn');
                if (button) {
                    const buttonText = button.textContent.trim();
                    Analytics.trackEvent('button_click', {
                        button_text: buttonText,
                        page_url: window.location.pathname
                    });
                }
            });

            // Track form submissions
            document.addEventListener('submit', function(e) {
                const form = e.target;
                if (form.tagName === 'FORM') {
                    Analytics.trackEvent('form_submit', {
                        form_id: form.id || 'unknown',
                        page_url: window.location.pathname
                    });
                }
            });

            // Track external link clicks
            document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                if (link && link.hostname !== window.location.hostname) {
                    Analytics.trackEvent('external_link_click', {
                        link_url: link.href,
                        link_text: link.textContent.trim()
                    });
                }
            });
        },

        trackPerformance: function() {
            // Track page load time
            window.addEventListener('load', function() {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                Analytics.trackEvent('page_load_time', {
                    load_time: loadTime,
                    page_url: window.location.pathname
                });
            });

            // Track scroll depth
            let maxScroll = 0;
            window.addEventListener('scroll', function() {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                        Analytics.trackEvent('scroll_depth', {
                            scroll_percent: maxScroll,
                            page_url: window.location.pathname
                        });
                    }
                }
            });
        },

        trackErrors: function() {
            // Track JavaScript errors
            window.addEventListener('error', function(e) {
                Analytics.trackEvent('javascript_error', {
                    error_message: e.message,
                    error_filename: e.filename,
                    error_line: e.lineno,
                    page_url: window.location.pathname
                });
            });

            // Track unhandled promise rejections
            window.addEventListener('unhandledrejection', function(e) {
                Analytics.trackEvent('promise_rejection', {
                    error_message: e.reason.toString(),
                    page_url: window.location.pathname
                });
            });
        },

        trackEvent: function(eventName, parameters) {
            // Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, parameters);
            }

            // Custom analytics (if needed)
            console.log('Analytics Event:', eventName, parameters);
        },

        // Track custom business metrics
        trackBusinessMetrics: function() {
            // Track service inquiries
            const serviceLinks = document.querySelectorAll('a[href*="service"]');
            serviceLinks.forEach(link => {
                link.addEventListener('click', function() {
                    Analytics.trackEvent('service_interest', {
                        service_type: this.textContent.trim(),
                        page_url: window.location.pathname
                    });
                });
            });

            // Track contact attempts
            const contactLinks = document.querySelectorAll('a[href*="contact"], a[href^="tel:"], a[href^="mailto:"]');
            contactLinks.forEach(link => {
                link.addEventListener('click', function() {
                    Analytics.trackEvent('contact_attempt', {
                        contact_type: this.href.includes('tel:') ? 'phone' : 
                                     this.href.includes('mailto:') ? 'email' : 'form',
                        page_url: window.location.pathname
                    });
                });
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Analytics.init();
            Analytics.trackBusinessMetrics();
        });
    } else {
        Analytics.init();
        Analytics.trackBusinessMetrics();
    }

    // Expose globally
    window.Analytics = Analytics;
})();