/* ==========================================================================
   FRONT ROW BEAUTY SALON — Services page interactions
   Each service (Hair, Nails, Body & Face, Waxing & Threading) is its own
   full-screen scene built from a real salon photo — no WebGL, no canvas,
   nothing that depends on a 3D layer booting. Scrolling from one photo to
   the next IS the transition. This just wires the expand/collapse toggle
   for the teaser/full-text split.
   ========================================================================== */
(function () {
  'use strict';

  document.querySelectorAll('.cine-expand').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var content = btn.closest('.cine-content');
      if (!content) return;
      var full = content.querySelector('.cine-full');
      var expanded = content.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      if (full) full.hidden = !expanded;
    });
  });
})();
