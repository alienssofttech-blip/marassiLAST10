(function ($) {
  "use strict";
  document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img:not([data-lazy="false"])');

    images.forEach(image => {
      if (!image.hasAttribute('loading')) {
        image.setAttribute('loading', 'lazy');
      }
      if (!image.hasAttribute('decoding')) {
        image.setAttribute('decoding', 'async');
      }
    });

  });
   // ==========================================
  //      Language Switching Implementation
  // ==========================================
  let translations = {};
  const defaultLang = 'ar';
  const rtlStylesheetId = 'rtl-stylesheet';
  const SUPPORT_EMAIL = 'support@dmarassils.com';
  const CONTACT_PAGE_URL = 'contact.html';

  // Function to get nested translation
  function getNestedTranslation(key, langData) {
    const keys = key.split('.');
    let result = langData;
    for (let i = 0; i < keys.length; i++) {
      if (result && typeof result === 'object' && result.hasOwnProperty(keys[i])) {
        result = result[keys[i]];
      } else {
        return null; // Key not found
      }
    }
    return result;
  }

  function rerouteSupportEmail(root = document.body) {
    if (!root) {
      return;
    }

    const scope = root instanceof Node ? root : document.body;

    scope.querySelectorAll(`a[href*="${SUPPORT_EMAIL}"]`).forEach(anchor => {
      anchor.setAttribute('href', CONTACT_PAGE_URL);
      anchor.setAttribute('data-email-link', 'contact');
      if (!anchor.textContent.trim()) {
        anchor.textContent = SUPPORT_EMAIL;
      }
    });

    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node || !node.nodeValue || !node.nodeValue.includes(SUPPORT_EMAIL)) {
          return NodeFilter.FILTER_REJECT;
        }
        const parentElement = node.parentElement;
        if (!parentElement) {
          return NodeFilter.FILTER_REJECT;
        }
        const parentTag = parentElement.tagName;
        if (parentTag === 'SCRIPT' || parentTag === 'STYLE') {
          return NodeFilter.FILTER_REJECT;
        }
        if (parentElement.closest('a')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodesToProcess = [];
    while (walker.nextNode()) {
      nodesToProcess.push(walker.currentNode);
    }

    nodesToProcess.forEach(textNode => {
      const parent = textNode.parentNode;
      if (!parent) {
        return;
      }

      const fragments = textNode.nodeValue.split(SUPPORT_EMAIL);
      const fragment = document.createDocumentFragment();

      fragments.forEach((part, index) => {
        if (part) {
          fragment.appendChild(document.createTextNode(part));
        }
        if (index < fragments.length - 1) {
          const emailAnchor = document.createElement('a');
          emailAnchor.href = CONTACT_PAGE_URL;
          emailAnchor.textContent = SUPPORT_EMAIL;
          emailAnchor.classList.add('contact-email-link');
          emailAnchor.setAttribute('data-email-link', 'contact');
          fragment.appendChild(emailAnchor);
        }
      });

      parent.replaceChild(fragment, textNode);
    });
  }

  function setupSupportEmailObserver() {
    if (!('MutationObserver' in window)) {
      return;
    }

    const observer = new MutationObserver(mutations => {
      let shouldProcess = false;

      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue.includes(SUPPORT_EMAIL)) {
            shouldProcess = true;
            if (node.parentNode) {
              rerouteSupportEmail(node.parentNode);
            }
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.querySelectorAll) {
              if (element.textContent && element.textContent.includes(SUPPORT_EMAIL)) {
                shouldProcess = true;
                rerouteSupportEmail(element);
              } else if (element.querySelector(`a[href*="${SUPPORT_EMAIL}"]`)) {
                shouldProcess = true;
                rerouteSupportEmail(element);
              }
            }
          }
        });
      });

      if (shouldProcess) {
        rerouteSupportEmail();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function setupFooterObserver() {
    const footerContainer = document.getElementById('footer');
    if (!footerContainer || !('MutationObserver' in window)) {
      return;
    }

    const invokeFooterEnhancements = target => {
      rerouteSupportEmail(target);
      if (window.AOS) {
        if (typeof window.AOS.refreshHard === 'function') {
          window.AOS.refreshHard();
        } else if (typeof window.AOS.refresh === 'function') {
          window.AOS.refresh();
        }
      }
    };

    if (footerContainer.children.length > 0) {
      invokeFooterEnhancements(footerContainer);
    }

    const observer = new MutationObserver(mutations => {
      const hasAddedNodes = mutations.some(mutation => mutation.addedNodes && mutation.addedNodes.length > 0);
      if (hasAddedNodes) {
        invokeFooterEnhancements(footerContainer);
      }
    });

    observer.observe(footerContainer, {
      childList: true,
      subtree: true
    });
  }

  // Function to load translations and apply them
  window.loadTranslations = async function (lang) {
    try {
      const response = await fetch(`assets/lang/${lang}.json`);
      translations = await response.json();

      // Apply translations to text content
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translatedText = getNestedTranslation(key, translations);
        if (translatedText !== null) {
          element.textContent = translatedText;
        }
      });

      // Apply translations to attributes
      document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translatedText = getNestedTranslation(key, translations);
        if (translatedText !== null) {
          element.setAttribute('placeholder', translatedText);
        }
      });

      document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        const translatedText = getNestedTranslation(key, translations);
        if (translatedText !== null) {
          element.setAttribute('alt', translatedText);
        }
      });

      document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const translatedText = getNestedTranslation(key, translations);
        if (translatedText !== null) {
          element.setAttribute('title', translatedText);
        }
      });

      document.querySelectorAll('[data-i18n-content]').forEach(element => {
        const key = element.getAttribute('data-i18n-content');
        const translatedText = getNestedTranslation(key, translations);
        if (translatedText !== null) {
          element.setAttribute('content', translatedText);
        }
      });

      rerouteSupportEmail();

      // Set HTML direction and language
      const htmlElement = document.documentElement;
      htmlElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      htmlElement.setAttribute('lang', lang);

      // Dynamically load/unload RTL stylesheet
      let rtlLink = document.getElementById(rtlStylesheetId);
      if (lang === 'ar') {
        if (!rtlLink) {
          rtlLink = document.createElement('link');
          rtlLink.id = rtlStylesheetId;
          rtlLink.rel = 'stylesheet';
          rtlLink.href = 'assets/css/main.min.css';
          document.head.appendChild(rtlLink);
        }
      } else {
        if (rtlLink) {
          rtlLink.remove();
        }
      }

      // Update language dropdown display
      updateLanguageDropdown(lang);

      // Store language preference
      localStorage.setItem('selectedLanguage', lang);

      // Trigger custom event for other scripts to listen to
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));

    } catch (error) {
      console.error('Error loading translations:', error);
    }
  };

  // Helper function to get translation for JS strings
  window.getTranslation = function(key) {
    return getNestedTranslation(key, translations) || key; // Fallback to key if not found
  };

  // Function to update language dropdown display
  function updateLanguageDropdown(selectedLang) {
    const selectedText = document.querySelector('.selected-text');
    if (selectedText) {
      const langText = selectedLang === 'ar' ? 'العربية' : 'English';
      const flagSrc = selectedLang === 'ar' ? 'https://flagcdn.com/w40/sa.png' : 'assets/images/thumbs/flag1.png';
      
      selectedText.innerHTML = `
        <span class="tw-w-25-px tw-h-25-px border border-white border-2 rounded-circle common-shadow d-flex justify-content-center align-items-center">
          <img src="${flagSrc}" alt="" class="w-100 h-100 object-fit-cover rounded-circle">
        </span>
        ${langText}
      `;
    }
  }
  // ==========================================
  //      Start Document Ready function
  // ==========================================
  $(document).ready(function () {
    
// Language switching event listeners
    $(document).on('click', '.lang-dropdown a[data-lang]', function(e) {
      e.preventDefault();
      const selectedLang = $(this).data('lang');
      window.loadTranslations(selectedLang);
    });

 
    
    // Initial language load on page ready
    const savedLanguage = localStorage.getItem('selectedLanguage') || defaultLang;
    window.loadTranslations(savedLanguage);

  // ============== Mobile Nav Menu Dropdown Js Start =======================
  function toggleSubMenu() {
    if ($(window).width() <= 991) {
      $('.has-submenu').off('click').on('click', function () {
        $(this).toggleClass('active').siblings('.has-submenu').removeClass('active').find('.nav-submenu').slideUp(300);
        $(this).find('.nav-submenu').stop(true, true).slideToggle(300);
      });
    } else {
      $('.has-submenu').off('click'); 
    }
  }

  toggleSubMenu();
  $(window).resize(toggleSubMenu);
  // ============== Mobile Nav Menu Dropdown Js End =======================
    
  // ===================== Scroll Back to Top Js Start ======================
  var progressPath = document.querySelector('.progress-wrap path');
  var pathLength = progressPath.getTotalLength();
  progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
  progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
  progressPath.style.strokeDashoffset = pathLength;
  progressPath.getBoundingClientRect();
  progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';
  var updateProgress = function () {
    var scroll = $(window).scrollTop();
    var height = $(document).height() - $(window).height();
    var progress = pathLength - (scroll * pathLength / height);
    progressPath.style.strokeDashoffset = progress;
  }
  updateProgress();
  $(window).scroll(updateProgress);
  var offset = 50;
  var duration = 550;
  jQuery(window).on('scroll', function() {
    if (jQuery(this).scrollTop() > offset) {
      jQuery('.progress-wrap').addClass('active-progress');
    } else {
      jQuery('.progress-wrap').removeClass('active-progress');
    }
  });
  jQuery('.progress-wrap').on('click', function(event) {
    event.preventDefault();
    jQuery('html, body').animate({scrollTop: 0}, duration);
    return false;
  })
  // ===================== Scroll Back to Top Js End ======================

  
// ========================== add active class to navbar menu current page Js Start =====================
  function dynamicActiveMenuClass(selector) {
    const menus = typeof selector === 'string' || selector instanceof String ? $(selector) : $(selector || []);

    function normalizePath(path) {
      const rawPath = (path || '').trim();

      if (!rawPath) {
        return 'index.html';
      }

      if (rawPath[0] === '#') {
        return null;
      }

      // Ignore external links (mailto:, tel:, http(s) when pointing to other origins, etc.)
      if (/^[a-zA-Z]+:/.test(rawPath) && rawPath.indexOf(window.location.origin) !== 0) {
        return null;
      }

      let normalized = rawPath;

      // Remove the current origin for absolute URLs pointing to this site
      if (normalized.indexOf(window.location.origin) === 0) {
        normalized = normalized.slice(window.location.origin.length);
      }

      normalized = normalized.split('?')[0].split('#')[0];
      normalized = normalized.replace(/^\.+\//, '');
      normalized = normalized.replace(/^\/+/, '').replace(/\/+$/, '');

      if (!normalized) {
        return 'index.html';
      }

      if (!normalized.endsWith('.html')) {
        normalized += '.html';
      }

      return normalized;
    }

    const currentPath = normalizePath(window.location.pathname) || 'index.html';

    menus.each(function () {
      const menu = $(this);

      menu.find('li').removeClass('activePage');

      menu.find('li').each(function () {
        const anchor = $(this).find('a').first();

        if (!anchor.length) {
          return;
        }

        const normalizedHref = normalizePath(anchor.attr('href'));

        if (normalizedHref && normalizedHref === currentPath) {
          $(this).addClass('activePage');
        }
      });

      menu.children('li').each(function () {
        if ($(this).find('.activePage').length) {
          $(this).addClass('activePage');
        }
      });

      if (!menu.find('li.activePage').length && currentPath === 'index.html') {
        menu.find('li.nav-menu__item').first().addClass('activePage');
      }
    });
  }

  const navigationLists = '.header .nav-menu, .mobile-menu__menu .nav-menu';
  if ($(navigationLists).length) {
    dynamicActiveMenuClass(navigationLists);
  }
// ========================== add active class to navbar menu current page Js End =====================


// ========================== Set Language in dropdown Js Start =================================
$('.lang-dropdown li').each(function () {
  var thisItem = $(this); 

  thisItem.on('click', function () {
    const listText = thisItem.text().trim(); // Get the text of the clicked item
    const listImageSrc = thisItem.find('img').attr('src'); // Get the image source of the clicked item

    // Set the selected text and image
    const selectedTextContainer = thisItem.closest('.group-item').find('.selected-text');
    selectedTextContainer.contents().last().replaceWith(listText); // Update the text (after the image)
    selectedTextContainer.find('img').attr('src', listImageSrc); // Update the image
  });
});
// ========================== Set Language in dropdown Js End =================================

  
// ========================== Add Attribute For Bg Image Js Start ====================
$(".bg-img").css('background', function () {
  var bg = ('url(' + $(this).data("background-image") + ')');
  return bg;
});
// ========================== Add Attribute For Bg Image Js End =====================


// ============================ Banner Slider Js Start ===========================
var bannerMenu = ['Air Freight', 'Ocean Freight', 'Land Transport']
var bannerSwiper = new Swiper ('.banner-slider', {
  // loop: true,
  speed: 5000,
  slidesPerView: 1,
  grabCursor: true,
  loop: true,
  effect: 'fade',
  autoplay: {
    delay: 4500,
    disableOnInteraction: false, 
  },
  pagination: {
    el: '.banner-pagination',
    clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + (bannerMenu[index]) + '</span>';
      },
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

// Stop
$('.banner-slider').on('mouseenter', function() {
  bannerSwiper.autoplay.stop();
});

// Start
$('.banner-slider').on('mouseleave', function() {
  bannerSwiper.autoplay.start();
});
// ============================ Banner Slider Js End ===========================


// ============================ Banner Slider Js Start ===========================
var bannerTwoMenu = ['Air Freight', 'Ocean Freight', 'Land Transport']
var bannerTwoSwiper = new Swiper ('.banner-two-slider', {
  loop: true,
  speed: 800,
  slidesPerView: 1,
  grabCursor: true,
	effect: 'fade',
  loop: true,
  autoplay: {
    delay: 3500,
    disableOnInteraction: false, 
  },
  pagination: {
    el: '.banner-two-pagination',
    clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + (bannerMenu[index]) + '</span>';
      },
  },

  // Navigation arrows
  navigation: {
    nextEl: '.banner-two-swiper-button-next',
    prevEl: '.banner-two-swiper-button-prev',
  },
});

// Stop
$('.banner-two-slider').on('mouseenter', function() {
  bannerTwoSwiper.autoplay.stop();
});

// Start
$('.banner-two-slider').on('mouseleave', function() {
  bannerTwoSwiper.autoplay.start();
});
// ============================ Banner Slider Js End ===========================


// ============================ AOS Js Start ===========================
AOS.init();
// ============================ AOS Js End ===========================


// ============================ Features Item Js Start ===========================
$('.features-item').on('mouseenter', function () {
  $('.features-item').removeClass('bg-white common-shadow-two');
  $(this).addClass('bg-white common-shadow-two');
});
// ============================ Features Item Js End ===========================


// ============================ Animated Radial Progress Bar Js Start ===========================
$('svg.radial-progress').each(function( index, value ) { 
  $(this).find($('circle.complete')).removeAttr( 'style' );
});
// ============================ Animated Radial Progress Bar Js End ===========================


// ========================= Counter Up Js Start ===================
const counterUp = window.counterUp.default;

const callback = (entries) => {
  entries.forEach((entry) => {
    const el = entry.target;
    if (entry.isIntersecting && !el.classList.contains('is-visible')) {
      counterUp(el, {
        duration: 2000,
        delay: 16,
      });
      el.classList.add('is-visible');
    }
  });
};
const IO = new IntersectionObserver(callback, { threshold: 1 });


// Counter
const counter = document.querySelector('.counter');
if (counter) {
  IO.observe(counter);
}
// ========================= Counter Up Js End ===================


// ========================= Add Class To transport way item Js Start ===================
$('.how-it-work-item').on('mouseenter', function () {
  $('.how-it-work-item').find('.how-it-work-item__icon').removeClass('bg-main-two-600');
  $(this).find('.how-it-work-item__icon').addClass('bg-main-two-600');
});
// ========================= Add Class To transport way item Js End ===================


// ========================= magnific Popup Js Start =====================
$('.play-button').magnificPopup({
  type:'iframe',
  removalDelay: 300,
  mainClass: 'mfp-fade',
});
// ========================= magnific Popup Js End =====================


// ================================= Project slider Start =========================
var projectSlider = new Swiper(".project-slider", {
  slidesPerView: 4,
  loop: true,
  spaceBetween: 30,
  grabCursor: true,
  speed: 1500,
  loop: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".project-pagination",
    clickable: true,
  },
  breakpoints: {
    300: {
      slidesPerView: 1,
    },
    575: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 3,
    },
    1400: {
      slidesPerView: 4,
    },
  },
});
// ================================= Project slider Start =========================


// ========================= Add Class To location item Js Start ===================
$('.location-item').on('mouseenter', function () {
  $('.location-item').find('.location-item__card').addClass('invisible opacity-0');
  $(this).find('.location-item__card').removeClass('invisible opacity-0');
});
// ========================= Add Class To location item Js End ===================


// ================================= Testimoanials slider Start =========================
var testiSwiper = new Swiper(".testimonials-slider", {
  grabCursor: true,
  effect: "creative",
  speed: 1500,
  autoplay: {
    delay: 1000,
    disableOnInteraction: false, 
  },
  loop: true,
  creativeEffect: {
    prev: {
      shadow: true,
      translate: ["-20%", 0, -1],
    },
    next: {
      translate: ["100%", 0, 0],
    },
  },
});

// Stop
$('.testimonials-slider').on('mouseenter', function() {
  testiSwiper.autoplay.stop();
});

// Start
$('.testimonials-slider').on('mouseleave', function() {
  testiSwiper.autoplay.start();
});
// ================================= Testimoanials slider Start =========================


// ================================= brand slider Start =========================
var brandSliderOne = new Swiper('.brand-slider', {
  autoplay: {
    delay: 2000,
    disableOnInteraction: false
  },
  speed: 1500,
  grabCursor: true,
  loop: true,
  slidesPerView: 5,
  breakpoints: {
      0: { // <400px show 1
          slidesPerView: 1,
      },
      400: {
          slidesPerView: 2,
      },
      768: {
          slidesPerView: 3,
      },
      992: {
          slidesPerView: 4,
      },
      1200: {
          slidesPerView: 5,
      },
  }
});
// ================================= brand slider End =========================

// ================================= brand slider Start =========================
var brandSlider = new Swiper('.brand-three-slider', {
  autoplay: {
    delay: 2000,
    disableOnInteraction: false
  },
  speed: 1500,
  grabCursor: true,
  loop: true,
  slidesPerView: 5,
  breakpoints: {
      300: {
          slidesPerView: 2,
      },
      768: {
          slidesPerView: 3,
      },
      992: {
          slidesPerView: 4,
      },
      1200: {
          slidesPerView: 5,
      },
  }
});
// ================================= brand slider End =========================

// ================================= Brand Two slider Start =========================
var brandTwoSlider = new Swiper('.brand-two-slider', {
  autoplay: {
    delay: 2000,
    disableOnInteraction: false
  },
  autoplay: false,
  speed: 1500,
  grabCursor: true,
  loop: true,
  slidesPerView: 7,
  breakpoints: {
      300: {
          slidesPerView: 2,
      },
      575: {
          slidesPerView: 3,
      },
      768: {
          slidesPerView: 4,
      },
      992: {
          slidesPerView: 5,
      },
      1200: {
          slidesPerView: 6,
      },
      1400: {
          slidesPerView: 7,
      },
  }
});
// ================================= Brand Two slider End =========================

// ========================= Blog item hover Js Start ===================
$('.blog-item').on('mouseenter', function () {
  $('.blog-item').find('.blog-date').addClass('bg-main-600').removeClass('bg-main-two-600');
  $('.blog-item').find('.blog-tag').addClass('bg-main-two-600').removeClass('bg-main-600');

  $(this).find('.blog-date').removeClass('bg-main-600').addClass('bg-main-two-600');
  $(this).find('.blog-tag').removeClass('bg-main-two-600').addClass('bg-main-600');
});
// ========================= Blog item hover Js End ===================


// ========================= Transport Way Js Start ===================
$('.transport-way-item').on('mouseenter', function () {
  $('.transport-way-item').find('.transport-way-item__icon').removeClass('bg-main-two-600');
  $('.transport-way-item').find('.transport-way-item__content').removeClass('border-main-two-600').addClass('border-neutral-50 ');

  $(this).find('.transport-way-item__icon').addClass('bg-main-two-600');
  $(this).find('.transport-way-item__content').removeClass('border-neutral-50').addClass('border-main-two-600');
});
// ========================= Transport Way Js End ===================


// ================================= Project slider Start =========================
var teamSlider = new Swiper(".team-slider", {
  slidesPerView: 5,
  loop: true,
  spaceBetween: 30,
  grabCursor: true,
  speed: 1500,
  loop: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  autoplay: false,
  pagination: {
    el: ".team-pagination",
    clickable: true,
  },
  breakpoints: {
    300: {
      slidesPerView: 1,
    },
    575: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 3,
    },
    1200: {
      slidesPerView: 4,
    },
    1400: {
      slidesPerView: 5,
    },
  },
});
// ================================= Project slider Start =========================


// ================================= Project slider Start =========================
var testimonialsTwoSlider = new Swiper(".testimonials-two-slider", {
  slidesPerView: 3,
  loop: true,
  spaceBetween: 30,
  grabCursor: true,
  speed: 1500,
  loop: true,
  centerMode: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  autoplay: false,
  pagination: {
    el: ".project-pagination",
    clickable: true,
  },
  // Navigation arrows
  navigation: {
    nextEl: '.testimonials-two-button-next',
    prevEl: '.testimonials-two-button-prev',
  },
  breakpoints: {
    300: {
      slidesPerView: 1,
    },
    575: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
  },
});
// ================================= Project slider Start =========================

// ================================= Marquee slider Start =========================
  if ($(".marquee").length) {
    $('.marquee').marquee({
        speed: 100,
        gap: 0,
        delayBeforeStart: 0,
        direction: $('html').attr('dir') === 'rtl' ? 'right' : 'left',
        duplicated: true,
        pauseOnHover: true,
        startVisible:true,
    });
  }
// ================================= Marquee slider End =========================

// ================================ Projects page js start =================================
  $('.project-gallery-link').magnificPopup({
    type: 'image',
    gallery: {
      enabled: true
    },
  });
// ================================ Projects page js End =================================


// ================================ Floating Progress js start =================================
  const progressContainers = document.querySelectorAll('.progress-container');

  function setPercentage(progressContainer) {
      const percentage = progressContainer.getAttribute('data-percentage') + '%';
      
      const progressEl = progressContainer.querySelector('.progress');
      const percentageEl = progressContainer.querySelector('.percentage');
      
      progressEl.style.width = percentage;
      percentageEl.innerText = percentage;
      percentageEl.style.insetInlineStart = percentage;
  }

  // Intersection Observer to trigger progress animation when section is in view
  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              // Element is in view, start the progress animation
              const progressContainer = entry.target;
              setPercentage(progressContainer);
              progressContainer.querySelector('.progress').classList.remove('active');
              progressContainer.querySelector('.percentage').classList.remove('active');
              observer.unobserve(progressContainer); // Stop observing once animation is triggered
          }
      });
  }, {
      threshold: 0.5 // Adjust this value as needed (0.5 means half the section needs to be visible)
  });

  // Start observing all progress containers
  progressContainers.forEach(progressContainer => {
      observer.observe(progressContainer);
});
// ================================ Floating Progress js End =================================

    
// ================================ Testimonials three slider js start =================================
  var testimonialsThreeThumbsSlider = new Swiper(".testimonials-three-thumbs-slider", {
    slidesPerView: 1,
    loop: true,
    freeMode: true,
    watchSlidesProgress: true,
    grabCursor: true,
    speed: 2500,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false, 
    },
    autoplay: false,
  });
  
  var testimonialsThreeContentSlider = new Swiper(".testimonials-three-content-slider", {
    slidesPerView: 1,
    loop: true,
    effect: "creative",
    creativeEffect: {
      prev: {
        shadow: true,
        translate: ["-20%", 0, -1],
      },
      next: {
        translate: ["100%", 0, 0],
      },
    },
    grabCursor: true,
    speed: 2500,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false, 
    },
    autoplay: false,
    navigation: {
      nextEl: ".testimonials-three-btn-next",
      prevEl: ".testimonials-three-btn-prev",
    },
    thumbs: {
      swiper: testimonialsThreeThumbsSlider,
    },
  });
