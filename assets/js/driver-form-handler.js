(function() {
    'use strict';

    const DriverFormHandler = {
        saudiPhoneRegex: /^(\+966|966|00966|0)?5[0-9]{8}$/,

        init: function() {
            const driverForm = document.querySelector('form[action="/send-contact"]');
            if (!driverForm || !window.location.pathname.includes('registerdriver')) {
                return;
            }

            this.setupDriverFormValidation(driverForm);
            this.setupRealTimePhoneValidation(driverForm);
            this.setupPhoneFormatting(driverForm);
        },

        setupDriverFormValidation: function(form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const phoneInput = form.querySelector('input[name="phone"]');
                const nameInput = form.querySelector('input[name="name"]');
                const emailInput = form.querySelector('input[name="email"]');
                const messageInput = form.querySelector('textarea[name="message"]');

                this.clearAllErrors(form);

                let isValid = true;

                if (!this.validateName(nameInput)) {
                    isValid = false;
                }

                if (!this.validateSaudiPhone(phoneInput)) {
                    isValid = false;
                }

                if (!this.validateEmail(emailInput)) {
                    isValid = false;
                }

                if (!this.validateMessage(messageInput)) {
                    isValid = false;
                }

                if (isValid) {
                    await this.submitDriverForm(form);
                }
            });
        },

        setupRealTimePhoneValidation: function(form) {
            const phoneInput = form.querySelector('input[name="phone"]');
            if (!phoneInput) return;

            phoneInput.addEventListener('blur', () => {
                this.validateSaudiPhone(phoneInput);
            });

            phoneInput.addEventListener('input', () => {
                this.clearFieldError(phoneInput);
            });
        },

        setupPhoneFormatting: function(form) {
            const phoneInput = form.querySelector('input[name="phone"]');
            if (!phoneInput) return;

            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^\d+]/g, '');

                if (value && !value.startsWith('+')) {
                    if (value.startsWith('966')) {
                        value = '+' + value;
                    } else if (value.startsWith('0')) {
                        value = '+966' + value.substring(1);
                    } else if (value.startsWith('5')) {
                        value = '+966' + value;
                    }
                }

                e.target.value = value;
            });
        },

        validateName: function(nameInput) {
            const value = nameInput.value.trim();

            if (!value) {
                this.showFieldError(nameInput, this.getTranslation('form_messages.required_field') || 'هذا الحقل مطلوب');
                return false;
            }

            if (value.length < 3) {
                this.showFieldError(nameInput, this.getTranslation('form_messages.name_min_length') || 'يجب أن يكون الاسم 3 أحرف على الأقل');
                return false;
            }

            if (value.length > 100) {
                this.showFieldError(nameInput, this.getTranslation('form_messages.name_max_length') || 'الاسم طويل جداً (100 حرف كحد أقصى)');
                return false;
            }

            return true;
        },

        validateSaudiPhone: function(phoneInput) {
            const value = phoneInput.value.trim();

            if (!value) {
                this.showFieldError(phoneInput, this.getTranslation('form_messages.phone_required') || 'رقم الهاتف مطلوب');
                return false;
            }

            const normalizedPhone = this.normalizeSaudiPhone(value);

            if (!this.saudiPhoneRegex.test(normalizedPhone)) {
                this.showFieldError(phoneInput, this.getTranslation('form_messages.invalid_phone') || 'يرجى إدخال رقم هاتف سعودي صحيح (مثال: +966555134448)');
                return false;
            }

            phoneInput.value = this.formatSaudiPhone(normalizedPhone);
            return true;
        },

        validateEmail: function(emailInput) {
            const value = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!value) {
                this.showFieldError(emailInput, this.getTranslation('form_messages.required_field') || 'هذا الحقل مطلوب');
                return false;
            }

            if (!emailRegex.test(value)) {
                this.showFieldError(emailInput, this.getTranslation('form_messages.invalid_email') || 'يرجى إدخال بريد إلكتروني صحيح');
                return false;
            }

            return true;
        },

        validateMessage: function(messageInput) {
            const value = messageInput.value.trim();

            if (!value) {
                this.showFieldError(messageInput, this.getTranslation('form_messages.required_field') || 'هذا الحقل مطلوب');
                return false;
            }

            if (value.length < 10) {
                this.showFieldError(messageInput, this.getTranslation('form_messages.message_min_length') || 'يجب أن تكون الرسالة 10 أحرف على الأقل');
                return false;
            }

            if (value.length > 5000) {
                this.showFieldError(messageInput, this.getTranslation('form_messages.message_max_length') || 'الرسالة طويلة جداً (5000 حرف كحد أقصى)');
                return false;
            }

            return true;
        },

        normalizeSaudiPhone: function(phone) {
            let normalized = phone.replace(/[\s\-\(\)]/g, '');

            if (normalized.startsWith('+966')) {
                normalized = normalized.substring(4);
            } else if (normalized.startsWith('966')) {
                normalized = normalized.substring(3);
            } else if (normalized.startsWith('00966')) {
                normalized = normalized.substring(5);
            } else if (normalized.startsWith('0')) {
                normalized = normalized.substring(1);
            }

            return normalized;
        },

        formatSaudiPhone: function(phone) {
            const normalized = this.normalizeSaudiPhone(phone);
            return '+966' + normalized;
        },

        showFieldError: function(field, message) {
            this.clearFieldError(field);

            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error-message';
            errorDiv.textContent = message;
            errorDiv.style.cssText = `
                color: #dc3545;
                font-size: 13px;
                margin-top: 8px;
                margin-right: 36px;
                animation: fadeInError 0.3s ease;
                direction: rtl;
                text-align: right;
            `;

            field.parentNode.appendChild(errorDiv);
            field.style.borderColor = '#dc3545';
            field.classList.add('is-invalid-field');
        },

        clearFieldError: function(field) {
            const existingError = field.parentNode.querySelector('.field-error-message');
            if (existingError) {
                existingError.remove();
            }
            field.style.borderColor = '';
            field.classList.remove('is-invalid-field');
        },

        clearAllErrors: function(form) {
            const allErrors = form.querySelectorAll('.field-error-message');
            allErrors.forEach(error => error.remove());

            const allFields = form.querySelectorAll('input, textarea');
            allFields.forEach(field => {
                field.style.borderColor = '';
                field.classList.remove('is-invalid-field');
            });
        },

        async submitDriverForm(form) {
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonHTML = submitButton.innerHTML;

            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="button__flair"></span>
                <span class="text-white tw-text-2xl">
                    <i class="ph-bold ph-circle-notch" style="animation: spin 1s linear infinite;"></i>
                </span>
                <span class="button__label">جاري الإرسال...</span>
            `;

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value.trim();
            });

            if (data.phone) {
                data.phone = this.formatSaudiPhone(data.phone);
            }

            try {
                const response = await fetch('/.netlify/functions/send-contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    this.showSuccessMessage(form, result.message || this.getTranslation('form_messages.driver_success') || 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.');
                    form.reset();
                } else {
                    this.showErrorMessage(form, result.error || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                this.showErrorMessage(form, 'خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHTML;
            }
        },

        showSuccessMessage: function(form, message) {
            this.removeAlerts(form);

            const successDiv = document.createElement('div');
            successDiv.className = 'alert alert-success driver-form-alert';
            successDiv.innerHTML = `
                <i class="ph-bold ph-check-circle" style="margin-left: 8px;"></i>
                ${message}
            `;
            successDiv.style.cssText = `
                margin-top: 20px;
                padding: 16px 20px;
                border-radius: 8px;
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                animation: slideDown 0.5s ease;
                direction: rtl;
                text-align: right;
                display: flex;
                align-items: center;
                font-size: 15px;
            `;

            form.appendChild(successDiv);

            setTimeout(() => {
                successDiv.style.opacity = '0';
                successDiv.style.transition = 'opacity 0.5s ease';
                setTimeout(() => successDiv.remove(), 500);
            }, 7000);
        },

        showErrorMessage: function(form, message) {
            this.removeAlerts(form);

            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger driver-form-alert';
            errorDiv.innerHTML = `
                <i class="ph-bold ph-x-circle" style="margin-left: 8px;"></i>
                ${message}
            `;
            errorDiv.style.cssText = `
                margin-top: 20px;
                padding: 16px 20px;
                border-radius: 8px;
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                animation: slideDown 0.5s ease;
                direction: rtl;
                text-align: right;
                display: flex;
                align-items: center;
                font-size: 15px;
            `;

            form.appendChild(errorDiv);

            setTimeout(() => {
                errorDiv.style.opacity = '0';
                errorDiv.style.transition = 'opacity 0.5s ease';
                setTimeout(() => errorDiv.remove(), 500);
            }, 8000);
        },

        removeAlerts: function(form) {
            const existingAlerts = form.querySelectorAll('.driver-form-alert');
            existingAlerts.forEach(alert => alert.remove());
        },

        getTranslation: function(key) {
            if (window.getTranslation) {
                return window.getTranslation(key);
            }
            return null;
        }
    };

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInError {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .is-invalid-field {
            border-color: #dc3545 !important;
        }

        .is-invalid-field:focus {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }

        .field-error-message {
            animation: fadeInError 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            DriverFormHandler.init();
        });
    } else {
        DriverFormHandler.init();
    }

    window.DriverFormHandler = DriverFormHandler;
})();
