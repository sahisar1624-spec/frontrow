/* ==========================================================================
   FRONT ROW BEAUTY SALON — Gallery page, 3D depth for the real photos
   Deliberately not a WebGL photo wall: these are the salon's real photos
   and video clips, and re-drawing them as textures on a canvas would mean
   loading every one twice, at lower quality, with none of the SEO/
   accessibility a real <img>/<video> gets for free. Instead the actual
   grid elements get the 3D treatment directly, pure CSS transforms:

     - each tile arrives with a one-time "toward camera" entrance as it
       scrolls into view (IntersectionObserver, played once)
     - hovering a tile lifts it slightly forward
     - clicking a tile brings it to the foreground and gently recedes the
       rest of the room behind it — click again, press Escape, or click
       the empty grid background to return to normal

   Existing behavior (the hover-to-play video tiles, wired separately at
   the bottom of gallery.html) is untouched — this only adds classes and
   transforms around it.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('gallery-grid');
  if (!grid) return;

  var figures = Array.prototype.slice.call(grid.querySelectorAll(':scope > figure'));
  if (!figures.length) return;

  /* -- click / keyboard: bring one photo forward -- */
  function clearFocus() {
    figures.forEach(function (f) { f.classList.remove('is-focused'); f.setAttribute('aria-pressed', 'false'); });
    grid.classList.remove('has-focus');
  }
  figures.forEach(function (fig) {
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-pressed', 'false');
    var label = fig.querySelector('.gallery-caption');
    if (label) fig.setAttribute('aria-label', 'Bring "' + label.textContent.trim() + '" to the foreground');

    function toggle() {
      var already = fig.classList.contains('is-focused');
      clearFocus();
      if (!already) {
        fig.classList.add('is-focused');
        fig.setAttribute('aria-pressed', 'true');
        grid.classList.add('has-focus');
      }
    }
    fig.addEventListener('click', toggle);
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') clearFocus();
  });
  grid.addEventListener('click', function (e) {
    if (e.target === grid) clearFocus();
  });

  /* -- one-time 3D entrance per tile, reduced-motion and phone-width gated -- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(min-width: 720px)').matches) return;

  figures.forEach(function (fig, i) {
    var depth = (i % 3) - 1; // -1, 0, 1 — a little rotation variety across the grid
    fig.style.setProperty('--enter-ry', (depth * 9) + 'deg');
    fig.classList.add('gallery-enter');
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-entered');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    figures.forEach(function (fig) { io.observe(fig); });
  } else {
    figures.forEach(function (fig) { fig.classList.add('is-entered'); });
  }
})();

/* ==========================================================================
   "Our Work" — a horizontal side-scroll strip of real client photos.
   Native touch/trackpad swipe already scrolls it with zero JS; this only
   adds two things a plain mouse can't do on its own: a vertical wheel
   gesture over the strip scrolls it sideways, and the prev/next buttons
   step one card at a time (disabling themselves at each end).
   ========================================================================== */
(function () {
  'use strict';

  var strip = document.getElementById('our-work-grid');
  if (!strip) return;

  var prevBtn = document.getElementById('our-work-prev');
  var nextBtn = document.getElementById('our-work-next');

  strip.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    strip.scrollBy({ left: e.deltaY, behavior: 'auto' });
  }, { passive: false });

  function cardStep() {
    var first = strip.querySelector('figure');
    if (!first) return strip.clientWidth * 0.8;
    var style = getComputedStyle(strip);
    var gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    return first.getBoundingClientRect().width + gap;
  }

  function updateButtons() {
    if (!prevBtn || !nextBtn) return;
    var max = strip.scrollWidth - strip.clientWidth - 1;
    prevBtn.disabled = strip.scrollLeft <= 0;
    nextBtn.disabled = strip.scrollLeft >= max;
  }

  if (prevBtn) prevBtn.addEventListener('click', function () {
    strip.scrollBy({ left: -cardStep() * 2, behavior: 'smooth' });
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    strip.scrollBy({ left: cardStep() * 2, behavior: 'smooth' });
  });

  strip.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  updateButtons();
})();
