/* Esha Naturals — shopping cart (saved in the browser, synced across tabs) */
(function (E) {
  'use strict';

  const { store, getProduct } = E.utils;
  const KEY = 'esha_cart_v1';
  const listeners = new Set();

  const clampQty = (q) => Math.max(0, Math.min(E.config.maxQtyPerItem || 10, Math.floor(Number(q) || 0)));

  // Keep only items that still exist in the catalogue.
  const sanitize = (items) =>
    (Array.isArray(items) ? items : [])
      .filter((i) => i && getProduct(i.id))
      .map((i) => ({ id: i.id, qty: clampQty(i.qty) }))
      .filter((i) => i.qty > 0);

  let items = sanitize(store.get(KEY, []));

  const emit = (detail) => listeners.forEach((fn) => fn(cart, detail || {}));
  const persist = (detail) => {
    store.set(KEY, items);
    emit(detail);
  };

  const cart = {
    get items() {
      return items.slice();
    },

    lines() {
      return items.map((i) => {
        const product = getProduct(i.id);
        return { product, qty: i.qty, total: product.price * i.qty, compareTotal: product.comparePrice * i.qty };
      });
    },

    qtyOf(id) {
      const found = items.find((i) => i.id === id);
      return found ? found.qty : 0;
    },

    add(id, qty = 1) {
      if (!getProduct(id)) return false;
      const found = items.find((i) => i.id === id);
      const before = found ? found.qty : 0;
      const next = clampQty(before + qty);
      if (found) found.qty = next;
      else items.push({ id, qty: next });
      persist({ type: 'add', id, qty: next - before, capped: next < before + qty });
      return next > before;
    },

    setQty(id, qty) {
      const q = clampQty(qty);
      if (q === 0) return cart.remove(id);
      const found = items.find((i) => i.id === id);
      if (!found) return cart.add(id, q);
      found.qty = q;
      persist({ type: 'update', id });
      return true;
    },

    remove(id) {
      items = items.filter((i) => i.id !== id);
      persist({ type: 'remove', id });
      return true;
    },

    clear() {
      items = [];
      persist({ type: 'clear' });
    },

    count() {
      return items.reduce((n, i) => n + i.qty, 0);
    },

    subtotal() {
      return cart.lines().reduce((s, l) => s + l.total, 0);
    },

    savings() {
      return cart.lines().reduce((s, l) => s + (l.compareTotal - l.total), 0);
    },

    deliveryFee(subtotal = cart.subtotal()) {
      const d = E.config.delivery || {};
      if (!subtotal) return 0;
      if (d.freeAbove && subtotal >= d.freeAbove) return 0;
      return Number(d.fee) || 0;
    },

    // How much more to add for free delivery (0 when already free or not offered)
    toFreeDelivery(subtotal = cart.subtotal()) {
      const d = E.config.delivery || {};
      if (!d.freeAbove || !Number(d.fee)) return 0;
      return Math.max(0, d.freeAbove - subtotal);
    },

    total() {
      const s = cart.subtotal();
      return s + cart.deliveryFee(s);
    },

    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };

  // Keep several open tabs in sync
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    items = sanitize(store.get(KEY, []));
    emit({ type: 'sync' });
  });

  E.cart = cart;
})(window.ESHA);
