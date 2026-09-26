/* Esha Naturals — order confirmation page */
(function (E) {
  'use strict';

  const U = E.utils;
  const icon = E.icon;
  const cfg = E.config;
  const { $, esc, money } = U;

  /* ---------- Small advance payment (optional, after the order is received) ---------- */
  const advanceCfg = () => cfg.advancePayment || {};
  const advanceOn = () => advanceCfg().enabled && (advanceCfg().accounts || []).length > 0;
  const advanceText = () => (advanceCfg().amount ? `an advance of ${money(advanceCfg().amount)}` : 'a small advance');

  // 03137996525 → 0313 7996525 · 5040453415800018 → 5040 4534 1580 0018
  const prettyNumber = (n) => {
    const d = String(n).replace(/\s+/g, '');
    if (/^03\d{9}$/.test(d)) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return d.replace(/(.{4})(?=.)/g, '$1 ');
  };

  const accountsHtml = (prefix) => `<ul class="pay-accounts">
      ${advanceCfg()
        .accounts.map(
          (a, i) => `<li class="pay-account">
        <span class="pay-account__method">${esc(a.method)}</span>
        <span class="pay-account__number" id="${prefix}-num-${i}">${esc(prettyNumber(a.number))}</span>
        <span class="pay-account__title">Account title: <strong>${esc(a.title)}</strong></span>
        <button type="button" class="btn btn--outline btn--sm" data-copy="${esc(String(a.number).replace(/\s+/g, ''))}" data-copy-el="${prefix}-num-${i}" aria-label="Copy ${esc(a.method)} number">${icon('copy')}<span>Copy</span></button>
      </li>`
        )
        .join('')}
    </ul>`;

  function copyText(btn) {
    const text = btn.dataset.copy;
    const el = document.getElementById(btn.dataset.copyEl);
    const done = (ok) => {
      const label = btn.querySelector('span');
      if (ok) {
        btn.classList.add('is-done');
        btn.innerHTML = `${icon('check')}<span>Copied</span>`;
        setTimeout(() => {
          btn.classList.remove('is-done');
          btn.innerHTML = `${icon('copy')}<span>Copy</span>`;
        }, 1800);
      } else if (label) {
        E.ui.toast('Number selected. Copy it from your keyboard menu.', { icon: 'info' });
      }
    };
    const selectIt = () => {
      if (!el) return false;
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      return ok;
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => done(true),
        () => done(selectIt())
      );
    } else {
      done(selectIt());
    }
  }

  function advanceBoxHtml(order) {
    const a = order.advance;
    if (a) {
      return `<section class="advance-box" aria-labelledby="advance-title">
        <h2 id="advance-title">Advance payment</h2>
        <p class="is-paid">${icon('check')} Thank you! You told us you sent the advance via ${esc(a.method)}${a.reference ? ` (ref. ${esc(a.reference)})` : ''}.</p>
        <p>We will check it and confirm your order on the call. The advance is deducted from the amount you pay on delivery.</p>
      </section>`;
    }
    return `<section class="advance-box" aria-labelledby="advance-title">
      <h2 id="advance-title">Confirm faster with ${advanceText()}</h2>
      <p>Optional: send ${advanceText()} by JazzCash or bank transfer and your order is confirmed on priority. The advance is deducted from the amount you pay on delivery. Not paying an advance? No problem, your order has been received and you can pay everything on delivery.</p>
      ${accountsHtml('box')}
      <div><button type="button" class="btn btn--gold" data-open-pay>${icon('wallet')}<span>I've sent the advance</span></button></div>
    </section>`;
  }

  function payModalHtml(order) {
    const accounts = advanceCfg().accounts;
    return `<dialog class="pay-modal" data-pay-modal aria-labelledby="pay-title" aria-describedby="pay-text">
      <div class="pay-modal__head">
        <button type="button" class="icon-btn pay-modal__close" data-pay-close aria-label="Close">${icon('close')}</button>
        <span class="pay-modal__icon">${icon('wallet')}</span>
        <p class="eyebrow eyebrow--center">Order received</p>
        <h2 class="pay-modal__title" id="pay-title" tabindex="-1">Confirm your order with ${advanceText()}</h2>
        <p class="pay-modal__text" id="pay-text">Your order <strong>${esc(order.id)}</strong> is already with us. To confirm it on priority, send ${advanceText()} to either account below. It is deducted from the amount you pay on delivery. This is optional.</p>
      </div>
      <form class="pay-modal__body" data-pay-form novalidate>
        ${accountsHtml('modal')}
        <fieldset class="field">
          <legend class="field__label">Which account did you pay to?</legend>
          <div class="pay-methods">
            ${accounts
              .map(
                (a, i) =>
                  `<label><input type="radio" name="method" value="${esc(a.method)}"${i === 0 ? ' checked' : ''}> ${esc(a.method)}</label>`
              )
              .join('')}
          </div>
        </fieldset>
        <div class="field">
          <label class="field__label" for="pay-ref">Transaction ID or the number you sent from <span class="opt">(optional)</span></label>
          <input class="input" id="pay-ref" name="reference" type="text" maxlength="60" autocomplete="off" placeholder="e.g. 0123456789">
        </div>
        <p class="form-alert" data-pay-alert role="alert" hidden></p>
        <div class="pay-modal__actions">
          <button type="button" class="btn btn--gold btn--block" data-pay-sent>${icon('check')}<span>I've sent the advance</span></button>
          <button type="button" class="pay-modal__skip" data-pay-skip>Skip, I'll pay on delivery</button>
        </div>
        <p class="pay-modal__note">You can also send the payment screenshot on WhatsApp ${esc(cfg.phone || '')}.</p>
      </form>
    </dialog>`;
  }

  E.pages.success = function (ctx) {
    const root = $('[data-success]');
    if (!root) return;

    const order = E.orders.find(U.param('order') || '');

    if (!order) {
      root.innerHTML = `<div class="success__card">
        <div class="success__hero">
          <span class="empty__icon">${icon('box')}</span>
          <h1 class="success__title">Order not found</h1>
          <p class="section-sub">We couldn't find this order on this device. If you have already placed an order, our team will call you to confirm it.</p>
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
    const d = cfg.delivery || {};

    const demoNote = order.demo
      ? `<p class="demo-note">${icon('info')}<span><strong>Demo preview.</strong> On the live website this order is emailed to ${esc(cfg.brand)} automatically${cfg.orderEmail ? ` (${esc(cfg.orderEmail)})` : ''}.</span></p>`
      : '';

    root.innerHTML = `<div class="success__card">
      <div class="success__hero">
        <span class="success__check">${icon('check')}</span>
        <p class="eyebrow eyebrow--center">Order received</p>
        <h1 class="success__title">Thank you${firstName ? `, ${esc(firstName)}` : ''}!</h1>
        <p class="section-sub">Your order has been placed. Our team will call you on <strong>${esc(c.phone)}</strong> shortly to confirm it.</p>
        <p class="success__id">Order number <strong>${esc(order.id)}</strong></p>
        ${demoNote}
      </div>

      <ol class="timeline" aria-label="What happens next">
        <li class="is-done"><i>${icon('check')}</i><strong>Order placed</strong><span>${esc(U.formatDate(order.createdAt))}</span></li>
        <li><i>${icon('phone')}</i><strong>Confirmation</strong><span>We call you to confirm</span></li>
        <li><i>${icon('box')}</i><strong>Dispatched</strong><span>Packed with care</span></li>
        <li><i>${icon('truck')}</i><strong>Delivered</strong><span>${esc(d.timeText || '')}</span></li>
      </ol>

      ${advanceOn() ? `<div data-advance>${advanceBoxHtml(order)}</div>` : ''}

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
            <p data-pay-line>${payLine(order)}</p>
            ${order.notes ? `<h3 style="margin-top:1rem">Notes</h3><p>${esc(order.notes)}</p>` : ''}
          </div>
        </div>
      </section>

      <div class="success__actions">
        <a class="btn btn--dark" href="shop.html">Continue shopping</a>
        ${window.ESHA_ARTIFACT ? '' : `<button type="button" class="btn btn--outline" data-print>${icon('box')}<span>Print receipt</span></button>`}
      </div>
    </div>
    ${advanceOn() ? payModalHtml(order) : ''}`;

    const printBtn = $('[data-print]');
    if (printBtn) printBtn.addEventListener('click', () => window.print());
    document.title = `Order ${order.id} | ${cfg.brand}`;

    if (advanceOn()) bindAdvance(ctx, root, order);
  };

  function payLine(order) {
    return order.advance
      ? `${esc(order.payment)}: please keep the remaining amount ready (total ${money(order.total)} minus your advance).`
      : `${esc(order.payment)}: please keep ${money(order.total)} ready when your order arrives.`;
  }

  function bindAdvance(ctx, root, order) {
    const modal = $('[data-pay-modal]', root);
    if (!modal) return;
    const alertBox = $('[data-pay-alert]', modal);
    const sentBtn = $('[data-pay-sent]', modal);
    let opener = null;

    const open = (trigger) => {
      if (modal.open) return;
      opener = trigger || null;
      alertBox.hidden = true;
      if (typeof modal.showModal === 'function') modal.showModal();
      else modal.setAttribute('open', '');
      const title = $('#pay-title', modal);
      if (title) title.focus();
      document.documentElement.classList.add('modal-open');
    };
    const close = () => {
      if (modal.open) {
        if (typeof modal.close === 'function') modal.close();
        else modal.removeAttribute('open');
      }
    };
    modal.addEventListener('close', () => {
      document.documentElement.classList.remove('modal-open');
      if (opener && document.contains(opener)) opener.focus();
    });
    // a click on the dark backdrop closes the popup
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    ctx.cleanup(() => {
      opener = null;
      close();
    });

    const refresh = () => {
      const box = $('[data-advance]', root);
      if (box) box.innerHTML = advanceBoxHtml(order);
      const line = $('[data-pay-line]', root);
      if (line) line.innerHTML = payLine(order);
    };

    root.addEventListener('click', (e) => {
      const copy = e.target.closest('[data-copy]');
      if (copy) return copyText(copy);
      const openBtn = e.target.closest('[data-open-pay]');
      if (openBtn) return open(openBtn);
      if (e.target.closest('[data-pay-close]')) return close();
      if (e.target.closest('[data-pay-skip]')) {
        close();
        E.ui.toast('No problem, pay everything on delivery. We will call you to confirm.', { icon: 'cash', timeout: 4200 });
      }
    });

    let busy = false;
    const submit = async () => {
      if (busy) return;
      const form = $('[data-pay-form]', modal);
      const method = (form.querySelector('input[name="method"]:checked') || {}).value || advanceCfg().accounts[0].method;
      const reference = String(form.reference.value || '').trim();
      busy = true;
      sentBtn.disabled = true;
      sentBtn.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>Sending…</span>`;
      const res = await E.orders.sendPayment(order, { method, reference });
      busy = false;
      sentBtn.disabled = false;
      sentBtn.innerHTML = `${icon('check')}<span>I've sent the advance</span>`;
      if (!res || !res.ok) {
        alertBox.hidden = false;
        alertBox.innerHTML = `${icon('info')}<span>Sorry, we couldn't send this just now. Please try again, or tell us on the confirmation call${cfg.phone ? ` (${esc(cfg.phone)})` : ''}.</span>`;
        return;
      }
      order.advance = { method, reference, at: new Date().toISOString() };
      E.orders.save(order);
      refresh();
      opener = null;
      close();
      const where = $('#advance-title', root);
      if (where) {
        where.setAttribute('tabindex', '-1');
        where.focus();
      }
      E.ui.toast(
        res.demo
          ? 'Preview: on the live website this is emailed to the store.'
          : 'Thank you! We will check your advance and confirm your order.',
        {
          icon: 'check',
          timeout: 4200
        }
      );
    };
    sentBtn.addEventListener('click', submit);
    $('[data-pay-form]', modal).addEventListener('submit', (e) => {
      e.preventDefault();
      submit();
    });

    // Show the popup once, right after the order is placed
    if (!order.advance && !order.advanceShown) {
      order.advanceShown = true;
      E.orders.save(order);
      const t = setTimeout(() => open(null), 900);
      ctx.cleanup(() => clearTimeout(t));
    }
  }
})(window.ESHA);
