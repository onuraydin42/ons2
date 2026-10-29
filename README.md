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

## Asset pipeline

`npm run prepare-assets` is the single, repeatable step that turns the raw drop
into everything `public/` needs. It is idempotent; re-run it whenever a source
asset changes.

| Source | Becomes |
| --- | --- |
| `images2/{cosmo,velvet,blonde,vesper}` | `public/images/cocktails/*.webp` (+ pre-blurred `*-blur.webp` plates) |
| `images2/{glass,lux,lux2,boxx}` | `public/images/editorial/*.webp` |
| `images2/rotate.mp4` | `public/media/rotate.mp4` (copied as-is) |
| `images2/logo.jpg` | `public/logo.png`, `public/logo-mark.png`, `public/favicon.ico`, `public/apple-touch-icon.png` |

The script also rewrites the logo dimensions in `lib/brand.ts`, so the code
never drifts from what is on disk.

Notes on decisions the script makes:

- **The film ships untouched.** `rotate.mp4` is already a lean H.264 file and
  there is no encoder in this toolchain. Its poster,
  `public/media/rotate-poster.webp`, is the film's first frame — if the film is
  ever replaced, export a new first frame over it so the two still match.
- **The logo's white background is keyed on the minimum channel**, not on
  luminance. White is the only colour with all three channels pinned high, so
  `min(r,g,b)` removes the background without eating the saturated gold.
- **Two logo renditions.** The supplied lockup is a monogram above a small
  "FLUID OUNCE" wordmark. At navbar scale that wordmark collapses into an
  illegible smudge, so the script also emits `logo-mark.png` (monogram only) for
  small placements. The full lockup is used where it is shown large — age gate
  and footer.

---

## Form delivery

The site is a static export, so there is no API route. Both order forms and the
footer newsletter POST JSON straight to a third-party relay.

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FORM_ENDPOINT` | Relay URL. Defaults to Web3Forms. |
| `NEXT_PUBLIC_FORM_ACCESS_KEY` | Web3Forms access key. **Required for delivery.** |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown in the footer and used for the mailto fallback. |

**Web3Forms is recommended** because it accepts a base64 data URL in the JSON
body — which is what the signature and the uploaded license images need.
Formspree works with the same JSON shape but truncates large fields, so a
full-resolution signature can arrive clipped.

The signature canvas is downscaled to 800px wide before encoding, and uploaded
license images to a 1600px long edge as JPEG. If a POST fails, the form says
"Something went wrong" inline and offers a `mailto:` fallback, so a submission
is never silently lost.

> Until an access key is set, submissions will fail and fall back to the mailto
> link. Everything else on the site works without configuration.

---

## Security

`public/_headers` ships with the export (Netlify Drop reads it from the deploy
root); `netlify.toml` repeats the same policy for a repo-connected build and
adds the http -> https and apex -> www redirects.

- **HSTS** `max-age=63072000; includeSubDomains; preload` — after the first
  visit the browser refuses to make a plain http request to this host at all.
- **CSP** locks scripts, styles, images, media and connections to `self` plus
  the form relay, blocks framing and object embeds, and sets
  `upgrade-insecure-requests`. Fonts are self-hosted by `next/font`; image
  previews in the portal use `blob:`/`data:` URLs, which `img-src` allows.
- **Cookies.** The site sets none — the age gate is React state, there is no
  analytics and no session. The `Set-Cookie` attributes are belt and braces: if
  anything ever does set one it is `Secure; HttpOnly; SameSite=Strict`.
- Plus `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a strict
  `Referrer-Policy`, and a `Permissions-Policy` that denies every device API.

---

## Phones

- Stages use `.h-stage` (`100svh` with a `100vh` fallback), not `100vh`. On iOS
  `100vh` is the height with the browser chrome *hidden*, so a `100vh` stage is
  taller than the visible area and its bottom is cut off.
- The viewport is `viewport-fit: cover`, so the page paints into the notch and
  Dynamic Island; the navbar and pill menu claim clearance with `pt-safe` /
  `pb-safe`.
- Portal inputs are 16px, which is what stops iOS zooming the page on focus.
- Below `lg` the navbar's eight links live behind a full-screen menu.

---

## The hidden portal

`/order` exists only at `https://www.fluidounce.co/order`.

- Nothing on the public site links to it — not the navbar, not the footer, and
  there is no sitemap.
- `robots: { index: false, follow: false }` in its metadata.
- `Disallow: /order` in `public/robots.txt`.
- The age gate renders there too, via the same shared shell.

The landing offers two doors, **Order** and **Reorder**:

- **Order** — a first order from a new account: State, Business Type
  (Liquor Store / Restaurant), Name of Business, Number of Cases; then
  *Delivery Details* (address, city, ZIP, contact, email, phone, and an optional
  delivery note behind a Yes/No); then *Business Verification* (tax ID and
  liquor license, each a number or an uploaded image) and the signature row.
  Choosing a business type opens its presentation above the business name: the
  boxed photograph for Liquor Stores, the rotating-bottle film for Restaurants.
- **Reorder** — an existing account: both presentations side by side, then
  Name of Business, Number of Cases, State and signature.

Case counts read "1 Case - 6 Bottles", "2 Cases - 12 Bottles", … (`data/order.ts`).

---

## Structure

