/* ==========================================================================
   FRONT ROW SALON — shared header, footer, index overlay, reveals, media
   Injected on every page via #site-header / #site-footer mount points, so
   the same markup and behaviour ship everywhere without a server-side
   include (this site is meant to open directly from disk, file:// and all).
   ========================================================================== */

(function () {
  /* Gate .reveal's hidden state behind this class (see shared/style.css)
     so content only ever disappears once we've confirmed JS is running
     and about to manage it — never permanently, if JS is blocked or errors. */
  document.documentElement.classList.add('js-ready');

  var FRESHA_URL = 'https://www.fresha.com/a/front-row-salon-dubai-al-nasser-building-kuwait-street-al-raffa-road-mankhool-bur-dubai-m7l7b4k4/booking';

  var PAGES = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About Us' },
    { href: 'services.html', label: 'Services' },
    { href: 'pricelist.html', label: 'Price List' },
    { href: 'team.html', label: 'Team' },
    { href: 'location.html', label: 'Maps & Timings' },
    { href: 'brands.html', label: 'Brand Partners' },
    { href: 'reviews.html', label: 'Reviews' },
    { href: 'information.html', label: 'Information' },
    { href: 'gallery.html', label: 'Gallery' },
    { href: 'contact.html', label: 'Contact Us' },
    { href: 'affirmation.html', label: 'Daily Affirmation' }
  ];

  function currentFile() {
    var path = window.location.pathname.split('/').pop();
    return path && path.length ? path : 'index.html';
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function bookBtn(extraClass, label) {
    return '<a class="btn btn-primary ' + extraClass + '" href="' + FRESHA_URL + '" target="_blank" rel="noopener noreferrer">' +
      (label || 'Book Now') + '</a>';
  }
  window.FRSBookButtonHTML = bookBtn;

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
        '<a class="brand" href="index.html"><span>Front Row</span><small>Salon &middot; Dubai</small></a>' +
        '<div class="nav-actions">' +
          bookBtn('btn-sm', 'Book Now') +
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
            '<span class="text-muted" style="font-size:0.85rem;">Al Nasser Building, Kuwait Street, Al Raffa Road, Mankhool, Bur Dubai</span>' +
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
  }

  function renderFooter() {
    var mount = document.getElementById('site-footer');
    if (!mount) return;

    mount.innerHTML =
      '<div class="wrap">' +
        '<div class="footer-top">' +
          '<div class="footer-brand">' +
            '<a class="brand" href="index.html"><span>Front Row</span><small>Salon &middot; Dubai</small></a>' +
            '<p>A warm, unhurried salon in Bur Dubai — real brilliance, natural ingredients, no less.</p>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Visit</h4>' +
            '<p>Al Nasser Building,<br>Kuwait Street, Al Raffa Road,<br>Mankhool, Bur Dubai, Shop 5</p>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Hours</h4>' +
            '<p>Open daily<br>Monday &ndash; Sunday<br>10:00 am &ndash; 9:00 pm</p>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Follow</h4>' +
            '<div>' +
              '<span class="footer-placeholder">Instagram &mdash; add link</span>' +
              '<span class="footer-placeholder">WhatsApp &mdash; add number</span>' +
              '<span class="footer-placeholder">Phone &mdash; add number</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>&copy; ' + new Date().getFullYear() + ' Front Row Salon. Highly recommended &mdash; 4.9 &middot; 63 reviews.</span>' +
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

  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    renderFooter();
    initMedia();
    initReveal();
  });
})();
