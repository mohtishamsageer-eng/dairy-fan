# Khaleeq Engineering — Website

Website for **Khaleeq Engineering** (Habibabad, Punjab, Pakistan): dairy farm fans, ventilation
systems, solar power, and electrical and mechanical solutions for dairy and livestock farms.

## What's inside

- `index.html`: single-page site (products, services, process, fan calculator, price guide, FAQ, contact)
- `styles.css`: responsive styles (desktop, tablet, phone)
- `script.js`: mobile menu, scroll reveal, fan calculator, and contact form that opens WhatsApp
- `assets/logo.svg`: logo and favicon

It's plain static HTML/CSS/JS with no build step and no dependencies.

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Any static host works. For GitHub Pages: go to repository **Settings → Pages**, set the source to the
branch and `/ (root)` folder, and save.

## Editing contact details

Phone/WhatsApp (`923008906067`) and email appear in `index.html` (search for `8906067` and
`sageerrehman54`) and in `script.js` (`WHATSAPP` constant).
