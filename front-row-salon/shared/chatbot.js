/* ==========================================================================
   FRONT ROW SALON — front-of-house chat widget
   A small, rule-based FAQ assistant (no backend, no external API) that
   answers the questions clients actually ask most: hours, location,
   booking, pricing, services, brands, cancellation and payment. Matches
   free-text input against keyword rules, and falls back to a real human
   contact (phone/WhatsApp/Contact page) for anything outside that list.
   Reuses window.FRSContact (set by shared/nav.js) as its single source of
   truth for phone, email, address and the Fresha URL — load this file
   after shared/nav.js on every page.
   ========================================================================== */

(function () {
  var C = window.FRSContact || {
    FRESHA_URL: 'https://www.fresha.com/en-GB/a/front-row-salon-dubai-al-nasser-building-kuwait-street-al-raffa-road-mankhool-bur-dubai-m7l7b4k4/all-offer?venue=true',
    PHONE_DISPLAY: '+971 4 336 5582',
    PHONE_TEL: '+97143365582',
    MOBILE_DISPLAY: '+971 50 232 9348',
    MOBILE_TEL: '+971502329348',
    WHATSAPP_URL: 'https://wa.me/971502329348',
    EMAIL: 'frontrowsalon22@gmail.com',
    DIRECTIONS_URL: 'https://maps.google.com/?daddr=Al%20Nasser%20Building%2C%20Kuwait%20Street%2C%20AL%20Raffa%20Road%2C%20Mankhool%2C%20Bur%20Dubai%2C%20Shop%205%2C%20Dubai'
  };

  function bookLink(label) {
    return '<a href="' + C.FRESHA_URL + '" target="_blank" rel="noopener noreferrer">' + (label || 'Book on Fresha') + '</a>';
  }
  function humanFallback() {
    return 'If I haven\'t answered that, our team will — call <a href="tel:' + C.PHONE_TEL + '">' + C.PHONE_DISPLAY + '</a>, ' +
      '<a href="' + C.WHATSAPP_URL + '" target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>, or use the ' +
      '<a href="contact.html">Contact page</a>.';
  }

  /* ---- knowledge base: [keywords, reply-builder] ---- */
  var RULES = [
    {
      k: ['hour', 'open', 'close', 'timing', 'time do you', 'what time'],
      a: function () { return 'We\'re open every day, Monday through Sunday, <strong>10:00 am &ndash; 9:00 pm</strong>. See the full <a href="location.html">Maps &amp; Timings page</a>.'; }
    },
    {
      k: ['where', 'location', 'address', 'direction', 'map', 'find you'],
      a: function () { return 'We\'re at Al Nasser Building, Kuwait Street, Al Raffa Road, Mankhool, Bur Dubai, Shop 5. <a href="' + C.DIRECTIONS_URL + '" target="_blank" rel="noopener noreferrer">Get directions</a>, or see our <a href="location.html">Maps &amp; Timings page</a>.'; }
    },
    {
      k: ['book', 'appointment', 'reserve', 'schedule', 'slot'],
      a: function () { return 'You can book instantly on Fresha &mdash; ' + bookLink() + '. Confirmation is instant, and you can pay by app or in salon.'; }
    },
    {
      k: ['cancel', 'reschedul', 'change my appointment', 'no show', 'no-show', 'late'],
      a: function () { return 'We ask for at least 24 hours\' notice to cancel or reschedule, so we can offer the slot to someone else. You can do this directly through your Fresha confirmation, or by calling us. Full details are on our <a href="terms-of-service.html">Terms of Service</a>.'; }
    },
    {
      k: ['price', 'cost', 'how much', 'rate', 'fee', 'charge'],
      a: function () { return 'A few examples: Classic Pedicure AED 84, Eyebrow AED 26.25, Hair Wash &amp; Blow Dry from AED 73.50. See the full <a href="pricelist.html">Price List</a> &mdash; anything not listed there, just ask in salon or on Fresha.'; }
    },
    {
      k: ['pay', 'payment', 'cash', 'card', 'apple pay'],
      a: function () { return 'You can pay by app through Fresha, or manually in salon &mdash; both are accepted.'; }
    },
    {
      k: ['service', 'what do you offer', 'what do you do', 'treatment'],
      a: function () { return 'Hair cutting &amp; colour, nails, waxing, threading, facials and massage &mdash; see the full breakdown on our <a href="services.html">Services page</a>.'; }
    },
    {
      k: ['hair'],
      a: function () { return 'We offer cutting &amp; styling, colour, and hair treatments &mdash; using L&rsquo;Or&eacute;al, Inoa, Schwarzkopf Professional, K18, Olaplex and Nashi Argan. More on the <a href="services.html">Services page</a>.'; }
    },
    {
      k: ['nail', 'manicure', 'pedicure'],
      a: function () { return 'Manicures, pedicures (including our popular Classic Pedicure), nail extensions and nail art &mdash; see pricing on the <a href="pricelist.html">Price List</a>.'; }
    },
    {
      k: ['wax', 'thread', 'bleach', 'facial', 'massage', 'skin'],
      a: function () { return 'We offer waxing, threading, bleaching, facials and massage &mdash; details on the <a href="services.html">Services page</a>.'; }
    },
    {
      k: ['brand', 'product you use', 'what products'],
      a: function () { return 'We work with L&rsquo;Or&eacute;al, Olaplex, Inoa, Schwarzkopf Professional, K18, Nashi, Dermalogica, Esthemax, Lycon, Rica, Essie and Klio &mdash; see our <a href="brands.html">Brand Partners page</a>. Some are also available to take home on our <a href="products.html">Products page</a>.'; }
    },
    {
      k: ['team', 'staff', 'stylist', 'therapist', 'who works'],
      a: function () { return 'Meet the team &mdash; six specialists, each rated 4.6&ndash;4.9 &mdash; on our <a href="team.html">Team page</a>. You can request a specific person when you book on Fresha.'; }
    },
    {
      k: ['review', 'rating', 'good', 'recommend'],
      a: function () { return 'We\'re rated 4.9 out of 5 from 63 reviews &mdash; Highly Recommended. Read them on our <a href="reviews.html">Reviews page</a>.'; }
    },
    {
      k: ['phone', 'number', 'call', 'contact'],
      a: function () { return 'Call us on <a href="tel:' + C.PHONE_TEL + '">' + C.PHONE_DISPLAY + '</a> or <a href="tel:' + C.MOBILE_TEL + '">' + C.MOBILE_DISPLAY + '</a>.'; }
    },
    {
      k: ['whatsapp'],
      a: function () { return 'Message us on WhatsApp any time: <a href="' + C.WHATSAPP_URL + '" target="_blank" rel="noopener noreferrer">' + C.MOBILE_DISPLAY + '</a>.'; }
    },
    {
      k: ['email', 'mail'],
      a: function () { return 'Email us at <a href="mailto:' + C.EMAIL + '">' + C.EMAIL + '</a>.'; }
    },
    {
      k: ['membership', 'loyalty', 'annual card', 'member card'],
      a: function () { return 'Our Annual Membership gets you 20% off every salon service, year-round, for AED 500 + VAT 5% &mdash; shareable with one family member or friend. Full details on our <a href="loyalty.html">Loyalty &amp; Membership page</a>.'; }
    },
    {
      k: ['promo', 'offer', 'discount', 'deal', 'package'],
      a: function () { return 'Our current promotions are live in salon and on Fresha &mdash; ask your stylist when you book, or check the offers shown when you ' + bookLink('book here') + '. We also have a 20% Annual Membership &mdash; see our <a href="loyalty.html">Loyalty page</a>.'; }
    },
    {
      k: ['patch test', 'allerg', 'sensitiv', 'pregnan'],
      a: function () { return 'Please tell us about any allergies, sensitivities or pregnancy before your appointment. Colour, keratin and some chemical treatments may need a patch test first &mdash; our team will advise you when booking.'; }
    },
    {
      k: ['thank', 'thanks', 'thank you', 'thx'],
      a: function () { return 'You\'re so welcome! Anything else I can help with?'; }
    },
    {
      k: ['hi', 'hello', 'hey', 'salam', 'good morning', 'good afternoon', 'good evening'],
      a: function () { return 'Hello! Ask me about hours, location, booking, pricing, services or our brand partners &mdash; or tap one of the suggestions below.'; }
    },
    {
      k: ['bye', 'goodbye', 'see you'],
      a: function () { return 'Thanks for stopping by &mdash; hope to see you in the chair soon! ' + bookLink(); }
    }
  ];

  var CHIPS = [
    { label: 'Opening hours', q: 'What are your opening hours?' },
    { label: 'Where are you located?', q: 'Where are you located?' },
    { label: 'How do I book?', q: 'How do I book an appointment?' },
    { label: 'Prices', q: 'How much do your services cost?' },
    { label: 'Brands you use', q: 'What brands do you use?' },
    { label: 'Cancellation policy', q: 'What is your cancellation policy?' }
  ];

  function findReply(raw) {
    var text = raw.toLowerCase();
    for (var i = 0; i < RULES.length; i++) {
      var kws = RULES[i].k;
      for (var j = 0; j < kws.length; j++) {
        if (text.indexOf(kws[j]) !== -1) return RULES[i].a();
      }
    }
    return 'I\'m not totally sure about that one. ' + humanFallback();
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function build() {
    var root = document.createElement('div');
    root.id = 'frs-chat';
    root.innerHTML =
      '<button class="frs-chat-fab" id="frs-chat-fab" aria-expanded="false" aria-controls="frs-chat-panel" aria-label="Chat with Front Row Beauty Salon">' +
        '<span class="frs-chat-ping" aria-hidden="true"></span>' +
        '<svg class="frs-chat-fab-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
        '<svg class="frs-chat-fab-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>' +
      '<div class="frs-chat-panel" id="frs-chat-panel" role="dialog" aria-modal="false" aria-label="Chat with Front Row Beauty Salon" aria-hidden="true">' +
        '<div class="frs-chat-head">' +
          '<img src="images/logo-mark.jpg" alt="">' +
          '<div class="frs-chat-head-text"><strong>Front Row Beauty Salon</strong><span>Typically replies instantly</span></div>' +
          '<button class="frs-chat-head-close" id="frs-chat-close" aria-label="Close chat">&times;</button>' +
        '</div>' +
        '<div class="frs-chat-body" id="frs-chat-body" role="log" aria-live="polite"></div>' +
        '<div class="frs-chat-chips" id="frs-chat-chips"></div>' +
        '<form class="frs-chat-form" id="frs-chat-form">' +
          '<label class="sr-only" for="frs-chat-input">Type a message</label>' +
          '<input type="text" id="frs-chat-input" placeholder="Ask a question&hellip;" autocomplete="off">' +
          '<button type="submit" aria-label="Send">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
          '</button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(root);

    var fab = document.getElementById('frs-chat-fab');
    var panel = document.getElementById('frs-chat-panel');
    var body = document.getElementById('frs-chat-body');
    var chipsWrap = document.getElementById('frs-chat-chips');
    var form = document.getElementById('frs-chat-form');
    var input = document.getElementById('frs-chat-input');
    var closeBtn = document.getElementById('frs-chat-close');
    var greeted = false;

    function addMsg(html, who) {
      var el = document.createElement('div');
      el.className = 'frs-msg frs-msg-' + who;
      el.innerHTML = html;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
    }

    function renderChips() {
      chipsWrap.innerHTML = '';
      CHIPS.forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'frs-chip';
        b.textContent = c.label;
        b.addEventListener('click', function () { handleUserText(c.q); });
        chipsWrap.appendChild(b);
      });
    }

    function handleUserText(text) {
      if (!text.trim()) return;
      addMsg(escapeHtml(text), 'user');
      input.value = '';

      var typing = document.createElement('div');
      typing.className = 'frs-msg-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;

      window.setTimeout(function () {
        typing.remove();
        addMsg(findReply(text), 'bot');
      }, 420);
    }

    function openPanel() {
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      fab.setAttribute('aria-expanded', 'true');
      fab.setAttribute('data-seen', 'true');
      if (!greeted) {
        greeted = true;
        addMsg('Hi! &#128075; How may I help you today? Ask me about hours, pricing, services or booking &mdash; or tap a question below.', 'bot');
        renderChips();
      }
      window.setTimeout(function () { input.focus(); }, 320);
    }
    function closePanel() {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      fab.setAttribute('aria-expanded', 'false');
      fab.focus();
    }

    fab.addEventListener('click', function () {
      panel.classList.contains('is-open') ? closePanel() : openPanel();
    });
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleUserText(input.value);
    });
  }

  document.addEventListener('DOMContentLoaded', build);
})();
