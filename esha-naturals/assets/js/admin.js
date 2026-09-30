/* Esha Naturals — admin panel (admin.html)
 * Shows the orders, advance payments, messages and reviews saved in the store's Google Sheet
 * (google-apps-script/Code.gs). Log in with ADMIN_PASSWORD from the Apps Script. */
(function () {
  'use strict';

  const cfg = (window.ESHA && window.ESHA.config) || {};
  const root = document.getElementById('admin');
  const KEY = 'esha_admin_pw';
  const REFRESH_MS = 2 * 60 * 1000;

  const state = { password: '', data: null, tab: 'orders', status: 'all', query: '', busy: false, error: '' };
  let refreshTimer = null;

  /* ---------------- helpers ---------------- */
  const esc = (v) =>
    String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const num = (v) => Number(String(v == null ? '' : v).replace(/[^\d.-]/g, '')) || 0;
  const money = (v) => `Rs ${Math.round(num(v)).toLocaleString('en-US')}`;
  const when = (v) => {
    const d = new Date(v);
    return isNaN(d)
      ? esc(v)
      : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const phoneDigits = (p) => String(p || '').replace(/\D/g, '');
  const waLink = (p) => {
    const d = phoneDigits(p);
    return /^03\d{9}$/.test(d) ? `https://wa.me/92${d.slice(1)}` : '';
  };
  const store = {
    get() {
      try {
        return sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || '';
      } catch (e) {
        return '';
      }
    },
    set(pw, remember) {
      try {
        sessionStorage.setItem(KEY, pw);
        if (remember) localStorage.setItem(KEY, pw);
      } catch (e) {
        /* storage blocked */
      }
    },
    clear() {
      try {
        sessionStorage.removeItem(KEY);
        localStorage.removeItem(KEY);
      } catch (e) {
        /* storage blocked */
      }
    }
  };

  async function api(action, extra) {
    const controller = 'AbortController' in window ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 30000) : null;
    try {
      const res = await fetch(cfg.orderEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ type: 'admin', password: state.password, action }, extra)),
        signal: controller ? controller.signal : undefined
      });
      return await res.json();
    } catch (e) {
      return { ok: false, error: 'network', message: 'Could not reach Google. Check your internet connection and try again.' };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  function toast(message, bad) {
    let wrap = document.querySelector('.admin-toasts');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'admin-toasts';
      wrap.setAttribute('role', 'status');
      document.body.appendChild(wrap);
    }
    const t = document.createElement('div');
    t.className = `admin-toast${bad ? ' is-bad' : ''}`;
    t.textContent = message;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  const errorText = (res) =>
    res.error === 'setup'
      ? 'The admin password is not set yet. In the Apps Script, type your password in ADMIN_PASSWORD, then Deploy → Manage deployments → Edit → New version → Deploy.'
      : res.message || res.error || 'Something went wrong.';

  /* ---------------- data ---------------- */
  async function load({ quiet } = {}) {
    if (state.busy) return;
    state.busy = true;
    if (!quiet) render();
    const res = await api('list');
    state.busy = false;
    if (!res.ok) {
      if (res.error === 'password' || res.error === 'setup' || res.error === 'locked') {
        store.clear();
        state.password = '';
        state.data = null;
      }
      state.error = errorText(res);
      if (quiet && state.data) toast(state.error, true);
      render();
      return;
    }
    const before = state.data ? state.data.orders.length : null;
    state.error = '';
    state.data = res;
    render();
    if (before !== null && res.orders.length > before)
      toast(`${res.orders.length - before} new order${res.orders.length - before > 1 ? 's' : ''}!`);
  }

  function startAutoRefresh() {
    clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      if (state.password && !document.hidden) load({ quiet: true });
    }, REFRESH_MS);
  }

  /* ---------------- views ---------------- */
  const brand = `<a class="admin-brand" href="index.html"><img src="assets/images/brand/logo-horizontal.svg" alt="${esc(cfg.brand || 'Esha Naturals')}" width="150" height="65"></a>`;

  function loginView() {
    const missing = !cfg.orderEndpoint;
    return `<section class="admin-login">
      ${brand}
      <h1>Admin panel</h1>
      ${
        missing
          ? '<p class="admin-alert">The Google Sheet is not connected yet: add the Apps Script link to <code>orderEndpoint</code> in <code>assets/js/config.js</code>.</p>'
          : `<form class="admin-login__form" data-login novalidate>
        <label class="field__label" for="admin-pw">Password</label>
        <input class="input" id="admin-pw" name="password" type="password" autocomplete="current-password" required>
        <label class="admin-check"><input type="checkbox" name="remember"> Remember me on this device</label>
        ${state.error ? `<p class="admin-alert" role="alert">${esc(state.error)}</p>` : ''}
        <button class="btn btn--dark btn--block" type="submit"${state.busy ? ' disabled' : ''}>${state.busy ? 'Opening…' : 'Log in'}</button>
      </form>`
      }
      <p class="admin-login__note">Orders are kept in your Google Sheet “${esc(cfg.brand || 'Esha Naturals')} Orders”.</p>
    </section>`;
  }

  function stats(d) {
    const now = new Date();
    const live = d.orders.filter((o) => !/cancel|return/i.test(o.Status));
    const month = live.filter((o) => {
      const t = new Date(o.Date);
      return !isNaN(t) && t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth();
    });
    const today = d.orders.filter((o) => {
      const t = new Date(o.Date);
      return !isNaN(t) && sameDay(t, now);
    });
    const cards = [
      ['New orders', d.orders.filter((o) => String(o.Status || 'New') === 'New').length, 'Waiting for your call'],
      ['Orders today', today.length, now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })],
      [
        'Sales this month',
        money(month.reduce((s, o) => s + num(o['Total (Rs)']), 0)),
        `${month.length} order${month.length === 1 ? '' : 's'} (not cancelled)`
      ],
      [
        'All orders',
        d.orders.length,
        `${d.reviews.filter((r) => String(r['Show on website']).toLowerCase() !== 'yes').length} review(s) to check`
      ]
    ];
    return `<div class="admin-stats">${cards
      .map(
        ([label, value, note]) =>
          `<div class="admin-stat"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></div>`
      )
      .join('')}</div>`;
  }

  function tabs(d) {
    const pending = d.reviews.filter((r) => String(r['Show on website']).toLowerCase() !== 'yes').length;
    const list = [
      ['orders', 'Orders', d.orders.length],
      ['payments', 'Advance payments', d.payments.length],
      ['messages', 'Messages', d.messages.length],
      ['reviews', 'Reviews', pending ? `${pending} new` : d.reviews.length]
    ];
    return `<div class="admin-tabs" role="tablist">${list
      .map(
        ([k, label, n]) =>
          `<button type="button" role="tab" class="admin-tab" data-tab="${k}" aria-selected="${state.tab === k}">${esc(label)} <span>${esc(n)}</span></button>`
      )
      .join('')}</div>`;
  }

  function orderCard(o, statuses) {
    const status = String(o.Status || 'New');
    const tel = phoneDigits(o.Phone);
    const wa = waLink(o.Phone);
    const options = statuses.includes(status) ? statuses : [status].concat(statuses);
    const row = (label, value) => (value === '' || value == null ? '' : `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`);
    return `<article class="admin-card order" data-status="${esc(status)}">
      <header class="admin-card__head">
        <div><strong class="order__id">${esc(o['Order ID'])}</strong><span class="admin-muted">${when(o.Date)}</span></div>
        <label class="order__status"><span class="sr-only">Status of ${esc(o['Order ID'])}</span>
          <select class="input" data-status-for="${esc(o['Order ID'])}">${options
            .map((s) => `<option${s === status ? ' selected' : ''}>${esc(s)}</option>`)
            .join('')}</select>
        </label>
      </header>
      <div class="order__customer">
        <strong>${esc(o.Name)}</strong>
        <span>${esc(o.City)}</span>
        <div class="order__contact">
          ${tel ? `<a class="btn btn--outline btn--sm" href="tel:${esc(tel)}">Call ${esc(o.Phone)}</a>` : ''}
          ${wa ? `<a class="btn btn--wa btn--sm" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
        </div>
      </div>
      <dl class="admin-dl">
        ${row('Address', o.Address)}
        ${row('Landmark', o.Landmark)}
        ${row('Items', o.Items)}
        ${row('Subtotal', o['Subtotal (Rs)'] !== '' ? money(o['Subtotal (Rs)']) : '')}
        ${row('Delivery', o['Delivery (Rs)'] !== '' ? (num(o['Delivery (Rs)']) ? money(o['Delivery (Rs)']) : 'Free') : '')}
        ${row('Payment', o.Payment)}
        ${row('Advance', o.Advance)}
        ${row('Email', o.Email)}
        ${row('Notes', o.Notes)}
      </dl>
      <footer class="order__total"><span>Total to collect</span><strong>${money(o['Total (Rs)'])}</strong></footer>
    </article>`;
  }

  function ordersView(d) {
    const q = state.query.trim().toLowerCase();
    const list = d.orders.filter(
      (o) =>
        (state.status === 'all' || String(o.Status || 'New') === state.status) &&
        (!q || [o['Order ID'], o.Name, o.Phone, o.City, o.Address, o.Items].join(' ').toLowerCase().includes(q))
    );
    const chips = ['all'].concat(d.statuses);
    return `<div class="admin-tools">
        <input class="input admin-search" type="search" placeholder="Search name, phone, order no., city…" value="${esc(state.query)}" data-search aria-label="Search orders">
        <div class="admin-chips">${chips
          .map((s) => {
            const n = s === 'all' ? d.orders.length : d.orders.filter((o) => String(o.Status || 'New') === s).length;
            return `<button type="button" class="admin-chip" data-filter="${esc(s)}" aria-pressed="${state.status === s}">${s === 'all' ? 'All' : esc(s)} <span>${n}</span></button>`;
          })
          .join('')}</div>
      </div>
      ${list.length ? `<div class="admin-grid">${list.map((o) => orderCard(o, d.statuses)).join('')}</div>` : empty(d.orders.length ? 'No orders match.' : 'No orders yet. New orders from the website appear here.')}`;
  }

  function simpleCard(title, sub, rows, extra) {
    return `<article class="admin-card">
      <header class="admin-card__head"><div><strong>${esc(title)}</strong><span class="admin-muted">${sub}</span></div>${extra || ''}</header>
      <dl class="admin-dl">${rows
        .filter(([, v]) => v !== '' && v != null && v !== '-')
        .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
        .join('')}</dl>
    </article>`;
  }

  function paymentsView(d) {
    if (!d.payments.length) return empty('No advance payments reported yet.');
    return `<div class="admin-grid">${d.payments
      .map((p) =>
        simpleCard(p['Order ID'], when(p.Received), [
          ['Customer', p['Customer name']],
          ['Mobile', p['Mobile number']],
          ['Paid to', p['Paid to']],
          ['Transaction ID / sender', p['Transaction ID / sender number']],
          ['Order total', p['Order total']]
        ])
      )
      .join('')}</div>`;
  }

  function messagesView(d) {
    if (!d.messages.length) return empty('No messages yet.');
    return `<div class="admin-grid">${d.messages
      .map((m) => {
        const wa = waLink(m['Mobile number']);
        return simpleCard(
          m.Name,
          when(m.Received),
          [
            ['Mobile', m['Mobile number']],
            ['Message', m.Message]
          ],
          wa ? `<a class="btn btn--wa btn--sm" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>` : ''
        );
      })
      .join('')}</div>`;
  }

  function reviewsView(d) {
    if (!d.reviews.length) return empty('No reviews yet.');
    return `<p class="admin-hint">Only reviews marked “On website” are shown to customers. Changes appear on the website within about 10 minutes.</p>
      <div class="admin-grid">${d.reviews
        .map((r) => {
          const shown = String(r['Show on website']).toLowerCase() === 'yes';
          const stars = Math.max(0, Math.min(5, num(r.Stars) || (String(r.Rating).match(/★/g) || []).length));
          return `<article class="admin-card review-card${shown ? ' is-shown' : ''}">
            <header class="admin-card__head">
              <div><strong>${esc(r.Name)}${r.City && r.City !== '-' ? `, ${esc(r.City)}` : ''}</strong><span class="admin-muted">${when(r.Received)} · ${esc(r.Product)}</span></div>
              <span class="admin-badge${shown ? ' is-on' : ''}">${shown ? 'On website' : 'Hidden'}</span>
            </header>
            <p class="review-card__stars" aria-label="${stars} out of 5 stars">${'★'.repeat(stars)}<span>${'★'.repeat(5 - stars)}</span></p>
            <p class="review-card__text">${esc(r.Review)}</p>
            <button type="button" class="btn ${shown ? 'btn--outline' : 'btn--dark'} btn--sm" data-review-row="${esc(r._row)}" data-show="${shown ? '0' : '1'}">${shown ? 'Hide from website' : 'Show on website'}</button>
          </article>`;
        })
        .join('')}</div>`;
  }

  const empty = (text) => `<div class="admin-empty">${esc(text)}</div>`;

  function appView() {
    const d = state.data;
    const views = { orders: ordersView, payments: paymentsView, messages: messagesView, reviews: reviewsView };
    return `<header class="admin-bar">
        ${brand}
        <h1 class="admin-bar__title">Admin panel</h1>
        <div class="admin-bar__actions">
          <button type="button" class="btn btn--outline btn--sm" data-refresh${state.busy ? ' disabled' : ''}>${state.busy ? 'Loading…' : 'Refresh'}</button>
          <button type="button" class="btn btn--outline btn--sm" data-logout>Log out</button>
        </div>
      </header>
      <div class="admin-body">
        ${state.error ? `<p class="admin-alert" role="alert">${esc(state.error)}</p>` : ''}
        ${stats(d)}
        ${tabs(d)}
        <section class="admin-panel" role="tabpanel">${views[state.tab](d)}</section>
      </div>`;
  }

  function render() {
    const focusSearch = document.activeElement && document.activeElement.matches('[data-search]');
    const caret = focusSearch ? document.activeElement.selectionStart : 0;
    root.innerHTML =
      state.password && state.data
        ? appView()
        : state.password && state.busy
          ? `<div class="admin-loading">${brand}<p>Loading orders…</p></div>`
          : loginView();
    if (focusSearch) {
      const s = root.querySelector('[data-search]');
      if (s) {
        s.focus();
        s.setSelectionRange(caret, caret);
      }
    }
  }

  /* ---------------- events ---------------- */
  root.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-login]');
    if (!form) return;
    e.preventDefault();
    const pw = form.elements.password.value;
    if (!pw) return form.elements.password.focus();
    state.password = pw;
    store.set(pw, form.elements.remember.checked);
    load().then(() => {
      if (state.data) startAutoRefresh();
      else {
        const input = root.querySelector('#admin-pw');
        if (input) input.focus();
      }
    });
  });

  root.addEventListener('click', async (e) => {
    const t = e.target;
    const tab = t.closest('[data-tab]');
    if (tab) {
      state.tab = tab.dataset.tab;
      return render();
    }
    const chip = t.closest('[data-filter]');
    if (chip) {
      state.status = chip.dataset.filter;
      return render();
    }
    if (t.closest('[data-refresh]')) return load();
    if (t.closest('[data-logout]')) {
      store.clear();
      clearInterval(refreshTimer);
      Object.assign(state, { password: '', data: null, error: '', tab: 'orders', status: 'all', query: '' });
      return render();
    }
    const rv = t.closest('[data-review-row]');
    if (rv) {
      const show = rv.dataset.show === '1';
      rv.disabled = true;
      const res = await api('review', { row: Number(rv.dataset.reviewRow), show });
      if (!res.ok) {
        rv.disabled = false;
        return toast(errorText(res), true);
      }
      const r = state.data.reviews.find((x) => String(x._row) === rv.dataset.reviewRow);
      if (r) r['Show on website'] = show ? 'Yes' : 'No';
      render();
      toast(show ? 'Review is now on the website.' : 'Review hidden from the website.');
    }
  });

  root.addEventListener('input', (e) => {
    if (e.target.matches('[data-search]')) {
      state.query = e.target.value;
      render();
    }
  });

  root.addEventListener('change', async (e) => {
    const sel = e.target.closest('[data-status-for]');
    if (!sel) return;
    const id = sel.dataset.statusFor;
    const order = state.data.orders.find((o) => String(o['Order ID']) === id);
    const before = order ? order.Status : '';
    sel.disabled = true;
    const res = await api('status', { id, status: sel.value });
    if (!res.ok) {
      sel.value = before;
      sel.disabled = false;
      return toast(errorText(res), true);
    }
    if (order) order.Status = sel.value;
    render();
    toast(`${id}: ${sel.value}`);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.password && state.data) load({ quiet: true });
  });

  /* ---------------- start ---------------- */
  state.password = store.get();
  if (state.password && cfg.orderEndpoint) {
    load().then(() => state.data && startAutoRefresh());
  } else {
    state.password = '';
    render();
  }
})();
