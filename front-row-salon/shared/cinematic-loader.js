/* ==========================================================================
   FRONT ROW BEAUTY SALON — shared cinematic loader
   One gate, one bundle, for every scroll-driven 3D experience on the site
   (services, about, gallery, team…) so each of those pages doesn't repeat
   its own guard logic or fetch three.js / GSAP twice. Everything here is
   self-hosted (shared/vendor/) — nothing is fetched from a third-party CDN.

   guardsPass() encodes the one policy every cinematic section must respect:
     - visitor hasn't asked for reduced motion
     - viewport has real room for a scene like this (not a phone)
     - the browser isn't flagging a slow/metered connection
     - WebGL is actually available
   loadCinematic() then lazily fetches three.js (ES module) plus GSAP core
   and ScrollTrigger (classic scripts — GSAP's UMD build wants a real global
   `window`, which a dynamic import()'s module scope doesn't reliably give
   it), and caches the one promise so a page that boots several cinematic
   sections only pays for the download once.
   ========================================================================== */

export function guardsPass() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (!window.matchMedia('(min-width: 900px)').matches) return false;
  if (navigator.connection && (navigator.connection.saveData ||
      /2g/.test(navigator.connection.effectiveType || ''))) return false;
  try {
    var c = document.createElement('canvas');
    if (!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))) return false;
  } catch (e) {
    return false;
  }
  return true;
}

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) { resolve(); return; }
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

var pending;
export function loadCinematic() {
  if (!pending) {
    pending = Promise.all([
      loadScript('shared/vendor/gsap.min.js').then(function () {
        return loadScript('shared/vendor/ScrollTrigger.min.js');
      }),
      import('./vendor/three.module.min.js')
    ]).then(function (results) {
      if (!window.gsap.core.globals().ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
      }
      return { THREE: results[1], gsap: window.gsap, ScrollTrigger: window.ScrollTrigger };
    });
  }
  return pending;
}

/* the bloom/glow post-processing chain — a separate, optional bundle since
   not every cinematic section wants it. Self-hosted from three's own
   examples/jsm/postprocessing (shared/vendor/postprocessing/), patched to
   import three.module.min.js locally instead of the bare 'three' specifier
   the upstream files use. */
var pendingBloom;
export function loadBloom() {
  if (!pendingBloom) {
    pendingBloom = Promise.all([
      import('./vendor/postprocessing/EffectComposer.js'),
      import('./vendor/postprocessing/RenderPass.js'),
      import('./vendor/postprocessing/UnrealBloomPass.js'),
      import('./vendor/postprocessing/OutputPass.js')
    ]).then(function (mods) {
      return {
        EffectComposer: mods[0].EffectComposer,
        RenderPass: mods[1].RenderPass,
        UnrealBloomPass: mods[2].UnrealBloomPass,
        OutputPass: mods[3].OutputPass
      };
    });
  }
  return pendingBloom;
}
