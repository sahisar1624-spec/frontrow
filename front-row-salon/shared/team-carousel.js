/* ==========================================================================
   FRONT ROW BEAUTY SALON — Team page, central-portrait 3D carousel
   Progressive enhancement only: if this script never runs (reduced motion,
   a narrow viewport, JS disabled), #team-grid stays exactly what it already
   is — a plain 3-column grid of the same six real cards, same photos,
   names, roles and ratings, same markup. Nothing here is required for the
   page to work.

   When it does run, it repositions those same six .team-card elements
   (never clones or replaces them) into one large "active" portrait at
   centre with the other five arranged in a shallow arc behind it.
   Selecting another stylist swaps it to the front and sends the previous
   one back into the arc — the real name/role/rating text just gets
   larger or smaller as its card does, since it's the same element.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('team-grid');
  if (!grid) return;

  /* a bold, bloom-lit ambient backdrop — three small medallions drifting
     around each other behind the carousel, echoing "many people, one
     standard" without touching any of the real portrait cards */
  import('./ambient-scene.js').then(function (mod) {
    import('./medallion.js').then(function (m) {
      mod.startAmbientScene('team-cinema', '#team-grid', function (THREE) {
        var group = new THREE.Group();
        var spots = [{ x: -2.8, y: 0.6, z: -2, r: 1 }, { x: 2.6, y: -0.8, z: -3, r: 0.8 }, { x: 0.4, y: 1.4, z: -4, r: 0.7 }];
        spots.forEach(function (s) {
          var med = m.buildMedallion(THREE, s.r);
          med.position.set(s.x, s.y, s.z);
          group.add(med);
        });
        return group;
      }, { camZ: 9, bloomStrength: 0.5, spinSpeed: 0.05 });
    });
  });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(':scope > .team-card'));
  if (cards.length < 3) return;

  var slots = [
    { x: -640, y: 210, rot: -10 },
    { x: -350, y: 265, rot: -5 },
    { x: 0, y: 285, rot: 0 },
    { x: 350, y: 265, rot: 5 },
    { x: 640, y: 210, rot: 10 }
  ];

  var order = cards.slice(); // order[0] is always the active/front card
  var enabled = false;

  function place() {
    order.forEach(function (card, i) {
      if (i === 0) {
        card.dataset.state = 'active';
        card.style.removeProperty('--ox');
        card.style.removeProperty('--oy');
        card.style.removeProperty('--rot');
        card.setAttribute('aria-pressed', 'true');
        card.setAttribute('tabindex', '-1');
      } else {
        card.dataset.state = 'orbit';
        var slot = slots[Math.min(i - 1, slots.length - 1)];
        card.style.setProperty('--ox', slot.x + 'px');
        card.style.setProperty('--oy', slot.y + 'px');
        card.style.setProperty('--rot', slot.rot + 'deg');
        card.setAttribute('aria-pressed', 'false');
        card.setAttribute('tabindex', '0');
      }
    });
  }

  function select(card) {
    if (order[0] === card) return;
    order = [card].concat(order.filter(function (c) { return c !== card; }));
    place();
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    grid.classList.add('is-stage');
    cards.forEach(function (card) {
      card.setAttribute('role', 'button');
      card.addEventListener('click', onClick);
      card.addEventListener('keydown', onKeydown);
    });
    place();
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    grid.classList.remove('is-stage');
    cards.forEach(function (card) {
      card.removeAttribute('role');
      card.removeAttribute('aria-pressed');
      card.removeAttribute('tabindex');
      delete card.dataset.state;
      card.style.removeProperty('--ox');
      card.style.removeProperty('--oy');
      card.style.removeProperty('--rot');
      card.removeEventListener('click', onClick);
      card.removeEventListener('keydown', onKeydown);
    });
  }

  function onClick() { select(this); }
  function onKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(this); }
  }

  function sync() {
    if (window.matchMedia('(min-width: 1080px)').matches) enable();
    else disable();
  }

  sync();
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sync, 150);
  });
})();
