/* Esha Naturals — small shared helpers */
(function (E) {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ESC[c]);

  const money = (n) => `${E.config.currency} ${Math.round(Number(n) || 0).toLocaleString('en-US')}`;

  const discountPercent = (p) => (p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : 0);

  // Reads ?name= from the page address (or from the in-page route in the single-file build)
  const param = (name) => (E.nav ? E.nav.param(name) : new URLSearchParams(window.location.search).get(name));

  // Image path -> embedded copy in the single-file build, unchanged on the normal website
  const asset = (path) => (window.ESHA_ASSETS && window.ESHA_ASSETS[path]) || path;

  // Absolute URL for structured data; safe in previews where the page address is not a real URL
  const absUrl = (path) => {
    try {
      return new URL(path, window.location.href).href;
    } catch (e) {
      return path;
    }
  };

  const getProduct = (id) => E.products.find((p) => p.id === id) || null;
  const getCategory = (id) => E.categories.find((c) => c.id === id) || null;
  const productsIn = (categoryId) => E.products.filter((p) => !categoryId || p.category === categoryId);

  const productUrl = (p) => `product.html?id=${encodeURIComponent(p.id)}`;
  const categoryUrl = (c) => `shop.html?category=${encodeURIComponent(c.id)}`;
  const articleUrl = (a) => `article.html?slug=${encodeURIComponent(a.slug)}`;

  // localStorage wrapper that never throws (private mode, blocked storage, etc.)
  const store = {
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  const digits = (s) => String(s || '').replace(/\D/g, '');

  const whatsappUrl = (text) => {
    const number = digits(E.config.whatsappNumber);
    if (!number) return null;
    return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  };

  const telUrl = () => (E.config.phone ? `tel:${String(E.config.phone).replace(/[^\d+]/g, '')}` : null);

  // Pakistani mobile numbers: 03XXXXXXXXX, 3XXXXXXXXX, +923XXXXXXXXX or 00923XXXXXXXXX
  const normalizePkPhone = (value) => {
    let d = digits(value);
    if (d.startsWith('0092')) d = d.slice(4);
    else if (d.startsWith('92') && d.length === 12) d = d.slice(2);
    else if (d.startsWith('0')) d = d.slice(1);
    return /^3\d{9}$/.test(d) ? `0${d.slice(0, 3)}-${d.slice(3)}` : null;
  };

  const readingTime = (html) => {
    const words = String(html)
      .replace(/<[^>]+>/g, ' ')
      .trim()
      .split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return iso;
    }
  };

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setMeta = ({ title, description, image }) => {
    if (title) {
      document.title = title;
      const og = $('meta[property="og:title"]');
      if (og) og.setAttribute('content', title);
    }
    if (description) {
      const d = $('meta[name="description"]');
      if (d) d.setAttribute('content', description);
      const og = $('meta[property="og:description"]');
      if (og) og.setAttribute('content', description);
    }
    if (image) {
      const og = $('meta[property="og:image"]');
      if (og) og.setAttribute('content', image);
    }
  };

  E.utils = {
    $,
    $$,
    esc,
    money,
    discountPercent,
    param,
    asset,
    absUrl,
    getProduct,
    getCategory,
    productsIn,
    productUrl,
    categoryUrl,
    articleUrl,
    store,
    digits,
    whatsappUrl,
    telUrl,
    normalizePkPhone,
    readingTime,
    formatDate,
    reducedMotion,
    setMeta
  };
})(window.ESHA);