```
app/
  layout.tsx              Outfit + Bodoni Moda, metadata, brand ground, SiteShell
  page.tsx                content flow for the brand site
  terms/ privacy/ media/  the info pages linked from the navbar
  order/page.tsx          metadata + noindex; renders the portal
  globals.css             brand ground, grain, age-gate keyframes
components/
  SiteShell.tsx           mounts AgeGate above every route; publishes "entered"
  AgeGate.tsx             state-only, no localStorage (hydration-safe)
  GateBackdrop.tsx        the night scene behind the gate, seasonal layer
  Navbar.tsx              eight links split around the mark; phone menu
  Hero.tsx                the opening: film frame, Didone name, side plates
  Marquee.tsx             the running line under the opening
  LoopVideo.tsx           muted looping film that keeps itself playing
  ProductDetails.tsx      still, copy, features, stats  (#discover)
  CocktailCollection.tsx  the switcher — arrows, pill menu, keyboard
  EditorialDivider.tsx    parallax plate between collection and craft
  CraftSection.tsx        process list + editorial column
  LegalPage.tsx           shared layout for Terms and Privacy
  MediaGallery.tsx        the press & media spread
  SmoothScroll.tsx        Lenis momentum scrolling, shared via context
  motion/                 Reveal, RevealHeading, RevealImage
  Footer.tsx              four columns + newsletter + legal links
  SignaturePad.tsx        pointer + touch signature, shared by both forms
  order/                  portal shell, field primitives, presentation media,
                          image upload, the Order and Reorder forms
data/
  product.ts              one product — no price field
  cocktails.ts            the four builds
  order.ts                states, case options, business types, presentations
  legal.ts                Terms and Privacy copy
lib/
  brand.ts, color.ts, motion.ts, season.ts, submitForm.ts
```

### Type

A fashion-house pairing: **Bodoni Moda**, a high-contrast Didone with an
optical-size axis, for display type (`font-display`), against **Outfit**'s quiet
geometric sans for everything functional. The opsz axis is what switches the
headlines to the hairline cut.

### The opening

A fashion cover rather than a cinematic. The bottle turns slowly in a single
1:2 portrait frame, the name is set huge behind it in the Didone, and once the
visitor scrolls a little, two campaign photographs glide in from either side to
finish the spread while the name parts around them. The section is `175svh`
tall — one stage plus a short run of travel — and the move completes in the
first 80% of it, then holds for a beat before releasing.

Its entrance waits for the age gate (`useSiteEntered()`): a headline that
assembles itself behind an opaque gate is an animation nobody sees. The film
holds on its first frame (its poster) until then too, and starts from 0 as the
visitor enters.

### Every load starts the show over

A first visit and a refresh behave the same: the page opens at the top behind
the gate (browser scroll restoration is switched off), the page cannot be
scrolled while the gate is up, and "Yes" lands at the very top — so the
opening, the film and the running line all play from their beginning. A
`#cocktail` hash left in the URL is ignored on a fresh load; hashes that arrive
while the visitor is inside the site (footer links, links from other pages)
are followed as usual.

### The running line

`Marquee` opens like a sentence: the first word rests exactly at the inner
edge of the left fade with nothing before it, and it holds there until the
visitor is through the gate and the band is (90%) on screen. It then makes one
opening pass and hands over, at the same speed, to an endless loop
(`fo-marquee-intro` / `fo-marquee-loop` in `globals.css`). The track carries
four copies of the run, so 25% is exactly one run and the right edge stays
covered on the widest screens.

### The entrance tremble

As the gate dissolves, the page lands with a short film-gate tremble: a
decaying micro-shake, an uneven dip of projector light and a burst of moving
grain, all gone within 1.6s. One setting controls it — `ENTRANCE_TREMBLE` in
`lib/motion.ts`:

| Field | Meaning |
| --- | --- |
| `intensity` | `0` off · `1` light (default) · `2` twice as strong; scales shake, flicker, grain and the settle zoom together |
| `duration` | seconds it runs after "Yes" (minimum 1.4 — shorter values are raised to it) |

Visitors whose OS asks for reduced motion never see it. The flicker only ever
darkens, and the 1.4s floor means no one-second window holds more than three
dips, whatever the settings.

### Navigation

Every in-page link glides through Lenis instead of jumping — navbar, phone
menu, footer cocktail links, and the form's jump to its first error. Links to a
section of the page already on screen are intercepted; links to another page go
through the router, and cross-page section links (`/#collection`) land on the
section when the home page mounts.

### The age gate

Year-round it is a night scene in the brand's colours. Through October and on
November 1st (by the visitor's own clock, read after mount) a Halloween layer
fades in over it — a harvest moon, bats crossing it, embers, a cobweb, and an
"All Hallows' Eve" kicker. It switches itself off; edit `lib/season.ts` to
change the window.

### Motion

`lib/motion.ts` holds one vocabulary — easings, durations, viewport
thresholds, stagger variants — and `components/motion/` turns it into three
reusable pieces:

- `Reveal` / `RevealGroup` / `RevealItem` — the standard rise, optionally staggered.
- `RevealHeading` — display headings that assemble word by word behind a clip.
  The word gaps are real text nodes, so `textContent` stays intact for copy and
  crawlers.
- `RevealImage` — plates uncovered with an animated `clip-path` while the
  picture inside settles out of a slow zoom.

`SmoothScroll` wraps every route with Lenis momentum scrolling. It is disabled
outright for anyone with `prefers-reduced-motion`, and paused while the age
gate or the phone menu is open. A stop requested before Lenis exists — the
gate's, on every first load, because effects run children-first — is
remembered and applied the moment Lenis is created.

### The switcher

There is only one vodka, so the arrows and pill menu move between the four
cocktails inside the Collection section. They change component state and nothing
else — **they never scroll the page.** The only anchors that move the page are
the footer's four cocktail links, which are ordinary navigation.

Colour is never hurried: the section's tint and its blurred ambient plate run
on a 1.6s ease-in-out, and the plate crossfades rather than swapping, so the
light blends from one drink to the next instead of dipping through black. Only
the copy and the recipe card wait their turn.
