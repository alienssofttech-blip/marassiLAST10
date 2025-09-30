// MARASSI Logistics - Cookie Consent Management
(function() {
    'use strict';

    const CookieConsent = {
        init: function() {
            this.createConsentBanner();
            this.bindEvents();
            this.checkConsentStatus();
        },

        createConsentBanner: function() {
            const banner = document.createElement('div');
            banner.id = 'cookie-consent-banner';
            banner.className = 'cookie-consent-banner';
            
            // Create banner content with translation attributes
            const bannerContent = document.createElement('div');
            bannerContent.className = 'cookie-consent-content';
            
            const textDiv = document.createElement('div');
            textDiv.className = 'cookie-consent-text';
            
            const title = document.createElement('h4');
            title.setAttribute('data-i18n', 'cookie_consent.title');
            
            const description = document.createElement('p');
            description.setAttribute('data-i18n', 'cookie_consent.description');
            
            textDiv.appendChild(title);
            textDiv.appendChild(description);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'cookie-consent-actions';
            
            const acceptAllBtn = document.createElement('button');
            acceptAllBtn.id = 'cookie-accept-all';
            acceptAllBtn.className = 'btn btn-main btn-sm';
            acceptAllBtn.setAttribute('data-i18n', 'cookie_consent.accept_all');
            
            const necessaryBtn = document.createElement('button');
            necessaryBtn.id = 'cookie-accept-necessary';
            necessaryBtn.className = 'btn btn-outline-main btn-sm';
            necessaryBtn.setAttribute('data-i18n', 'cookie_consent.necessary_only');
            
            const settingsBtn = document.createElement('button');
            settingsBtn.id = 'cookie-settings';
            settingsBtn.className = 'btn btn-link btn-sm';
            settingsBtn.setAttribute('data-i18n', 'cookie_consent.settings');
            
            actionsDiv.appendChild(acceptAllBtn);
            actionsDiv.appendChild(necessaryBtn);
            actionsDiv.appendChild(settingsBtn);
            
            bannerContent.appendChild(textDiv);
            bannerContent.appendChild(actionsDiv);
            banner.appendChild(bannerContent);

            // Add CSS
            const style = document.createElement('style');
            style.textContent = `
                .cookie-consent-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(11, 11, 11, 0.95);
                    backdrop-filter: blur(10px);
                    color: white;
                    padding: 20px;
                    z-index: 10000;
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                }
                .cookie-consent-banner.show {
                    transform: translateY(0);
                }
                .cookie-consent-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }
                .cookie-consent-text h4 {
                    margin: 0 0 8px 0;
                    font-size: 18px;
                    font-weight: 600;
                }
                .cookie-consent-text p {
                    margin: 0;
                    font-size: 14px;
                    opacity: 0.9;
                }
                .cookie-consent-actions {
                    display: flex;
                    gap: 12px;
                    flex-shrink: 0;
                }
                @media (max-width: 768px) {
                    .cookie-consent-content {
                        flex-direction: column;
                        text-align: center;
                    }
                    .cookie-consent-actions {
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(banner);
        },

        bindEvents: function() {
            const self = this;
            
            document.getElementById('cookie-accept-all').addEventListener('click', function() {
                self.setConsent('all');
                self.hideBanner();
            });

            document.getElementById('cookie-accept-necessary').addEventListener('click', function() {
                self.setConsent('necessary');
                self.hideBanner();
            });

            document.getElementById('cookie-settings').addEventListener('click', function() {
                self.showSettings();
            });
        },

        checkConsentStatus: function() {
            const consent = localStorage.getItem('cookie-consent');
            if (!consent) {
                setTimeout(() => {
                    this.showBanner();
                }, 1000);
            } else {
                this.loadCookies(consent);
            }
        },

        showBanner: function() {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) {
                banner.classList.add('show');
            }
        },

        hideBanner: function() {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) {
                banner.classList.remove('show');
                setTimeout(() => {
                    banner.remove();
                }, 300);
            }
        },

        setConsent: function(type) {
            const consentData = {
                timestamp: new Date().toISOString(),
                type: type,
                version: '1.0'
            };
            localStorage.setItem('cookie-consent', JSON.stringify(consentData));
            this.loadCookies(type);
        },

        loadCookies: function(consentType) {
            if (consentType === 'all' || (typeof consentType === 'object' && consentType.type === 'all')) {
                // Load analytics and marketing cookies
                this.loadAnalytics();
            }
            // Necessary cookies are always loaded
            this.loadNecessaryCookies();
        },

        loadAnalytics: function() {
            // Google Analytics (replace with your tracking ID)
            if (typeof gtag === 'undefined') {
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
                document.head.appendChild(script);

                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'GA_MEASUREMENT_ID');
            }
        },

        loadNecessaryCookies: function() {
            // Load only necessary cookies for website functionality
            console.log('Necessary cookies loaded');
        },

        showSettings: function() {
            // Create settings modal
            const modal = document.createElement('div');
            modal.className = 'cookie-settings-modal';
            
            // Create modal with translation attributes
            const overlay = document.createElement('div');
            overlay.className = 'cookie-settings-overlay';
            
            const content = document.createElement('div');
            content.className = 'cookie-settings-content';
            
            const title = document.createElement('h3');
            title.setAttribute('data-i18n', 'cookie_consent.settings_title');
            
            const necessaryCategory = document.createElement('div');
            necessaryCategory.className = 'cookie-category';
            necessaryCategory.innerHTML = `
                <h4 data-i18n="cookie_consent.necessary_cookies_heading"></h4>
                <p data-i18n="cookie_consent.necessary_cookies_description"></p>
                <label class="cookie-toggle">
                    <input type="checkbox" checked disabled>
                    <span class="slider"></span>
                    <span data-i18n="cookie_consent.always_active"></span>
                </label>
            `;
            
            const analyticsCategory = document.createElement('div');
            analyticsCategory.className = 'cookie-category';
            analyticsCategory.innerHTML = `
                <h4 data-i18n="cookie_consent.analytics_cookies_heading"></h4>
                <p data-i18n="cookie_consent.analytics_cookies_description"></p>
                <label class="cookie-toggle">
                    <input type="checkbox" id="analytics-toggle">
                    <span class="slider"></span>
                    <span data-i18n="cookie_consent.optional"></span>
                </label>
            `;
            
            const actions = document.createElement('div');
            actions.className = 'cookie-actions';
            
            const saveBtn = document.createElement('button');
            saveBtn.id = 'save-settings';
            saveBtn.className = 'btn btn-main';
            saveBtn.setAttribute('data-i18n', 'cookie_consent.save_settings');
            
            const closeBtn = document.createElement('button');
            closeBtn.id = 'close-settings';
            closeBtn.className = 'btn btn-outline-main';
            closeBtn.setAttribute('data-i18n', 'cookie_consent.close');
            
            actions.appendChild(saveBtn);
            actions.appendChild(closeBtn);
            
            content.appendChild(title);
            content.appendChild(necessaryCategory);
            content.appendChild(analyticsCategory);
            content.appendChild(actions);
            
            modal.appendChild(overlay);
            modal.appendChild(content);

            // Add modal CSS
            const modalStyle = document.createElement('style');
            modalStyle.textContent = `
                .cookie-settings-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .cookie-settings-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                }
                .cookie-settings-content {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    position: relative;
                    z-index: 1;
                }
                .cookie-category {
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }
                .cookie-category:last-of-type {
                    border-bottom: none;
                }
                .cookie-toggle {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }
                .cookie-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
            `;
            document.head.appendChild(modalStyle);
            document.body.appendChild(modal);

            // Apply translations to the modal content
            if (window.loadTranslations) {
                const currentLang = localStorage.getItem('selectedLanguage') || 'en';
                // Re-apply translations to the newly created modal elements
                setTimeout(() => {
                    modal.querySelectorAll('[data-i18n]').forEach(element => {
                        const key = element.getAttribute('data-i18n');
                        const translatedText = window.getTranslation ? window.getTranslation(key) : key;
                        if (translatedText !== key) {
                            element.textContent = translatedText;
                        }
                    });
                }, 100);
            }

            // Bind modal events
            const self = this;
            document.getElementById('save-settings').addEventListener('click', function() {
                const analyticsEnabled = document.getElementById('analytics-toggle').checked;
                self.setConsent(analyticsEnabled ? 'all' : 'necessary');
                modal.remove();
                modalStyle.remove();
                self.hideBanner();
            });

            document.getElementById('close-settings').addEventListener('click', function() {
                modal.remove();
                modalStyle.remove();
            });

            modal.querySelector('.cookie-settings-overlay').addEventListener('click', function() {
                modal.remove();
                modalStyle.remove();
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            CookieConsent.init();
        });
    } else {
        CookieConsent.init();
    }

    // Expose globally for manual control
    window.CookieConsent = CookieConsent;
})();