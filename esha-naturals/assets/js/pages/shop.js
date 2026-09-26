/* Esha Naturals — shop page: category filter, sorting, URL state */
(function (E) {
  'use strict';

  const U = E.utils;
  const ui = E.ui;
  const icon = E.icon;
  const { $, esc } = U;

  E.pages.shop = function (ctx) {
    const grid = $('[data-shop-grid]');
    const pills = $('[data-shop-pills]');
    const sortSel = $('[data-shop-sort]');
    const countEl = $('[data-shop-count]');
    const intro = $('[data-cat-intro]');
    const titleEl = $('[data-shop-title]');
    const subEl = $('[data-shop-sub]');
    const crumb = $('[data-shop-crumb]');
    if (!grid) return;

    const SORTS = {
      featured: () => 0,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      discount: (a, b) => U.discountPercent(b) - U.discountPercent(a),
      name: (a, b) => a.name.localeCompare(b.name)
    };

    const readState = () => {
      const c = U.param('category');
      const s = U.param('sort');
      return { category: c && U.getCategory(c) ? c : '', sort: SORTS[s] ? s : 'featured' };
    };

    let state = readState();

    const urlFor = (s) => {
      const params = new URLSearchParams();
      if (s.category) params.set('category', s.category);
      if (s.sort && s.sort !== 'featured') params.set('sort', s.sort);
      const q = params.toString();
      return `shop.html${q ? `?${q}` : ''}`;
    };

    function renderPills() {
      const all = [{ id: '', name: 'All Products', count: U.allProducts().length }].concat(
        E.categories.map((c) => ({ id: c.id, name: c.name, count: U.productsIn(c.id).length }))
      );
      pills.innerHTML = all
        .map(
          (c) =>
            `<a class="pill" href="${urlFor({ category: c.id, sort: state.sort })}" data-category="${c.id}"${
              c.id === state.category ? ' aria-current="true"' : ''
            }>${esc(c.name)} <span class="pill__count">(${c.count})</span></a>`
        )
        .join('');
    }

    function render() {
      const cat = U.getCategory(state.category);
      const list = U.productsIn(state.category)
        .map((p, i) => ({ p, i }))
        .sort((a, b) => SORTS[state.sort](a.p, b.p) || a.i - b.i)
        .map((x) => x.p);

      grid.innerHTML = list.map((p, i) => ui.productCard(p, { level: 2, delay: i * 0.06, eager: i < 4 })).join('');
      countEl.textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
      sortSel.value = state.sort;
      renderPills();

      if (cat) {
        const words = esc(cat.title).split(' ');
        const last = words.pop();
        titleEl.innerHTML = `${words.join(' ')} <em>${last}</em>`;
        subEl.textContent = cat.description;
        crumb.hidden = false;
        crumb.innerHTML = `<span aria-current="page">${esc(cat.name)}</span>`;
        intro.hidden = false;
        intro.innerHTML = `<span class="cat-intro__icon">${icon(cat.icon)}</span>
        <div><h2>${esc(cat.tagline)}</h2><p>${esc(cat.description)}</p></div>`;
        document.title = `${cat.title} | ${E.config.brand}`;
      } else {
        titleEl.innerHTML = 'The <em>Collection</em>';
        subEl.textContent =
          'Pure hair care and cooking oils made with natural ingredients. 100% original, with Cash on Delivery all over Pakistan.';
        crumb.hidden = true;
        intro.hidden = true;
        document.title = `Shop All Products | ${E.config.brand}`;
      }
      ui.setActiveNav(cat ? `cat:${cat.id}` : 'shop');
      ui.refreshReveals(grid);
    }

    pills.addEventListener('click', (e) => {
      const a = e.target.closest('[data-category]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      state = Object.assign({}, state, { category: a.dataset.category });
      E.nav.update(urlFor(state));
      render();
    });

    sortSel.addEventListener('change', () => {
      state = Object.assign({}, state, { sort: sortSel.value });
      E.nav.update(urlFor(state), { replace: true });
      render();
    });

    // Header links like "Hair Care" point at this same page — filter in place instead of reloading.
    // (The single-file build already shows every link in place, so this is only for the normal site.)
    if (!ctx.spa)
      ctx.on(document, 'click', (e) => {
        if (e.defaultPrevented) return;
        const a = e.target.closest('a[href^="shop.html"]');
        if (!a || pills.contains(a) || e.metaKey || e.ctrlKey || e.shiftKey) return;
        const url = new URL(a.href, window.location.href);
        const c = url.searchParams.get('category') || '';
        if (c && !U.getCategory(c)) return;
        e.preventDefault();
        ui.closeDrawers();
        state = { category: c, sort: state.sort };
        E.nav.update(urlFor(state));
        render();
        window.scrollTo({ top: 0, behavior: U.reducedMotion() ? 'auto' : 'smooth' });
      });

    if (!ctx.spa)
      ctx.on(window, 'popstate', () => {
        state = readState();
        render();
      });

    render();
  };
})(window.ESHA);
