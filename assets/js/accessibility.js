// MARASSI Logistics - Accessibility Enhancements
(function() {
    'use strict';

    const Accessibility = {
        init: function() {
            this.enhanceKeyboardNavigation();
            this.addAriaLabels();
            this.improveFocusManagement();
            this.addSkipLinks();
            this.enhanceColorContrast();
        },

        enhanceKeyboardNavigation: function() {
            // Make all interactive elements keyboard accessible
            const interactiveElements = document.querySelectorAll('a, button, [tabindex]');
            
            interactiveElements.forEach(element => {
                if (!element.hasAttribute('tabindex')) {
                    element.setAttribute('tabindex', '0');
                }
                
                // Add keyboard event handlers
                element.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        if (this.tagName !== 'A' && this.tagName !== 'BUTTON') {
                            e.preventDefault();
                            this.click();
                        }
                    }
                });
            });

            // Escape key handling for modals
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    const openModal = document.querySelector('.modal.show, .offcanvas-sidebar:not(.tw--translate-x-full)');
                    if (openModal) {
                        const closeButton = openModal.querySelector('.close, .offcanvas-sidebar__close');
                        if (closeButton) {
                            closeButton.click();
                        }
                    }
                }
            });
        },

        addAriaLabels: function() {
            // Add ARIA labels to navigation
            const navMenus = document.querySelectorAll('.nav-menu');
            navMenus.forEach(menu => {
                menu.setAttribute('role', 'navigation');
                menu.setAttribute('aria-label', 'Main navigation');
            });

            // Add ARIA labels to buttons without text
            const iconButtons = document.querySelectorAll('button:not([aria-label])');
            iconButtons.forEach(button => {
                const icon = button.querySelector('i');
                if (icon) {
                    const iconClass = icon.className;
                    let label = 'Button';
                    
                    if (iconClass.includes('ph-x')) label = 'Close';
                    else if (iconClass.includes('ph-list')) label = 'Menu';
                    else if (iconClass.includes('ph-phone')) label = 'Call';
                    else if (iconClass.includes('ph-envelope')) label = 'Email';
                    else if (iconClass.includes('ph-caret')) label = 'Toggle';
                    
                    // Use translation if available
                    const translatedLabel = window.getTranslation ? window.getTranslation(`accessibility.${label.toLowerCase()}`) || label : label;
                    button.setAttribute('aria-label', translatedLabel);
                }
            });

            // Add ARIA labels to social links
            const socialLinks = document.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="youtube"]');
            socialLinks.forEach(link => {
                const href = link.href;
                let platform = 'Social media';
                
                if (href.includes('facebook')) platform = 'Facebook';
                else if (href.includes('twitter')) platform = 'Twitter';
                else if (href.includes('instagram')) platform = 'Instagram';
                else if (href.includes('youtube')) platform = 'YouTube';
                
                const labelKey = `accessibility.visit_${platform.toLowerCase()}_page`;
                const translatedLabel = window.getTranslation ? window.getTranslation(labelKey) || `Visit our ${platform} page` : `Visit our ${platform} page`;
                link.setAttribute('aria-label', translatedLabel);
            });
        },

        improveFocusManagement: function() {
            // Add visible focus indicators
            const style = document.createElement('style');
            style.textContent = `
                /* Enhanced focus indicators */
                a:focus,
                button:focus,
                input:focus,
                textarea:focus,
                select:focus,
                [tabindex]:focus {
                    outline: 2px solid #007bff !important;
                    outline-offset: 2px !important;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25) !important;
                }
                
                /* Skip to content link */
                .skip-link {
                    position: absolute;
                    top: -40px;
                    left: 6px;
                    background: #000;
                    color: #fff;
                    padding: 8px;
                    text-decoration: none;
                    border-radius: 4px;
                    z-index: 10000;
                    transition: top 0.3s;
                }
                
                .skip-link:focus {
                    top: 6px;
                }
                
                /* High contrast mode support */
                @media (prefers-contrast: high) {
                    .text-neutral-500,
                    .text-neutral-600 {
                        color: #000 !important;
                    }
                    
                    .bg-neutral-50 {
                        background-color: #fff !important;
                        border: 1px solid #000 !important;
                    }
                }
                
                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    *,
                    *::before,
                    *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `;
            document.head.appendChild(style);

            // Focus trap for modals
            this.setupFocusTrap();
        },

        addSkipLinks: function() {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-link';
            skipLink.setAttribute('data-i18n', 'accessibility.skip_to_content');
            skipLink.textContent = window.getTranslation ? window.getTranslation('accessibility.skip_to_content') || 'Skip to main content' : 'Skip to main content';
            
            document.body.insertBefore(skipLink, document.body.firstChild);
            
            // Add main content ID if not present
            const mainContent = document.querySelector('main, .main-content, section:first-of-type');
            if (mainContent && !mainContent.id) {
                mainContent.id = 'main-content';
            }
        },

        enhanceColorContrast: function() {
            // Check and enhance color contrast
            const lowContrastElements = document.querySelectorAll('.text-neutral-400, .text-neutral-500');
            
            lowContrastElements.forEach(element => {
                // Add high contrast alternative
                element.classList.add('contrast-enhanced');
            });
        },

        setupFocusTrap: function() {
            const modals = document.querySelectorAll('.modal, .offcanvas-sidebar');
            
            modals.forEach(modal => {
                modal.addEventListener('keydown', function(e) {
                    if (e.key === 'Tab') {
                        const focusableElements = modal.querySelectorAll(
                            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
                        );
                        
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];
                        
                        if (e.shiftKey) {
                            if (document.activeElement === firstElement) {
                                lastElement.focus();
                                e.preventDefault();
                            }
                        } else {
                            if (document.activeElement === lastElement) {
                                firstElement.focus();
                                e.preventDefault();
                            }
                        }
                    }
                });
            });
        },

        // Screen reader announcements
        announceToScreenReader: function(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = window.getTranslation ? window.getTranslation(message) || message : message;
            
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Accessibility.init();
            
            // Re-initialize when language changes
            window.addEventListener('languageChanged', function() {
                Accessibility.addSkipLinks();
                Accessibility.addAriaLabels();
            });
        });
    } else {
        Accessibility.init();
    }

    // Expose globally
    window.Accessibility = Accessibility;
})();