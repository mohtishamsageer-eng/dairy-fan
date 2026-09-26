/* Esha Naturals — order confirmation page */
(function (E) {
  'use strict';

  const U = E.utils;
  const icon = E.icon;
  const cfg = E.config;
  const { $, esc, money } = U;

  const root = $('[data-success]');
  if (!root) return;

  const order = E.orders.find(U.param('order') || '');

  if (!order) {
    root.innerHTML = `<div class="success__card">
      <div class="success__hero">
        <span class="empty__icon">${icon('box')}</span>
        <h1 class="success__title">Order not found</h1>
        <p class="section-sub">We couldn't find this order on this device. If you have already placed an order, our team will contact you to confirm it.</p>
        <div class="success__actions">
          <a class="btn btn--dark" href="shop.html">Continue shopping</a>
          <a class="btn btn--outline" href="contact.html">Contact us</a>
        </div>
      </div>
    </div>`;
    return;
  }

  const c = order.customer;
  const firstName = String(c.name || '').split(' ')[0];
  const waUrl = E.orders.whatsappUrl(order);
  const viaSheet = !!cfg.orderEndpoint;
  const d = cfg.delivery || {};

  const lead = waUrl && !viaSheet
    ? 'One last step: send your order to us on WhatsApp so our team can confirm it.'
    : 'Your order has been placed. Our team will call or WhatsApp you shortly to confirm it.';

  const waPanel = waUrl
    ? `<div class="wa-panel">
        <p>${viaSheet
          ? 'Want a faster confirmation? Send your order details to us on WhatsApp.'
          : order.whatsappOpened
            ? 'WhatsApp should have opened with your order details. Please press <strong>Send</strong>. If it did not open, tap the button below.'
            : 'Tap the button below. WhatsApp will open with your order details, just press <strong>Send</strong>.'}</p>
        <a class="btn btn--wa btn--lg" href="${waUrl}" target="_blank" rel="noopener">${icon('whatsapp')}<span>Send order on WhatsApp</span></a>
      </div>`
    : '';

  root.innerHTML = `<div class="success__card">
    <div class="success__hero">
      <span class="success__check">${icon('check')}</span>
      <p class="eyebrow eyebrow--center">${waUrl && !viaSheet ? 'Almost done' : 'Order received'}</p>
      <h1 class="success__title">Thank you${firstName ? `, ${esc(firstName)}` : ''}!</h1>
      <p class="section-sub">${lead}</p>
      <p class="success__id">Order number <strong>${esc(order.id)}</strong></p>
    </div>

    ${waPanel}

    <ol class="timeline" aria-label="What happens next">
      <li class="is-done"><i>${icon('check')}</i><strong>Order placed</strong><span>${esc(U.formatDate(order.createdAt))}</span></li>
      <li><i>${icon('phone')}</i><strong>Confirmation</strong><span>We call or WhatsApp you</span></li>
      <li><i>${icon('box')}</i><strong>Dispatched</strong><span>Packed with care</span></li>
      <li><i>${icon('truck')}</i><strong>Delivered</strong><span>${esc(d.timeText || '')}</span></li>
    </ol>

    <section class="order-box" aria-labelledby="order-summary-title">
      <h2 id="order-summary-title">Order summary</h2>
      <ul class="order-lines">
        ${order.items.map((i) => `<li><span>${esc(i.name)} (${esc(i.size)}) × ${i.qty}</span><span>${money(i.total)}</span></li>`).join('')}
      </ul>
      <dl class="totals">
        <div class="totals__row"><dt>Subtotal</dt><dd>${money(order.subtotal)}</dd></div>
        <div class="totals__row"><dt>Delivery</dt><dd>${order.delivery ? money(order.delivery) : 'Free'}</dd></div>
        ${order.savings ? `<div class="totals__row totals__row--save"><dt>You saved</dt><dd>${money(order.savings)}</dd></div>` : ''}
        <div class="totals__row totals__row--total"><dt>Total to pay</dt><dd>${money(order.total)}</dd></div>
      </dl>
      <div class="order-box__grid">
        <div>
          <h3>Delivery details</h3>
          <address>
            ${esc(c.name)}<br>
            ${esc(c.phone)}${c.email ? `<br>${esc(c.email)}` : ''}<br>
            ${esc(c.address)}${c.landmark ? `<br>Near ${esc(c.landmark)}` : ''}<br>
            ${esc(c.city)}
          </address>
        </div>
        <div>
          <h3>Payment</h3>
          <p>${esc(order.payment)}: please keep ${money(order.total)} ready when your order arrives.</p>
          ${order.notes ? `<h3 style="margin-top:1rem">Notes</h3><p>${esc(order.notes)}</p>` : ''}
        </div>
      </div>
    </section>

    <div class="success__actions">
      <a class="btn btn--dark" href="shop.html">Continue shopping</a>
      <button type="button" class="btn btn--outline" data-print>${icon('box')}<span>Print receipt</span></button>
    </div>
  </div>`;

  const printBtn = $('[data-print]');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
  document.title = `Order ${order.id} | ${cfg.brand}`;
})(window.ESHA);
