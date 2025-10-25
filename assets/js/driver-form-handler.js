// (function() {
//     'use strict';

//     const DriverFormHandler = {
//     // regex to validate normalized Saudi local mobile numbers (starts with 5 and 9 digits total)
//     saudiPhoneRegex: /^5[0-9]{8}$/,

//         init: function() {
//             // select the driver registration form by id used in registerdriver.html
//             const driverForm = document.querySelector('#driver-registration-form');
//             console.log('DriverFormHandler: init called, found form ->', !!driverForm);
//             if (!driverForm || !window.location.pathname.includes('registerdriver')) {
//                 return;
//             }

//             this.setupDriverFormValidation(driverForm);
//             this.setupRealTimePhoneValidation(driverForm);
//             this.setupPhoneFormatting(driverForm);
//         },

//         setupDriverFormValidation: function(form) {
//             form.addEventListener('submit', async (e) => {
//                 e.preventDefault();
//                const nameInput = form.querySelector('input[name="name"]');
//                 const phoneInput = form.querySelector('input[name="phone"]');
               
//                 const emailInput = form.querySelector('input[name="email"]');
//                 const messageInput = form.querySelector('textarea[name="message"]');

//                 this.clearAllErrors(form);

//                 let isValid = true;

//                 if (!this.validateName(nameInput)) {
//                     isValid = false;
//                 }

//                 if (!this.validateSaudiPhone(phoneInput)) {
//                     isValid = false;
//                 }

//                 if (!this.validateEmail(emailInput)) {
//                     isValid = false;
//                 }

//                 if (!this.validateMessage(messageInput)) {
//                     isValid = false;
//                 }

//                     console.log('DriverFormHandler: form validation result ->', isValid);
//                     if (isValid) {
//                         await this.submitDriverForm(form);
//                     }
//             });
//         },

//         setupRealTimePhoneValidation: function(form) {
//             const phoneInput = form.querySelector('input[name="phone"]');
//             if (!phoneInput) return;

//             phoneInput.addEventListener('blur', () => {
//                 this.validateSaudiPhone(phoneInput);
//             });

//             phoneInput.addEventListener('input', () => {
//                 this.clearFieldError(phoneInput);
//             });
//         },

//         setupPhoneFormatting: function(form) {
//             const phoneInput = form.querySelector('input[name="phone"]');
//             if (!phoneInput) return;

//             phoneInput.addEventListener('input', (e) => {
//                 let value = e.target.value.replace(/[^\d+]/g, '');

//                 if (value && !value.startsWith('+')) {
//                     if (value.startsWith('966')) {
//                         value = '+' + value;
//                     } else if (value.startsWith('0')) {
//                         value = '+966' + value.substring(1);
//                     } else if (value.startsWith('5')) {
//                         value = '+966' + value;
//                     }
//                 }

//                 e.target.value = value;
//             });
//         },

//         validateName: function(nameInput) {
//             const value = nameInput.value.trim();

//             if (!value) {
//                 this.showFieldError(nameInput, this.getTranslation('form_messages.required_field') || 'هذا الحقل مطلوب');
//                 return false;
//             }

//             if (value.length < 3) {
//                 this.showFieldError(nameInput, this.getTranslation('form_messages.name_min_length') || 'يجب أن يكون الاسم 3 أحرف على الأقل');
//                 return false;
//             }

//             if (value.length > 100) {
//                 this.showFieldError(nameInput, this.getTranslation('form_messages.name_max_length') || 'الاسم طويل جداً (100 حرف كحد أقصى)');
//                 return false;
//             }

//             return true;
//         },

//         validateSaudiPhone: function(phoneInput) {
//             const value = phoneInput.value.trim();

//             if (!value) {
//                 this.showFieldError(phoneInput, this.getTranslation('form_messages.phone_required') || 'رقم الهاتف مطلوب');
//                 return false;
//             }

//             const normalizedPhone = this.normalizeSaudiPhone(value);

