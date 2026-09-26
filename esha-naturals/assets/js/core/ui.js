/* Esha Naturals — shared layout (announcement bar, header, menus, cart drawer, footer) and UI components */
(function (E) {
  'use strict';

  const U = E.utils;
  const { $, $$, esc, money } = U;
  const icon = E.icon;
  const cfg = E.config;
  const page = document.body.dataset.page || '';

  /* ------------------------------------------------------------------
   * Reusable components
   * ------------------------------------------------------------------ */
  const priceHtml = (p, { save = false, cls = '' } = {}) => {
    const off = U.discountPercent(p);
    return `<div class="price ${cls}">
      <span class="price__now">${money(p.price)}</span>
      ${off ? `<s class="price__was"><span class="sr-only">Original price: </span>${money(p.comparePrice)}</s>` : ''}
      ${save && off ? `<span class="price__save">Save ${off}%</span>` : ''}
    </div>`;
  };

  const productImg = (p, { size = 'sm', eager = false, cls = '' } = {}) => {
    const sm = size === 'sm';
    const src = sm ? p.images.productSm : p.images.product;
    const w = sm ? p.images.smWidth : p.images.width;
    const h = sm ? p.images.smHeight : p.images.height;
    return `<img class="${cls}" src="${src}" alt="${esc(p.name)}, ${esc(p.size)} bottle" width="${w}" height="${h}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
  };

  const productCard = (p, { level = 3, delay = 0, eager = false } = {}) => {
    const cat = U.getCategory(p.category);
    const off = U.discountPercent(p);
    return `<article class="p-card reveal" style="--tint:${p.theme.tint};--accent:${p.theme.accent};--d:${delay}s">
      <div class="p-card__media">
        ${off ? `<span class="p-card__badge">−${off}%</span>` : ''}
        <span class="p-card__size">${esc(p.size)}</span>
        ${productImg(p, { eager })}
      </div>
      <div class="p-card__body">
        <p class="p-card__cat">${esc(cat ? cat.name : '')}</p>
        <h${level} class="p-card__title"><a href="${U.productUrl(p)}">${esc(p.name)}</a></h${level}>
        <p class="p-card__desc">${esc(p.tagline)}</p>
        ${priceHtml(p)}
        <div class="p-card__actions">
          <button type="button" class="btn btn--dark btn--block btn--sm" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart">
            ${icon('bag')}<span>Add to Cart</span>
          </button>
        </div>
      </div>
    </article>`;
  };

  const articleCard = (a, { level = 3, delay = 0, featured = false } = {}) => {
    const topic = (E.topics || []).find((t) => t.id === a.topic);
    return `<article class="a-card${featured ? ' a-card--featured' : ''} reveal" style="--d:${delay}s">
      <div class="a-card__media"><img src="${a.cover}" alt="${esc(a.coverAlt)}" width="720" height="480" loading="lazy" decoding="async"></div>
      <div class="a-card__body">
        <p class="a-card__meta"><span>${esc(topic ? topic.name : '')}</span><span aria-hidden="true">·</span><span>${U.readingTime(a.body)} min read</span></p>
        <h${level} class="a-card__title"><a href="${U.articleUrl(a)}">${esc(a.title)}</a></h${level}>
        <p class="a-card__excerpt">${esc(a.excerpt)}</p>
        <span class="link-arrow" aria-hidden="true">Read article ${icon('arrowRight')}</span>
      </div>
    </article>`;
  };

  const ornament = (cls = '') =>
    `<div class="ornament ${cls}" aria-hidden="true"><span></span>${icon('dropSolid')}<span></span></div>`;

  // Accordion list (FAQ answers are trusted HTML written in data/faqs.js)
  const accordionHtml = (items, { openFirst = false } = {}) =>
    items
      .map(
        (it, i) => `<details class="acc"${openFirst && i === 0 ? ' open' : ''}>
          <summary><span>${esc(it.q)}</span><span class="acc__icon" aria-hidden="true"></span></summary>
          <div class="acc__body">${it.a}</div>
        </details>`
      )
      .join('');

  const faqHtml = () => (typeof E.faqs === 'function' ? accordionHtml(E.faqs()) : '');

  // Static HTML uses <span data-icon="name"></span> placeholders; this inserts the SVG.
  function bindIcons(root = document) {
    $$('[data-icon]:not([data-icon-done])', root).forEach((el) => {
      el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon));
      el.setAttribute('data-icon-done', '');
    });
  }

  // Fill elements such as <span data-bind="deliveryFee"></span> with store settings.
  function bindConfig(root = document) {
    $$('[data-wa-link]', root).forEach((a) => {
      const url = U.whatsappUrl(a.dataset.waText || `Hi ${cfg.brand}! I would like to place an order.`);
      if (url) a.href = url;
    });
    const dl = cfg.delivery || {};
    const values = {
      brand: cfg.brand,
      deliveryTime: dl.timeText,
      deliveryShort: dl.shortTimeText,
      deliveryFee: Number(dl.fee) ? money(dl.fee) : 'free',
      freeAbove: dl.freeAbove ? money(dl.freeAbove) : '',
      phone: cfg.phone,
      email: cfg.email,
      location: cfg.location
    };
    $$('[data-bind]', root).forEach((el) => {
      const v = values[el.dataset.bind];
      if (v) el.textContent = v;
    });
    $$('[data-show-if]', root).forEach((el) => {
      const key = el.dataset.showIf;
      const on =
        key === 'whatsapp' ? !!U.whatsappUrl() :
        key === 'phone' ? !!cfg.phone :
        key === 'email' ? !!cfg.email :
        key === 'deliveryFee' ? !!Number(dl.fee) :
        key === 'freeAbove' ? !!(Number(dl.fee) && dl.freeAbove) :
        key === 'flatFee' ? !!(Number(dl.fee) && !dl.freeAbove) :
        key === 'noDeliveryFee' ? !Number(dl.fee) : true;
      el.hidden = !on;
    });
  }

  /* ------------------------------------------------------------------
   * Announcement bar
   * ------------------------------------------------------------------ */
  const d = cfg.delivery || {};
  const announcements = [
    { icon: 'cash', text: 'Cash on Delivery all over Pakistan' },
    { icon: 'truck', text: `${d.shortTimeText || 'Fast delivery'} after order confirmation` },
    d.freeAbove && Number(d.fee) ? { icon: 'box', text: `Free delivery on orders over ${money(d.freeAbove)}` } : null,
    { icon: 'seal', text: '100% Original · Pure · Natural · Trusted' }
  ].filter(Boolean);

  function renderAnnouncement() {
    const el = $('#announce');
    if (!el) return;
    el.classList.add('announce');
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Store announcements');
    el.innerHTML = announcements
      .map((a, i) => `<p class="announce__item${i === 0 ? ' is-active' : ''}"${i ? ' aria-hidden="true"' : ''}>${icon(a.icon)}<span>${esc(a.text)}</span></p>`)
      .join('');
    if (announcements.length < 2 || U.reducedMotion()) return;
    const items = $$('.announce__item', el);
    let i = 0;
    let paused = false;
    el.addEventListener('mouseenter', () => (paused = true));
    el.addEventListener('mouseleave', () => (paused = false));
    setInterval(() => {
      if (paused || document.hidden) return;
      items[i].classList.remove('is-active');
      items[i].setAttribute('aria-hidden', 'true');
      i = (i + 1) % items.length;
      items[i].classList.add('is-active');
      items[i].removeAttribute('aria-hidden');
    }, 4500);
  }

  /* ------------------------------------------------------------------
   * Header & navigation
   * ------------------------------------------------------------------ */
  const NAV = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'shop.html', label: 'Shop All', key: 'shop' },
    { href: 'shop.html?category=hair-care', label: 'Hair Care', key: 'cat:hair-care' },
    { href: 'shop.html?category=cooking-oils', label: 'Cooking Oils', key: 'cat:cooking-oils' },
    { href: 'journal.html', label: 'Journal', key: 'journal' },
    { href: 'about.html', label: 'About', key: 'about' },
    { href: 'contact.html', label: 'Contact', key: 'contact' }
  ];

  function activeKey() {
    if (page === 'shop') {
      const c = U.param('category');
      return c && U.getCategory(c) ? `cat:${c}` : 'shop';
    }
    if (page === 'product') {
      const p = U.getProduct(U.param('id'));
      return p ? `cat:${p.category}` : 'shop';
    }
    if (page === 'article') return 'journal';
    return page;
  }

  function setActiveNav(key = activeKey()) {
    $$('[data-nav-key]').forEach((a) => {
      if (a.dataset.navKey === key) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function renderHeader() {
    const el = $('#site-header');
    if (!el) return;
    const wa = U.whatsappUrl(`Hi ${cfg.brand}! I would like to know more about your products.`);
    el.classList.add('site-header');
    el.innerHTML = `
      <div class="container header__inner">
        <button type="button" class="icon-btn header__menu" aria-label="Open menu" aria-controls="mobile-nav" aria-expanded="false" data-open-menu>${icon('menu')}</button>
        <a class="header__logo" href="index.html" aria-label="${esc(cfg.brand)}, home">
          <img src="assets/images/brand/logo-horizontal-light.svg" alt="${esc(cfg.brand)}" width="183" height="79">
        </a>
        <nav class="header__nav" aria-label="Main">
          <ul>${NAV.filter((n) => n.key !== 'home')
            .map((n) => `<li><a href="${n.href}" data-nav-key="${n.key}">${n.label}</a></li>`)
            .join('')}</ul>
        </nav>
        <div class="header__actions">
          ${wa ? `<a class="icon-btn header__wa" href="${wa}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${icon('whatsapp')}</a>` : ''}
          <button type="button" class="icon-btn cart-btn" data-open-cart aria-controls="cart-drawer" aria-label="Open cart">
            ${icon('bag')}<span class="cart-count" data-cart-count data-count="0">0</span>
          </button>
        </div>
      </div>`;
    const onScroll = () => el.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function renderMobileNav() {
    const wrap = document.createElement('div');
    wrap.className = 'drawer drawer--left drawer--menu';
    wrap.id = 'mobile-nav';
    const wa = U.whatsappUrl(`Hi ${cfg.brand}! I would like to place an order.`);
    const tel = U.telUrl();
    wrap.innerHTML = `
      <div class="drawer__overlay" data-close></div>
      <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu" tabindex="-1">
        <div class="drawer__head">
          <img src="assets/images/brand/logo-horizontal-light.svg" alt="${esc(cfg.brand)}" width="183" height="79" class="menu__logo">
          <button type="button" class="icon-btn" data-close aria-label="Close menu">${icon('close')}</button>
        </div>
        <nav class="menu__nav" aria-label="Mobile">
          <ul>${NAV.map((n, i) => `<li style="--i:${i}"><a href="${n.href}" data-nav-key="${n.key}"><span>${n.label}</span>${icon('arrowRight')}</a></li>`).join('')}</ul>
        </nav>
        <div class="menu__foot">
          <p class="menu__note">${icon('cash')} Cash on Delivery · ${esc(d.shortTimeText || '')}</p>
          ${wa ? `<a class="btn btn--wa btn--block" href="${wa}" target="_blank" rel="noopener">${icon('whatsapp')}<span>Order on WhatsApp</span></a>` : ''}
          ${tel ? `<a class="btn btn--outline-light btn--block" href="${tel}">${icon('phone')}<span>Call ${esc(cfg.phone)}</span></a>` : ''}
        </div>
      </div>`;
    document.body.appendChild(wrap);
    return wrap;
  }

  /* ------------------------------------------------------------------
   * Drawer behaviour (focus trap, escape, scroll lock)
   * ------------------------------------------------------------------ */
  let openDrawer = null;

  function makeDrawer(el, { onOpen, onClose } = {}) {
    const panel = $('.drawer__panel', el);
    let lastFocus = null;
    el.inert = true;

    const focusables = () =>
      $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', panel).filter(
        (n) => n.offsetParent !== null
      );

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        api.close();
      } else if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    const api = {
      open(trigger) {
        if (openDrawer && openDrawer !== api) openDrawer.close({ restoreFocus: false });
        lastFocus = trigger || document.activeElement;
        el.inert = false;
        el.classList.add('is-open');
        document.documentElement.classList.add('no-scroll');
        document.addEventListener('keydown', onKey);
        openDrawer = api;
        if (onOpen) onOpen();
        requestAnimationFrame(() => panel.focus({ preventScroll: true }));
      },
      close({ restoreFocus = true } = {}) {
        if (!el.classList.contains('is-open')) return;
        el.classList.remove('is-open');
        el.inert = true;
        document.documentElement.classList.remove('no-scroll');
        document.removeEventListener('keydown', onKey);
        if (openDrawer === api) openDrawer = null;
        if (onClose) onClose();
        if (restoreFocus && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
      },
      get isOpen() {
        return el.classList.contains('is-open');
      }
    };

    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) api.close();
    });
    return api;
  }

  /* ------------------------------------------------------------------
   * Cart drawer
   * ------------------------------------------------------------------ */
  function renderCartDrawer() {
    const wrap = document.createElement('div');
    wrap.className = 'drawer drawer--cart';
    wrap.id = 'cart-drawer';
    wrap.innerHTML = `
      <div class="drawer__overlay" data-close></div>
      <aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabindex="-1">
        <div class="drawer__head">
          <h2 class="drawer__title" id="cart-title">Your Cart <span class="drawer__count" data-cart-count-text></span></h2>
          <button type="button" class="icon-btn" data-close aria-label="Close cart">${icon('close')}</button>
        </div>
        <div class="free-bar" data-free-bar hidden></div>
        <div class="drawer__body" data-cart-body></div>
        <div class="drawer__foot" data-cart-foot hidden></div>
      </aside>`;
    document.body.appendChild(wrap);
    return wrap;
  }

  const lineItemHtml = (l, { compact = false } = {}) => {
    const p = l.product;
    const max = cfg.maxQtyPerItem || 10;
    return `<li class="line-item${compact ? ' line-item--compact' : ''}" data-line="${p.id}">
      <a class="line-item__media" href="${U.productUrl(p)}" style="--tint:${p.theme.tint}" tabindex="-1" aria-hidden="true">${productImg(p)}</a>
      <div class="line-item__info">
        <a class="line-item__name" href="${U.productUrl(p)}">${esc(p.name)}</a>
        <p class="line-item__meta">${esc(p.size)} · ${money(p.price)}</p>
        <div class="line-item__controls">
          <div class="qty" role="group" aria-label="Quantity for ${esc(p.name)}">
            <button type="button" data-qty-dec="${p.id}" aria-label="Decrease quantity">${icon('minus')}</button>
            <input type="number" inputmode="numeric" min="1" max="${max}" value="${l.qty}" data-qty-input="${p.id}" aria-label="Quantity">
            <button type="button" data-qty-inc="${p.id}" aria-label="Increase quantity"${l.qty >= max ? ' disabled' : ''}>${icon('plus')}</button>
          </div>
          <button type="button" class="line-item__remove" data-remove="${p.id}" aria-label="Remove ${esc(p.name)}">Remove</button>
        </div>
      </div>
      <p class="line-item__total">${money(l.total)}</p>
    </li>`;
  };

  const freeBarHtml = (subtotal) => {
    if (!subtotal || !d.freeAbove || !Number(d.fee)) return '';
    const left = E.cart.toFreeDelivery(subtotal);
    const pct = Math.min(100, Math.round((subtotal / d.freeAbove) * 100));
    const text = left
      ? `Add <strong>${money(left)}</strong> more for <strong>free delivery</strong>`
      : `${icon('check')} You have unlocked <strong>free delivery</strong>`;
    return `<p class="free-bar__text">${text}</p><div class="free-bar__track" role="progressbar" aria-label="Progress to free delivery" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span class="free-bar__fill" style="width:${pct}%"></span></div>`;
  };

  const totalsHtml = () => {
    const s = E.cart.subtotal();
    const fee = E.cart.deliveryFee(s);
    const save = E.cart.savings();
    return `<dl class="totals">
      <div class="totals__row"><dt>Subtotal</dt><dd>${money(s)}</dd></div>
      <div class="totals__row"><dt>Delivery</dt><dd>${fee ? money(fee) : 'Free'}</dd></div>
      ${save ? `<div class="totals__row totals__row--save"><dt>You save</dt><dd>${money(save)}</dd></div>` : ''}
      <div class="totals__row totals__row--total"><dt>Total</dt><dd>${money(s + fee)}</dd></div>
    </dl>`;
  };

  // Re-rendering replaces buttons; put keyboard focus back on the equivalent control.
  function focusSelector(el) {
    if (!el || !el.dataset) return null;
    const keys = { qtyInc: 'qty-inc', qtyDec: 'qty-dec', qtyInput: 'qty-input', remove: 'remove' };
    const k = Object.keys(keys).find((x) => el.dataset[x]);
    return k ? `[data-${keys[k]}="${el.dataset[k]}"]` : null;
  }
  function keepFocus(root, render) {
    const active = document.activeElement;
    const sel = root && root.contains(active) ? focusSelector(active) : null;
    render();
    if (!sel) return;
    const next = root.querySelector(sel);
    const fallback = root.closest('[tabindex="-1"]');
    if (next && !next.disabled) next.focus({ preventScroll: true });
    else if (fallback) fallback.focus({ preventScroll: true });
  }

  function updateCartUI() {
    const count = E.cart.count();
    $$('[data-cart-count]').forEach((n) => {
      n.textContent = count;
      n.dataset.count = String(count);
    });
    $$('[data-open-cart]').forEach((b) => b.setAttribute('aria-label', `Open cart, ${count} item${count === 1 ? '' : 's'}`));
    const countText = $('[data-cart-count-text]');
    if (countText) countText.textContent = count ? `(${count})` : '';

    const body = $('[data-cart-body]');
    const foot = $('[data-cart-foot]');
    const bar = $('[data-free-bar]');
    if (!body) return;
    keepFocus(body, () => renderCartBody(body, foot, bar));
  }

  function renderCartBody(body, foot, bar) {
    const lines = E.cart.lines();
    if (!lines.length) {
      body.innerHTML = `<div class="empty">
        <span class="empty__icon">${icon('bag')}</span>
        <p class="empty__title">Your cart is empty</p>
        <p class="empty__text">Discover pure hair care and cooking oils, made with natural ingredients.</p>
        <a class="btn btn--dark" href="shop.html">Shop the collection</a>
      </div>`;
      foot.hidden = true;
      bar.hidden = true;
      return;
    }
    const s = E.cart.subtotal();
    bar.innerHTML = freeBarHtml(s);
    bar.hidden = !bar.innerHTML;
    body.innerHTML = `<ul class="line-items">${lines.map((l) => lineItemHtml(l)).join('')}</ul>`;
    foot.hidden = false;
    foot.innerHTML = `${totalsHtml()}
      <a class="btn btn--gold btn--block" href="checkout.html">Proceed to Checkout ${icon('arrowRight')}</a>
      <p class="drawer__note">${icon('cash')} Cash on Delivery · ${esc(d.shortTimeText || '')} after confirmation</p>`;
  }

  /* ------------------------------------------------------------------
   * Footer
   * ------------------------------------------------------------------ */
  function socialLinks() {
    const s = cfg.social || {};
    const names = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
    const links = Object.keys(names)
      .filter((k) => s[k])
      .map((k) => `<a href="${esc(s[k])}" target="_blank" rel="noopener" aria-label="${names[k]}">${icon(k)}</a>`)
      .join('');
    return links ? `<div class="socials">${links}</div>` : '';
  }

  function renderFooter() {
    const el = $('#site-footer');
    if (!el) return;
    const wa = U.whatsappUrl(`Hi ${cfg.brand}!`);
    const tel = U.telUrl();
    const contact = [
      wa ? `<li><a href="${wa}" target="_blank" rel="noopener">${icon('whatsapp')}<span>WhatsApp us</span></a></li>` : '',
      tel ? `<li><a href="${tel}">${icon('phone')}<span>${esc(cfg.phone)}</span></a></li>` : '',
      cfg.email ? `<li><a href="mailto:${esc(cfg.email)}">${icon('mail')}<span>${esc(cfg.email)}</span></a></li>` : '',
      cfg.location ? `<li><span class="footer__plain">${icon('pin')}<span>${esc(cfg.location)}</span></span></li>` : ''
    ].join('');
    el.classList.add('site-footer');
    el.innerHTML = `
      <div class="promise">
        <div class="container promise__grid">
          <div class="promise__item">${icon('cash')}<div><strong>Cash on Delivery</strong><span>Pay when your order arrives</span></div></div>
          <div class="promise__item">${icon('truck')}<div><strong>${esc(d.shortTimeText || 'Fast delivery')}</strong><span>After order confirmation</span></div></div>
          <div class="promise__item">${icon('seal')}<div><strong>100% Original</strong><span>Pure, natural &amp; trusted</span></div></div>
          <div class="promise__item">${icon('leaf')}<div><strong>Natural Ingredients</strong><span>Carefully prepared</span></div></div>
        </div>
      </div>
      <div class="container footer__top">
        <div class="footer__brand">
          <a href="index.html" aria-label="${esc(cfg.brand)}, home"><img src="assets/images/brand/logo-stacked-light.svg" alt="${esc(cfg.brand)}" width="250" height="194" loading="lazy"></a>
          <p class="footer__about">Pure hair care and cooking oils made with natural ingredients. 100% original, delivered with care across Pakistan.</p>
          ${socialLinks()}
        </div>
        <div class="footer__col">
          <h2 class="footer__title">Shop</h2>
          <ul class="footer__links">
            <li><a href="shop.html">All Products</a></li>
            ${E.categories.map((c) => `<li><a href="${U.categoryUrl(c)}">${esc(c.title)}</a></li>`).join('')}
            ${E.products.map((p) => `<li><a href="${U.productUrl(p)}">${esc(p.name)}</a></li>`).join('')}
          </ul>
        </div>
        <div class="footer__col">
          <h2 class="footer__title">Help</h2>
          <ul class="footer__links">
            <li><a href="policies.html#shipping">Shipping &amp; Delivery</a></li>
            <li><a href="policies.html#returns">Returns &amp; Exchanges</a></li>
            <li><a href="policies.html#privacy">Privacy Policy</a></li>
            <li><a href="contact.html#faq">FAQs</a></li>
            <li><a href="journal.html">Journal</a></li>
            <li><a href="about.html">Our Story</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h2 class="footer__title">Get in touch</h2>
          <ul class="footer__links footer__contact">${contact}<li><a href="contact.html">${icon('mail')}<span>Contact page</span></a></li></ul>
          <p class="footer__cod">${icon('cash')} Cash on Delivery available</p>
        </div>
      </div>
      <div class="footer__bottom">
        <div class="container footer__bottom-inner">
          <p>© ${new Date().getFullYear()} ${esc(cfg.brand)}. All rights reserved.</p>
          <p class="footer__tag">${esc(cfg.tagline)}</p>
        </div>
      </div>`;
  }

  function renderWhatsAppFab() {
    if (page === 'checkout' || page === 'success') return;
    const wa = U.whatsappUrl(`Hi ${cfg.brand}! I would like to know more about your products.`);
    if (!wa) return;
    const a = document.createElement('a');
    a.className = 'wa-fab';
    a.href = wa;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Chat with us on WhatsApp');
    a.innerHTML = icon('whatsapp');
    document.body.appendChild(a);
  }

  /* ------------------------------------------------------------------
   * Toasts
   * ------------------------------------------------------------------ */
  let toastWrap = null;
  function toast(message, { icon: ic = 'check', timeout = 3200 } = {}) {
    if (!toastWrap) {
      toastWrap = document.createElement('div');
      toastWrap.className = 'toast-wrap';
      toastWrap.setAttribute('role', 'status');
      toastWrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastWrap);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${icon(ic)}<span>${esc(message)}</span>`;
    toastWrap.appendChild(t);
    setTimeout(() => {
      t.classList.add('is-leaving');
      setTimeout(() => t.remove(), 400);
    }, timeout);
  }

  /* ------------------------------------------------------------------
   * Scroll reveal
   * ------------------------------------------------------------------ */
  let io = null;
  function refreshReveals(root = document) {
    const els = $$('.reveal:not(.is-visible)', root);
    if (!('IntersectionObserver' in window) || U.reducedMotion()) {
      els.forEach((e) => e.classList.add('is-visible'));
      return;
    }
    if (!io) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add('is-visible');
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
    }
    els.forEach((e) => io.observe(e));
  }

  /* ------------------------------------------------------------------
   * Global interactions (add to cart, buy now, quantities)
   * ------------------------------------------------------------------ */
  let cartDrawer = null;
  let menuDrawer = null;

  function flashButton(btn, text) {
    const label = btn.querySelector('span');
    if (!label || btn.dataset.flashing) return;
    const original = label.textContent;
    btn.dataset.flashing = '1';
    btn.classList.add('is-added');
    label.textContent = text;
    setTimeout(() => {
      label.textContent = original;
      btn.classList.remove('is-added');
      delete btn.dataset.flashing;
    }, 1600);
  }

  function qtyFor(btn) {
    const sel = btn.dataset.qtyFrom;
    const input = sel ? $(sel) : null;
    return input ? Math.max(1, parseInt(input.value, 10) || 1) : 1;
  }

  function bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) {
        e.preventDefault();
        const id = add.dataset.add;
        const before = E.cart.qtyOf(id);
        E.cart.add(id, qtyFor(add));
        if (E.cart.qtyOf(id) === before) {
          toast(`You can order up to ${cfg.maxQtyPerItem} of each product.`, { icon: 'info' });
          return;
        }
        flashButton(add, 'Added');
        if (add.dataset.noDrawer === undefined && cartDrawer) cartDrawer.open(add);
        return;
      }
      const buy = e.target.closest('[data-buy]');
      if (buy) {
        e.preventDefault();
        const id = buy.dataset.buy;
        const qty = qtyFor(buy);
        if (E.cart.qtyOf(id) < qty) E.cart.setQty(id, qty);
        window.location.href = 'checkout.html';
        return;
      }
      const openCart = e.target.closest('[data-open-cart]');
      if (openCart && cartDrawer) {
        e.preventDefault();
        cartDrawer.open(openCart);
        return;
      }
      const openMenu = e.target.closest('[data-open-menu]');
      if (openMenu && menuDrawer) {
        menuDrawer.open(openMenu);
        return;
      }
      const dec = e.target.closest('[data-qty-dec]');
      if (dec) {
        const id = dec.dataset.qtyDec;
        const q = E.cart.qtyOf(id);
        if (q > 1) E.cart.setQty(id, q - 1);
        return;
      }
      const inc = e.target.closest('[data-qty-inc]');
      if (inc) {
        const id = inc.dataset.qtyInc;
        E.cart.setQty(id, E.cart.qtyOf(id) + 1);
        return;
      }
      const rm = e.target.closest('[data-remove]');
      if (rm) {
        const p = U.getProduct(rm.dataset.remove);
        E.cart.remove(rm.dataset.remove);
        if (p) toast(`${p.name} removed from cart`, { icon: 'trash' });
      }
    });

    document.addEventListener('change', (e) => {
      const input = e.target.closest('[data-qty-input]');
      if (!input) return;
      const q = parseInt(input.value, 10);
      if (!q || q < 1) E.cart.remove(input.dataset.qtyInput);
      else E.cart.setQty(input.dataset.qtyInput, q);
    });
  }

  /* ------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------ */
  function init() {
    document.documentElement.classList.add('js');
    renderAnnouncement();
    renderHeader();
    const menuEl = renderMobileNav();
    const cartEl = renderCartDrawer();
    renderFooter();
    renderWhatsAppFab();
    setActiveNav();

    menuDrawer = makeDrawer(menuEl, {
      onOpen: () => $$('[data-open-menu]').forEach((b) => b.setAttribute('aria-expanded', 'true')),
      onClose: () => $$('[data-open-menu]').forEach((b) => b.setAttribute('aria-expanded', 'false'))
    });
    cartDrawer = makeDrawer(cartEl);

    updateCartUI();
    E.cart.onChange((c, detail) => {
      updateCartUI();
      if (detail.type === 'add') {
        $$('[data-cart-count]').forEach((n) => {
          n.classList.remove('bump');
          void n.offsetWidth;
          n.classList.add('bump');
        });
      }
    });
    bindGlobalEvents();
    bindIcons();
    bindConfig();
    document.addEventListener('DOMContentLoaded', () => {
      bindIcons();
      bindConfig();
      refreshReveals();
    });
  }

  E.ui = {
    priceHtml,
    productImg,
    productCard,
    articleCard,
    ornament,
    accordionHtml,
    faqHtml,
    bindConfig,
    bindIcons,
    lineItemHtml,
    totalsHtml,
    keepFocus,
    freeBarHtml,
    toast,
    refreshReveals,
    setActiveNav,
    openCart: (trigger) => cartDrawer && cartDrawer.open(trigger),
    closeCart: () => cartDrawer && cartDrawer.close(),
    closeDrawers: () => {
      if (openDrawer) openDrawer.close({ restoreFocus: false });
    }
  };

  init();
})(window.ESHA);
