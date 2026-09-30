# Esha Naturals — e-commerce website

An online store for **Esha Naturals** hair care and cooking oils. Customers can browse
categories, add to cart and place **Cash on Delivery** orders from anywhere in Pakistan.

- 4 products in 2 categories: **Hair Care** (Anti Hair Fall Oil, Hair Care Oil) and **Cooking Oils** (Mustard Oil, Sesame Oil)
- 2 **Bundle Offers**: Hair Oil Bundle (Anti Hair Fall + Hair Care, Rs 3,400 → Rs 1,700) and
  Cooking Oil Bundle (Mustard + Sesame, Rs 2,399 → Rs 1,700), on the home page, in the shop and with their own product pages
- **Customer reviews** on the home page and every product page, with a "Write a review" form (see section 5)
- Working cart, checkout with Pakistani mobile-number validation, order confirmation page
- **Every order is emailed to `eshanaturals0@gmail.com`** with all the details the customer filled in
  (no WhatsApp order messages). Contact-form messages arrive by email too.
- WhatsApp **0317 7161578** is used only for the "Chat with us" buttons
- After placing an order the customer sees a popup to send an optional **small advance** (JazzCash or Bank of Punjab).
  The order email is sent first, so you get every order whether or not they pay. If they tap
  *"I've sent the advance"*, a second email tells you the account and transaction ID.
- 6 short **Blog** articles on the benefits of the oils (page `journal.html`)
- About, Contact, FAQ, Shipping / Returns / Privacy pages
- Works on mobile and desktop, fast, no monthly fees: a plain static website (HTML, CSS, JavaScript)
- Also available as **one single file**: [`dist/esha-naturals.html`](dist/esha-naturals.html)

## 1. How orders reach you

**Recommended: your own Google Sheet + Gmail** (free, no activation, no monthly limit on orders).
Every order is saved as a row in a Google Sheet (your order list, also in the Google Sheets phone app)
and emailed to `eshanaturals0@gmail.com` from your own Gmail. Advance payments, contact messages and
reviews get their own tabs and emails. Customers who give an email get a confirmation email.
Set it up once with [`google-apps-script/SETUP.md`](google-apps-script/SETUP.md) and paste the link into
`orderEndpoint` in `assets/js/config.js`.

The order email subject looks like *"New order received EN-260926-AB12: Rs 2,198 (Ayesha Khan, Lahore)"* and
contains a table with the order number, name, mobile number, city, full address, landmark,
items, subtotal, delivery charge, total, payment method and notes. If the customer typed an
email address, you can simply press **Reply** to answer them.

