/* Esha Naturals — order creation, local order history and email delivery (FormSubmit) */
(function (E) {
  'use strict';

  const { store, money } = E.utils;
  const KEY = 'esha_orders_v1';
  const memory = {}; // keeps orders when the browser blocks storage (private mode, previews)

  const newOrderId = () => {
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(4);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
    return `EN-${ymd}-${rand}`;
  };

  // Emails can only be sent from the published website (http/https), not from a file opened
  // on a computer or an embedded preview. There the site runs as a demo.
  // window.ESHA_DEMO is set by the preview build (tools/build-single-file.js --artifact).
  const isLive = () => !window.ESHA_DEMO && /^https?:$/.test(window.location.protocol) && window.origin !== 'null';

  const itemsText = (order, sep) => order.items.map((i, n) => `${n + 1}. ${i.name} (${i.size}) × ${i.qty} = ${money(i.total)}`).join(sep);

  const postJSON = async (url, data, timeoutMs) => {
    const controller = 'AbortController' in window ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
        signal: controller ? controller.signal : undefined
      });
      let body = {};
      try {
        body = await res.json();
      } catch (e) {
        body = {};
      }
      return { ok: res.ok && String(body.success) === 'true', message: body.message || '' };
    } catch (e) {
      return { ok: false, message: e && e.name === 'AbortError' ? 'timeout' : 'network' };
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  const orders = {
    isLive,

    create(customer, notes) {
      const lines = E.cart.lines();
      const subtotal = E.cart.subtotal();
      const delivery = E.cart.deliveryFee(subtotal);
      return {
        id: newOrderId(),
        createdAt: new Date().toISOString(),
        customer,
        notes: notes || '',
        items: lines.map((l) => ({
          id: l.product.id,
          name: l.product.bundle ? `${l.product.name}: ${l.product.tagline}` : l.product.name,
          size: l.product.size,
          price: l.product.price,
          comparePrice: l.product.comparePrice,
          qty: l.qty,
          total: l.total
        })),
        subtotal,
        delivery,
        total: subtotal + delivery,
        savings: E.cart.savings(),
        payment: 'Cash on Delivery'
      };
    },

    save(order) {
      memory[order.id] = order;
      const list = store.get(KEY, []);
      const next = [order].concat(Array.isArray(list) ? list.filter((o) => o && o.id !== order.id) : []).slice(0, 20);
      store.set(KEY, next);
    },

    find(id) {
      if (memory[id]) return memory[id];
      const list = store.get(KEY, []);
      return (Array.isArray(list) ? list : []).find((o) => o && o.id === id) || null;
    },

    last() {
      const list = store.get(KEY, []);
      return (Array.isArray(list) && list[0]) || Object.values(memory).pop() || null;
    },

    // The email the store receives for every order (one row per field in a neat table).
    emailFields(order) {
      const c = order.customer;
      const when = new Date(order.createdAt).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const fields = {
        _subject: `New order received ${order.id}: ${money(order.total)} (${c.name}, ${c.city})`,
        _template: 'table',
        _captcha: 'false',
        'Order ID': order.id,
        'Order date': when,
        'Customer name': c.name,
        'Mobile number': c.phone,
        City: c.city,
        'Full address': c.address,
        'Nearest landmark': c.landmark || '-',
        'Items ordered': itemsText(order, ' | '),
        Subtotal: money(order.subtotal),
        'Delivery charges': order.delivery ? money(order.delivery) : 'Free',
        'TOTAL (Cash on Delivery)': money(order.total),
        Payment: E.config.advancePayment && E.config.advancePayment.enabled ? `${order.payment} (advance optional)` : order.payment,
        'Order notes': order.notes || '-',
        Website: window.location.origin + window.location.pathname
      };
      if (c.email) {
        fields.email = c.email; // lets the store press "Reply" to answer the customer
        fields._autoresponse = `Thank you for your order ${order.id} with ${E.config.brand}! Total: ${money(order.total)} (Cash on Delivery). Our team will call you shortly to confirm it. Delivery takes ${E.config.delivery.timeText}.`;
      }
      return fields;
    },

    // Sends the order to the store. Resolves to { ok, demo, message }. Never throws.
    async send(order) {
      const cfg = E.config;
      if (!isLive()) return { ok: true, demo: true };
      if (cfg.orderEndpoint) orders.syncSheet(order);
      if (!cfg.orderEmail) return { ok: !!cfg.orderEndpoint, message: 'No order email configured' };
      return postJSON(`https://formsubmit.co/ajax/${encodeURIComponent(cfg.orderEmail)}`, orders.emailFields(order), 15000);
    },

    // Contact-form messages go to the same inbox.
    async sendMessage({ name, phone, message }) {
      const cfg = E.config;
      if (!isLive()) return { ok: true, demo: true };
      if (!cfg.orderEmail) return { ok: false, message: 'No email configured' };
      return postJSON(
        `https://formsubmit.co/ajax/${encodeURIComponent(cfg.orderEmail)}`,
        {
          _subject: `Website message from ${name}`,
          _template: 'table',
          _captcha: 'false',
          Name: name,
          'Mobile number': phone || '-',
          Message: message,
          Website: window.location.origin + window.location.pathname
        },
        15000
      );
    },

    // The customer reports an advance payment from the popup after the order.
    async sendPayment(order, { method, reference }) {
      const cfg = E.config;
      if (!isLive()) return { ok: true, demo: true };
      if (!cfg.orderEmail) return { ok: false, message: 'No email configured' };
      const c = order.customer;
      return postJSON(
        `https://formsubmit.co/ajax/${encodeURIComponent(cfg.orderEmail)}`,
        {
          _subject: `Advance payment sent for order ${order.id} (${c.name})`,
          _template: 'table',
          _captcha: 'false',
          'Order ID': order.id,
          'Customer name': c.name,
          'Mobile number': c.phone,
          'Paid to': method,
          'Transaction ID / sender number': reference || '-',
          'Order total': money(order.total),
          Note: 'Please check your account before confirming this advance.'
        },
        15000
      );
    },

    // A customer review, emailed to the store for approval before it is shown on the website.
    async sendReview(r) {
      const cfg = E.config;
      if (!isLive()) return { ok: true, demo: true };
      if (!cfg.orderEmail) return { ok: false, message: 'No email configured' };
      const p = E.utils.getProduct(r.product);
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      return postJSON(
        `https://formsubmit.co/ajax/${encodeURIComponent(cfg.orderEmail)}`,
        {
          _subject: `New review (${r.rating}/5) for ${p ? p.name : r.product} from ${r.name}`,
          _template: 'table',
          _captcha: 'false',
          Product: p ? `${p.name} (${p.size})` : r.product,
          Rating: `${stars} (${r.rating} out of 5)`,
          Name: r.name,
          City: r.city || '-',
          Review: r.text,
          Date: r.date,
          'To publish': `Add it to assets/js/data/reviews.js: { product: '${r.product}', name: ${JSON.stringify(r.name)}, city: ${JSON.stringify(r.city || '')}, rating: ${r.rating}, date: '${r.date}', text: ${JSON.stringify(r.text)} },`
        },
        15000
      );
    },

    // Optional Google Sheet log (see google-apps-script/SETUP.md). Fire-and-forget.
    syncSheet(order) {
      try {
        fetch(E.config.orderEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(order)
        }).catch(() => {});
      } catch (e) {
        /* ignore */
      }
    }
  };

  E.orders = orders;
})(window.ESHA);
