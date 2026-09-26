/*
 * Esha Naturals — frequently asked questions
 * Answers can use the store settings from config.js (delivery charges, timings).
 */
window.ESHA = window.ESHA || {};

ESHA.faqs = function () {
  const c = ESHA.config;
  const d = c.delivery || {};
  const money = (n) => `${c.currency} ${Number(n).toLocaleString('en-US')}`;

  let charges;
  if (!Number(d.fee)) charges = 'Delivery is <strong>free</strong> on all orders across Pakistan.';
  else if (d.freeAbove)
    charges = `Delivery is <strong>free on orders of ${money(d.freeAbove)} or more</strong>. For smaller orders, a delivery charge of ${money(d.fee)} applies. The exact amount is always shown in your cart before you order.`;
  else charges = `A flat delivery charge of <strong>${money(d.fee)}</strong> applies to every order across Pakistan.`;

  return [
    {
      q: 'How do I place an order?',
      a: '<p>Add your products to the cart and tap <strong>Proceed to Checkout</strong>. Enter your name, mobile number and delivery address, then tap <strong>Place Order</strong>. No account or advance payment is needed.</p>'
    },
    {
      q: 'Is Cash on Delivery available?',
      a: '<p>Yes. We offer <strong>Cash on Delivery all over Pakistan</strong>. You pay in cash when your order arrives at your door.</p>'
    },
    {
      q: 'How long does delivery take?',
      a: `<p>After you place your order, our team will call you to confirm it. Your order is then delivered within <strong>${d.timeText || '3–4 working days after confirmation'}</strong>.</p>`
    },
    {
      q: 'What are the delivery charges?',
      a: `<p>${charges}</p>`
    },
    {
      q: 'Are Esha Naturals products 100% original?',
      a: '<p>Yes. Every Esha Naturals product is 100% original, prepared with natural ingredients and packed with care. <strong>Pure · Natural · Trusted.</strong></p>'
    },
    {
      q: 'Which hair oil is right for me?',
      a: '<p>Choose <strong>Anti Hair Fall Oil</strong> if hair fall or weak hair is your main concern. Choose <strong>Hair Care Oil</strong> for everyday nourishment, dryness and shine. Both are suitable for all hair types.</p>'
    },
    {
      q: 'How often should I use the hair oils?',
      a: '<p>For best results, use them <strong>2–3 times a week</strong>. Massage the oil into your scalp, leave it on for 1–2 hours or overnight, then wash with a mild shampoo.</p>'
    },
    {
      q: 'What if my order arrives damaged or incorrect?',
      a: '<p>Please contact us within <strong>48 hours of delivery</strong> with a photo of the product and your order number, and we will arrange a replacement. See our <a href="policies.html#returns">Returns &amp; Exchanges</a> policy.</p>'
    }
  ];
};
