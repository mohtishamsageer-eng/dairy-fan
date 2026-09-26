/*
 * Esha Naturals — store settings
 * ------------------------------------------------------------------
 * This is the ONLY file you need to edit for day-to-day changes:
 * order email, WhatsApp chat number, delivery charges, contact details and social links.
 * Product names, prices and descriptions live in assets/js/data/products.js
 */
window.ESHA = window.ESHA || {};

ESHA.config = {
  brand: 'Esha Naturals',
  tagline: 'Pure · Natural · Trusted',

  // Every order (and every contact-form message) is emailed to this address.
  // The first time the live website sends an email, FormSubmit sends an "Activate Form"
  // email to this address — click it once and all orders arrive automatically.
  orderEmail: 'eshanaturals0@gmail.com',

  // WhatsApp number for the "Chat with us" buttons only (orders are NOT sent to WhatsApp).
  // International format without "+" or spaces: 0317 7161578 -> '923177161578'. Leave '' to hide.
  whatsappNumber: '923177161578',

  // Phone number shown on the website. Leave '' to hide.
  phone: '0317 7161578',

  // Contact email shown on the website. Leave '' to hide.
  email: 'eshanaturals0@gmail.com',

  // Shown in the footer and on the contact page, e.g. 'Lahore, Pakistan'.
  location: 'Pakistan',

  // Optional: Google Sheet order log. Paste your Google Apps Script "Web app" URL here
  // (see google-apps-script/SETUP.md). Orders are then also saved to your sheet.
  orderEndpoint: '',

  currency: 'Rs',

  delivery: {
    fee: 200, // delivery charge in Rs for orders below the free-delivery amount
    freeAbove: 2000, // orders of this amount or more get free delivery (set 0 to always charge the fee)
    timeText: '3–4 working days after order confirmation',
    shortTimeText: '3–4 day delivery'
  },

  maxQtyPerItem: 10,

  // Optional small advance, shown in a popup after the order is placed.
  // The order is emailed to you whether or not the customer pays the advance.
  advancePayment: {
    enabled: true,
    amount: 0, // e.g. 200 to ask for Rs 200; 0 = just "a small advance"
    accounts: [
      { method: 'JazzCash', number: '03137996525', title: 'Esha Tariq' },
      { method: 'Bank of Punjab (BOP)', number: '5040453415800018', title: 'Esha Tariq' }
    ]
  },

  // Social links — leave '' to hide an icon.
  social: {
    instagram: 'https://www.instagram.com/eshanaturals0',
    facebook: 'https://www.facebook.com/share/19cwkScHVn/',
    tiktok: 'https://www.tiktok.com/@eshanaturals0',
    youtube: ''
  }
};
