# FLUID OUNCE

Fashion-editorial brand site for a single ultra-premium vodka, plus a hidden
trade portal at `/order`.

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lenis · static export.

**Nothing on this site is for sale.** There are no prices, no cart, no checkout
and no "reserve" anywhere in the codebase. The only transactional surface is the
trade portal, which takes wholesale orders from licensed partners by email.

---

## Getting started

```bash
npm install
```

```bash
npm run prepare-assets
```

```bash
npm run dev
```

`npm run build` writes the static site to `out/`. Drag that folder onto Netlify
Drop — there is no server component to host.

---

## The words are the brand's own

Every line of copy comes verbatim from the live site, https://www.fluidounce.co
— wording, capitalisation and punctuation included. Edit copy in `data/`, never
in components:

| File | Holds |
| --- | --- |
| `data/site.ts` | the tagline, the manifesto, Discover and /discover, Contact, the age gate, navigation, footer small print, social links, SEO titles |
| `data/legal.ts` | Terms & Conditions and Privacy Policy, section by section, with the live anchors (`#section-8` …) |
| `data/order.ts` | every label, placeholder, option and message of the two trade forms |
| `data/cocktails.ts` | the four cocktails, transcribed from their recipe cards |

`data/legal.ts` was generated from the live pages, so it matches them exactly.
The live copy contains a few slips — "go throw", "I here by certify",
"2 Case-12 Bottles", "Coffee Liquer" (the card's spelling) — which are kept as
published; correct them in `data/` if the brand wants them corrected.

---

## Asset pipeline

`npm run prepare-assets` turns the raw drop into everything `public/` needs. It
is idempotent; re-run it whenever a source asset changes.

| Source | Becomes |
| --- | --- |
| `images2/{cosmo,velvet,blonde,vesper}` | `public/images/cocktails/*.webp` |
| `images2/{glass,lux,lux2,boxx}` | `public/images/editorial/*.webp` |
| `images2/boxx` | `public/og.jpg`, the 1200x630 share card |
| `images2/logo.jpg` | `public/logo.png`, `public/logo-mark.png`, `public/favicon.ico`, `public/apple-touch-icon.png` |

The script also rewrites the logo dimensions in `lib/brand.ts`, so the code
never drifts from what is on disk.

- **The logo's white background is keyed on the minimum channel**, not on
  luminance. White is the only colour with all three channels pinned high, so
  `min(r,g,b)` removes the background without eating the saturated gold.
- **Two logo renditions.** The supplied lockup is a monogram above a small
  "FLUID OUNCE" wordmark. At small sizes that wordmark collapses into a smudge,
  so the script also emits `logo-mark.png` (monogram only); the name is then set
  in type beside it.

### The turning bottle

`npm run build-bottle` turns `images2/rotate.mp4` — the bottle on its plinth,
filmed against a grey studio sweep — into the bottle alone: one transparent WebP
for every film frame of one revolution (`public/media/bottle/1240/`, and every
other frame, smaller, in `/720/` for thumbnails and slower devices), plus the
plinth as a single still underneath them.

The camera, backdrop and plinth never move, so the empty studio is recovered as
a clean plate and every frame is relit against it onto linen (`STAGE` in the
script, `--fo-linen` in `app/globals.css` — keep the two equal, and rebuild when
the colour changes), with no alpha key to go patchy in the clear cap. The
outlines are cut geometrically and smoothed over time, so they do not crawl as
the bottle turns.

The camera hunts for focus through the film: every second or so the whole picture
goes soft and comes back. The plinth's logo never moves, so it measures how soft
each frame is, and the frame is deblurred by that amount. Frames are played whole
and never crossfaded (`components/BottleSpin.tsx`): a blend of two angles is a
double image, which softens a slow turn.

Frames, not a film: a video's decoded colour never exactly matches the page's
CSS colour, so a film always shows as a faint box. The frames have no box.

ffmpeg is not a project dependency. Install one for the run:

```bash
npm i --no-save ffmpeg-static
```

```bash
npm run build-bottle
```

The frames are cached as immutable, so the build also writes a new
`BOTTLE_VERSION` into `lib/bottle.ts`, along with the frame sizes and layout.

---

## Form delivery

The site is a static export, so there is no API route. Both order forms POST
JSON straight to a third-party relay.

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FORM_ENDPOINT` | Relay URL. Defaults to Web3Forms. |
| `NEXT_PUBLIC_FORM_ACCESS_KEY` | Web3Forms access key. **Required for delivery.** |
| `NEXT_PUBLIC_CONTACT_EMAIL` | The mailto fallback if a submission fails (defaults to info@fluidounce.co). |

**Web3Forms is recommended** because it accepts a base64 data URL in the JSON
body — which is what the signature and the uploaded license images need.

The signature canvas is downscaled to 800px wide before encoding, and uploaded
license images to a 1600px long edge as JPEG. If a POST fails, the form shows
the live site's failure message with a `mailto:` fallback, so a submission is
never silently lost.

> Until an access key is set, submissions will fail and fall back to the mailto
> link. Everything else on the site works without configuration.

---

## Search

- Each page sets its own title, description, canonical URL and share card
  (`lib/seo.ts`); the layout sets none of those, so no page can inherit the home
  page's canonical by accident.
- `components/StructuredData.tsx` publishes schema.org Organization and WebSite
  data: name, logo, email, phone, New York, and the Instagram and X profiles as
  `sameAs` — what Google uses to tie "FLUID OUNCE" searches and the brand's
  knowledge panel to this site.
- `app/sitemap.ts` writes `sitemap.xml` (home, /discover, /terms, /privacy);
  `public/robots.txt` points to it. The portal is in neither.
- Each page has one `h1`; the age gate's question is an `h2`, as it is live.
- The old site's `.html` addresses (`/terms.html`, `/privacy.html`,
  `/discover.html`) redirect permanently to the new pages (`public/_redirects`,
  `netlify.toml`), so their links and standing carry over.

After going live: verify the domain in Google Search Console and submit
`https://www.fluidounce.co/sitemap.xml`.

---

## Security

`public/_headers` ships with the export (Netlify Drop reads it from the deploy
root); `netlify.toml` repeats the same policy for a repo-connected build and
adds the http -> https and apex -> www redirects.

- **HSTS** `max-age=63072000; includeSubDomains; preload`.
- **CSP** locks scripts, styles, images, media and connections to `self` plus
  the form relay, blocks framing and object embeds, and sets
  `upgrade-insecure-requests`. Fonts are self-hosted by `next/font`; image
  previews in the portal use `blob:`/`data:` URLs, which `img-src` allows.
- **Cookies.** The site itself sets none — the age gate is React state and there
  is no session. (The footer's small print, copied from the live site, mentions
  analytics cookies; adding analytics later means widening the CSP for it.)
- Plus `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a strict
  `Referrer-Policy`, and a `Permissions-Policy` that denies every device API.

---

## Phones

- Stages use `.h-stage` (`100svh` with a `100vh` fallback), not `100vh`. On iOS
  `100vh` is the height with the browser chrome *hidden*, so a `100vh` stage is
  taller than the visible area and its bottom is cut off. Inside `calc()`, use
  `var(--svh)`, which carries the same fallback.
- The opening's stage is `.h-stage-full` (`100lvh`) with its content in an
  `.h-stage` box at the top: nothing is ever behind the address bar, and when the
  bar slides away the same ground carries on underneath rather than ending in a
  line across the screen.
- The opening's geometry lives in `.hero-stage` (`globals.css`). Upright, the name
  and tagline stack above the bottle; on any screen on its side (`flank:`) the
  bottle stands between the two words, as on a desktop. Each bottle height is
  capped by the room it has, so a very short phone loses a little height rather
  than run the bottle into the type.
- `short:` is a phone on its side, `fine:` a mouse. Blurs behind glass and the
  hero's blended light are `fine:` only: on a phone they cost a whole-screen pass
  on every frame while the canvas is repainting.
- The viewport is `viewport-fit: cover`, so the page paints into the notch and
  Dynamic Island; the navbar and pill menu claim clearance with `pt-safe` /
  `pb-safe`, and page gutters clear a sideways notch with `.safe-gutter`.
- Portal inputs are 16px, which is what stops iOS zooming the page on focus.
- The signature field only re-fits when its own width changes. Phones fire
  `resize` whenever the address bar slides or the keyboard opens, and re-fitting
  on those wiped the signature between signing and pressing Submit.
- Hover styles only apply where hovering exists (`hoverOnlyWhenSupported`), so a
  tapped button does not stay lit; buttons show an `active:` state instead.
- Below `lg` the navbar's six links live behind a full-screen menu. The cocktails
  also move with a sideways swipe.
- A phone gets the same 1240px bottle frames as a desktop: its screen has as many
  pixels to fill. The 720px set (309 frames) goes to a small placement, to a 3G
  connection and to a device reporting 2 GB of memory or less; a browser asked to
  save data, or on 2G, keeps the still. Frames download coarse revolution first, so
  the bottle turns from the start and only gets smoother.

---

## The hidden portal

`/order` exists only at `https://www.fluidounce.co/order`.

- Nothing on the public site links to it — not the navbar, not the footer, not
  the sitemap.
- `robots: { index: false, follow: false }` in its metadata.
- `Disallow: /order` in `public/robots.txt`.
- The age gate renders there too, via the same shared shell.

The landing offers the live site's two doors, **Reorder** and **Order**:

- **Order** — a first order from a new account: State, Business Type
  (Liquor Store / Restaurant), Name Of Business, Number Of Cases (including
  "No Order Setup Account Only"); then *Delivery Details*; then *Business
  Verification* (tax ID and liquor license, each a number or an uploaded image),
  the signature and the certification. Choosing a business type opens its
  presentation above the business name: the boxed photograph for Liquor Stores,
  the turning bottle for Restaurants.
- **Reorder** — an existing account: both presentations side by side, then
  Name Of Business, Number Of Cases, State, signature and certification.

As live, a problem is shown by highlighting the field, with one message above
the form: "Please review the highlighted fields."

---

## Structure

```
app/
  layout.tsx              Jost + Bodoni Moda + Libre Baskerville, metadata
  page.tsx                the brand site, in the live site's order
  discover/               the long story (/discover.html)
  terms/ privacy/         the legal documents
  order/page.tsx          metadata + noindex; renders the portal
  sitemap.ts              sitemap.xml at build time
  globals.css             palette, grain, keyframes
components/
  SiteShell.tsx           mounts AgeGate above every route; publishes "entered"
  AgeGate.tsx             the live gate; state-only (hydration-safe)
  GateBackdrop.tsx        the light behind the gate
  Navbar.tsx              three links either side of the mark; phone menu
  Hero.tsx                the opening: the name, the line, the turning bottle
  BottleSpin.tsx          plays the bottle frames on a canvas
  Marquee.tsx             the running line under the opening
  Manifesto.tsx           the brand's sentence, inked in by scroll
  DiscoverSection.tsx     Discover on the home page  (#discover)
  DiscoverStory.tsx       the /discover chapters
  CocktailCollection.tsx  the four cocktails and their cards
  EditorialBand.tsx       the daylight photograph between sections
  ContactSection.tsx      email, phone, New York  (#contact)
  Footer.tsx              links, profiles, small print
  LegalPage.tsx           shared layout for Terms and Privacy
  LegalContents.tsx       the documents' contents, gliding to each section
  SocialIcons.tsx         Instagram and X
  StructuredData.tsx      schema.org JSON-LD
  SmoothScroll.tsx        Lenis momentum scrolling, shared via context
  motion/                 Reveal, RevealHeading, RevealImage
  SignaturePad.tsx        pointer + touch signature, shared by both forms
  order/                  portal shell, field primitives, presentations,
                          image upload, the Order and Reorder forms
data/                     all copy — see above
lib/
  brand.ts, color.ts, motion.ts, seo.ts, submitForm.ts, useGlideLink.ts
```

### Look and type

Warm stone mid-tones (porcelain and linen), charred-wood ink, ivory cards and a
char footer. Foil gold on a mid-tone all but disappears, so each surface takes the
shade that reads on it: the foil itself on ivory and char, champagne for rules and
sparks on stone, dark bronze for small type on stone, and the mark in ink. Every
small line of text clears WCAG AA.

- **Jost**, a geometric sans, sets the FLUID OUNCE name — the same construction
  as the wordmark on the bottle and the plinth.
- **Bodoni Moda**, a modern (Didone) serif, sets the headings, the manifesto
  and the cocktail names.
- **Libre Baskerville**, a transitional serif drawn for the screen, sets every
  small and running line.

### The opening

The bottle stands on the page itself, turning slowly on its plinth, with the
name set huge on either side of it. Scrolling drives the scene: the bottle
turns a full revolution with the page (on top of its own slow turn), the name
parts and steps back, and two campaign photographs glide in from either side.
On a fine pointer the layers drift against the cursor, the nearest furthest. The
section is `240svh` tall — one stage plus the run of travel — and the spread
resolves in its first three quarters, then holds.

Its entrance waits for the age gate (`useSiteEntered()`): the name rises out of
its masks and the bottle out of the floor as the visitor arrives.

### Every load starts the show over

A first visit and a refresh behave the same: the page opens at the top behind
the gate (browser scroll restoration is switched off), the page cannot be
scrolled while the gate is up, and "Yes" lands at the very top. "No" leaves for
Google, as it does live.

The gate links to the Terms & Conditions and Privacy Policy, so those two pages
are never gated — they must be readable before anyone accepts them.

### The running line

`Marquee` opens like a sentence: the first phrase rests exactly at the inner
edge of the left fade, and holds there until the visitor is through the gate
and the band is (90%) on screen. It then makes one opening pass and hands over,
at the same speed, to an endless loop. Its phrases are all lifted from the live
copy.

### The entrance tremble

As the gate dissolves, the page lands with a short film-gate tremble: a
decaying micro-shake, a gentle dip of light and a burst of moving grain, all
gone within 1.6s. One setting controls it — `ENTRANCE_TREMBLE` in
`lib/motion.ts`:

| Field | Meaning |
| --- | --- |
| `intensity` | `0` off · `1` light (default) · `2` twice as strong |
| `duration` | seconds it runs after "Yes" (minimum 1.4 — shorter values are raised to it) |

Visitors whose OS asks for reduced motion never see it.

### Navigation

Every in-page link glides through Lenis instead of jumping — navbar, phone
menu, footer, the legal contents and the form's jump to its first highlighted
field (`lib/useGlideLink.ts`). "Media" is the brand's Instagram, as it is live.

### Motion

`lib/motion.ts` holds one vocabulary — easings, durations, viewport
thresholds, stagger variants — and `components/motion/` turns it into three
reusable pieces: `Reveal` (the standard rise), `RevealHeading` (headings that
assemble word by word behind a clip, with real spaces so `textContent` stays
intact), and `RevealImage` (plates uncovered with a clip-path while the picture
settles out of a slow zoom).

`SmoothScroll` wraps every route with Lenis momentum scrolling. It only runs for
a mouse: a touch screen already scrolls continuously, and is spared the listeners.
It is disabled outright for anyone with `prefers-reduced-motion`, and paused while
the age gate or the phone menu is open.

### The cocktails

The arrows, the pill menu and the arrow keys move between the four cocktails.
They change component state and nothing else — they never scroll the page. The
room's tint follows each drink on a slow ease, so the colour blends from one to
the next.
