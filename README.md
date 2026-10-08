# L’étoile Bleue · Soins & Bien-être — site vitrine

Institut de beauté et d’épilation laser, Rue de la Servette 67 (2e étage), 1202 Genève.
One-page static site in French, served by GitHub Pages from the repo root.

## Build

`index.html` is generated: edit `_build/template.html` (markup) or the price list in
`_build/build.py`, then run

```
python3 _build/build.py
```

CSS and JS are hand-written in `assets/css/style.css` and `assets/js/main.js`
(GSAP, ScrollTrigger and Lenis are vendored in `assets/vendor/`). Bump `V` in
`build.py` to bust caches. `?nomotion` disables every animation (handy for screenshots).

## Sources (read 2026-10-08)

- Salonkee `salon/l-etoile-bleue`: full price list, hours (Mon–Fri 9–20), phone 078 339 99 01, −30 % first-visit offer, description, logo and cabin photo.
- Google Business Profile (place ID `ChIJU_lradtkjEcRbFGDdpXsp7w`): 5.0 from 3 reviews (all quoted), owner photos, attributes (women-owned, LGBTQ+ friendly, appointment only, cards, Wi-Fi).
- Swiss commercial register mirrors: sole proprietorship of Simone Leitao Pinheiro, registered 31 January 2018.

## To confirm with the salon

- Phone/WhatsApp: Salonkee lists 078 339 99 01, Google and the register list 076 607 31 71. The site uses the Salonkee number (single constant in `main.js` + the `tel:`/`wa.me` links).
- That the number is on WhatsApp.
- Spelling: the new logo reads “étoile blue · Soins & Beauté”, the business name everywhere else is “L’étoile Bleue Soins & Bien-être”. The site keeps both as found.
- Simone is still the owner (the 2018 register entry was struck off in 2023).

The page is `noindex` while it is a proposal.
