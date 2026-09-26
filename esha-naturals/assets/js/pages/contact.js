/* Esha Naturals — contact page: contact options, message form (emailed to the store), FAQ */
(function (E) {
  'use strict';

  const U = E.utils;
  const ui = E.ui;
  const icon = E.icon;
  const cfg = E.config;
  const { $, esc } = U;

  E.pages.contact = function () {
    const wa = U.whatsappUrl(`Hi ${cfg.brand}! I have a question.`);
    const tel = U.telUrl();

    /* ---------- Contact cards ---------- */
    const cards = [];
    if (tel)
      cards.push(
        `<a class="contact-card" href="${tel}">${icon('phone')}<div><strong>${esc(cfg.phone)}</strong><span>Call us for orders and delivery updates</span></div></a>`
      );
    if (cfg.email)
      cards.push(
        `<a class="contact-card" href="mailto:${esc(cfg.email)}">${icon('mail')}<div><strong>${esc(cfg.email)}</strong><span>We reply as soon as we can</span></div></a>`
      );
    if (wa)
      cards.push(
        `<a class="contact-card contact-card--wa" href="${wa}" target="_blank" rel="noopener">${icon('whatsapp')}<div><strong>Chat on WhatsApp</strong><span>Questions about our products</span></div></a>`
      );
    cards.push(
      `<div class="contact-card">${icon('truck')}<div><strong>Delivery across Pakistan</strong><span>${esc((cfg.delivery && cfg.delivery.timeText) || '')}</span></div></div>`
    );
    cards.push(
      `<div class="contact-card">${icon('cash')}<div><strong>Cash on Delivery</strong><span>No advance payment, pay when your order arrives</span></div></div>`
    );
    const cardsEl = $('[data-contact-cards]');
    if (cardsEl) cardsEl.innerHTML = cards.join('');

    /* ---------- Message form (sent to the store's email) ---------- */
    const form = $('[data-contact-form]');
    const hint = $('[data-contact-hint]');
    if (form) {
      if (hint) hint.textContent = cfg.orderEmail ? 'Your message is sent straight to our inbox. We usually reply within a day.' : '';
      const submit = $('[data-contact-submit]');
      if (!cfg.orderEmail) submit.disabled = true;

      const check = (name, ok) => {
        const wrap = $(`[data-field="${name}"]`);
        wrap.classList.toggle('has-error', !ok);
        form.elements[name].setAttribute('aria-invalid', String(!ok));
        return ok;
      };

      const sendForm = async () => {
        if (submit.disabled) return;
        const name = form.elements.cname.value.trim();
        const phone = form.elements.cphone.value.trim();
        const message = form.elements.cmessage.value.trim();
        const okName = check('cname', name.length >= 2);
        const okMsg = check('cmessage', message.length >= 3);
        if (!okName) return form.elements.cname.focus();
        if (!okMsg) return form.elements.cmessage.focus();

        submit.disabled = true;
        submit.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Sending…</span>';
        const result = await E.orders.sendMessage({ name, phone, message });
        submit.disabled = false;
        submit.textContent = 'Send message';
        if (!result.ok) {
          ui.toast(`Sorry, your message could not be sent. Please try again${cfg.phone ? ` or call ${cfg.phone}` : ''}.`, {
            icon: 'info',
            timeout: 6000
          });
          return;
        }
        form.reset();
        ui.toast(
          result.demo ? 'Demo preview: on the live website this message is emailed to us.' : 'Thank you! Your message has been sent.',
          { timeout: 5000 }
        );
      };
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendForm();
      });
      submit.addEventListener('click', (e) => {
        e.preventDefault();
        sendForm();
      });
    }

    /* ---------- FAQ ---------- */
    const faq = $('[data-faq]');
    if (faq) faq.innerHTML = ui.faqHtml();
  };
})(window.ESHA);
