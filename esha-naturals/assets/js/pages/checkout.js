/* Esha Naturals — checkout: customer details, validation, Cash on Delivery order */
(function (E) {
  'use strict';

  const U = E.utils;
  const ui = E.ui;
  const icon = E.icon;
  const cfg = E.config;
  const { $, esc, money } = U;

  const CITIES = [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Hyderabad',
    'Gujranwala',
    'Sialkot',
    'Sargodha',
    'Bahawalpur',
    'Sukkur',
    'Larkana',
    'Abbottabad',
    'Mardan',
    'Sahiwal',
    'Gujrat',
    'Sheikhupura',
    'Rahim Yar Khan',
    'Jhang',
    'Dera Ghazi Khan',
    'Dera Ismail Khan',
    'Kasur',
    'Okara',
    'Wah Cantt',
    'Mingora',
    'Nawabshah',
    'Chiniot',
    'Kamoke',
    'Hafizabad',
    'Sadiqabad',
    'Burewala',
    'Khanewal',
    'Muzaffargarh',
    'Mandi Bahauddin',
    'Jhelum',
    'Attock',
    'Chakwal',
    'Vehari',
    'Mianwali',
    'Khairpur',
    'Kohat',
    'Swabi',
    'Nowshera',
    'Charsadda',
    'Mansehra',
    'Haripur',
    'Mirpur (AJK)',
    'Muzaffarabad',
    'Gilgit',
    'Skardu',
    'Gwadar',
    'Turbat',
    'Taxila',
    'Murree',
    'Toba Tek Singh',
    'Pakpattan',
    'Lodhran',
    'Narowal',
    'Mirpur Khas',
    'Thatta'
  ];

  E.pages.checkout = function (ctx) {
    const root = $('[data-checkout]');
    if (!root) return;

    // Prefill from the last order placed on this device (convenience for repeat customers)
    const lastOrder = E.orders.last();
    const last = lastOrder && lastOrder.customer ? lastOrder.customer : {};

    const field = (id, label, input, { required = false, hint = '', error = '' } = {}) => `
    <div class="field" data-field="${id}">
      <label class="field__label" for="f-${id}">${label} ${required ? '<span class="req" aria-hidden="true">*</span>' : '<span class="opt">(optional)</span>'}</label>
      ${input}
      ${hint ? `<p class="field__hint" id="h-${id}">${hint}</p>` : ''}
      ${error ? `<p class="field__error" id="e-${id}">${icon('info')}<span>${error}</span></p>` : ''}
    </div>`;

    const describedBy = (id, hint) => `aria-describedby="${hint ? `h-${id} ` : ''}e-${id}"`;

    function renderEmpty() {
      root.innerHTML = `<div class="empty" style="padding-block:4rem 6rem">
      <span class="empty__icon">${icon('bag')}</span>
      <h2 class="empty__title">Your cart is empty</h2>
      <p class="empty__text">Add your favourite Esha Naturals oils to the cart, then come back here to place your order.</p>
      <a class="btn btn--dark" href="shop.html">Shop the collection</a>
    </div>`;
    }

    function renderForm() {
      const d = cfg.delivery || {};
      root.innerHTML = `<div class="checkout__grid">
      <form class="checkout-form" novalidate data-checkout-form>
        <div class="form-alert" data-form-alert role="alert" hidden></div>

        <section class="form-card" aria-labelledby="h-contact">
          <h2 class="form-card__title" id="h-contact"><span class="form-card__num">1</span>Contact details</h2>
          ${field('name', 'Full name', `<input class="input" id="f-name" name="name" autocomplete="name" maxlength="80" required placeholder="e.g. Ayesha Khan" value="${esc(last.name || '')}" ${describedBy('name')}>`, { required: true, error: 'Please enter your full name.' })}
          <div class="field-row">
            ${field('phone', 'Mobile number', `<input class="input" id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" required placeholder="03XX XXXXXXX" value="${esc(last.phone || '')}" ${describedBy('phone', true)}>`, { required: true, hint: 'We will call you on this number to confirm your order.', error: 'Please enter a valid mobile number, e.g. 0300 1234567.' })}
            ${field('email', 'Email', `<input class="input" id="f-email" name="email" type="email" autocomplete="email" maxlength="120" placeholder="you@example.com" value="${esc(last.email || '')}" ${describedBy('email')}>`, { error: 'Please enter a valid email address.' })}
          </div>
        </section>

        <section class="form-card" aria-labelledby="h-address">
          <h2 class="form-card__title" id="h-address"><span class="form-card__num">2</span>Delivery address</h2>
          ${field('city', 'City', `<input class="input" id="f-city" name="city" list="pk-cities" autocomplete="address-level2" maxlength="60" required placeholder="Start typing your city" value="${esc(last.city || '')}" ${describedBy('city')}>`, { required: true, error: 'Please enter your city.' })}
          ${field('address', 'Complete address', `<textarea class="input" id="f-address" name="address" autocomplete="street-address" maxlength="300" required rows="3" placeholder="House / flat no., street, block, area" ${describedBy('address')}>${esc(last.address || '')}</textarea>`, { required: true, error: 'Please enter your complete address (house no., street and area).' })}
          ${field('landmark', 'Nearest landmark', `<input class="input" id="f-landmark" name="landmark" maxlength="120" placeholder="e.g. near Jamia Masjid" value="${esc(last.landmark || '')}">`)}
          ${field('notes', 'Order notes', '<textarea class="input" id="f-notes" name="notes" maxlength="400" rows="2" placeholder="Anything we should know about your order or delivery?"></textarea>')}
          <datalist id="pk-cities">${CITIES.map((c) => `<option value="${esc(c)}"></option>`).join('')}</datalist>
        </section>

        <section class="form-card" aria-labelledby="h-payment">
          <h2 class="form-card__title" id="h-payment"><span class="form-card__num">3</span>Payment</h2>
          <label class="pay-option">
            <input type="radio" name="payment" value="cod" checked>
            <div><strong>Cash on Delivery (COD)</strong><span>Pay in cash when your order arrives.</span></div>
            ${icon('cash')}
          </label>
          ${
            cfg.advancePayment && cfg.advancePayment.enabled
              ? `<p class="confirm-note">${icon('wallet')}<span><strong>Optional:</strong> after placing your order you can send a small advance by ${esc(
                  (cfg.advancePayment.accounts || []).map((a) => a.method.replace(/\s*\(.*\)/, '')).join(' or ')
                )} to confirm it on priority. It is deducted from your total. Your order is received either way.</span></p>`
              : ''
          }
          <p class="confirm-note">${icon('phone')}<span>After you place your order, our team will call you to confirm it. Delivery takes <strong>${esc(d.timeText || '')}</strong>.</span></p>
        </section>

        <div class="hp" aria-hidden="true"><label>Company <input type="text" name="company" tabindex="-1" autocomplete="off"></label></div>

        <div class="place-order">
          <button type="button" class="btn btn--gold btn--lg btn--block" data-place-order></button>
          <p class="place-order__terms">By placing your order you agree to our <a href="policies.html">shipping, returns &amp; privacy policies</a>.</p>
          ${E.orders.isLive() ? '' : `<p class="demo-note">${icon('info')}<span><strong>Preview.</strong> Orders placed here are not sent. On the live website every order is emailed to ${esc(cfg.brand)}.</span></p>`}
        </div>
      </form>
      <aside class="summary-card" aria-labelledby="summary-title" data-summary></aside>
    </div>`;
    }

    function renderSummary() {
      const box = $('[data-summary]');
      if (!box) return;
      ui.keepFocus(box, () => fillSummary(box));
      const btn = $('[data-place-order]');
      if (btn && !btn.classList.contains('is-loading')) {
        btn.innerHTML = `${icon('lock')}<span>Place Order · ${money(E.cart.total())}</span>`;
      }
    }

    function fillSummary(box) {
      const lines = E.cart.lines();
      const bar = ui.freeBarHtml(E.cart.subtotal());
      box.innerHTML = `
      <h2 class="summary-card__title" id="summary-title">Order summary <a href="shop.html">Add more</a></h2>
      ${bar ? `<div class="free-bar">${bar}</div>` : ''}
      <ul class="line-items">${lines.map((l) => ui.lineItemHtml(l, { compact: true })).join('')}</ul>
      ${ui.totalsHtml()}
      <p class="drawer__note" style="color:var(--on-dark-muted)">${icon('lock')} Cash on Delivery · pay when it arrives</p>`;
    }

    /* ---------------- Validation ---------------- */
    const validators = {
      name: (v) => v.trim().length >= 3 && /[a-z؀-ۿ]/i.test(v),
      phone: (v) => !!U.normalizePkPhone(v),
      email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      city: (v) => v.trim().length >= 2,
      address: (v) => v.trim().length >= 10
    };

    function setFieldError(name, invalid) {
      const wrap = $(`[data-field="${name}"]`);
      const input = $(`[name="${name}"]`);
      if (!wrap || !input) return;
      wrap.classList.toggle('has-error', invalid);
      input.setAttribute('aria-invalid', String(invalid));
    }

    function validate(form) {
      const bad = [];
      Object.keys(validators).forEach((name) => {
        const el = form.elements[name];
        const invalid = !validators[name](el ? el.value : '');
        setFieldError(name, invalid);
        if (invalid) bad.push(el);
      });
      return bad;
    }

    function bindForm() {
      const form = $('[data-checkout-form]');
      if (!form) return;
      const alertBox = $('[data-form-alert]');

      // Re-check a field once the customer edits it after an error
      form.addEventListener('input', (e) => {
        const name = e.target.name;
        if (validators[name] && e.target.getAttribute('aria-invalid') === 'true') {
          setFieldError(name, !validators[name](e.target.value));
        }
      });
      form.addEventListener('focusout', (e) => {
        const name = e.target.name;
        if (validators[name] && e.target.value.trim()) setFieldError(name, !validators[name](e.target.value));
      });

      // The order is placed from the button click (and Enter inside the form). Handling the click directly
      // also works inside embedded previews that block normal form submission.
      const placeOrder = async () => {
        if ($('[data-place-order]').classList.contains('is-loading')) return;
        if (!E.cart.count()) return render();
        if (form.elements.company && form.elements.company.value) return; // bot trap

        const bad = validate(form);
        if (bad.length) {
          alertBox.hidden = false;
          alertBox.innerHTML = `${icon('info')}<span>Please check the highlighted field${bad.length > 1 ? 's' : ''} and try again.</span>`;
          bad[0].focus();
          return;
        }
        alertBox.hidden = true;

        const v = (n) => (form.elements[n] ? form.elements[n].value.trim() : '');
        const customer = {
          name: v('name'),
          phone: U.normalizePkPhone(v('phone')),
          email: v('email'),
          city: v('city'),
          address: v('address').replace(/\s+/g, ' '),
          landmark: v('landmark')
        };
        const order = E.orders.create(customer, v('notes'));
        E.orders.save(order);

        const btn = $('[data-place-order]');
        btn.classList.add('is-loading');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Placing your order…</span>';

        // The order is emailed to the store (see orderEmail in config.js)
        const result = await E.orders.send(order);
        if (!result.ok) {
          btn.classList.remove('is-loading');
          btn.disabled = false;
          renderSummary();
          const call = cfg.phone ? ` or call us on <a href="${U.telUrl()}">${esc(cfg.phone)}</a>` : '';
          alertBox.hidden = false;
          alertBox.innerHTML = `${icon('info')}<span>Sorry, we couldn't send your order just now. Please check your internet connection and tap Place Order again${call}.</span>`;
          alertBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
          return;
        }
        order.emailed = !result.demo;
        order.demo = !!result.demo;
        E.orders.save(order);
        E.cart.clear();
        E.nav.go(`order-success.html?order=${encodeURIComponent(order.id)}`);
      };

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        placeOrder();
      });
      $('[data-place-order]').addEventListener('click', (e) => {
        e.preventDefault();
        placeOrder();
      });
    }

    let mode = '';
    function render() {
      const hasItems = E.cart.count() > 0;
      if (!hasItems) {
        if (mode !== 'empty') renderEmpty();
        mode = 'empty';
        return;
      }
      if (mode !== 'form') {
        renderForm();
        bindForm();
        mode = 'form';
      }
      renderSummary();
    }

    ctx.cleanup(
      E.cart.onChange(() => {
        // Keep the page as-is while an order is being submitted (the cart is cleared just before leaving)
        const btn = $('[data-place-order]');
        if (btn && btn.classList.contains('is-loading')) return;
        render();
      })
    );

    if (!cfg.orderEmail && !cfg.orderEndpoint && window.console) {
      console.warn('[Esha Naturals] No orderEmail or orderEndpoint set in assets/js/config.js, so orders cannot reach the store yet.');
    }

    render();
  };
})(window.ESHA);
