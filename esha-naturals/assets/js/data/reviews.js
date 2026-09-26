/*
 * Esha Naturals — customer reviews shown on the website
 * ------------------------------------------------------------------
 * When a customer writes a review on the website it is emailed to the store
 * (subject "New review ..."). Reviews are not published automatically: to show one,
 * copy it into the list below. Only add real reviews from real customers.
 *
 *   product: the product id (see data/products.js), e.g. 'anti-hair-fall-oil' or 'hair-care-bundle'
 *   rating:  1 to 5 stars
 *   date:    'YYYY-MM-DD'
 *
 * Example:
 *   { product: 'hair-care-oil', name: 'Ayesha K.', city: 'Lahore', rating: 5, date: '2026-10-02', text: 'My hair feels much softer after two weeks.' },
 */
window.ESHA = window.ESHA || {};

ESHA.customerReviews = [];
