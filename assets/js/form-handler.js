// MARASSI Logistics - Enhanced Form Handling
(function() {
    'use strict';

    const FormHandler = {
        init: function() {
            this.setupFormValidation();
            this.setupFormSubmission();
            this.setupRealTimeValidation();
        },

        setupFormValidation: function() {
            const forms = document.querySelectorAll('form');
            
            forms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    if (FormHandler.validateForm(form)) {
                        FormHandler.submitForm(form);
                    }
                });
            });
        },

        setupRealTimeValidation: function() {
            const inputs = document.querySelectorAll('input[required], textarea[required]');
            
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    FormHandler.validateField(this);
                });
                
                input.addEventListener('input', function() {
                    FormHandler.clearFieldError(this);
                });
            });
        },

        validateForm: function(form) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!FormHandler.validateField(field)) {
                    isValid = false;
                }
            });
            
            return isValid;
        },

        validateField: function(field) {
            const value = field.value.trim();
            const fieldType = field.type;
            const fieldName = field.name || field.getAttribute('data-i18n-placeholder') || field.placeholder;
            
            // Clear previous errors
            FormHandler.clearFieldError(field);
            
            // Required field check
            if (!value) {
                FormHandler.showFieldError(field, 'form_messages.required_field');
                return false;
            }
            
            // Email validation
            if (fieldType === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    FormHandler.showFieldError(field, 'form_messages.invalid_email');
                    return false;
                }
            }
            
            // Phone validation
            if (fieldType === 'tel') {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                    FormHandler.showFieldError(field, 'form_messages.invalid_phone');
                    return false;
                }
            }
            
            // Text length validation
            if (fieldType === 'text' && value.length < 2) {
                FormHandler.showFieldError(field, 'form_messages.name_min_length');
                return false;
            }
            
            // Message length validation
            if (field.tagName === 'TEXTAREA' && value.length < 10) {
                FormHandler.showFieldError(field, 'form_messages.message_min_length');
                return false;
            }
            
            return true;
        },

        showFieldError: function(field, message) {
            FormHandler.clearFieldError(field);
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = window.getTranslation ? window.getTranslation(message) || message : message;
            errorDiv.style.cssText = `
                color: #dc3545;
                font-size: 12px;
                margin-top: 4px;
                animation: fadeIn 0.3s ease;
            `;
            
            field.parentNode.appendChild(errorDiv);
            field.style.borderColor = '#dc3545';
            field.classList.add('is-invalid');
        },

        clearFieldError: function(field) {
            const existingError = field.parentNode.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
            field.style.borderColor = '';
            field.classList.remove('is-invalid');
        },

        submitForm: async function(form) {
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;

            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Sending...
            `;
            submitButton.disabled = true;

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            const SUPABASE_URL = 'https://0ec90b57d6e95fcbda19832f.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

            try {
                const response = await fetch(`${SUPABASE_URL}/functions/v1/send-contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    FormHandler.showSuccessMessage(form, result.message);
                    form.reset();
                } else {
                    FormHandler.showErrorMessage(form, result.error || 'Failed to send message. Please try again.');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                FormHandler.showErrorMessage(form, 'Network error. Please check your connection and try again.');
            } finally {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        },

        showSuccessMessage: function(form, message) {
            const existingAlert = form.querySelector('.alert');
            if (existingAlert) existingAlert.remove();

            const successDiv = document.createElement('div');
            successDiv.className = 'alert alert-success';
            const displayMessage = message || (window.getTranslation ? window.getTranslation('form_messages.success') : 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
            successDiv.innerHTML = `<i class="ph-bold ph-check-circle me-2"></i>${displayMessage}`;
            successDiv.style.cssText = `
                margin-top: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                background-color: #d4edda;
                border-color: #c3e6cb;
                color: #155724;
                animation: slideDown 0.5s ease;
            `;

            form.appendChild(successDiv);

            setTimeout(() => {
                successDiv.remove();
            }, 5000);
        },

        showErrorMessage: function(form, error) {
            const existingAlert = form.querySelector('.alert');
            if (existingAlert) existingAlert.remove();

            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.innerHTML = `<i class="ph-bold ph-x-circle me-2"></i>${error}`;
            errorDiv.style.cssText = `
                margin-top: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                background-color: #f8d7da;
                border-color: #f5c6cb;
                color: #721c24;
                animation: slideDown 0.5s ease;
            `;
            form.appendChild(errorDiv);
            setTimeout(() => {
                errorDiv.remove();
            }, 7000);
        },

        setupFormSubmission: function() {
            // Newsletter form handling
            const newsletterForms = document.querySelectorAll('form[action="#"]');
            
            newsletterForms.forEach(form => {
                const emailInput = form.querySelector('input[type="email"]');
                if (emailInput) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        if (FormHandler.validateField(emailInput)) {
                            FormHandler.handleNewsletterSignup(emailInput.value);
                            emailInput.value = '';
                        }
                    });
                }
            });
        },

        handleNewsletterSignup: function(email) {
            // Store newsletter signup (replace with actual API call)
            console.log('Newsletter signup:', email);
            
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'newsletter-success';
            const successMessage = window.getTranslation ? window.getTranslation('form_messages.newsletter_success') : 'Successfully subscribed to newsletter!';
            notification.innerHTML = `<div class="alert alert-success position-fixed" style="top: 20px; right: 20px; z-index: 9999;"><i class="ph-bold ph-check-circle me-2"></i>${successMessage}</div>`;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    };

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .field-error {
            animation: fadeIn 0.3s ease;
        }
        
        .is-invalid {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            FormHandler.init();
        });
    } else {
        FormHandler.init();
    }

    // Expose globally
    window.FormHandler = FormHandler;
})();