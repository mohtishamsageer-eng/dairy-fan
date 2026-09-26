/*
 * Esha Naturals — navigation & page lifecycle
 * ------------------------------------------------------------------
 * Normal website: every page is its own .html file; this runs the page's code once.
 * Single-file build (dist/esha-naturals.html, window.ESHA_SPA = true): all pages live in
 * <template> elements and links like "shop.html?category=hair-care" are shown in place
 * using the address "#/shop.html?category=hair-care".
 */
(function (E) {
  'use strict';

  const spa = !!window.ESHA_SPA;
  E.pages = E.pages || {};

  /* ---------------- Page lifecycle ---------------- */
  let cleanups = [];
  const ctx = {
    spa,
    on(target, type, fn, opts) {
      target.addEventListener(type, fn, opts);
      cleanups.push(() => target.removeEventListener(type, fn, opts));
    },
    cleanup(fn) {
      cleanups.push(fn);
    }
  };

  function runPage(key) {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        /* ignore */
      }
    });
    cleanups = [];
    const fn = E.pages[key];
    if (fn) {
      try {
        fn(ctx);
      } catch (e) {
        if (window.console) console.error(e);
      }
    }
    if (E.ui) E.ui.afterPageRender(key);
  }

  /* ---------------- Routes ---------------- */
  const PAGE_RE = /^(?:\.\/)?([a-z0-9-]+\.html)?(\?[^#]*)?(#.*)?$/i;

  const parse = (path) => {
    const m = String(path || '').match(PAGE_RE) || [];
    return {
      file: (m[1] || 'index.html').toLowerCase(),
      query: new URLSearchParams((m[2] || '').slice(1)),
      anchor: (m[3] || '').slice(1)
    };
  };

  let current = spa ? parse((window.location.hash || '').replace(/^#\/?/, '')) : null;
  let silentHash = null;

  const hashFor = (path) => `#/${path.replace(/^\.\//, '')}`;

  function scrollToAnchor(anchor) {
    const el = anchor && document.getElementById(anchor);
    if (el) el.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }

  function resolveAssets(root) {
    const map = window.ESHA_ASSETS;
    if (!map) return;
    root.querySelectorAll('img[src^="assets/"]').forEach((img) => {
      const v = map[img.getAttribute('src')];
      if (v) img.setAttribute('src', v);
    });
    // Single-file build: one embedded copy per image, so drop srcset and keep the largest source
    root.querySelectorAll('[srcset]').forEach((el) => {
      const urls = el
        .getAttribute('srcset')
        .split(',')
        .map((s) => s.trim().split(/\s+/)[0]);
      const largest = map[urls[urls.length - 1]];
      el.removeAttribute('srcset');
      el.removeAttribute('sizes');
      if (el.tagName === 'IMG' && largest && !/^data:/.test(el.getAttribute('src') || '')) el.setAttribute('src', largest);
    });
  }

  function render(route) {
    current = route;
    let tpl = document.getElementById(`page-${route.file}`);
    if (!tpl) tpl = document.getElementById('page-404.html');
    const main = document.getElementById('main');
    const frag = tpl.content.cloneNode(true);
    resolveAssets(frag);
    main.className = tpl.dataset.mainClass || '';
    main.innerHTML = '';
    main.appendChild(frag);
    document.body.dataset.page = tpl.dataset.page;
    document.title = tpl.dataset.title || document.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && tpl.dataset.desc) desc.setAttribute('content', tpl.dataset.desc);
    runPage(tpl.dataset.page);
    scrollToAnchor(route.anchor);
  }

  function go(path, { replace = false } = {}) {
    if (!spa) {
      if (replace) window.location.replace(path);
      else window.location.href = path;
      return;
    }
    const route = parse(path);
    const hash = hashFor(path);
    if (window.location.hash !== hash) {
      silentHash = hash;
      try {
        if (replace) window.location.replace(hash);
        else window.location.hash = hash;
      } catch (e) {
        silentHash = null;
      }
    }
    render(route);
  }

  // Change the address without re-rendering (filters, sorting)
  function update(path, { replace = false } = {}) {
    if (!spa) {
      try {
        window.history[replace ? 'replaceState' : 'pushState'](null, '', path);
      } catch (e) {
        /* ignore */
      }
      return;
    }
    current = parse(path);
    const hash = hashFor(path);
    if (window.location.hash === hash) return;
    silentHash = hash;
    try {
      if (replace) window.location.replace(hash);
      else window.location.hash = hash;
    } catch (e) {
      silentHash = null;
    }
  }

  function params() {
    return spa && current ? current.query : new URLSearchParams(window.location.search);
  }

  E.nav = {
    spa,
    go,
    update,
    params,
    param: (name) => params().get(name),
    runPage
  };

  /* ---------------- Boot ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    if (!spa) {
      runPage(document.body.dataset.page);
      return;
    }

    window.addEventListener('hashchange', () => {
      if (silentHash && window.location.hash === silentHash) {
        silentHash = null;
        return;
      }
      silentHash = null;
      render(parse(window.location.hash.replace(/^#\/?/, '')));
    });

    // Handle internal links in place
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (href.charAt(0) === '#' && href.charAt(1) !== '/') {
        e.preventDefault();
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (id === 'main') el.focus({ preventScroll: true });
        }
        return;
      }
      if (!PAGE_RE.test(href) || !/\.html/i.test(href)) return;
      e.preventDefault();
      if (E.ui) E.ui.closeDrawers();
      go(href);
    });

    render(current);
  });
})(window.ESHA);
