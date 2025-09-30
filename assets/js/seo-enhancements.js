// MARASSI Logistics - SEO Enhancements
(function() {
    'use strict';

    const SEO = {
        init: function() {
            this.enhanceMetaTags();
            this.addStructuredData();
            this.optimizeImages();
            this.trackUserBehavior();
        },

        enhanceMetaTags: function() {
            // Dynamically enhance meta tags based on page content
            const pageTitle = document.querySelector('h1');
            const pageDescription = document.querySelector('p');
            
            if (pageTitle && !document.querySelector('meta[property="og:title"]')) {
                this.addMetaTag('property', 'og:title', pageTitle.textContent);
            }
            
            if (pageDescription && !document.querySelector('meta[property="og:description"]')) {
                const description = pageDescription.textContent.substring(0, 160);
                this.addMetaTag('property', 'og:description', description);
            }
            
            // Add canonical URL
            if (!document.querySelector('link[rel="canonical"]')) {
                const canonical = document.createElement('link');
                canonical.rel = 'canonical';
                canonical.href = window.location.href.split('?')[0];
                document.head.appendChild(canonical);
            }
        },

        addMetaTag: function(attribute, name, content) {
            const meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            meta.content = content;
            document.head.appendChild(meta);
        },

        addStructuredData: function() {
            // Add breadcrumb structured data
            const breadcrumbs = this.generateBreadcrumbs();
            if (breadcrumbs.length > 1) {
                const breadcrumbSchema = {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": breadcrumbs.map((crumb, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "name": crumb.name,
                        "item": crumb.url
                    }))
                };
                
                this.addJSONLD(breadcrumbSchema);
            }

            // Add organization schema if not present
            if (!document.querySelector('script[type="application/ld+json"]')) {
                const organizationSchema = {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "MARASSI Transport & Logistics",
                    "url": "https://marassi.com",
                    "logo": "https://marassi.com/assets/images/logo/Marassi_logo.png",
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "telephone": "+966-555-134-448",
                        "contactType": "customer service"
                    },
                    "address": {
                        "@type": "PostalAddress",
                        "addressCountry": "SA",
                        "addressRegion": "Al-Qassim",
                        "addressLocality": "Unaizah"
                    },
                    "sameAs": [
                        "https://www.facebook.com/marassi",
                        "https://www.twitter.com/marassi",
                        "https://www.instagram.com/marassi"
                    ]
                };
                
                this.addJSONLD(organizationSchema);
            }
        },

        addJSONLD: function(schema) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        },

        generateBreadcrumbs: function() {
            const path = window.location.pathname;
            const breadcrumbs = [
                { name: 'Home', url: 'https://marassi.com/' }
            ];
            
            if (path.includes('about')) {
                breadcrumbs.push({ name: 'About', url: 'https://marassi.com/about.html' });
            } else if (path.includes('service')) {
                breadcrumbs.push({ name: 'Services', url: 'https://marassi.com/service.html' });
            } else if (path.includes('project')) {
                breadcrumbs.push({ name: 'Projects', url: 'https://marassi.com/project.html' });
            } else if (path.includes('contact')) {
                breadcrumbs.push({ name: 'Contact', url: 'https://marassi.com/contact.html' });
            }
            
            return breadcrumbs;
        },

        optimizeImages: function() {
            // Add missing alt attributes
            const images = document.querySelectorAll('img:not([alt])');
            images.forEach(img => {
                const src = img.src || img.getAttribute('data-src') || '';
                const filename = src.split('/').pop().split('.')[0];
                const altText = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                img.setAttribute('alt', altText || 'Image');
            });

            // Add loading="lazy" to images below the fold
            const images2 = document.querySelectorAll('img:not([loading])');
            images2.forEach((img, index) => {
                if (index > 2) { // Skip first 3 images (likely above fold)
                    img.setAttribute('loading', 'lazy');
                }
            });
        },

        trackUserBehavior: function() {
            // Track scroll depth for SEO insights
            let maxScroll = 0;
            window.addEventListener('scroll', function() {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                }
            });

            // Track time on page
            const startTime = Date.now();
            window.addEventListener('beforeunload', function() {
                const timeOnPage = Date.now() - startTime;
                // This data can be sent to analytics
                console.log('Time on page:', timeOnPage / 1000, 'seconds');
                console.log('Max scroll depth:', maxScroll, '%');
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            SEO.init();
        });
    } else {
        SEO.init();
    }

    // Expose globally
    window.SEO = SEO;
})();