**Backup: email services.** If `orderEndpoint` is empty or Google does not answer, the website emails
the order through [Web3Forms](https://web3forms.com) (when `web3formsKey` is set; free plan 250 emails a month)
or otherwise [FormSubmit](https://formsubmit.co). FormSubmit needs a one-time activation per web address:
place a test order on the live website, open the **"Activate FormSubmit on https://…"** email sent to
`eshanaturals0@gmail.com` (check Spam) and click **Activate**. An activation for `…netlify.app` does not
cover your own domain.

> When the website is opened as a file on a computer or phone (not from a web address), it runs as a
> **demo**: everything works, but nothing is sent, and the confirmation page says so.

## 2. Put the website online

Pick one:

- **Netlify Drop (easiest, free):** go to <https://app.netlify.com/drop> and drag the whole
  `esha-naturals` folder onto the page. You get a live link immediately and can connect your own domain later.
- **Netlify / Vercel / Cloudflare Pages from GitHub:** import this repository and set the
  *base / root directory* to `esha-naturals`. No build command is needed.
- **Any hosting with cPanel:** upload everything inside `esha-naturals` to `public_html`.
- **Single file:** `dist/esha-naturals.html` can also be uploaded on its own (rename it to `index.html`).

To preview on your computer, double-click `index.html` or `dist/esha-naturals.html`.

## 3. Settings — `assets/js/config.js`

| Setting | Now | What it does |
|---|---|---|
| `orderEmail` | `eshanaturals0@gmail.com` | Where orders and contact messages are emailed |
| `web3formsKey` | empty | Optional Web3Forms access key for the email backup (empty = FormSubmit) |
| `whatsappNumber` | `923177161578` | WhatsApp "Chat with us" buttons (not used for orders) |
| `phone` | `0317 7161578` | Number shown on the website |
| `email` | `eshanaturals0@gmail.com` | Email shown on the website |
| `delivery.fee` / `delivery.freeAbove` | Rs 250, free over Rs 2,000 | Delivery charges |
| `advancePayment` | JazzCash 0313 7996525 · BOP 5040453415800018 (Esha Tariq) | Optional small advance shown in a popup after the order. `amount: 0` says "a small advance"; set e.g. `200` to ask for Rs 200 |
| `social` | Instagram, Facebook, TikTok | Social links in the footer, mobile menu and contact page |
| `orderEndpoint` | empty | Google Sheet + Gmail link (recommended, see `google-apps-script/SETUP.md`) |

## 4. Everyday changes

- **Prices, descriptions, sizes:** `assets/js/data/products.js` (`price` = selling price, `comparePrice` = original price)
- **Bundle offers:** `ESHA.bundles` at the bottom of `assets/js/data/products.js` (`includes` = the products inside)
- **Categories:** top of `assets/js/data/products.js`
- **Articles:** `assets/js/data/articles.js`
- **FAQs:** `assets/js/data/faqs.js`
- **Shipping / returns / privacy text:** `policies.html`
- **Colours and fonts:** the variables at the top of `assets/css/main.css`

After changing anything, rebuild the single file with `node tools/build-single-file.js` (needs Node.js).

## 5. Customer reviews

Customers write a review (stars, name, city, text) on the home page or a product page. The review is
**emailed to `orderEmail`** with the subject *"New review (5/5) for … from …"*; the customer sees their own
review straight away, marked "awaiting approval" (only on their phone/computer).

Reviews are **not published automatically**, so nobody can post spam or fake reviews on the store. To publish
one, copy the ready-made line from the email's *"To publish"* row into `ESHA.customerReviews` in
`assets/js/data/reviews.js` and upload the website again (and rebuild the single file). The average rating,
star bars and review list update by themselves. Please only add real reviews from real customers.

## Folder structure

```
esha-naturals/
├── index.html            Home (hero slideshow, categories, collection, spotlight, journal, FAQ)
├── shop.html             All products + category filter (?category=hair-care / cooking-oils) + sorting
├── product.html          Product page (?id=anti-hair-fall-oil …)
├── checkout.html         Customer details + Cash on Delivery
├── order-success.html    Order confirmation
├── journal.html          Blog: articles list (?topic=…)
├── article.html          Single article (?slug=…)
├── about.html · contact.html · policies.html · 404.html
├── dist/esha-naturals.html   The whole website in one file (generated)
├── assets/
│   ├── css/main.css
│   ├── fonts/            Self-hosted fonts (Cormorant Garamond, Jost, Great Vibes, OFL licence)
│   ├── images/
│   │   ├── products/     Bottle photos with transparent background
│   │   ├── posters/      Original product posters
│   │   ├── journal/      Article covers
│   │   └── brand/        Logo (SVG), home-page group photo, favicon, app icons, social sharing image
│   └── js/
│       ├── config.js     ← store settings
│       ├── data/         products & bundles, articles, FAQs, customer reviews
│       ├── core/         cart, orders (email), reviews, navigation, layout (header, footer, cart drawer), icons, helpers
│       └── pages/        code for each page
├── tools/build-single-file.js   Builds dist/esha-naturals.html
└── google-apps-script/   Optional Google Sheet order log (Code.gs + SETUP.md)
```

The cart and the customer's last delivery details are stored in the customer's own browser
(localStorage). No customer data is stored on the website itself; orders are only emailed to you.