//             if (!this.saudiPhoneRegex.test(normalizedPhone)) {
//                 this.showFieldError(phoneInput, this.getTranslation('form_messages.invalid_phone') || 'يرجى إدخال رقم هاتف سعودي صحيح (مثال: +966555134448)');
//                 return false;
//             }

//             phoneInput.value = this.formatSaudiPhone(normalizedPhone);
//             return true;
//         },

//         validateEmail: function(emailInput) {
//             const value = emailInput.value.trim();
//             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//             if (!value) {
//                 this.showFieldError(emailInput, this.getTranslation('form_messages.required_field') || 'هذا الحقل مطلوب');
//                 return false;
//             }

//             if (!emailRegex.test(value)) {
//                 this.showFieldError(emailInput, this.getTranslation('form_messages.invalid_email') || 'يرجى إدخال بريد إلكتروني صحيح');
//                 return false;
//             }

//             return true;
//         },

//         validateMessage: function(messageInput) {
//             const value = messageInput.value.trim();

//             if (!value) {
//                 this.showFieldError(messageInput, this.getTranslation('form_messages.required_field') || 'هذا الحقل مطلوب');
//                 return false;
//             }

//             if (value.length < 10) {
//                 this.showFieldError(messageInput, this.getTranslation('form_messages.message_min_length') || 'يجب أن تكون الرسالة 10 أحرف على الأقل');
//                 return false;
//             }

//             if (value.length > 5000) {
//                 this.showFieldError(messageInput, this.getTranslation('form_messages.message_max_length') || 'الرسالة طويلة جداً (5000 حرف كحد أقصى)');
//                 return false;
//             }

//             return true;
//         },

//         normalizeSaudiPhone: function(phone) {
//             let normalized = phone.replace(/[\s\-\(\)]/g, '');

//             // debug: show normalization steps
//             // (will print in browser console when called)
//             // Example: input '+966555123456' -> '555123456'
//             console.log('DriverFormHandler: normalizeSaudiPhone input ->', phone);

//             if (normalized.startsWith('+966')) {
//                 normalized = normalized.substring(4);
//             } else if (normalized.startsWith('966')) {
//                 normalized = normalized.substring(3);
//             } else if (normalized.startsWith('00966')) {
//                 normalized = normalized.substring(5);
//             } else if (normalized.startsWith('0')) {
//                 normalized = normalized.substring(1);
//             }

//             return normalized;
//         },

//         formatSaudiPhone: function(phone) {
//             const normalized = this.normalizeSaudiPhone(phone);
//             return '+966' + normalized;
//         },

//         showFieldError: function(field, message) {
//             this.clearFieldError(field);

//             const errorDiv = document.createElement('div');
//             errorDiv.className = 'field-error';
//             errorDiv.textContent = message;
//             errorDiv.style.cssText = `
//                 color: #dc3545;
//                 font-size: 13px;
//                 margin-top: 8px;
//                 margin-right: 36px;
//                 animation: fadeInError 0.3s ease;
//                 direction: rtl;
//                 text-align: right;
//             `;

//             field.parentNode.appendChild(errorDiv);
//             field.style.borderColor = '#dc3545';
//             field.classList.add('is-invalid');
//         },

//         clearFieldError: function(field) {
//             const existingError = field.parentNode.querySelector('.field-error');
//             if (existingError) {
//                 existingError.remove();
//             }
//             field.style.borderColor = '';
//             field.classList.remove('is-invalid');
//         },

//         clearAllErrors: function(form) {
//             const allErrors = form.querySelectorAll('.field-error');
//             allErrors.forEach(error => error.remove());

//             const allFields = form.querySelectorAll('input, textarea');
//             allFields.forEach(field => {
//                 field.style.borderColor = '';
//                 field.classList.remove('is-invalid');
//             });
//         },

//         async submitDriverForm(form) {
//             const submitButton = form.querySelector('button[type="submit"]');
//             const originalButtonHTML = submitButton.innerHTML;

