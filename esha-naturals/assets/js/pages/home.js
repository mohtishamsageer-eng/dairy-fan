/* Esha Naturals — home page: hero slideshow, categories, collection, spotlight, journal, FAQ */
(function (E) {
  'use strict';

  const U = E.utils;
  const ui = E.ui;
  const icon = E.icon;
  const { $, $$, esc } = U;

  const pad = (n) => String(n).padStart(2, '0');

  // "Anti Hair Fall Oil" -> "Anti Hair Fall <em>Oil</em>"
  const accentLastWord = (name) => {
    const parts = esc(name).split(' ');
    const last = parts.pop();
    return `${parts.join(' ')} <em>${last}</em>`;
  };

  /* ---------------- Hero slideshow ---------------- */
  function initHero(ctx) {
    const hero = $('#hero');
    if (!hero) return;
    const slidesWrap = $('[data-hero-slides]', hero);
    const stage = $('[data-hero-stage]', hero);
    const controls = $('[data-hero-controls]', hero);
    const tag = $('[data-hero-tag]', hero);
    const products = E.products;
    const total = products.length + 1;

    products.forEach((p, i) => {
      const cat = U.getCategory(p.category);
      slidesWrap.insertAdjacentHTML(
        'beforeend',
        `<div class="hero-slide" role="group" aria-roledescription="slide" aria-label="${i + 2} of ${total}: ${esc(p.name)}" aria-hidden="true">
          <p class="eyebrow hero-slide__eyebrow">${esc(cat ? cat.name : '')} · ${esc(p.size)}</p>
          <h2 class="hero-slide__title">${accentLastWord(p.name)}</h2>
          <p class="hero-slide__motto">${esc(p.motto)}</p>
          <p class="hero-slide__text">${esc(p.shortDescription)}</p>
          ${ui.priceHtml(p, { save: true, cls: 'hero-slide__price on-dark-price' })}
          <div class="hero-slide__actions">
            <button type="button" class="btn btn--gold btn--lg" data-add="${p.id}">${icon('bag')}<span>Add to Cart</span></button>
            <a class="btn btn--outline-light btn--lg" href="${U.productUrl(p)}">View Details</a>
          </div>
        </div>`
      );
      stage.insertAdjacentHTML(
        'beforeend',
        `<img class="stage__bottle${ui.isSmall(p) ? ' stage__bottle--sm' : ''}" src="${U.asset(p.images.product)}" alt="" width="${p.images.width}" height="${p.images.height}" decoding="async" fetchpriority="low" data-slide-img>`
      );
    });

    const slides = $$('.hero-slide', slidesWrap);
    const visuals = [$('.stage__group', stage)].concat($$('[data-slide-img]', stage));
    const glows = ['rgba(212, 162, 76, 0.40)'].concat(products.map((p) => p.theme.glow));
    slides[0].setAttribute('aria-label', `1 of ${total}: ${E.config.brand} collection`);

    controls.innerHTML = `
      <p class="hero__counter" aria-hidden="true"><strong data-hero-current>01</strong> / ${pad(total)}</p>
      <div class="hero__dots" role="group" aria-label="Choose a slide">
        ${slides.map((s, i) => `<button type="button" class="hero__dot" data-go="${i}" aria-label="Show slide ${i + 1} of ${total}"></button>`).join('')}
      </div>
      <div class="hero__arrows">
        <button type="button" class="round-btn" data-prev aria-label="Previous slide">${icon('arrowLeft')}</button>
        <button type="button" class="round-btn" data-next aria-label="Next slide">${icon('arrowRight')}</button>
        <button type="button" class="round-btn" data-toggle aria-label="Pause slideshow">${icon('pause')}</button>
      </div>`;
    const dots = $$('.hero__dot', controls);
    const current = $('[data-hero-current]', controls);
    const toggle = $('[data-toggle]', controls);

    const INTERVAL = 6500;
    hero.style.setProperty('--hero-interval', `${INTERVAL}ms`);
    let index = 0;
    let playing = !U.reducedMotion();
    let hold = false; // hover / focus / hidden tab
    let timer = null;
    let started = 0;
    let remaining = INTERVAL;

    const schedule = () => {
      clearTimeout(timer);
      timer = null;
      if (!playing || hold) return;
      started = Date.now();
      timer = setTimeout(() => go(index + 1), remaining);
    };

    const setHold = (value) => {
      if (value === hold) return;
      hold = value;
      if (hold && timer) {
        clearTimeout(timer);
        timer = null;
        remaining = Math.max(0, remaining - (Date.now() - started));
      }
      hero.classList.toggle('is-paused', hold);
      schedule();
    };

    function go(i) {
      index = (i + total) % total;
      slides.forEach((s, k) => {
        const on = k === index;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
        s.inert = !on;
      });
      visuals.forEach((v, k) => v.classList.toggle('is-active', k === index));
      hero.dataset.slide = String(index);
      dots.forEach((dot, k) => dot.setAttribute('aria-current', String(k === index)));
      current.textContent = pad(index + 1);
      hero.style.setProperty('--hero-glow', glows[index]);

      const p = index > 0 ? products[index - 1] : null;
      const off = p ? U.discountPercent(p) : 0;
      tag.hidden = !off;
      if (off) tag.innerHTML = `<div><strong>−${off}%</strong><span>Special price</span></div>`;

      // restart the progress bar animation
      hero.classList.remove('is-playing');
      void hero.offsetWidth;
      if (playing) hero.classList.add('is-playing');
      remaining = INTERVAL;
      schedule();
    }

    const setPlaying = (value) => {
      playing = value;
      toggle.innerHTML = icon(playing ? 'pause' : 'play');
      toggle.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
      hero.classList.toggle('is-playing', playing);
      remaining = INTERVAL;
      schedule();
    };

    controls.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-go]');
      if (dot) return go(Number(dot.dataset.go));
      if (e.target.closest('[data-prev]')) return go(index - 1);
      if (e.target.closest('[data-next]')) return go(index + 1);
      if (e.target.closest('[data-toggle]')) setPlaying(!playing);
    });

    hero.addEventListener('mouseenter', () => setHold(true));
    hero.addEventListener('mouseleave', () => setHold(hero.contains(document.activeElement)));
    hero.addEventListener('focusin', () => setHold(true));
    hero.addEventListener('focusout', (e) => {
      if (!hero.contains(e.relatedTarget)) setHold(hero.matches(':hover'));
    });
    ctx.on(document, 'visibilitychange', () => setHold(document.hidden || hero.matches(':hover')));
    ctx.cleanup(() => clearTimeout(timer));

    hero.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowLeft') go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    });

    // Swipe on touch screens
    let sx = 0;
    let sy = 0;
    hero.addEventListener(
      'touchstart',
      (e) => {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
      },
      { passive: true }
    );
    hero.addEventListener(
      'touchend',
      (e) => {
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(index + (dx < 0 ? 1 : -1));
      },
      { passive: true }
    );

    setPlaying(playing);
    go(0);
  }

  /* ---------------- Marquee ---------------- */
  function renderMarquee() {
    const el = $('[data-marquee]');
    if (!el) return;
    const words = ['100% Original', 'Pure & Natural', 'Cash on Delivery', 'Nationwide Delivery', 'Trusted Quality', 'Natural Ingredients'];
    const group = (hidden) =>
      `<div class="marquee__group"${hidden ? ' aria-hidden="true"' : ''}>${words
        .map((w) => `<span class="marquee__item">${esc(w)}${icon('dropSolid')}</span>`)
        .join('')}</div>`;
    el.innerHTML = `<div class="marquee__track">${group(false)}${group(true)}</div>`;
  }

  /* ---------------- Categories ---------------- */
  function renderCategories() {
    const el = $('[data-categories]');
    if (!el) return;
    el.innerHTML = E.categories
      .map((c, i) => {
        const ps = U.productsIn(c.id);
        return `<a class="cat-card cat-card--${c.id === 'hair-care' ? 'hair' : 'cook'} reveal" href="${U.categoryUrl(c)}" style="--glow:${c.glow};--d:${i * 0.1}s">
          <div class="cat-card__stage" aria-hidden="true">
            ${ps
              .slice(0, 2)
              .map(
                (p) =>
                  `<img class="${ui.isSmall(p) ? 'is-small' : 'is-large'}" src="${U.asset(p.images.productSm)}" alt="" width="${p.images.smWidth}" height="${p.images.smHeight}" loading="lazy" decoding="async">`
              )
              .join('')}
          </div>
          <div class="cat-card__body">
            <p class="cat-card__count">${ps.length} product${ps.length === 1 ? '' : 's'}</p>
            <h3 class="cat-card__title">${esc(c.title)}</h3>
            <p class="cat-card__text">${esc(c.tagline)}</p>
            <span class="link-arrow">Shop ${esc(c.name)} ${icon('arrowRight')}</span>
          </div>
        </a>`;
      })
      .join('');
  }

  /* ---------------- Products ---------------- */
  function renderProducts() {
    const el = $('[data-products]');
    if (el) el.innerHTML = E.products.map((p, i) => ui.productCard(p, { delay: i * 0.08 })).join('');
  }

  /* ---------------- Spotlight ---------------- */
  function renderSpotlight() {
    const el = $('[data-spotlight]');
    if (!el) return;
    const p = U.getProduct(el.dataset.spotlight);
    if (!p) {
      el.remove();
      return;
    }
    el.innerHTML = `<div class="container spotlight__grid">
      <div class="spotlight__intro reveal">
        <p class="eyebrow">The Hair Ritual</p>
        <h2 class="section-title">${accentLastWord(p.name)}</h2>
        <p class="hero-slide__motto">${esc(p.motto)}</p>
        <p class="spotlight__text">${esc(p.description)}</p>
        ${ui.priceHtml(p, { save: true })}
        <div class="hero-slide__actions">
          <button type="button" class="btn btn--gold" data-add="${p.id}">${icon('bag')}<span>Add to Cart</span></button>
          <a class="btn btn--outline-light" href="${U.productUrl(p)}">View Details</a>
        </div>
      </div>
      <div class="spotlight__stage reveal" style="--d:.1s" aria-hidden="true">
        <div class="stage__ring"></div>
        <div class="stage__pedestal"></div>
        <img class="stage__bottle" src="${U.asset(p.images.product)}" alt="" width="${p.images.width}" height="${p.images.height}" loading="lazy" decoding="async">
        ${p.ingredients
          .slice(0, 3)
          .map((ing, i) => `<span class="callout callout--${i + 1}"><i>${esc(ing.name.charAt(0))}</i>${esc(ing.name)}</span>`)
          .join('')}
      </div>
      <ul class="benefit-list reveal" style="--d:.2s">
        ${p.highlights.map((h) => `<li>${icon(h.icon)}<div><strong>${esc(h.title)}</strong><span>${esc(h.text || '')}</span></div></li>`).join('')}
      </ul>
    </div>`;
  }

  /* ---------------- Journal & FAQ ---------------- */
  function renderArticles() {
    const el = $('[data-articles]');
    if (!el || !E.articles) return;
    const picks = ['why-hair-falls', 'mustard-oil-desi-kitchen', 'hair-oil-ingredients']
      .map((s) => E.articles.find((a) => a.slug === s))
      .filter(Boolean);
    el.innerHTML = picks.map((a, i) => ui.articleCard(a, { delay: i * 0.08 })).join('');
  }

  function renderFaq() {
    const el = $('[data-faq]');
    if (el) el.innerHTML = ui.faqHtml();
  }

  E.pages.home = function (ctx) {
    initHero(ctx);
    renderMarquee();
    renderCategories();
    renderProducts();
    renderSpotlight();
    renderArticles();
    renderFaq();
  };
})(window.ESHA);
