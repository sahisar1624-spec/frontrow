/* ==========================================================================
   FRONT ROW BEAUTY SALON — shared header, footer, index overlay, reveals, media
   Injected on every page via #site-header / #site-footer mount points, so
   the same markup and behaviour ship everywhere without a server-side
   include (this site is meant to open directly from disk, file:// and all).
   ========================================================================== */

(function () {
  /* Gate .reveal's hidden state behind this class (see shared/style.css)
     so content only ever disappears once we've confirmed JS is running
     and about to manage it — never permanently, if JS is blocked or errors. */
  document.documentElement.classList.add('js-ready');

  var FRESHA_URL = 'https://www.fresha.com/en-GB/a/front-row-salon-dubai-al-nasser-building-kuwait-street-al-raffa-road-mankhool-bur-dubai-m7l7b4k4/all-offer?venue=true';
  var PHONE_DISPLAY = '+971 4 336 5582';
  var PHONE_TEL = '+97143365582';
  var MOBILE_DISPLAY = '+971 50 232 9348';
  var MOBILE_TEL = '+971502329348';
  var WHATSAPP_URL = 'https://wa.me/971502329348';
  var EMAIL = 'frontrowsalon22@gmail.com';
  var DIRECTIONS_URL = 'https://maps.google.com/?daddr=Al%20Nasser%20Building%2C%20Kuwait%20Street%2C%20AL%20Raffa%20Road%2C%20Mankhool%2C%20Bur%20Dubai%2C%20Shop%205%2C%20Dubai';
  var GOOGLE_REVIEWS_URL = 'https://www.google.com/maps/search/?api=1&query=Front+Row+Beauty+Salon+Bur+Dubai';
  window.FRSContact = { FRESHA_URL: FRESHA_URL, PHONE_DISPLAY: PHONE_DISPLAY, PHONE_TEL: PHONE_TEL, MOBILE_DISPLAY: MOBILE_DISPLAY, MOBILE_TEL: MOBILE_TEL, WHATSAPP_URL: WHATSAPP_URL, EMAIL: EMAIL, DIRECTIONS_URL: DIRECTIONS_URL, GOOGLE_REVIEWS_URL: GOOGLE_REVIEWS_URL };

  var PAGES = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About Us' },
    { href: 'services.html', label: 'Services' },
    { href: 'pricelist.html', label: 'Price List' },
    { href: 'loyalty.html', label: 'Loyalty & Membership' },
    { href: 'products.html', label: 'Products' },
    { href: 'brands.html', label: 'Brand Partners' },
    { href: 'team.html', label: 'Team' },
    { href: 'gallery.html', label: 'Gallery' },
    { href: 'reviews.html', label: 'Reviews' },
    { href: 'location.html', label: 'Maps & Timings' },
    { href: 'information.html', label: 'Information' },
    { href: 'contact.html', label: 'Contact Us' },
    { href: 'affirmation.html', label: 'Daily Affirmation' }
  ];

  function currentFile() {
    var path = window.location.pathname.split('/').pop();
    return path && path.length ? path : 'index.html';
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---- light / dark theme toggle: manual, remembered per visitor.
     Defaults to the dark palette (this brand's default identity) unless
     the visitor has previously chosen light. A tiny inline script in each
     page's <head> applies the stored choice before first paint, so this
     just keeps the toggle button in sync and handles clicks. ---- */
  var THEME_KEY = 'frs-theme';
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function applyTheme(theme) {
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'light' ? '&#9789;' : '&#9728;';
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }
  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    applyTheme(currentTheme());
    btn.addEventListener('click', function () {
      applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
    });
  }

  function bookBtn(extraClass, label) {
    return '<a class="btn btn-primary ' + extraClass + '" href="' + FRESHA_URL + '" target="_blank" rel="noopener noreferrer">' +
      (label || 'Book Now') + '</a>';
  }
  window.FRSBookButtonHTML = bookBtn;

  function brandMark() {
    return '<a class="brand" href="index.html"><img class="brand-mark" src="images/logo-mark.jpg" alt="Front Row Beauty Salon crest">' +
      '<span class="brand-text"><span>Front Row Beauty Salon</span><small>Hair &middot; Nails &middot; Skin</small></span></a>';
  }

  function renderHeader() {
    var mount = document.getElementById('site-header');
    if (!mount) return;
    var here = currentFile();

    var indexLinks = PAGES.map(function (p, i) {
      var current = p.href === here ? ' aria-current="page"' : '';
      return '<a href="' + p.href + '"' + current + '><span class="idx">' + pad(i + 1) + '</span><span class="name">' + p.label + '</span></a>';
    }).join('');

    mount.innerHTML =
      '<div class="nav">' +
        brandMark() +
        '<div class="nav-actions">' +
          bookBtn('btn-sm nav-book-btn', 'Book Now') +
          '<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Switch theme"></button>' +
          '<button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-overlay">' +
            '<span class="bars"><span></span><span></span></span>Index' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="nav-overlay" id="nav-overlay">' +
        '<button class="nav-close" id="nav-close" aria-label="Close index">&times;</button>' +
        '<div class="nav-overlay-inner">' +
          '<div class="eyebrow">Contents</div>' +
          '<div class="nav-overlay-list" style="margin-top:1.5rem;">' + indexLinks + '</div>' +
          '<div class="nav-overlay-foot">' +
            '<span class="text-muted" style="font-size:0.85rem;">Al Nasser Building, Kuwait Street, Al Raffa Road, Mankhool, Bur Dubai &middot; ' + PHONE_DISPLAY + '</span>' +
            bookBtn('btn-sm', 'Book an appointment') +
          '</div>' +
        '</div>' +
      '</div>';

    var toggle = document.getElementById('nav-toggle');
    var overlay = document.getElementById('nav-overlay');
    var close = document.getElementById('nav-close');

    function openOverlay() {
      overlay.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeOverlay() {
      overlay.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    toggle.addEventListener('click', function () {
      overlay.classList.contains('is-open') ? closeOverlay() : openOverlay();
    });
    close.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOverlay(); });

    initThemeToggle();
  }

  function renderFooter() {
    var mount = document.getElementById('site-footer');
    if (!mount) return;

    mount.innerHTML =
      '<div class="wrap">' +
        '<div class="footer-top">' +
          '<div class="footer-brand">' +
            brandMark() +
            '<p>A warm, unhurried salon in Bur Dubai — real brilliance, natural ingredients, no less.</p>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Visit</h4>' +
            '<p><a href="' + DIRECTIONS_URL + '" target="_blank" rel="noopener noreferrer">Al Nasser Building,<br>Kuwait Street, Al Raffa Road,<br>Mankhool, Bur Dubai, Shop 5</a></p>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Hours</h4>' +
            '<p>Open daily<br>Monday &ndash; Sunday<br>10:00 am &ndash; 9:00 pm</p>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Get in touch</h4>' +
            '<p>' +
              '<a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a><br>' +
              '<a href="tel:' + MOBILE_TEL + '">' + MOBILE_DISPLAY + '</a><br>' +
              '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a><br>' +
              '<a href="' + WHATSAPP_URL + '" target="_blank" rel="noopener noreferrer">WhatsApp us</a>' +
            '</p>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>&copy; ' + new Date().getFullYear() + ' Front Row Beauty Salon. Highly recommended &mdash; 4.9 &middot; 63 reviews.</span>' +
          '<span class="footer-legal">' +
            '<a href="privacy-policy.html">Privacy Policy</a> &middot; ' +
            '<a href="terms-of-service.html">Terms of Service</a> &middot; ' +
            '<a href="terms-of-use.html">Terms of Use</a>' +
          '</span>' +
          '<span>Instant confirmation &middot; Pay by app or in salon</span>' +
        '</div>' +
      '</div>';
  }

  /* ---- media placeholders: reveal real photo/video the instant it exists
     at the given path, with zero markup changes required later ---- */
  function initMedia() {
    document.querySelectorAll('.media-placeholder img').forEach(function (img) {
      var box = img.closest('.media-placeholder');
      function reveal() { box.classList.add('is-loaded'); }
      if (img.complete && img.naturalWidth > 0) { reveal(); }
      img.addEventListener('load', reveal);
      img.addEventListener('error', function () { box.classList.remove('is-loaded'); });
    });
    document.querySelectorAll('.media-placeholder video').forEach(function (video) {
      var box = video.closest('.media-placeholder');
      function reveal() { box.classList.add('is-loaded'); }
      video.addEventListener('loadeddata', reveal);
      video.addEventListener('error', function () { box.classList.remove('is-loaded'); }, true);
      if (video.readyState >= 2) reveal();
    });
  }

  /* ---- restrained scroll reveal: fade + rise, once, skipped entirely
     under prefers-reduced-motion (handled in CSS) ---- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px' });
    els.forEach(function (el) { io.observe(el); });
    // safety net: an element that never intersects for any reason (unusual
    // viewport/layout edge case) still isn't left invisible forever
    window.setTimeout(function () {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      io.disconnect();
    }, 4000);
  }

  /* ---- page transition: a brief fade to paper before leaving for another
     page on this site, so navigation feels like one continuous piece
     instead of a hard cut. Only ever engages after a real click on a real
     internal link — a blocked/slow script just leaves normal <a> browsing
     untouched, nothing on the page depends on this to be usable. ---- */
  function initPageTransition() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var overlay = document.createElement('div');
    overlay.id = 'page-transition';
    document.body.appendChild(overlay);

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!href || !/^[a-zA-Z0-9_-]+\.html(#.*)?$/.test(href)) return;
      e.preventDefault();
      overlay.classList.add('is-active');
      window.setTimeout(function () { window.location.href = href; }, 340);
    });
  }

  /* ---- structured data: tells Google this is a real, bookable local
     business (address, hours, phone, rating) so search results can show
     more than a blue link. Same facts already printed on every page —
     this just repeats them in a machine-readable form Google recognises. ---- */
  function injectSchema() {
    if (document.getElementById('frs-schema')) return;
    var data = {
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      'name': 'Front Row Beauty Salon',
      'image': 'https://frontrowbeautysalon.com/images/salon-styling-stations.jpg',
      'url': 'https://frontrowbeautysalon.com/',
      'telephone': PHONE_TEL,
      'priceRange': 'AED',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Al Nasser Building, Kuwait Street, Al Raffa Road, Mankhool, Shop 5',
        'addressLocality': 'Dubai',
        'addressCountry': 'AE'
      },
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        'opens': '10:00',
        'closes': '21:00'
      },
      'sameAs': [FRESHA_URL],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'reviewCount': '63'
      }
    };
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'frs-schema';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /* ---- floating actions: a WhatsApp shortcut (bottom-left, every screen
     size) and a full-width "Book Now" bar that only appears on phones,
     where the header's own Book Now button is hidden to save space. ---- */
  function renderFloatingActions() {
    if (document.getElementById('frs-whatsapp')) return;

    var wa = document.createElement('a');
    wa.id = 'frs-whatsapp';
    wa.href = WHATSAPP_URL;
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.setAttribute('aria-label', 'Message us on WhatsApp');
    wa.innerHTML = '<svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">' +
      '<path d="M16 3C9.1 3 3.5 8.6 3.5 15.5c0 2.4.7 4.7 1.9 6.7L3 29l7-2.3c1.9 1.1 4 1.6 6 1.6 6.9 0 12.5-5.6 12.5-12.5S22.9 3 16 3zm0 22.7c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4.2 1.4 1.4-4.1-.2-.4c-1.1-1.7-1.6-3.6-1.6-5.6 0-5.7 4.6-10.3 10.3-10.3s10.3 4.6 10.3 10.3S21.7 25.7 16 25.7zm5.6-7.7c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"/>' +
      '</svg>';
    document.body.appendChild(wa);

    var bar = document.createElement('div');
    bar.id = 'frs-mobile-book-bar';
    bar.innerHTML = bookBtn('', 'Book Now on Fresha');
    document.body.appendChild(bar);
  }

  /* ---- scroll progress: a thin gold line at the very top of the viewport
     tracking how far down the page the visitor has read. ---- */
  function initScrollProgress() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var bar = document.createElement('div');
    bar.id = 'frs-scroll-progress';
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- staggered headline reveal: splits the big page/hero titles into
     one <span> per word so they rise in with a slight cascade instead of
     as a single block. Falls back to the plain heading if JS is off. ---- */
  function initStagger() {
    var heads = document.querySelectorAll('.page-hero h1, .home-hero-content h1');
    if (!heads.length || !('IntersectionObserver' in window)) return;
    heads.forEach(function (h) {
      var words = h.textContent.trim().split(/\s+/);
      h.innerHTML = words.map(function (w) {
        return '<span class="stagger-word">' + w + '</span>';
      }).join(' ');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var spans = entry.target.querySelectorAll('.stagger-word');
        spans.forEach(function (span, i) {
          span.style.transitionDelay = (i * 0.06) + 's';
          span.classList.add('is-visible');
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    heads.forEach(function (h) { io.observe(h); });
  }

  /* ---- animated stat counters: any <span class="stat-number" data-count>
     counts up from 0 the moment it scrolls into view. data-decimals keeps
     values like "4.9" from being truncated to whole numbers. ---- */
  function initCounters() {
    var els = document.querySelectorAll('.stat-number[data-count]');
    if (!els.length) return;
    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var duration = 1300;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) {
      els.forEach(animate);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    renderFooter();
    initMedia();
    initReveal();
    initPageTransition();
    injectSchema();
    renderFloatingActions();
    initScrollProgress();
    initStagger();
    initCounters();
  });
})();