// ================================ Testimonials three slider js End =================================


// ========================= Counter Three section Js Start ===================
$('.counter-three-item').on('mouseenter', function () {
  $('.counter-three-item').removeClass('bg-main-600');
  $('.counter-three-item').find('.hover-text').removeClass('text-white');

  $(this).addClass('bg-main-600');
  $(this).find('.hover-text').addClass('text-white');
});
// ========================= Counter Three section Js End ===================

// ========================= Service Three Js End ===================
var serviceThreeSlider = new Swiper(".service-three-slider", {
  slidesPerView: 3,
  loop: true,
  spaceBetween: 30,
  grabCursor: true,
  speed: 1500,
  loop: true,
  centerMode: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".project-pagination",
    clickable: true,
  },
  // Navigation arrows
  navigation: {
    nextEl: '.service-three-button-next',
    prevEl: '.service-three-button-prev',
  },
  breakpoints: {
    300: {
      slidesPerView: 1,
    },
    575: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
  },
});
// ========================= Service Three Js End ===================

// ========================= Blog Three Js End ===================
var blogThreeSlider = new Swiper(".blog-three-slider", {
  slidesPerView: 3,
  loop: true,
  spaceBetween: 30,
  grabCursor: true,
  speed: 1500,
  loop: true,
  centerMode: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".project-pagination",
    clickable: true,
  },
  // Navigation arrows
  navigation: {
    nextEl: '.blog-three-button-next',
    prevEl: '.blog-three-button-prev',
  },
  breakpoints: {
    300: {
      slidesPerView: 1,
    },
    575: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
  },
});
// ========================= Blog Three Js End ===================



