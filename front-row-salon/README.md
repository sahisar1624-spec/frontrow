# Front Row Beauty Salon — website

A static, no-build multi-page site for Front Row Beauty Salon (Bur Dubai). Every
`.html` file opens directly in a browser — no server, no bundler, no
npm install, and no 3D/WebGL anywhere on the site.

**Design direction:** black & gold luxury editorial — a fashion-magazine
"front row" world after dark. Near-black charcoal ground with a warm grey
ambience, ivory ink, foil-gold as the primary accent paired with a soft
rose-blush for a feminine, premium touch (never masculine), Bodoni Moda
for display type paired with Work Sans, a magazine-masthead nav with a
numbered full-screen "Index" overlay, and restrained scroll-reveal motion
in place of any scroll-driven animation.

## Structure

```
front-row-salon/
  index.html               Home — editorial split hero (headline + real salon photo)
  about.html                About Us
  services.html             Services — with three photo + long-form copy sections
                             on Hair, Nails and Body & Face
  pricelist.html             Price List
  products.html               Products — retail catalogue, ready to fill in
  brands.html                 Brand Partners — the 12 partner brands
  team.html                    Team
  gallery.html                  Gallery
  reviews.html                   Reviews
  location.html                   Maps & Timings — live Google Maps embed
  information.html                 Information
  contact.html                      Contact Us
  affirmation.html                   Daily Affirmation — quiet, breathing card
  shared/
    style.css              design tokens, typography, every shared component
    nav.js                 injects the header nav + footer, the Index overlay,
                            scroll-reveal, media-placeholder loader, and the
                            site's contact details / Fresha URL (single source
                            of truth — see FRSContact in nav.js)
  images/                 real salon photos + logo live here (see below)
  videos/                 drop real video clips in here (see filenames below)
```

Fonts (Bodoni Moda, Work Sans) load from Google Fonts via a `@import` in
`shared/style.css` — the only external dependency on the whole site, aside
from the Google Maps embed on `location.html`.

## Booking

Every "Book Now" button links out to the real Fresha venue page in a new tab:

```
https://www.fresha.com/en-GB/a/front-row-salon-dubai-al-nasser-building-kuwait-street-al-raffa-road-mankhool-bur-dubai-m7l7b4k4/all-offer?venue=true
```

There is no custom booking form anywhere — this is intentional.

## Contact details (live on every page)

- Phone: **+971 4 336 5582**
- Mobile / WhatsApp: **+971 50 232 9348**
- Email: **frontrowsalon22@gmail.com**
- Address: Al Nasser Building, Kuwait Street, Al Raffa Road, Mankhool, Bur
  Dubai, Shop 5 — open daily, 10:00 am – 9:00 pm
- These live in one place — `shared/nav.js` (`FRESHA_URL`, `PHONE_*`,
  `MOBILE_*`, `WHATSAPP_URL`, `EMAIL`, `DIRECTIONS_URL`) — and are used to
  render the header, footer and Index overlay everywhere. Update them
  there once and every page picks it up.

## Logo & real photos

The salon crest and five real interior photos are already in `images/`:

- `logo-mark.jpg` — the square crest (used in the header/footer brand mark
  and as the browser-tab favicon)
- `logo-full.jpg` — the full logo with the "Front Row Beauty Salon" ring
  text, for larger display if needed
- `salon-styling-stations.jpg` — gold-framed mirrors, styling chairs (home
  hero, Services/Hair)
- `salon-treatment-room-1.jpg`, `salon-treatment-room-2.jpg` — facial/body
  treatment rooms (Services/Body & Face, gallery)
- `salon-product-display.jpg` — the Nashi Argan shelf with the salon crest
  on the wall (About, Brand Partners)
- `salon-reception.jpg` — the reception desk with the salon crest (home
  teaser, Maps & Timings, gallery)

`gallery.html` also uses copies of these under its original filenames
(`interior-1.jpg`, `styling-chairs.jpg`, `reception.jpg`, `gallery-2.jpg`,
`gallery-3.jpg`) so its captions line up — replace those copies with
different shots any time without touching the HTML.

## Dropping in more photos & videos

Every image and video on the site is wired as a **placeholder that
upgrades itself automatically.** Each one is an `<img>` or `<video>`
pointing at the filename it expects, sitting inside a `.media-placeholder`
box that shows a soft dark gradient + a caption + the expected filename
until that file actually exists. The moment a file of the right name lands
in `/images` or `/videos`, the placeholder fades out and the real
photo/clip fades in — **no HTML or CSS edits required.**

Still open (no photo supplied yet):

### Team (`team.html`)
- `images/team-jessy.jpg`, `images/team-marian.jpg`, `images/team-maricon.jpg`,
  `images/team-sima.jpg`, `images/team-nash.jpg`, `images/team-naina.jpg`
- `images/teaser-team.jpg` — used on the home page "Team" teaser card

### Services (`services.html`)
- `images/nail-station.jpg` — nail bar / nail art close-up for the Nails
  pillar section

### Products (`products.html`)
- `images/product-nashi-argan-shampoo.jpg`, `images/product-olaplex.jpg`,
  `images/product-k18.jpg`, `images/product-dermalogica.jpg`,
  `images/product-essie.jpg`, `images/product-klio.jpg` — one square photo
  per featured product. Add more `.product-card` tiles in `products.html`
  the same way for L'Oréal, Inoa, Schwarzkopf Professional, Esthemax,
  Lycon and Rica products as they're photographed; update the price and
  description text alongside each photo.

### Gallery (`gallery.html`)
- `videos/gallery-clip-1.mp4`, `videos/gallery-clip-2.mp4` — hover-to-play clips

Add more `<figure>` or `.product-card` tiles following the existing
pattern for any additional photos or products.

## Brand Partners

`brands.html` lists the 12 brands the salon works with: L'Oréal, Olaplex,
Inoa, Schwarzkopf Professional, K18, Nashi, Dermalogica, Esthemax, Lycon,
Rica, Essie and Klio. Logo marks are shown as styled text tiles pending
permission to use each brand's artwork — swap in real logo images in the
`.brand-tile` markup whenever that's available.

## Content notes

- Dishna is a former team member and does **not** appear anywhere on the site, per instruction.
- Prices shown are exactly what was supplied. Categories without a given price are marked "Ask in salon" rather than an invented number — see `pricelist.html`.
- The Google Maps embed on `location.html` uses the keyless
  `maps.google.com/maps?...&output=embed` format (no API key required) —
  swap in a Google Maps Embed API key + iframe later if preferred.
- The contact form on `contact.html` is front-end only — it shows a "message sent" confirmation state but does not send anywhere yet.

## Accessibility

All motion (scroll-reveal fades, the affirmation page's breathing glow and
text transitions, the brand marquee) is skipped or reduced automatically
for visitors with `prefers-reduced-motion` enabled.
