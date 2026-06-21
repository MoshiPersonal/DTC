/* ============================================================
   Dolf Training Center — Interactions
   ============================================================ */
(function () {
  "use strict";
  var T = window.TRANSLATIONS || { en: {}, ar: {} };
  var docEl = document.documentElement;

  // Always load at the top (hash links still scroll into view normally)
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ---------------- i18n ---------------- */
  function setMeta(name, content) {
    var m = document.querySelector('meta[name="' + name + '"]');
    if (m) m.setAttribute("content", content);
  }

  function applyLang(lang) {
    if (!T[lang]) lang = "en";
    var dict = T[lang];
    docEl.lang = lang;
    docEl.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (dict[k] != null) el.textContent = dict[k];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-html");
      if (dict[k] != null) el.innerHTML = dict[k];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-placeholder");
      if (dict[k] != null) el.setAttribute("placeholder", dict[k]);
    });

    if (dict["doc.title"]) document.title = dict["doc.title"];
    if (dict["doc.desc"]) setMeta("description", dict["doc.desc"]);

    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());

    try { localStorage.setItem("dtc-lang", lang); } catch (e) {}
  }

  function hasValue(value) {
    return (
      value !== null &&
      value !== undefined &&
      !(typeof value === 'string' && value.trim() === '') &&
      !(Array.isArray(value) && value.length === 0)
    );
  }

  function setText(selector, text) {
    var el = document.querySelector(selector);
    if (el && hasValue(text)) el.textContent = text;
  }

  function setHTML(selector, html) {
    var el = document.querySelector(selector);
    if (el && hasValue(html)) el.innerHTML = html;
  }

  function setAttr(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el && hasValue(value)) el.setAttribute(attr, value);
  }

  function renderItems(selector, html) {
    var container = document.querySelector(selector);
    if (container && hasValue(html)) container.innerHTML = html;
  }

  function getCurrentLang() {
    return document.documentElement.lang === 'ar' ? 'ar' : 'en';
  }

  function resolveAssetUrl(media, assetPrefix) {
    if (!hasValue(media) || typeof media !== 'object') return '';
    if (typeof media === 'string') return media;
    if (typeof media.url === 'string') {
      return media.url.startsWith('http') ? media.url : assetPrefix.replace(/\/$/, '') + media.url;
    }
    return '';
  }

  function buildNavLinks(items, lang) {
    if (!Array.isArray(items)) return '';
    return items
      .map(function (item, index) {
        var label = lang === 'ar' ? item.labelAr || item.labelEn : item.labelEn || item.labelAr || '';
        var href = item.url || '#';
        return '<li><a class="nav__link' + (index === 0 ? ' is-active' : '') + '" href="' + href + '">' + label + '</a></li>';
      })
      .join('');
  }

  function getSocialIcon(platform) {
    if (!platform || typeof platform !== 'string') return '';
    var key = platform.trim().toLowerCase();
    switch (key) {
      case 'twitter':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 4.01c-.8.35-1.65.58-2.55.69a4.48 4.48 0 0 0 1.96-2.47 8.97 8.97 0 0 1-2.84 1.09 4.47 4.47 0 0 0-7.62 4.07 12.69 12.69 0 0 1-9.22-4.68 4.48 4.48 0 0 0 1.38 5.97 4.42 4.42 0 0 1-2.03-.56v.06a4.47 4.47 0 0 0 3.58 4.38 4.5 4.5 0 0 1-2.02.08 4.48 4.48 0 0 0 4.18 3.1 8.97 8.97 0 0 1-5.56 1.92A8.99 8.99 0 0 1 2 19.54a12.65 12.65 0 0 0 6.86 2.01c8.23 0 12.74-6.82 12.74-12.74v-.58A9.1 9.1 0 0 0 22 4.01z"/></svg>';
      case 'instagram':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>';
      case 'linkedin':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 11v6M8 8v.01M12 17v-4a2 2 0 0 1 4 0v4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
      case 'x':
      case 'twitterx':
      case 'twitter x':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" stroke-width="2.4"/></svg>';
      case 'facebook':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>';
      default:
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>';
    }
  }

  function buildSocialLinks(items) {
    if (!Array.isArray(items)) return '';
    return items
      .filter(function (item) { return item && item.url; })
      .map(function (item) {
        var icon = getSocialIcon(item.platform || '');
        var href = item.url || '#';
        return '<a href="' + href + '" target="_blank" rel="noopener noreferrer" aria-label="' + (item.platform || 'Social Link') + '">' + icon + '</a>';
      })
      .join('');
  }

  function sortByDisplayOrder(items) {
    if (!Array.isArray(items)) return [];
    return items.slice().sort(function (a, b) {
      var aValue = typeof a.displayOrder === 'number' ? a.displayOrder : Number(a.displayOrder) || 0;
      var bValue = typeof b.displayOrder === 'number' ? b.displayOrder : Number(b.displayOrder) || 0;
      return aValue - bValue;
    });
  }

  function buildAboutItems(items) {
    return items
      .map(function (item, index) {
        return (
          '<div class="accordion__item' +
          (index === 0 ? ' is-open' : '') +
          '">' +
          '<button class="accordion__head" aria-expanded="' +
          (index === 0 ? 'true' : 'false') +
          '"><span>' +
          (item.title || '') +
          '</span><svg class="accordion__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
          '<div class="accordion__panel"><div class="accordion__body"><p>' +
          (item.content || '') +
          '</p></div></div></div>'
        );
      })
      .join('');
  }

  function buildProgramItems(items) {
    return items
      .map(function (item) {
        return (
          '<article class="program">' +
          '<img class="program__bg" src="assets/img/program-business.jpg" alt="" loading="lazy" />' +
          '<div class="program__top"><span class="program__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg></span></div>' +
          '<div class="program__content"><h3 class="program__title">' +
          (item.title || '') +
          '</h3><p class="program__desc">' +
          (item.description || '') +
          '</p></div><span class="program__cta" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></article>'
        );
      })
      .join('');
  }

  function buildServiceItems(items) {
    return items
      .map(function (item) {
        return (
          '<li>' +
          '<span class="solutions__check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></span>' +
          '<span>' +
          (item.description ? ' ' + item.description : '') +
          '</span>' +
          '</li>'
        );
      })
      .join('');
  }

  function buildFaqItems(items) {
    return items
      .map(function (item, index) {
        return (
          '<div class="accordion__item' +
          (index === 0 ? ' is-open' : '') +
          '">' +
          '<button class="accordion__head" aria-expanded="' +
          (index === 0 ? 'true' : 'false') +
          '"><span>' +
          (item.question || '') +
          '</span><svg class="accordion__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>' +
          '<div class="accordion__panel"><div class="accordion__body"><p>' +
          (item.answer || '') +
          '</p></div></div></div>'
        );
      })
      .join('');
  }

 async function loadDynamicContent() {
  var config = window.DTC_CONFIG || {};

  var env = {};

  try {
    if (
      typeof import.meta !== 'undefined' &&
      import.meta &&
      import.meta.env
    ) {
      env = import.meta.env;
    }
  } catch (e) {}

  var API_BASE =
    env.VITE_API_URL ||
    config.apiUrl ||
    'http://localhost:3000/api/v1/content';

  var TENANT_CODE =
    (env.VITE_TENANT_CODE ||
      config.tenantCode ||
      'dtc').toLowerCase();

  var assetPrefix =
    env.VITE_ASSET_URL ||
    config.assetUrl ||
    'http://localhost:3000';

  console.log('API_BASE:', API_BASE);
  console.log('TENANT_CODE:', TENANT_CODE);
  console.log('assetPrefix:', assetPrefix);

try {
  if (
    typeof import.meta !== 'undefined' &&
    import.meta &&
    import.meta.env
  ) {
    env = import.meta.env;
  }
} catch (e) {
  env = {};
}

console.log('Environment variables:', env);

var API_BASE =
  env.VITE_API_URL ||
  'http://localhost:3000/api/v1/content';

var TENANT_CODE =
  (env.VITE_TENANT_CODE || 'dtc')
    .toLowerCase();

var assetPrefix =
  env.VITE_ASSET_URL ||
  'http://localhost:3000';
    var path = window.location.pathname.replace(/^\//g, '').replace(/\/$/g, '').trim();
    var slugParam = path ? '&slug=' + encodeURIComponent(path) : '';
    var apiUrl = API_BASE + '?tenantCode=' + encodeURIComponent(TENANT_CODE) + slugParam + '&type=all';

    try {
      var response = await fetch(apiUrl);
      if (!response.ok) return;
      var payload = await response.json();
      var data = payload.data || payload;
      var page = data.page || {};
      var lang = getCurrentLang();

      var hero = page.hero || {};
      setHTML('#heroTitle', lang === 'ar' ? hero.titleAr || hero.titleEn : hero.titleEn || hero.titleAr);
      setText('#heroSubtitle', lang === 'ar' ? hero.subtitleAr || hero.subtitleEn : hero.subtitleEn || hero.subtitleAr);
      setAttr('#heroCtaPrimary', 'href', hero.ctaUrl);
      setText('#heroCtaPrimary span', lang === 'ar' ? hero.ctaTextAr || hero.ctaTextEn : hero.ctaTextEn || hero.ctaTextAr);
      setAttr('#heroCtaSecondary', 'href', hero.secondaryCtaUrl);
      setText('#heroCtaSecondary', lang === 'ar' ? hero.secondaryCtaTextAr || hero.secondaryCtaTextEn : hero.secondaryCtaTextEn || hero.secondaryCtaTextAr);
      var heroImageUrl = resolveAssetUrl(hero.image, assetPrefix);
      if (hasValue(heroImageUrl)) setAttr('#heroImage', 'src', heroImageUrl);

      var layout = data.layout || {};
      var tenant = data.tenant || {};
      var portalBranding = (tenant.branding && tenant.branding.portal) || {};
      var logoEnUrl = resolveAssetUrl(portalBranding.logoEn, assetPrefix);
      var logoArUrl = resolveAssetUrl(portalBranding.logoAr, assetPrefix);
      if (hasValue(logoEnUrl)) setAttr('.brand__logo--full.brand__logo--en', 'src', logoEnUrl);
      if (hasValue(logoArUrl)) setAttr('.brand__logo--full.brand__logo--ar', 'src', logoArUrl);
      if (hasValue(logoEnUrl)) setAttr('.footer__logo--en', 'src', logoEnUrl);
      if (hasValue(logoArUrl)) setAttr('.footer__logo--ar', 'src', logoArUrl);

      var navLinks = (layout.header && layout.header.navLinks) || [];
      if (navLinks.length) {
        renderItems('.nav__list', buildNavLinks(navLinks, lang));
        attachNavLinkCloseListeners();
      }

      var footerSocialLinks = (layout.footer && layout.footer.socialLinks) || [];
      if (footerSocialLinks.length) renderItems('.footer__icons', buildSocialLinks(footerSocialLinks));

      var contactInfo = tenant.contactInfo || {};
      var phone = contactInfo.phone || '';
      var email = contactInfo.email || '';
      var address = lang === 'ar' ? contactInfo.addressAr || contactInfo.addressEn : contactInfo.addressEn || contactInfo.addressAr;
      var phoneNode = document.querySelector('.contact__details a[href^="tel:"]');
      if (phoneNode && hasValue(phone)) {
        phoneNode.setAttribute('href', 'tel:' + phone.replace(/\s+/g, ''));
        phoneNode.textContent = phone;
      }
      var emailNode = document.querySelector('.contact__details a[href^="mailto:"]');
      if (emailNode && hasValue(email)) {
        emailNode.setAttribute('href', 'mailto:' + email);
        emailNode.textContent = email;
      }
      var addressNode = document.querySelector('.contact__details .contact__value[data-i18n="contact.address.value"]');
      if (addressNode && hasValue(address)) {
        addressNode.textContent = address;
      }

      var about = page.about || {};
      var aboutImageUrl = resolveAssetUrl(about.image, assetPrefix);
      if (hasValue(aboutImageUrl)) setAttr('#aboutImage', 'src', aboutImageUrl);
      setHTML('#aboutHeading', lang === 'ar' ? about.headingAr || about.headingEn : about.headingEn || about.headingAr);
      setText('#aboutLead', lang === 'ar' ? about.descriptionAr || about.descriptionEn : about.descriptionEn || about.descriptionAr);

      var aboutItems = (about.additionalSections || []).map(function (item) {
        return {
          title: lang === 'ar' ? item.titleAr || item.titleEn : item.titleEn || item.titleAr,
          content: lang === 'ar' ? item.contentAr || item.contentEn : item.contentEn || item.contentAr,
        };
      });
      if (aboutItems.length) {
        renderItems('#aboutAccordion', buildAboutItems(aboutItems));
        initAccordion(document.getElementById('aboutAccordion'));
      }

      var services = page.servicesContext || {};
      setText('#solutionsHeading', lang === 'ar' ? services.headingAr || services.headingEn : services.headingEn || services.headingAr);
      setText('#solutionsDescription', lang === 'ar' ? services.descriptionAr || services.descriptionEn : services.descriptionEn || services.descriptionAr);

      var serviceItems = sortByDisplayOrder(services.servicesList || []).map(function (service) {
        return {
          title: lang === 'ar' ? service.titleAr || service.titleEn : service.titleEn || service.titleAr,
          description: lang === 'ar' ? service.descriptionAr || service.descriptionEn : service.descriptionEn || service.descriptionAr,
        };
      });
      if (serviceItems.length) {
        renderItems('#solutionsList', buildServiceItems(serviceItems));
      }

      var faqs = page.faqsContext || {};
      var faqItems = sortByDisplayOrder(faqs.faqsList || []).map(function (faq) {
        return {
          question: lang === 'ar' ? faq.questionAr || faq.questionEn : faq.questionEn || faq.questionAr,
          answer: lang === 'ar' ? faq.answerAr || faq.answerEn : faq.answerEn || faq.answerAr,
        };
      });
      if (faqItems.length) {
        renderItems('#faqAccordion', buildFaqItems(faqItems));
        initAccordion(document.getElementById('faqAccordion'));
      }
      setText('#faqHeading', lang === 'ar' ? faqs.headingAr || faqs.headingEn : faqs.headingEn || faqs.headingAr);
      setText('#faqDescription', lang === 'ar' ? faqs.descriptionAr || faqs.descriptionEn : faqs.descriptionEn || faqs.descriptionAr);

      var seo = page.seo || {};
      if (lang === 'ar') {
        if (hasValue(seo.metaTitleAr)) document.title = seo.metaTitleAr;
        if (hasValue(seo.metaDescriptionAr)) setMeta('description', seo.metaDescriptionAr);
      } else {
        if (hasValue(seo.metaTitleEn)) document.title = seo.metaTitleEn;
        if (hasValue(seo.metaDescriptionEn)) setMeta('description', seo.metaDescriptionEn);
      }
    } catch (error) {
      console.warn('Failed to load dynamic DTC content:', error);
    }
  }

  var saved = "en";
  try { saved = localStorage.getItem("dtc-lang") || "en"; } catch (e) {}
  applyLang(saved);
  loadDynamicContent();

  var langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", function () {
      applyLang(docEl.lang === "ar" ? "en" : "ar");
    });
  }

  /* ---------------- Sticky header ---------------- */
  var header = document.querySelector(".header");
  function onScrollHeader() {
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------------- Mobile navigation ---------------- */
  var hamburger = document.getElementById("hamburger");
  var nav = document.getElementById("primary-nav");
  var scrim = document.getElementById("navScrim");

  function openNav() {
    nav.classList.add("is-open");
    hamburger.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add("is-show"); });
    document.body.style.overflow = "hidden";
  }
  function closeNav() {
    nav.classList.remove("is-open");
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    scrim.classList.remove("is-show");
    document.body.style.overflow = "";
    setTimeout(function () { scrim.hidden = true; }, 300);
  }
  if (hamburger) {
    hamburger.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) closeNav(); else openNav();
    });
  }
  if (scrim) scrim.addEventListener("click", closeNav);

  function attachNavLinkCloseListeners() {
    if (!nav) return;
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.innerWidth <= 980) closeNav();
      });
    });
  }

  // Mobile submenu expand
  document.querySelectorAll(".nav__caret").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var item = btn.closest(".nav__item");
      var expanded = item.classList.toggle("is-expanded");
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  });

  // Close drawer when a nav link is clicked (mobile)
  attachNavLinkCloseListeners();

  /* ---------------- Accordions ---------------- */
  function initAccordion(root) {
    if (!root) return;
    var items = root.querySelectorAll(".accordion__item");
    items.forEach(function (item) {
      var head = item.querySelector(".accordion__head");
      head.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        items.forEach(function (i) {
          i.classList.remove("is-open");
          var h = i.querySelector(".accordion__head");
          if (h) h.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          head.setAttribute("aria-expanded", "true");
        }
      });
    });
  }
  var aboutAcc = document.getElementById("aboutAccordion");
  var faqAcc = document.getElementById("faqAccordion");
  initAccordion(aboutAcc);
  initAccordion(faqAcc);

  // Dropdown links that target a specific accordion item
  document.querySelectorAll("[data-acc-target]").forEach(function (link) {
    link.addEventListener("click", function () {
      var target = link.getAttribute("data-acc-target");
      var item = aboutAcc ? aboutAcc.querySelector('.accordion__item[data-acc="' + target + '"]') : null;
      if (item) {
        aboutAcc.querySelectorAll(".accordion__item").forEach(function (i) {
          i.classList.remove("is-open");
          i.querySelector(".accordion__head").setAttribute("aria-expanded", "false");
        });
        item.classList.add("is-open");
        item.querySelector(".accordion__head").setAttribute("aria-expanded", "true");
      }
      if (window.innerWidth <= 980) closeNav();
    });
  });

  /* ---------------- Program expander ---------------- */
  var programs = document.querySelectorAll(".program");
  var canHover = window.matchMedia("(hover: hover)").matches;
  function activateProgram(el) {
    programs.forEach(function (p) { p.classList.toggle("is-active", p === el); });
  }
  programs.forEach(function (el) {
    el.addEventListener("click", function () { activateProgram(el); });
    if (canHover) {
      el.addEventListener("mouseenter", function () { activateProgram(el); });
    }
  });

  /* ---------------- Contact form ---------------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var success = document.getElementById("formSuccess");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateField(field) {
      var input = field.querySelector("input, textarea");
      if (!input) return true;
      var ok = true;
      if (input.hasAttribute("required") && !input.value.trim()) ok = false;
      if (ok && input.type === "email" && input.value.trim() && !emailRe.test(input.value.trim())) ok = false;
      field.classList.toggle("has-error", !ok);
      return ok;
    }

    form.querySelectorAll(".field").forEach(function (field) {
      var input = field.querySelector("input, textarea");
      if (input) {
        input.addEventListener("blur", function () { validateField(field); });
        input.addEventListener("input", function () {
          if (field.classList.contains("has-error")) validateField(field);
        });
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll(".field").forEach(function (field) {
        if (!validateField(field)) valid = false;
      });
      if (!valid) {
        var firstErr = form.querySelector(".field.has-error input, .field.has-error textarea");
        if (firstErr) firstErr.focus();
        return;
      }
      if (success) {
        success.hidden = false;
        form.reset();
        setTimeout(function () { success.hidden = true; }, 6000);
      }
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- Scrollspy ---------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link[href^='#']"));
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = "#" + entry.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- Back to top ---------------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 600) { toTop.hidden = false; requestAnimationFrame(function () { toTop.classList.add("is-show"); }); }
      else { toTop.classList.remove("is-show"); }
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
