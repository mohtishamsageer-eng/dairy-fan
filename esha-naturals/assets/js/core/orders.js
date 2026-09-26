/* Esha Naturals — order creation, local order history, WhatsApp message and Google Sheet sync */
(function (E) {
  'use strict';

  const { store, money, whatsappUrl } = E.utils;
  const KEY = 'esha_orders_v1';

  const newOrderId = () => {
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(4);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
    return `EN-${ymd}-${rand}`;
  };

  const orders = {
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
          name: l.product.name,
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
      const list = store.get(KEY, []);
      const next = [order].concat(Array.isArray(list) ? list.filter((o) => o && o.id !== order.id) : []).slice(0, 20);
      store.set(KEY, next);
    },

    find(id) {
      const list = store.get(KEY, []);
      return (Array.isArray(list) ? list : []).find((o) => o && o.id === id) || null;
    },

    whatsappText(order) {
      const c = order.customer;
      const lines = [
        `*New Order: ${E.config.brand}*`,
        `Order ID: ${order.id}`,
        '',
        '*Items*'
      ];
      order.items.forEach((i, n) => lines.push(`${n + 1}. ${i.name} (${i.size}) × ${i.qty} = ${money(i.total)}`));
      lines.push(
        '',
        `Subtotal: ${money(order.subtotal)}`,
        `Delivery: ${order.delivery ? money(order.delivery) : 'Free'}`,
        `*Total: ${money(order.total)}*`,
        `Payment: ${order.payment}`,
        '',
        '*Delivery details*',
        `Name: ${c.name}`,
        `Phone: ${c.phone}`
      );
      if (c.email) lines.push(`Email: ${c.email}`);
      lines.push(`City: ${c.city}`, `Address: ${c.address}`);
      if (c.landmark) lines.push(`Landmark: ${c.landmark}`);
      if (order.notes) lines.push(`Notes: ${order.notes}`);
      lines.push('', 'Please confirm my order. Thank you!');
      return lines.join('\n');
    },

    whatsappUrl(order) {
      return whatsappUrl(orders.whatsappText(order));
    },

    // Sends the order to the Google Apps Script web app (if configured).
    // Resolves to true when the request left the browser, false otherwise. Never throws.
    async sync(order) {
      const url = E.config.orderEndpoint;
      if (!url) return false;
      const controller = 'AbortController' in window ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 10000) : null;
      try {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(order),
          signal: controller ? controller.signal : undefined
        });
        return true;
      } catch (e) {
        return false;
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
  };

  E.orders = orders;
})(window.ESHA);