// ========================= Banner Four Js Start ===================
const bannerFourSlider = new Swiper('.banner-four-active', {
  // Optional parameters
  speed:1500,
  loop: true,
  slidesPerView: 1,
  autoplay: true,
  effect:'fade',
  breakpoints: {
    '1600': {
      slidesPerView:1,
    },
    '1400': {
      slidesPerView:1,
    },
    '1200': {
      slidesPerView:1,
    },
    '992': {
      slidesPerView: 1,
    },
    '768': {
      slidesPerView: 1,
    },
    '576': {
      slidesPerView: 1,
    },
    '0': {
      slidesPerView: 1,
    },

    a11y: false,
  },
  // Navigation arrows
  navigation: {
    nextEl: '.banner-slider-next',
    prevEl: '.banner-slider-prev',
  },
});
// ========================= Banner Four Js End ===================


// ========================= Feature Four Js Start ===================
var featureFourSlider = new Swiper(".feature-four-active", {
  slidesPerView: 3,
  loop: true,
  spaceBetween: 30,
  speed: 1500,
  loop: true,
  // Navigation arrows
  navigation: {
    nextEl: '.feature-slider-next',
    prevEl: '.feature-slider-prev',
  },
  breakpoints: {
    300: {
      slidesPerView: 1,
    },
    575: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
  },
});
// ========================= Feature Four Js End ===================