//             submitButton.disabled = true;
//             submitButton.innerHTML = `
//                 <span class="button__flair"></span>
//                 <span class="text-white tw-text-2xl">
//                     <i class="ph-bold ph-circle-notch" style="animation: spin 1s linear infinite;"></i>
//                 </span>
//                 <span class="button__label">جاري الإرسال...</span>
//             `;

//             const formData = new FormData(form);
//             const data = {};
//             formData.forEach((value, key) => {
//                 data[key] = value.trim();
//             });

//             if (data.phone) {
//                 data.phone = this.formatSaudiPhone(data.phone);
//             }

//             try {
//                 const response = await fetch('/.netlify/functions/register-driver', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify(data)
//                 });

//                 const result = await response.json();
//                 console.log('DriverFormHandler: submission response ->', result);

//                 if (response.ok && result.success) {
//                     this.showSuccessMessage(form, result.message || this.getTranslation('form_messages.driver_success') || 'تم إرسال طلب الانضمام بنجاح! سنتواصل معك قريباً.');
//                     form.reset();
//                 } else {
//                     this.showErrorMessage(form, result.error || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
//                 }
//             } catch (error) {
//                 console.error('Form submission error:', error);
//                 this.showErrorMessage(form, 'خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
//             } finally {
//                 submitButton.disabled = false;
//                 submitButton.innerHTML = originalButtonHTML;
//             }
//         },

//         showSuccessMessage: function(form, message) {
//             this.removeAlerts(form);

//             const successDiv = document.createElement('div');
//             successDiv.className = 'alert alert-success driver-form-alert';
//             successDiv.innerHTML = `
//                 <i class="ph-bold ph-check-circle" style="margin-left: 8px;"></i>
//                 ${message}
//             `;
//             successDiv.style.cssText = `
//                 margin-top: 20px;
//                 padding: 16px 20px;
//                 border-radius: 8px;
//                 background-color: #d4edda;
//                 border: 1px solid #c3e6cb;
//                 color: #155724;
//                 animation: slideDown 0.5s ease;
//                 direction: rtl;
//                 text-align: right;
//                 display: flex;
//                 align-items: center;
//                 font-size: 15px;
//             `;

//             form.appendChild(successDiv);

//             setTimeout(() => {
//                 successDiv.style.opacity = '0';
//                 successDiv.style.transition = 'opacity 0.5s ease';
//                 setTimeout(() => successDiv.remove(), 500);
//             }, 7000);
//         },

//         showErrorMessage: function(form, message) {
//             this.removeAlerts(form);

//             const errorDiv = document.createElement('div');
//             errorDiv.className = 'alert alert-danger driver-form-alert';
//             errorDiv.innerHTML = `
//                 <i class="ph-bold ph-x-circle" style="margin-left: 8px;"></i>
//                 ${message}
//             `;
//             errorDiv.style.cssText = `
//                 margin-top: 20px;
//                 padding: 16px 20px;
//                 border-radius: 8px;
//                 background-color: #f8d7da;
//                 border: 1px solid #f5c6cb;
//                 color: #721c24;
//                 animation: slideDown 0.5s ease;
//                 direction: rtl;
//                 text-align: right;
//                 display: flex;
//                 align-items: center;
//                 font-size: 15px;
//             `;

//             form.appendChild(errorDiv);

//             setTimeout(() => {
//                 errorDiv.style.opacity = '0';
//                 errorDiv.style.transition = 'opacity 0.5s ease';
//                 setTimeout(() => errorDiv.remove(), 500);
//             }, 8000);
//         },

//         removeAlerts: function(form) {
//             const existingAlerts = form.querySelectorAll('.driver-form-alert');
//             existingAlerts.forEach(alert => alert.remove());
//         },

//         getTranslation: function(key) {
//             if (window.getTranslation) {
//                 return window.getTranslation(key);
//             }
//             return null;
//         }
//     };

