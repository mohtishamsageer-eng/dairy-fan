/* Esha Naturals — order creation, local order history and delivery to the store
 * (Google Sheet + Gmail when set up, otherwise email through Web3Forms or FormSubmit) */
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

  // Sends one email to the store. Uses Web3Forms when an access key is set in config.js (no activation,
  // works on any web address); otherwise FormSubmit, which needs one "Activate Form" click per address.
  const canEmail = () => !!(E.config.web3formsKey || E.config.orderEmail);
  const deliver = (fields) => {
    const cfg = E.config;
    if (cfg.web3formsKey) {
      const data = { access_key: cfg.web3formsKey, subject: fields._subject, from_name: `${cfg.brand} website` };
      Object.keys(fields).forEach((k) => {
        if (k[0] !== '_' && k !== 'email') data[k] = fields[k];
      });
      if (fields.email) {
        data['Customer email'] = fields.email;
        data.replyto = fields.email; // lets the store press "Reply" to answer the customer
      }
      return postJSON('https://api.web3forms.com/submit', data, 15000);
    }
    return postJSON(`https://formsubmit.co/ajax/${encodeURIComponent(cfg.orderEmail)}`, fields, 15000);
  };

  // Google Sheet + Gmail (google-apps-script/Code.gs). A plain-text POST keeps it a "simple" request,
  // so the browser can read Google's answer and know the order really arrived.
  const postToSheet = async (payload, timeoutMs) => {
    const controller = 'AbortController' in window ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const res = await fetch(E.config.orderEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      });
      const body = await res.json();
      return { ok: res.ok && body.ok === true, message: body.error || '' };
    } catch (e) {
      return { ok: false, message: e && e.name === 'AbortError' ? 'timeout' : 'network' };
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  // Delivers one order, payment, message or review to the store: to the Google Sheet (which also emails
  // the store) when orderEndpoint is set, and by email if the sheet is not set up or does not answer.
  const dispatch = async (type, fields, extra) => {
    const cfg = E.config;
    if (!isLive()) return { ok: true, demo: true };
    if (cfg.orderEndpoint) {
      const res = await postToSheet(Object.assign({ type, fields }, extra), 20000);
      if (res.ok) return res;
    }
    if (!canEmail()) return { ok: false, message: 'No order email configured' };
    return deliver(fields);
  };

  const orders = {
    isLive,
    canEmail,

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
    send(order) {
      return dispatch('order', orders.emailFields(order), { order });
    },

    // Contact-form messages go to the same inbox.
    sendMessage({ name, phone, message }) {
      return dispatch('message', {
        _subject: `Website message from ${name}`,
        _template: 'table',
        _captcha: 'false',
        Name: name,
        'Mobile number': phone || '-',
        Message: message,
        Website: window.location.origin + window.location.pathname
      });
    },

    // The customer reports an advance payment from the popup after the order.
    sendPayment(order, { method, reference }) {
      const c = order.customer;
      return dispatch('payment', {
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
      });
    },

    // A customer review, emailed to the store for approval before it is shown on the website.
    sendReview(r) {
      const p = E.utils.getProduct(r.product);
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      return dispatch('review', {
        _subject: `New review (${r.rating}/5) for ${p ? p.name : r.product} from ${r.name}`,
        _template: 'table',
        _captcha: 'false',
        Product: p ? `${p.name} (${p.size})` : r.product,
        'Product ID': r.product,
        Stars: r.rating,
        Rating: `${stars} (${r.rating} out of 5)`,
        Name: r.name,
        City: r.city || '-',
        Review: r.text,
        Date: r.date,
        'To publish': E.config.orderEndpoint
          ? 'Open the admin panel (admin.html), tab Reviews, and press "Show on website".'
          : `Add it to assets/js/data/reviews.js: { product: '${r.product}', name: ${JSON.stringify(r.name)}, city: ${JSON.stringify(r.city || '')}, rating: ${r.rating}, date: '${r.date}', text: ${JSON.stringify(r.text)} },`
      });
    }
  };

  E.orders = orders;
})(window.ESHA);
