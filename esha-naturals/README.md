# Esha Naturals — e-commerce website

An online store for **Esha Naturals** hair care and cooking oils. Customers can browse
categories, add to cart and place **Cash on Delivery** orders from anywhere in Pakistan.

- 4 products in 2 categories: **Hair Care** (Anti Hair Fall Oil, Hair Care Oil) and **Cooking Oils** (Mustard Oil, Sesame Oil)
- Working cart, checkout with Pakistani mobile-number validation, order confirmation page
- Orders reach you on **WhatsApp**, and optionally in a **Google Sheet** (with email alerts)
- 6 short **Journal** articles on the benefits of the oils
- About, Contact, FAQ, Shipping / Returns / Privacy pages
- Works on mobile and desktop, fast, no monthly fees: it is a plain static website (HTML, CSS, JavaScript)

## 1. Before going live: fill in your details

Open **`assets/js/config.js`** and fill in:

| Setting | What to put |
|---|---|
| `whatsappNumber` | Number that receives orders, e.g. `0300 1234567` → `'923001234567'` |
| `phone` | Number shown on the website, e.g. `'0300 1234567'` |
| `email` | Your email (optional) |
| `location` | e.g. `'Lahore, Pakistan'` |
| `delivery.fee` / `delivery.freeAbove` | Delivery charge and free-delivery amount (now Rs 200, free over Rs 2,000) |
| `social` | Instagram / Facebook / TikTok / YouTube links (optional) |
| `orderEndpoint` | Optional Google Sheet link, see below |

**How orders reach you**

- **WhatsApp only** (just set `whatsappNumber`): when a customer taps *Place Order*, WhatsApp opens
  with the full order (items, total, name, phone, address). The customer taps *Send* and you receive it.
- **Google Sheet** (recommended as well): follow [`google-apps-script/SETUP.md`](google-apps-script/SETUP.md)
  (about 5 minutes). Every order is then saved automatically in your sheet, and you can get an email per order.

## 2. Put the website online

Pick one:

- **Netlify Drop (easiest, free):** go to <https://app.netlify.com/drop> and drag the whole
  `esha-naturals` folder onto the page. You get a live link immediately and can connect your own domain later.
- **Netlify / Vercel / Cloudflare Pages from GitHub:** import this repository and set the
  *base / root directory* to `esha-naturals`. No build command is needed.
- **Any hosting with cPanel:** upload everything inside `esha-naturals` to `public_html`.

To preview on your computer, double-click `index.html`, or run `python3 -m http.server` inside the
folder and open <http://localhost:8000>.

## 3. Everyday changes

- **Prices, descriptions, sizes:** `assets/js/data/products.js` (`price` = selling price, `comparePrice` = original price)
- **Categories:** top of `assets/js/data/products.js`
- **Articles:** `assets/js/data/articles.js`
- **FAQs:** `assets/js/data/faqs.js`
- **Shipping / returns / privacy text:** `policies.html`
- **Colours and fonts:** the variables at the top of `assets/css/main.css`

## Folder structure

```
esha-naturals/
├── index.html            Home (hero slideshow, categories, collection, spotlight, journal, FAQ)
├── shop.html             All products + category filter (?category=hair-care / cooking-oils) + sorting
├── product.html          Product page (?id=anti-hair-fall-oil …)
├── checkout.html         Customer details + Cash on Delivery
├── order-success.html    Order confirmation
├── journal.html          Articles list (?topic=…)
├── article.html          Single article (?slug=…)
├── about.html · contact.html · policies.html · 404.html
├── assets/
│   ├── css/main.css
│   ├── fonts/            Self-hosted fonts (Cormorant Garamond, Jost, Great Vibes, OFL licence)
│   ├── images/
│   │   ├── products/     Bottle photos with transparent background
│   │   ├── posters/      Original product posters
│   │   ├── journal/      Article covers
│   │   └── brand/        Logo (SVG), favicon, app icons, social sharing image
│   └── js/
│       ├── config.js     ← store settings
│       ├── data/         products, articles, FAQs
│       ├── core/         cart, orders, layout (header, footer, cart drawer), icons, helpers
│       └── pages/        code for each page
└── google-apps-script/   Optional Google Sheet order log (Code.gs + SETUP.md)
```

The cart and the customer's last delivery details are stored in the customer's own browser
(localStorage). No customer data is stored on the website itself.