//     const style = document.createElement('style');
//     style.textContent = `
//         @keyframes fadeInError {
//             from {
//                 opacity: 0;
//                 transform: translateY(-10px);
//             }
//             to {
//                 opacity: 1;
//                 transform: translateY(0);
//             }
//         }

//         @keyframes slideDown {
//             from {
//                 opacity: 0;
//                 transform: translateY(-20px);
//             }
//             to {
//                 opacity: 1;
//                 transform: translateY(0);
//             }
//         }

//         @keyframes spin {
//             from { transform: rotate(0deg); }
//             to { transform: rotate(360deg); }
//         }

//         .is-invalid {
//             border-color: #dc3545 !important;
//         }

//         .is-invalid:focus {
//             border-color: #dc3545 !important;
//             box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
//         }

//         .field-error {
//             animation: fadeInError 0.3s ease;
//             color: #dc3545;
//             font-size: 13px;
//             margin-top: 8px;
//             margin-right: 36px;
//             direction: rtl;
//             text-align: right;
//         }
//     `;
//     document.head.appendChild(style);

//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', function() {
//             DriverFormHandler.init();
//         });
//     } else {
//         DriverFormHandler.init();
//     }

//     window.DriverFormHandler = DriverFormHandler;
// })();
// MARASSI Logistics - Enhanced Form Handling
(function() {
    'use strict';

    const DriverFormHandler = {
        init: function() {
            this.setupFormValidation();
            this.setupFormSubmission();
            this.setupRealTimeValidation();
        },

        setupFormValidation: function() {
            // Only target the driver registration form to avoid interfering with other forms
            const forms = document.querySelectorAll('#driver-registration-form');

            forms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();

                    if (DriverFormHandler.validateForm(form)) {
                        DriverFormHandler.submitForm(form);
                    }
                });
            });
        },

        setupRealTimeValidation: function() {
            // Restrict real-time validation to inputs inside the driver form only
            const inputs = document.querySelectorAll('#driver-registration-form input[required], #driver-registration-form textarea[required]');

            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    DriverFormHandler.validateField(this);
                });

                input.addEventListener('input', function() {
                    DriverFormHandler.clearFieldError(this);
                });
            });
        },

        validateForm: function(form) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!DriverFormHandler.validateField(field)) {
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
            DriverFormHandler.clearFieldError(field);
            
            // Required field check
            if (!value) {
                DriverFormHandler.showFieldError(field, 'form_messages.required_field');
                return false;
            }
            
            // Email validation
            if (fieldType === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    DriverFormHandler.showFieldError(field, 'form_messages.invalid_email');
                    return false;
                }
            }
            
            // Phone validation
            if (fieldType === 'tel') {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                    DriverFormHandler.showFieldError(field, 'form_messages.invalid_phone');
                    return false;
                }
            }
            
            // Text length validation
            if (fieldType === 'text' && value.length < 2) {
                DriverFormHandler.showFieldError(field, 'form_messages.name_min_length');
                return false;
            }
            
            // Message length validation
            if (field.tagName === 'TEXTAREA' && value.length < 10) {
                DriverFormHandler.showFieldError(field, 'form_messages.message_min_length');
                return false;
            }
            
            return true;
        },

        showFieldError: function(field, message) {
            DriverFormHandler.clearFieldError(field);
            
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

            try {
                const response = await fetch('/.netlify/functions/register-driver', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    DriverFormHandler.showSuccessMessage(form, result.message);
                    form.reset();
                } else {
                    DriverFormHandler.showErrorMessage(form, result.error || 'Failed to send message. Please try again.');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                DriverFormHandler.showErrorMessage(form, 'Network error. Please check your connection and try again.');
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
                        
                        if (DriverFormHandler.validateField(emailInput)) {
                            DriverFormHandler.handleNewsletterSignup(emailInput.value);
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
            DriverFormHandler.init();
        });
    } else {
        DriverFormHandler.init();
    }

    // Expose globally under a driver-specific name to avoid clobbering the site-wide FormHandler
    window.DriverFormHandler = DriverFormHandler;
})();