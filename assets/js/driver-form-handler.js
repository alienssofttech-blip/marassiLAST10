// MARASSI Logistics - Driver form handler tuned for registerdriver.html
(function() {
    'use strict';

    const SA_PATTERN = /^5\d{8}$/; // local Saudi mobile (starts with 5 + 8 digits)
    const DIAL = '+966';

    function normalizeArabicDigits(str = '') {
        // convert Arabic-Indic digits to latin digits then remove non-digits
        const map = { '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9' };
        return String(str).split('').map(ch => map[ch] ?? ch).join('').replace(/[^0-9+]/g, '');
    }

    function normalizeLocal(val = '') {
        // return only local part (without country code) used by SA_PATTERN
        let v = normalizeArabicDigits(val).replace(/^\+/, '');
        if (v.startsWith('966')) v = v.substring(3);
        if (v.startsWith('00966')) v = v.replace(/^00/, '');
        if (v.startsWith('0')) v = v.substring(1);
        return v;
    }

    const DriverFormHandler = {
        init() {
            const form = document.getElementById('driver-registration-form');
            if (!form) return;

            // wire up phone helper for phone_local and sponsor_phone
            this.setupPhoneHelpers(form);

            // validate and submit
            form.addEventListener('submit', e => {
                e.preventDefault();
                // set submitted at hidden field if present
                const submittedAt = document.getElementById('submitted_at_field');
                if (submittedAt) submittedAt.value = new Date().toISOString();

                if (this.validateForm(form)) {
                    this.submitForm(form);
                }
            });

            // realtime validation for required fields
            const requiredEls = form.querySelectorAll('input[required], textarea[required], select[required]');
            requiredEls.forEach(el => {
                el.addEventListener('blur', () => this.validateField(el));
                el.addEventListener('input', () => this.clearFieldError(el));
            });
        },

        setupPhoneHelpers(form) {
            const phoneInput = form.querySelector('#phone_local') || form.querySelector('input[name="phone_local"]');
            const phoneE164 = form.querySelector('#phone_e164');
            const phoneError = form.querySelector('#phone_error');

            if (phoneInput) {
                const update = () => {
                    const local = normalizeLocal(phoneInput.value);
                    if (SA_PATTERN.test(local)) {
                        if (phoneE164) phoneE164.value = DIAL + local;
                        if (phoneError) phoneError.textContent = '';
                        phoneInput.classList.remove('is-invalid');
                    } else {
                        if (phoneE164) phoneE164.value = '';
                    }
                };

                phoneInput.addEventListener('input', () => {
                    update();
                    this.clearFieldError(phoneInput);
                });

                phoneInput.addEventListener('blur', () => {
                    const local = normalizeLocal(phoneInput.value);
                    if (!SA_PATTERN.test(local)) {
                        this.showFieldError(phoneInput, 'الرقم غير صالح. مثال صحيح: 5xxxxxxxx');
                        if (phoneError) phoneError.textContent = 'الرقم غير صالح. مثال صحيح: 5xxxxxxxx';
                    } else {
                        if (phoneError) phoneError.textContent = '';
                    }
                });
            }

            // sponsor phone is optional; normalize on input but don't require
            const sponsor = form.querySelector('#sponsor_phone') || form.querySelector('input[name="sponsor_phone"]');
            if (sponsor) {
                sponsor.addEventListener('input', () => {
                    sponsor.value = normalizeArabicDigits(sponsor.value).replace(/[^0-9+]/g, '');
                });
            }
        },

        validateForm(form) {
            let ok = true;

            // required by this page
            const fullName = form.querySelector('input[name="full_name"]');
            const email = form.querySelector('input[name="email"]');
            const phoneLocal = form.querySelector('#phone_local') || form.querySelector('input[name="phone_local"]');
            const city = form.querySelector('input[name="city"]');
            const vehicle = form.querySelector('select[name="vehicle_type"]');
            const agree = form.querySelector('input[name="agree_terms"]');

            if (fullName && !fullName.value.trim()) { this.showFieldError(fullName, 'هذا الحقل مطلوب'); ok = false; }
            if (email && !email.value.trim()) { this.showFieldError(email, 'هذا الحقل مطلوب'); ok = false; }
            if (city && !city.value.trim()) { this.showFieldError(city, 'هذا الحقل مطلوب'); ok = false; }
            if (vehicle && !vehicle.value) { this.showFieldError(vehicle, 'الرجاء اختيار نوع وسيلة التوصيل'); ok = false; }
            if (agree && !agree.checked) { this.showFieldError(agree, 'يجب الموافقة على الشروط والأحكام'); ok = false; }

            // phone specific validation
            if (phoneLocal) {
                const local = normalizeLocal(phoneLocal.value);
                if (!SA_PATTERN.test(local)) {
                    this.showFieldError(phoneLocal, 'الرقم غير صالح. مثال صحيح: 5xxxxxxxx');
                    ok = false;
                } else {
                    // fill hidden e164 field if present
                    const phoneE164 = form.querySelector('#phone_e164');
                    if (phoneE164) phoneE164.value = DIAL + local;
                }
            }

            return ok;
        },

        validateField(field) {
            this.clearFieldError(field);
            const tag = field.tagName.toLowerCase();
            const type = field.type;
            const val = (field.value || '').trim();

            if (field.hasAttribute('required')) {
                if (type === 'checkbox') {
                    if (!field.checked) { this.showFieldError(field, 'هذا الحقل مطلوب'); return false; }
                } else if (!val) {
                    this.showFieldError(field, 'هذا الحقل مطلوب'); return false;
                }
            }

            if (type === 'email' && val) {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!re.test(val)) { this.showFieldError(field, 'يرجى إدخال بريد إلكتروني صحيح'); return false; }
            }

            if (type === 'tel' && val) {
                const local = normalizeLocal(val);
                if (!SA_PATTERN.test(local)) { this.showFieldError(field, 'الرقم غير صالح. مثال صحيح: 5xxxxxxxx'); return false; }
            }

            if (tag === 'textarea' && val.length && val.length < 10) { this.showFieldError(field, 'الرجاء إدخال 10 أحرف على الأقل'); return false; }

            return true;
        },

        showFieldError(field, message) {
            this.clearFieldError(field);
            const wrapper = field.parentNode || field.closest('.form-group') || document.createElement('div');
            const el = document.createElement('div');
            el.className = 'field-error';
            el.textContent = message;
            el.style.cssText = 'color:#dc3545;font-size:13px;margin-top:6px;direction:rtl;text-align:right;';
            wrapper.appendChild(el);
            try { field.classList.add('is-invalid'); field.style.borderColor = '#dc3545'; } catch (e) {}
        },

        clearFieldError(field) {
            const parent = field.parentNode;
            if (!parent) return;
            const ex = parent.querySelector('.field-error');
            if (ex) ex.remove();
            field.classList.remove('is-invalid');
            field.style.borderColor = '';
        },

        async submitForm(form) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.dataset.orig = submitButton.innerHTML;
                submitButton.innerHTML = `<i class="ph ph-circle-notch" style="animation:spin 1s linear infinite;margin-inline-start:8px"></i> جاري الإرسال...`;
            }

            // send as FormData to preserve file inputs
            const formData = new FormData(form);

            try {
                // DEBUG: list FormData entries and count files before sending
                try {
                    let fdEntries = 0, fdFiles = 0;
                    for (const pair of formData.entries()) {
                        fdEntries++;
                        try {
                            if (pair[1] instanceof File) fdFiles++;
                        } catch (e) {}
                    }
                    console.log('Driver form: sending FormData', { entries: fdEntries, files: fdFiles });
                } catch (logErr) {
                    console.warn('Failed to enumerate FormData entries', logErr && logErr.message);
                }

                const resp = await fetch('/.netlify/functions/register-driver', {
                    method: 'POST',
                    body: formData
                });

                let body = null;
                try { body = await resp.json(); } catch (err) { /* non-json response */ }

                if (resp.ok && body && body.success) {
                    this.showSuccessMessage(form, body.message || 'تم إرسال الطلب بنجاح.');
                    form.reset();
                } else if (resp.ok && !body) {
                    this.showSuccessMessage(form, 'تم إرسال الطلب.');
                    form.reset();
                } else {
                    this.showErrorMessage(form, (body && body.error) || 'حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقًا.');
                }
            } catch (error) {
                console.error('Driver form submit error', error);
                this.showErrorMessage(form, 'خطأ في الشبكة. تحقق من اتصالك وحاول مرة أخرى.');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = submitButton.dataset.orig || submitButton.innerHTML;
                }
            }
        },

        showSuccessMessage(form, message) {
            this.removeAlerts(form);
            const d = document.createElement('div');
            d.className = 'alert alert-success driver-form-alert';
            d.textContent = message;
            d.style.cssText = 'margin-top:16px;padding:12px;border-radius:8px;';
            form.appendChild(d);
            setTimeout(() => d.remove(), 6000);
        },

        showErrorMessage(form, message) {
            this.removeAlerts(form);
            const d = document.createElement('div');
            d.className = 'alert alert-danger driver-form-alert';
            d.textContent = message;
            d.style.cssText = 'margin-top:16px;padding:12px;border-radius:8px;';
            form.appendChild(d);
            setTimeout(() => d.remove(), 8000);
        },

        removeAlerts(form) {
            const ex = form.querySelectorAll('.driver-form-alert');
            ex.forEach(n => n.remove());
        }
    };

    // small CSS additions used by spinner
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .is-invalid { border-color: #dc3545 !important; }
        .field-error { color:#dc3545; font-size:13px; margin-top:6px; }
    `;
    document.head.appendChild(style);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DriverFormHandler.init());
    } else {
        DriverFormHandler.init();
    }

    window.DriverFormHandler = DriverFormHandler;
})();