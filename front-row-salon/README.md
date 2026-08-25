# Front Row Salon — website

A static, no-build multi-page site for Front Row Salon (Bur Dubai). Every
`.html` file opens directly in a browser — no server, no bundler, no
npm install.

## Structure

```
front-row-salon/
  index.html          Home — full 3D scroll hero (glass hand-mirror)
  about.html           About Us
  services.html        Services
  pricelist.html        Price List
  team.html             Team
  location.html         Maps & Timings
  brands.html           Brand Partners
  contact.html          Contact Us
  reviews.html          Reviews
  information.html      Information
  gallery.html          Gallery
  affirmation.html      Daily Affirmation — glass orb, its own 3D scene
  shared/
    style.css           design tokens, typography, every shared component
    nav.js              injects the header nav + footer on every page
    scene.js            shared ambient 3D background (all interior pages)
  images/                drop real photos in here (see filenames below)
  videos/                drop real video clips in here (see filenames below)
```

Three.js and GSAP load from CDN (jsdelivr / cdnjs) via `<script type="importmap">`
in each page's `<head>` — an internet connection is needed the first time a
page renders its 3D scene, but nothing needs installing locally.

## Booking

Every "Book Now" button on the site links out to the real Fresha booking
page in a new tab:

```
https://www.fresha.com/a/front-row-salon-dubai-al-nasser-building-kuwait-street-al-raffa-road-mankhool-bur-dubai-m7l7b4k4/booking
```

There is no custom booking form anywhere — this is intentional.

## Dropping in real photos & videos

Every image and video on the site is wired as a **placeholder that
upgrades itself automatically.** Each one is an `<img>` or `<video>`
pointing at the real filename it expects, sitting inside a
`.media-placeholder` box that shows a soft gradient + a caption + the
expected filename until that file actually exists. The moment a file of
the right name lands in `/images` or `/videos`, the placeholder fades out
and the real photo/clip fades in — **no HTML or CSS edits required.**

Just save your files with these exact names:

### Home (`index.html`)
- `videos/hero-loop.mp4` — looping background video behind the 3D mirror hero (optional; the 3D scene works fine alone if this is missing)
- `images/teaser-services.jpg`, `images/teaser-team.jpg`, `images/teaser-gallery.jpg`

### About (`about.html`)
- `videos/about-atmosphere.mp4` — optional salon-atmosphere clip

### Team (`team.html`)
- `images/team-jessy.jpg`
- `images/team-marian.jpg`
- `images/team-maricon.jpg`
- `images/team-sima.jpg`
- `images/team-nash.jpg`
- `images/team-naina.jpg`

### Gallery (`gallery.html`)
- `images/interior-1.jpg` — modern interior
- `images/styling-chairs.jpg` — styling stations
- `images/nail-station.jpg` — nail care area
- `images/reception.jpg` — reception area
- `images/gallery-2.jpg`, `images/gallery-3.jpg` — additional detail shots
- `videos/gallery-clip-1.mp4`, `videos/gallery-clip-2.mp4` — hover-to-play clips

Add more `<figure>` tiles in `gallery.html` following the same pattern for
any additional photos or clips.

## Content notes

- Dishna is a former team member and does **not** appear anywhere on the site, per instruction.
- Prices shown are exactly what was supplied. Categories without a given price are marked "Ask in salon" rather than an invented number — see `pricelist.html`.
- Phone number, Instagram and WhatsApp are not yet supplied — they appear as clearly marked placeholders in the footer and on `contact.html`.
- The Google Maps embed on `location.html` is a labeled placeholder; drop in a Google Maps Embed API `<iframe>` once a key is available (the spot is commented inline).
- The contact form on `contact.html` is front-end only — it shows a "message sent" confirmation state but does not send anywhere yet.

## Accessibility

All motion (3D idle animation, scroll-driven camera moves, the affirmation
page's pulse and text transitions, the brand marquee) is skipped or
reduced automatically for visitors with `prefers-reduced-motion` enabled.
