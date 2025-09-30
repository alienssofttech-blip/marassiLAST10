// MARASSI Logistics - Security Enhancements
(function() {
    'use strict';

    const Security = {
        init: function() {
            this.sanitizeInputs();
            this.preventXSS();
            this.secureExternalLinks();
            this.validateForms();
        },

        sanitizeInputs: function() {
            // Basic input sanitization
            const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
            
            inputs.forEach(input => {
                input.addEventListener('input', function(e) {
                    // Remove potentially dangerous characters
                    let value = e.target.value;
                    value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                    value = value.replace(/javascript:/gi, '');
                    value = value.replace(/on\w+\s*=/gi, '');
                    
                    if (value !== e.target.value) {
                        e.target.value = value;
                    }
                });
            });
        },

        preventXSS: function() {
            // Escape HTML entities
            window.escapeHtml = function(text) {
                const map = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                };
                return text.replace(/[&<>"']/g, function(m) { return map[m]; });
            };
        },

        secureExternalLinks: function() {
            // Add security attributes to external links
            const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
            
            externalLinks.forEach(link => {
                link.setAttribute('rel', 'noopener noreferrer');
                link.setAttribute('target', '_blank');
            });
        },

        validateForms: function() {
            const forms = document.querySelectorAll('form');
            
            forms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    if (!Security.validateForm(form)) {
                        e.preventDefault();
                        return false;
                    }
                });
            });
        },

        validateForm: function(form) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            
            inputs.forEach(input => {
                const value = input.value.trim();
                
                // Check if required field is empty
                if (!value) {
                    this.showFieldError(input, 'This field is required');
                    isValid = false;
                    return;
                }

                // Email validation
                if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        this.showFieldError(input, 'Please enter a valid email address');
                        isValid = false;
                        return;
                    }
                }

                // Phone validation (basic)
                if (input.type === 'tel') {
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                        this.showFieldError(input, 'Please enter a valid phone number');
                        isValid = false;
                        return;
                    }
                }

                // Clear any existing errors
                this.clearFieldError(input);
            });

            return isValid;
        },

        showFieldError: function(input, message) {
            this.clearFieldError(input);
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 4px;';
            
            input.parentNode.appendChild(errorDiv);
            input.style.borderColor = '#dc3545';
        },

        clearFieldError: function(input) {
            const existingError = input.parentNode.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
            input.style.borderColor = '';
        },

        // Rate limiting for form submissions
        rateLimitSubmission: function(form) {
            const lastSubmission = localStorage.getItem('lastFormSubmission');
            const now = Date.now();
            const cooldown = 5000; // 5 seconds

            if (lastSubmission && (now - parseInt(lastSubmission)) < cooldown) {
                return false;
            }

            localStorage.setItem('lastFormSubmission', now.toString());
            return true;
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Security.init();
        });
    } else {
        Security.init();
    }

    // Expose globally
    window.Security = Security;
})();