// ========================= Service Four Js Start ===================
var serviceFourSlider = new Swiper(".service-four-active", {
  slidesPerView: 3,
  loop: true,
  spaceBetween: 30,
  speed: 1500,
  dots: false,
  loop: true,
  centeredSlides: true,
  breakpoints: {
    300: {
      slidesPerView: 1,
    },
    575: {
      slidesPerView: 1,
    },
    992: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
  },
  // pagination dots
  pagination: {
    el: ".service-four-dots",
    clickable: true,
  },
});
// ========================= Service Four Js End ===================



// ========================= Portfolio Three Js End ===================
var portfolioFourSlider = new Swiper(".portfolio-four-active", {
  slidesPerView: 3,
  loop: true,
  spaceBetween: 30,
  speed: 1500,
  loop: true,
  centeredSlides: true,
  breakpoints: {
    300: {
      slidesPerView: 1,
    },
    575: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
  },
  navigation: {
    nextEl: ".portfolio-four-next",
    prevEl: ".portfolio-four-prev",
  },
});
// ========================= Portfolio Three Js End ===================



// ========================= Brand Three Js Start ===================
var slider = new Swiper('.brand-four-active', {
  slidesPerView: 5,
  spaceBetween: 40,
  loop: true,
  autoplay:true,
  centeredSlides: true,
  breakpoints: {
    '1400': {
      slidesPerView: 5,
    },
    '1200': {
      slidesPerView: 5,
    },
    '992': {
      slidesPerView: 4,
    },
    '768': {
      slidesPerView: 3,
    },
    '576': {
      slidesPerView: 2,
    },
    '0': {
      slidesPerView: 2,
    },
  },
});
// ========================= Brand Three Js End ===================


