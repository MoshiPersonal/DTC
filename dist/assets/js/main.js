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
    if (!hasValue(media)) return '';
    if (typeof media === 'string') {
      return media.startsWith('http') ? media : assetPrefix.replace(/\/$/, '') + media;
    }
    if (typeof media === 'object' && typeof media.url === 'string') {
      return media.url.startsWith('http') ? media.url : assetPrefix.replace(/\/$/, '') + media.url;
    }
    return '';
  }

  function normalizeHash(hash) {
    if (!hash) return '#home';
    var value = String(hash).trim();
    if (value === '#') return '#home';
    var idx = value.indexOf('#');
    if (idx >= 0) {
      value = value.slice(idx);
    }
    if (!value) return '#home';
    return value;
  }

  function getNavLinks() {
    return Array.prototype.slice.call(document.querySelectorAll('.nav__link[href*="#"]'));
  }

  function setActiveNavLink(hash) {
    hash = normalizeHash(hash);
    var links = getNavLinks();
    var found = false;

    links.forEach(function (link) {
      var href = normalizeHash(link.getAttribute('href'));
      var active = href === hash;
      link.classList.toggle('is-active', active);
      if (active) found = true;
    });

    if (!found) {
      var defaultLink = document.querySelector('.nav__link[href="#home"]') || document.querySelector('.nav__list li:first-child .nav__link');
      if (defaultLink) defaultLink.classList.add('is-active');
    }
  }

  function scrollToHashTarget(hash) {
    hash = normalizeHash(hash);
    var target = document.querySelector(hash);
    if (!target) return;
    window.requestAnimationFrame(function () {
      window.scrollTo({ top: target.offsetTop, behavior: 'auto' });
    });
  }

  function buildNavLinks(items, lang) {
    if (!Array.isArray(items)) return '';
    var currentHash = normalizeHash(window.location.hash || '#home');

    return items
      .map(function (item) {
        var label = lang === 'ar' ? item.labelAr || item.labelEn : item.labelEn || item.labelAr || '';
        var href = item.url || '#home';
        var isActive = normalizeHash(href) === currentHash;

        return '<li><a class="nav__link' + (isActive ? ' is-active' : '') + '" href="' + href + '">' + label + '</a></li>';
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

  function getConfig() {
    var config = window.DTC_CONFIG || {};
    var env = {};

    try {
      if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
        env = import.meta.env;
      }
      if (window.__ENV__) {
        env = Object.assign({}, env, window.__ENV__);
      }
    } catch (e) {}

    return {
      apiUrl: env.VITE_API_URL || config.apiUrl || window.location.origin + '/api/v1/content',
      assetUrl: env.VITE_ASSET_URL || config.assetUrl || window.location.origin,
      tenantCode: (env.VITE_TENANT_CODE || config.tenantCode || 'dtc').toLowerCase(),
      lmsApiUrl: env.VITE_LMS_API_URL || config.lmsApiUrl || '',
      lmsToken: env.VITE_LMS_TOKEN || config.lmsToken || '',
      lmsOrg: env.VITE_LMS_ORG || config.lmsOrg || '',
      lmsCourseShortname: env.VITE_LMS_COURSE_SHORTNAME || config.lmsCourseShortname || 'All',
      lmsCourseUrlTemplate: env.VITE_LMS_COURSE_URL_TEMPLATE || config.lmsCourseUrlTemplate || config.courseUrlTemplate || ''
    };
  }

  function buildLmsProgramCards(items, lang, courseUrlTemplate, assetPrefix) {
    if (!Array.isArray(items) || items.length === 0) return '';

    // Render all items into a track; the slider will show 4 at a time.
    return items.map(function (item) {
      var title = lang === 'ar' ? (item.fullname_ar || item.fullname || '') : (item.fullname || item.fullname_ar || '');
      var imageUrl = resolveAssetUrl(item.courseimage || (item.overviewfiles && item.overviewfiles[0] && item.overviewfiles[0].fileurl), assetPrefix);
      var imageAlt = title || 'Training Program';
      var courseId = item.id;
      var courseHref = courseUrlTemplate ? courseUrlTemplate.replace('{courseId}', courseId) : '#';

      return (
        '<article class="program program--compact">' +
        (imageUrl ? '<img class="program__bg" src="' + imageUrl + '" alt="' + imageAlt + '" loading="lazy" />' : '') +
        '<div class="program__content">' +
          '<h3 class="program__title">' +
            '<a href="' + courseHref + '" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">' + title + '</a>' +
          '</h3>' +
        '</div>' +
        '<a class="program__cta" href="' + courseHref + '" target="_blank" rel="noopener noreferrer" aria-label="Open ' + title + '"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
        '</article>'
      );
    }).join('');
  }

  function initProgramsSlider(container) {
    if (!container) return;
    var track = container.querySelector('.programs__track');
    if (!track) return;

    var items = Array.prototype.slice.call(track.children);
    var total = items.length;
    var index = 0;
    var isPointer = window.matchMedia('(hover: hover)').matches;

    function getPerView() {
      var width = container.clientWidth;
      if (width < 680) return 1;
      if (width < 920) return 2;
      if (width < 1200) return 3;
      return 4;
    }

    function scrollToIndex() {
      if (!items[index]) return;
      track.scrollTo({ left: items[index].offsetLeft, behavior: 'smooth' });
    }

    function clampIndex(value) {
      var perView = getPerView();
      return Math.min(Math.max(0, value), Math.max(0, total - perView));
    }

    function updateIndex(newIndex) {
      index = clampIndex(newIndex);
      scrollToIndex();
    }

    function onResize() {
      index = clampIndex(index);
      scrollToIndex();
    }

    container.classList.add('programs--slider');
    track.style.overflowX = 'auto';
    track.style.scrollSnapType = 'x mandatory';
    track.style.webkitOverflowScrolling = 'touch';
    track.style.scrollBehavior = 'smooth';
    track.style.cursor = 'grab';
    track.style.touchAction = 'pan-x';
    items.forEach(function (item) {
      item.style.scrollSnapAlign = 'start';
    });

    if (isPointer) {
      try { initProgramCards(track); } catch (e) { console.warn('initProgramCards failed', e); }
    }

    var autoPlayTimer = null;
    function startAutoplay() {
      if (autoPlayTimer || total <= getPerView()) return;
      autoPlayTimer = setInterval(function () {
        var nextIndex = index + 1;
        if (nextIndex > total - getPerView()) nextIndex = 0;
        updateIndex(nextIndex);
      }, 3000);
    }
    function stopAutoplay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    track.addEventListener('pointerdown', function () {
      stopAutoplay();
    });
    track.addEventListener('pointerup', function () {
      startAutoplay();
    });
    track.addEventListener('pointerleave', function () {
      startAutoplay();
    });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoplay(); else startAutoplay();
    });

    if (isPointer) {
      track.addEventListener('mouseenter', stopAutoplay);
      track.addEventListener('mouseleave', startAutoplay);
    }

    startAutoplay();
    onResize();
  }

  function buildArticleCards(items, lang, assetPrefix) {
    if (!Array.isArray(items) || items.length === 0) return '';

    return items
      .map(function (item) {
        var title = lang === 'ar' ? item.titleAr || item.titleEn : item.titleEn || item.titleAr || '';
        var excerpt = lang === 'ar' ? item.excerptAr || item.excerptEn : item.excerptEn || item.excerptAr || '';
        var imageUrl = resolveAssetUrl(item.image, assetPrefix);
        var imageAlt = item.image && item.image.alt ? item.image.alt : title;
        var slug = item.slug ? '/' + item.slug : '#';

        return (
          '<article class="program">' +
          (imageUrl ? '<img class="program__bg" src="' + imageUrl + '" alt="' + imageAlt + '" loading="lazy" />' : '') +
          '<div class="program__top"><span class="program__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg></span></div>' +
          '<div class="program__content"><h3 class="program__title">' + title + '</h3><p class="program__desc">' + excerpt + '</p></div>' +
          '<a class="program__cta" href="' + slug + '" aria-label="Read more about ' + title + '"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
          '</article>'
        );
      })
      .join('');
  }

  function getLocalizedText(content, lang, fieldNames) {
    var keys = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
    var fallback = '';
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = content && content[key + (lang === 'ar' ? 'Ar' : 'En')];
      if (hasValue(value)) return value;
      if (hasValue(content && content[key])) return content[key];
      if (i === 0 && hasValue(content && content[key + 'En'])) return content[key + 'En'];
      if (i === 0 && hasValue(content && content[key + 'Ar'])) return content[key + 'Ar'];
    }
    return fallback;
  }

  function renderHeroBlock(block, lang, assetPrefix) {
    var content = block.content || {};
    var title = getLocalizedText(content, lang, ['title']);
    var subtitle = getLocalizedText(content, lang, ['subtitle']);
    var description = getLocalizedText(content, lang, ['description']);
    var ctaText = getLocalizedText(content, lang, ['ctaText']);
    var secondaryCtaText = getLocalizedText(content, lang, ['secondaryCtaText']);
    var heroImageUrl = resolveAssetUrl(content.image, assetPrefix);

    setHTML('#heroTitle', (title || '') + '<span class="t-dot">.</span>');
    setText('#heroSubtitle', subtitle);
    setText('#heroText', description);
    setAttr('#heroCtaPrimary', 'href', content.ctaUrl || '#');
    setText('#heroCtaPrimary span', ctaText);
    setAttr('#heroCtaSecondary', 'href', content.secondaryCtaUrl || '#contact');
    setText('#heroCtaSecondary', secondaryCtaText || (lang === 'ar' ? 'تواصل معنا' : 'Contact us'));
    if (hasValue(heroImageUrl)) setAttr('#heroImage', 'src', heroImageUrl);
  }

  function renderAboutBlock(block, lang, assetPrefix) {
    var content = block.content || {};
    var heading = getLocalizedText(content, lang, ['heading']);
    var description = getLocalizedText(content, lang, ['description']);
    var imageUrl = resolveAssetUrl(content.image, assetPrefix);

    if (hasValue(imageUrl)) setAttr('#aboutImage', 'src', imageUrl);
    setHTML('#aboutHeading', heading);
    setText('#aboutLead', description);

    var sections = Array.isArray(content.additionalSections) ? content.additionalSections : [];
    var items = sections.map(function (item) {
      return {
        title: getLocalizedText(item, lang, ['title']),
        content: getLocalizedText(item, lang, ['content']),
      };
    });

    if (items.length) {
      renderItems('#aboutAccordion', buildAboutItems(items));
      initAccordion(document.getElementById('aboutAccordion'));
    }
  }

  function renderServicesBlock(block, lang, assetPrefix) {
    var content = block.content || {};
    var heading = getLocalizedText(content, lang, ['heading']);
    var description = getLocalizedText(content, lang, ['description']);
    var imageUrl = resolveAssetUrl(content.image, assetPrefix);
    var imageAlt = content.image && content.image.alt ? content.image.alt : heading;
    var items = sortByDisplayOrder(content.servicesList || []).map(function (service) {
      return {
        title: getLocalizedText(service, lang, ['title']),
        description: getLocalizedText(service, lang, ['description']),
      };
    });

    setHTML('#solutionsHeading', (heading || '') + '<span class="t-dot">.</span>');
    setText('#solutionsDescription', description);
    if (hasValue(imageUrl)) {
      setAttr('.solutions__media img', 'src', imageUrl);
      setAttr('.solutions__media img', 'alt', imageAlt);
    }
    if (items.length) {
      renderItems('#solutionsList', buildServiceItems(items));
    }
  }

  function renderFaqsBlock(block, lang) {
    var content = block.content || {};
    var heading = getLocalizedText(content, lang, ['heading']);
    var description = getLocalizedText(content, lang, ['description']);
    var items = sortByDisplayOrder(content.faqsList || []).map(function (faq) {
      return {
        question: getLocalizedText(faq, lang, ['question']),
        answer: getLocalizedText(faq, lang, ['answer']),
      };
    });

    if (items.length) {
      renderItems('#faqAccordion', buildFaqItems(items));
      initAccordion(document.getElementById('faqAccordion'));
    }
    setText('#faqHeading', heading);
    setText('#faqDescription', description);
  }

  function renderBlocks(blocks, lang, assetPrefix) {
    if (!Array.isArray(blocks) || blocks.length === 0) return;

    blocks.forEach(function (block) {
      var type = String(block.blockType || '').toLowerCase();
      if (type === 'heroblock') {
        renderHeroBlock(block, lang, assetPrefix);
      } else if (type === 'aboutblock') {
        renderAboutBlock(block, lang, assetPrefix);
      } else if (type === 'servicesblock') {
        renderServicesBlock(block, lang, assetPrefix);
      } else if (type === 'faqsblock') {
        renderFaqsBlock(block, lang);
      }
    });
  }

  async function loadLmsPrograms(lang, assetPrefix) {
    var config = getConfig();
    var lmsApiUrl = config.lmsApiUrl;
    var lmsToken = config.lmsToken;
    var lmsOrg = config.lmsOrg;
    var lmsShortname = config.lmsCourseShortname;
    var courseUrlTemplate = config.lmsCourseUrlTemplate;
    var container = document.getElementById('programsGrid');

    if (!container || !lmsApiUrl || !lmsToken) return;

    var body = new URLSearchParams();
    body.set('field', 'shortname');
    body.set('value', lmsShortname || 'All');
    body.set('org', lmsOrg || '');

    try {
      var response = await fetch(lmsApiUrl + '?wstoken=' + encodeURIComponent(lmsToken) + '&wsfunction=ws_get_courselist&moodlewsrestformat=json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error('LMS request failed with status ' + response.status);
      }

      var data = await response.json();
      var items = Array.isArray(data && data.courses) ? data.courses : [];

      if (items.length) {
        var cards = buildLmsProgramCards(items, lang, courseUrlTemplate, assetPrefix);
        // wrap in track for slider
        container.innerHTML = '<div class="programs__track">' + cards + '</div>';
        if (items.length > 4) {
          initProgramsSlider(container);
        } else {
          initProgramCards(container);
        }
      } else {
        container.innerHTML = '<p class="programs__note reveal">No training programs available right now.</p>';
      }
    } catch (error) {
      console.warn('Failed to load LMS training programs:', error);
      container.innerHTML = '<p class="programs__note reveal">Training programs are temporarily unavailable.</p>';
    }
  }

  async function loadDynamicContent() {
    var config = getConfig();
    var apiBase = config.apiUrl;
    var assetPrefix = config.assetUrl;
    var tenantCode = config.tenantCode;

    var path = window.location.pathname.replace(/^\//g, '').replace(/\/$/g, '').trim();
    var slugParam = path ? '&slug=' + encodeURIComponent(path) : '';
    var apiUrl = apiBase + '?tenantCode=' + encodeURIComponent(tenantCode) + slugParam + '&type=all';

    try {
      var response = await fetch(apiUrl);
      if (!response.ok) {
        console.warn('DTC content fetch failed:', response.status, response.statusText);
        return;
      }

      var payload = await response.json();
      var data = payload.data || payload;
      var page = data.page || {};
      var lang = getCurrentLang();

      var layout = data.layout || {};
      var tenant = data.tenant || {};
      var portalBranding = tenant.branding || {};
      var logoEnUrl = resolveAssetUrl(portalBranding.logoEn, assetPrefix);
      var logoArUrl = resolveAssetUrl(portalBranding.logoAr, assetPrefix);
      var logoMarkUrl = resolveAssetUrl(portalBranding.logoMark, assetPrefix);
      if (hasValue(logoEnUrl)) setAttr('.brand__logo--full.brand__logo--en', 'src', logoEnUrl);
      if (hasValue(logoArUrl)) setAttr('.brand__logo--full.brand__logo--ar', 'src', logoArUrl);
      if (hasValue(logoMarkUrl)) setAttr('.brand__logo--mark', 'src', logoMarkUrl);

      var navLinks = (layout.header && layout.header.navLinks) || [];
      if (navLinks.length) {
        renderItems('.nav__list', buildNavLinks(navLinks, lang));
        attachNavLinkCloseListeners();
        initScrollSpy();
        syncNavState();
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

      var blocks = Array.isArray(page.blocks) ? page.blocks : [];
      renderBlocks(blocks, lang, assetPrefix);

      function setSectionVisibility(sectionId, hasContent) {
        var section = document.getElementById(sectionId);
        if (section) {
          section.hidden = !hasContent;
        }
      }

      var aboutBlock = blocks.find(function (block) {
        return String(block.blockType || '').toLowerCase() === 'aboutblock';
      });
      var servicesBlock = blocks.find(function (block) {
        return String(block.blockType || '').toLowerCase() === 'servicesblock';
      });
      var faqsBlock = blocks.find(function (block) {
        return String(block.blockType || '').toLowerCase() === 'faqsblock';
      });

      var aboutItems = aboutBlock && aboutBlock.content && Array.isArray(aboutBlock.content.additionalSections)
        ? aboutBlock.content.additionalSections
        : [];
      var servicesItems = servicesBlock && servicesBlock.content && Array.isArray(servicesBlock.content.servicesList)
        ? servicesBlock.content.servicesList
        : [];
      var faqsItems = faqsBlock && faqsBlock.content && Array.isArray(faqsBlock.content.faqsList)
        ? faqsBlock.content.faqsList
        : [];

      setSectionVisibility('about', aboutItems.length > 0);
      setSectionVisibility('solutions', servicesItems.length > 0);
      setSectionVisibility('faqs', faqsItems.length > 0);

      var footerData = layout.footer || {};
      var footerCopyText = lang === 'ar'
        ? footerData.copyrightTextAr || footerData.copyrightTextEn
        : footerData.copyrightTextEn || footerData.copyrightTextAr;
      if (hasValue(footerCopyText)) {
        var footerCopyEl = document.querySelector('[data-i18n-html="footer.copy"]');
        if (footerCopyEl) {
          footerCopyEl.innerHTML = footerCopyText + ' <span id="year">' + new Date().getFullYear() + '</span>';
        }
      }

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
  
  var initialConfig = getConfig();
  loadLmsPrograms(getCurrentLang(), initialConfig.assetUrl);

  var langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", function () {
      applyLang(docEl.lang === "ar" ? "en" : "ar");
      var loaderEl = document.getElementById('appLoader');
      if (loaderEl) loaderEl.classList.remove('is-hidden');
      loadDynamicContent();
      
      var currentConfig = getConfig();
      loadLmsPrograms(getCurrentLang(), currentConfig.assetUrl);
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
    nav.querySelectorAll('.nav__link').forEach(function (a) {
      a.addEventListener('click', function () {
        setActiveNavLink(a.getAttribute('href'));
        if (window.innerWidth <= 980) closeNav();
      });
    });
  }

  document.querySelectorAll(".brand").forEach(function (brandLogo) {
    brandLogo.addEventListener("click", function () {
      document.querySelectorAll(".nav__link").forEach(function (link) {
        link.classList.remove("is-active");
      });
      var homeLink = document.querySelector(".nav__list li:first-child .nav__link") || document.querySelector('.nav__link[href^="#home"]');
      if (homeLink) homeLink.classList.add("is-active");
    });
  });

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
  function initProgramCards(root) {
    var scope = root || document;
    var programs = scope.querySelectorAll(".program");
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
  }
  initProgramCards();

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
  function initScrollSpy() {
    var navLinks = getNavLinks();
    var sections = navLinks
      .map(function (l) { return document.querySelector(l.getAttribute('href')); })
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveNavLink('#' + entry.target.id);
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  function syncNavState() {
    setActiveNavLink(window.location.hash || '#home');
    if (window.location.hash) {
      scrollToHashTarget(window.location.hash);
    }
  }

  window.addEventListener('hashchange', function () {
    setActiveNavLink(window.location.hash || '#home');
    scrollToHashTarget(window.location.hash || '#home');
  });

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


window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');

    setTimeout(() => {
        loader.classList.add('is-hidden');
    }, 1200);
});