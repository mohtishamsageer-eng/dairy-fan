/*
 * Esha Naturals — store settings
 * ------------------------------------------------------------------
 * This is the ONLY file you need to edit for day-to-day changes:
 * WhatsApp number, delivery charges, contact details and social links.
 * Product names, prices and descriptions live in assets/js/data/products.js
 */
window.ESHA = window.ESHA || {};

ESHA.config = {
  brand: 'Esha Naturals',
  tagline: 'Pure · Natural · Trusted',

  // WhatsApp number that receives orders, in international format without "+" or spaces.
  // Example: 0300 1234567  ->  '923001234567'
  // Leave empty ('') to hide all WhatsApp buttons.
  whatsappNumber: '',

  // Phone number shown on the website (any format), e.g. '0300 1234567'. Leave '' to hide.
  phone: '',

  // Contact email shown on the website. Leave '' to hide.
  email: '',

  // Shown in the footer and on the contact page, e.g. 'Lahore, Pakistan'.
  location: 'Pakistan',

  // Optional: Google Sheet order log. Paste your Google Apps Script "Web app" URL here
  // (see google-apps-script/README in the project). Every order is then saved to your sheet.
  orderEndpoint: '',

  currency: 'Rs',

  delivery: {
    fee: 200,            // delivery charge in Rs for orders below the free-delivery amount
    freeAbove: 2000,     // orders of this amount or more get free delivery (set 0 to always charge the fee)
    timeText: '3–4 working days after order confirmation',
    shortTimeText: '3–4 day delivery'
  },

  maxQtyPerItem: 10,

  // Social links — leave '' to hide an icon.
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: ''
  }
};