// ========================= Banner Five Js Start ===================
const bannerFiveSlider = new Swiper('.banner-five-active', {
  // Optional parameters
  speed:2000,
  loop: true,
  slidesPerView: 1,
  autoplay: true,
  effect:'slide',
  breakpoints: {
    '1600': {
      slidesPerView:1,
    },
    '1400': {
      slidesPerView:1,
    },
    '1200': {
      slidesPerView:1,
    },
    '992': {
      slidesPerView: 1,
    },
    '768': {
      slidesPerView: 1,
    },
    '576': {
      slidesPerView: 1,
    },
    '0': {
      slidesPerView: 1,
    },

    a11y: false,
  },
  // Navigation arrows
  navigation: {
    nextEl: '.banner-five-next',
    prevEl: '.banner-five-prev',
  },
  // pagination dots
  pagination: {
    el: ".banner-five-dots",
    clickable:true,
  },
});
// Stop
// $('.banner-five-active').on('mouseenter', function() {
//   bannerFiveSlider.autoplay.stop();
// });

// // Start
// $('.banner-five-active').on('mousemove', function() {
//   bannerFiveSlider.autoplay.start();
// });
// let autoplayRestarted = false;

// $('.banner-five-active')
//   .on('mouseenter', function () {
//     bannerFiveSlider.autoplay.stop();
//     autoplayRestarted = false;
//   })
//   .on('mousemove', function () {
//     if (!autoplayRestarted) {
//       // restart once after first movement
//       bannerFiveSlider.autoplay.start();
//       autoplayRestarted = true;
//     }
//   })
//   .on('mouseleave', function () {
//     // (optional) stop again when leaving, or keep running
//     bannerFiveSlider.autoplay.start(); // or stop(); depending on what you prefer
//   });
// ========================= Banner Five Js End ===================




});
  // ==========================================
  //      End Document Ready function
  // ==========================================

// ========================= Preloader Js Start =====================
  $(document).ready(function() {
    $('.preloader').fadeOut();
  });
// ========================= Preloader Js End ========================

    // ========================= Header Sticky Js Start ==============
    $(window).on('scroll', function() {
      if ($(window).scrollTop() >= 460) {
        $('.header').addClass('fixed-header');
      }
      else {
          $('.header').removeClass('fixed-header');
      }
    }); 
    // ========================= Header Sticky Js End===================

  function initializeSupportEmailFeatures() {
    rerouteSupportEmail();
    setupSupportEmailObserver();
    setupFooterObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupportEmailFeatures);
  } else {
    initializeSupportEmailFeatures();
  }

})(jQuery);
