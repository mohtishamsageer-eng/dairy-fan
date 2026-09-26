/* Esha Naturals — contact page: contact options, message form (sent via WhatsApp or email), FAQ */
(function (E) {
  'use strict';

  const U = E.utils;
  const ui = E.ui;
  const icon = E.icon;
  const cfg = E.config;
  const { $, esc } = U;

  const wa = U.whatsappUrl(`Hi ${cfg.brand}!`);
  const tel = U.telUrl();

  /* ---------- Contact cards ---------- */
  const cards = [];
  if (wa) cards.push(`<a class="contact-card contact-card--wa" href="${wa}" target="_blank" rel="noopener">${icon('whatsapp')}<div><strong>WhatsApp</strong><span>Fastest way to order or ask a question</span></div></a>`);
  if (tel) cards.push(`<a class="contact-card" href="${tel}">${icon('phone')}<div><strong>${esc(cfg.phone)}</strong><span>Call us for orders and delivery updates</span></div></a>`);
  if (cfg.email) cards.push(`<a class="contact-card" href="mailto:${esc(cfg.email)}">${icon('mail')}<div><strong>${esc(cfg.email)}</strong><span>We reply as soon as we can</span></div></a>`);
  cards.push(`<div class="contact-card">${icon('truck')}<div><strong>Delivery across Pakistan</strong><span>${esc((cfg.delivery && cfg.delivery.timeText) || '')}</span></div></div>`);
  cards.push(`<div class="contact-card">${icon('cash')}<div><strong>Cash on Delivery</strong><span>No advance payment, pay when your order arrives</span></div></div>`);
  if (cfg.location) cards.push(`<div class="contact-card">${icon('pin')}<div><strong>${esc(cfg.location)}</strong><span>${esc(cfg.brand)}</span></div></div>`);
  const cardsEl = $('[data-contact-cards]');
  if (cardsEl) cardsEl.innerHTML = cards.join('');

  /* ---------- Message form ---------- */
  const form = $('[data-contact-form]');
  const hint = $('[data-contact-hint]');
  const canSend = !!(wa || cfg.email);
  if (form) {
    if (hint) {
      hint.textContent = wa
        ? 'Your message will open in WhatsApp, ready to send.'
        : cfg.email
          ? 'Your message will open in your email app, ready to send.'
          : 'Our contact details will be available here soon.';
    }
    if (!canSend) $('[data-contact-submit]').disabled = true;

    const check = (name, ok) => {
      const wrap = $(`[data-field="${name}"]`);
      wrap.classList.toggle('has-error', !ok);
      form.elements[name].setAttribute('aria-invalid', String(!ok));
      return ok;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements.cname.value.trim();
      const phone = form.elements.cphone.value.trim();
      const msg = form.elements.cmessage.value.trim();
      const okName = check('cname', name.length >= 2);
      const okMsg = check('cmessage', msg.length >= 3);
      if (!okName) return form.elements.cname.focus();
      if (!okMsg) return form.elements.cmessage.focus();
      if (!canSend) return;

      const text = `Hi ${cfg.brand}!\n\n${msg}\n\nName: ${name}${phone ? `\nPhone: ${phone}` : ''}`;
      const url = U.whatsappUrl(text) ||
        `mailto:${cfg.email}?subject=${encodeURIComponent(`Message from ${name}`)}&body=${encodeURIComponent(text)}`;
      if (url.startsWith('mailto:')) window.location.href = url;
      else {
        const w = window.open(url, '_blank');
        if (w) w.opener = null;
      }
      ui.toast('Thank you! Your message is ready to send.');
      form.reset();
    });
  }

  /* ---------- FAQ ---------- */
  const faq = $('[data-faq]');
  if (faq) faq.innerHTML = ui.faqHtml();
})(window.ESHA);
