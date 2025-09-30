// MARASSI Logistics - Performance Optimization
(function() {
    'use strict';

    const Performance = {
        init: function() {
            this.lazyLoadImages();
            this.preloadCriticalResources();
            this.optimizeScrollPerformance();
            this.registerServiceWorker();
        },

        lazyLoadImages: function() {
            // Add lazy loading to all images that don't already have it
            const images = document.querySelectorAll('img:not([loading])');
            images.forEach(img => {
                img.setAttribute('loading', 'lazy');
            });

            // Intersection Observer for advanced lazy loading
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                            }
                            observer.unobserve(img);
                        }
                    });
                });

                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
        },

        preloadCriticalResources: function() {
            const criticalResources = [
                { href: 'assets/css/main.css', as: 'style' },
                { href: 'assets/js/main.js', as: 'script' },
                { href: 'assets/images/logo/Marassi_logo.png', as: 'image' }
            ];

            criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource.href;
                link.as = resource.as;
                if (resource.as === 'style') {
                    link.onload = function() {
                        this.onload = null;
                        this.rel = 'stylesheet';
                    };
                }
                document.head.appendChild(link);
            });
        },

        optimizeScrollPerformance: function() {
            let ticking = false;

            function updateScrollPosition() {
                // Throttled scroll handling
                ticking = false;
            }

            function requestTick() {
                if (!ticking) {
                    requestAnimationFrame(updateScrollPosition);
                    ticking = true;
                }
            }

            window.addEventListener('scroll', requestTick, { passive: true });
        },

        registerServiceWorker: function() {
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                        .then(function(registration) {
                            console.log('ServiceWorker registration successful');
                        })
                        .catch(function(err) {
                            console.log('ServiceWorker registration failed');
                        });
                });
            }
        },

        // Web Vitals monitoring
        measureWebVitals: function() {
            // Core Web Vitals measurement
            if ('PerformanceObserver' in window) {
                // Largest Contentful Paint
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        console.log('LCP:', entry.startTime);
                    }
                }).observe({ entryTypes: ['largest-contentful-paint'] });

                // First Input Delay
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    }
                }).observe({ entryTypes: ['first-input'] });

                // Cumulative Layout Shift
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) {
                            console.log('CLS:', entry.value);
                        }
                    }
                }).observe({ entryTypes: ['layout-shift'] });
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Performance.init();
        });
    } else {
        Performance.init();
    }

    // Expose globally
    window.Performance = Performance;
})();