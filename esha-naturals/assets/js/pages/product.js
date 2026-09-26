/* Esha Naturals — product page */
(function (E) {
  'use strict';

  const U = E.utils;
  const ui = E.ui;
  const icon = E.icon;
  const cfg = E.config;
  const { $, $$, esc, money } = U;

  E.pages.product = function (ctx) {
    const root = $('[data-pdp]');
    if (!root) return;

    const p = U.getProduct(U.param('id'));

    if (!p) {
      root.innerHTML = `<div class="container not-found">
      <p class="not-found__code">Oops</p>
      <h1 class="section-title">We couldn't find that product</h1>
      <p class="section-sub" style="margin:1rem auto 2rem">It may have been renamed or removed. Please browse our full collection.</p>
      <a class="btn btn--dark" href="shop.html">Browse all products</a>
    </div>`;
      document.title = `Product not found | ${cfg.brand}`;
      return;
    }

    const cat = U.getCategory(p.category);
    const off = U.discountPercent(p);
    const d = cfg.delivery || {};
    const max = cfg.maxQtyPerItem || 10;
    const accentLast = (text) => {
      const words = esc(text).split(' ');
      const last = words.pop();
      return `${words.join(' ')} <em>${last}</em>`;
    };

    /* ---------- Meta & structured data ---------- */
    const abs = U.absUrl;
    U.setMeta({
      title: `${p.name} (${p.size}) | ${cfg.brand}`,
      description: `${p.shortDescription} ${money(p.price)}. Cash on Delivery all over Pakistan.`,
      image: abs(p.images.poster)
    });
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${cfg.brand} ${p.name}`,
      image: [abs(p.images.product), abs(p.images.poster)],
      description: p.description,
      sku: p.id,
      brand: { '@type': 'Brand', name: cfg.brand },
      offers: {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: 'PKR',
        price: p.price,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition'
      }
    });
    document.head.appendChild(ld);
    ctx.cleanup(() => ld.remove());

    /* ---------- Main product block ---------- */
    const deliveryLine =
      d.freeAbove && Number(d.fee)
        ? `<li>${icon('box')}<span><strong>Free delivery</strong> on orders over ${money(d.freeAbove)}</span></li>`
        : !Number(d.fee)
          ? `<li>${icon('box')}<span><strong>Free delivery</strong> all over Pakistan</span></li>`
          : '';

    root.innerHTML = `<div class="container">
    <nav class="breadcrumbs breadcrumbs--left pdp__crumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="index.html">Home</a></li>
        <li><a href="shop.html">Shop</a></li>
        ${cat ? `<li><a href="${U.categoryUrl(cat)}">${esc(cat.name)}</a></li>` : ''}
        <li><span aria-current="page">${esc(p.name)}</span></li>
      </ol>
    </nav>
    <div class="pdp__grid" style="--tint:${p.theme.tint}">
      <div class="gallery">
        <div class="gallery__stage">
          ${off ? `<span class="price__save gallery__badge">Save ${off}%</span>` : ''}
          <img class="gallery__img gallery__img--product is-active" data-view="0" src="${U.asset(p.images.product)}" alt="${esc(p.name)}, ${esc(p.size)} bottle" width="${p.images.width}" height="${p.images.height}" fetchpriority="high">
          <img class="gallery__img gallery__img--poster" data-view="1" src="${U.asset(p.images.poster)}" alt="${esc(p.name)} poster with benefits and ingredients" width="1024" height="1536" loading="lazy" decoding="async">
          <button type="button" class="gallery__zoom" data-zoom>${icon('expand')}<span>View poster</span></button>
        </div>
        <div class="gallery__thumbs" role="group" aria-label="Product images">
          <button type="button" class="gallery__thumb" data-thumb="0" aria-pressed="true" aria-label="Show bottle photo">
            <img class="is-product" src="${U.asset(p.images.productSm)}" alt="" width="${p.images.smWidth}" height="${p.images.smHeight}">
          </button>
          <button type="button" class="gallery__thumb" data-thumb="1" aria-pressed="false" aria-label="Show poster">
            <img class="is-poster" src="${U.asset(p.images.posterSm)}" alt="" width="640" height="960" loading="lazy">
          </button>
        </div>
      </div>

      <div class="pdp__info">
        <div class="pdp__head">
          <p class="eyebrow">${esc(cat ? cat.name : '')} · ${esc(p.size)}</p>
          <h1 class="pdp__title">${esc(p.name)}</h1>
          <p class="pdp__tagline">${esc(p.tagline)}</p>
        </div>
        <div class="pdp__price">
          ${ui.priceHtml(p, { save: true })}
          ${off ? `<p class="pdp__price-note">${icon('sparkle')} You save ${money(p.comparePrice - p.price)} on this bottle</p>` : ''}
        </div>
        <p class="pdp__desc">${esc(p.description)}</p>
        <ul class="pdp__highlights">
          ${p.highlights.map((h) => `<li class="hl">${icon(h.icon)}<span>${esc(h.title)}</span></li>`).join('')}
        </ul>
        <div class="pdp__size"><span>Size</span><span class="size-chip">${esc(p.size)}</span></div>
        <div class="buy-row" data-buy-row>
          <div class="qty qty--lg" role="group" aria-label="Quantity">
            <button type="button" data-pdp-dec aria-label="Decrease quantity" disabled>${icon('minus')}</button>
            <input type="number" id="pdp-qty" value="1" min="1" max="${max}" inputmode="numeric" aria-label="Quantity">
            <button type="button" data-pdp-inc aria-label="Increase quantity">${icon('plus')}</button>
          </div>
          <button type="button" class="btn btn--dark" data-add="${p.id}" data-qty-from="#pdp-qty">${icon('bag')}<span>Add to Cart</span></button>
          <button type="button" class="btn btn--gold" data-buy="${p.id}" data-qty-from="#pdp-qty"><span>Buy Now</span></button>
        </div>
        <ul class="assure">
          <li>${icon('truck')}<span><strong>Delivery in ${esc(d.timeText || '')}</strong></span></li>
          <li>${icon('cash')}<span><strong>Cash on Delivery</strong> all over Pakistan, no advance payment</span></li>
          <li>${icon('seal')}<span><strong>100% original</strong> Esha Naturals product</span></li>
          ${deliveryLine}
        </ul>
        <div class="faq">
          <details class="acc" open>
            <summary><span>Description</span><span class="acc__icon" aria-hidden="true"></span></summary>
            <div class="acc__body"><p>${esc(p.description)}</p><p class="caution">${icon('info')}<span>${esc(p.caution)}</span></p></div>
          </details>
          <details class="acc">
            <summary><span>${esc(p.ingredientsTitle)}</span><span class="acc__icon" aria-hidden="true"></span></summary>
            <div class="acc__body"><ul>${p.ingredients.map((i) => `<li><strong>${esc(i.name)}</strong>: ${esc(i.note)}</li>`).join('')}</ul></div>
          </details>
          <details class="acc">
            <summary><span>How to use</span><span class="acc__icon" aria-hidden="true"></span></summary>
            <div class="acc__body"><ol>${p.howToUse.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
          </details>
          <details class="acc">
            <summary><span>Product details</span><span class="acc__icon" aria-hidden="true"></span></summary>
            <div class="acc__body"><table class="details-table"><tbody>${p.details.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div>
          </details>
          <details class="acc">
            <summary><span>Delivery &amp; returns</span><span class="acc__icon" aria-hidden="true"></span></summary>
            <div class="acc__body">
              <p>After you place your order, our team will call or message you to confirm it. Delivery takes <strong>${esc(d.timeText || '')}</strong>, and you pay cash on delivery.</p>
              <p>If your product arrives damaged or incorrect, contact us within 48 hours of delivery and we will replace it. <a href="policies.html#shipping">Read our shipping &amp; returns policy</a>.</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>`;

    /* ---------- Gallery & lightbox ---------- */
    const views = $$('.gallery__img', root);
    const thumbs = $$('[data-thumb]', root);
    const showView = (i) => {
      views.forEach((v) => v.classList.toggle('is-active', Number(v.dataset.view) === i));
      thumbs.forEach((t) => t.setAttribute('aria-pressed', String(Number(t.dataset.thumb) === i)));
    };
    thumbs.forEach((t) => t.addEventListener('click', () => showView(Number(t.dataset.thumb))));

    const lightbox = $('[data-lightbox]');
    const lbImg = $('[data-lightbox-img]');
    const openLightbox = () => {
      lbImg.src = U.asset(p.images.poster);
      lbImg.alt = `${p.name} poster`;
      if (lightbox.showModal) lightbox.showModal();
      else window.open(U.asset(p.images.poster), '_blank');
    };
    ctx.on(document, 'click', (e) => {
      if (e.target.closest('[data-zoom]')) openLightbox();
    });
    if (lightbox) {
      $('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.close();
      });
    }

    /* ---------- Quantity stepper ---------- */
    const qtyInput = $('#pdp-qty');
    const dec = $('[data-pdp-dec]');
    const inc = $('[data-pdp-inc]');
    const setQty = (v) => {
      const q = Math.max(1, Math.min(max, parseInt(v, 10) || 1));
      qtyInput.value = q;
      dec.disabled = q <= 1;
      inc.disabled = q >= max;
    };
    dec.addEventListener('click', () => setQty(Number(qtyInput.value) - 1));
    inc.addEventListener('click', () => setQty(Number(qtyInput.value) + 1));
    qtyInput.addEventListener('change', () => setQty(qtyInput.value));

    /* ---------- Ingredients / poster section ---------- */
    const details = $('[data-pdp-details]');
    details.hidden = false;
    details.innerHTML = `<div class="container ingredients">
    <div class="poster-frame reveal">
      <img src="${U.asset(p.images.poster)}" alt="${esc(p.name)} poster" width="1024" height="1536" loading="lazy" decoding="async">
      <button type="button" data-zoom aria-label="View the full poster"></button>
    </div>
    <div class="reveal" style="--d:.1s">
      <p class="eyebrow">${esc(p.ingredientsTitle)}</p>
      <h2 class="section-title" style="margin-top:1rem">${accentLast(p.motto)}</h2>
      <p class="section-sub" style="margin-top:1rem">${esc(p.shortDescription)}</p>
      <ul class="ing-grid">${p.ingredients.map((i) => `<li class="ing"><strong>${esc(i.name)}</strong><span>${esc(i.note)}</span></li>`).join('')}</ul>
    </div>
  </div>`;

    /* ---------- Related products ---------- */
    const related = E.products
      .filter((x) => x.id !== p.id)
      .sort((a, b) => (b.category === p.category) - (a.category === p.category))
      .slice(0, 3);
    const rel = $('[data-pdp-related]');
    if (related.length) {
      rel.hidden = false;
      rel.innerHTML = `<div class="container">
      <header class="section-head section-head--split reveal">
        <p class="eyebrow">You may also like</p>
        <h2 class="section-title">Complete your <em>ritual</em></h2>
        <a class="link-arrow section-head__action" href="shop.html">View all ${icon('arrowRight')}</a>
      </header>
      <div class="product-grid product-grid--3">${related.map((x, i) => ui.productCard(x, { delay: i * 0.08 })).join('')}</div>
    </div>`;
    }

    /* ---------- Sticky add-to-cart bar ---------- */
    const bar = $('[data-buybar]');
    bar.hidden = false;
    bar.style.setProperty('--tint', p.theme.tint);
    bar.innerHTML = `<span class="buybar__media">${ui.productImg(p)}</span>
    <div class="buybar__info"><p class="buybar__name">${esc(p.name)}</p>${ui.priceHtml(p)}</div>
    <button type="button" class="btn btn--gold btn--sm" data-add="${p.id}" data-qty-from="#pdp-qty">${icon('bag')}<span>Add to Cart</span></button>`;
    const buyRow = $('[data-buy-row]');
    if ('IntersectionObserver' in window && buyRow) {
      const io = new IntersectionObserver(([entry]) => {
        const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        bar.classList.toggle('is-visible', show);
        document.body.classList.toggle('has-buybar', show);
      });
      io.observe(buyRow);
      ctx.cleanup(() => {
        io.disconnect();
        document.body.classList.remove('has-buybar');
      });
    }
  };
})(window.ESHA);
