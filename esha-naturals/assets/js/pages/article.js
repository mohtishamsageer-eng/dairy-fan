/* Esha Naturals — single journal article */
(function (E) {
  'use strict';

  const U = E.utils;
  const ui = E.ui;
  const icon = E.icon;
  const cfg = E.config;
  const { $, esc } = U;

  const root = $('[data-article]');
  if (!root) return;

  const slug = U.param('slug');
  const a = E.articles.find((x) => x.slug === slug);

  if (!a) {
    root.innerHTML = `<div class="container not-found">
      <p class="not-found__code">Oops</p>
      <h1 class="section-title">Article not found</h1>
      <p class="section-sub" style="margin:1rem auto 2rem">This article may have moved. Browse all our articles instead.</p>
      <a class="btn btn--dark" href="journal.html">Go to the Journal</a>
    </div>`;
    document.title = `Article not found | ${cfg.brand}`;
    return;
  }

  const topic = E.topics.find((t) => t.id === a.topic);
  const abs = (path) => new URL(path, window.location.href).href;
  U.setMeta({ title: `${a.title} | ${cfg.brand}`, description: a.excerpt, image: abs(a.cover) });

  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.excerpt,
    image: abs(a.cover),
    author: { '@type': 'Organization', name: cfg.brand },
    publisher: { '@type': 'Organization', name: cfg.brand }
  });
  document.head.appendChild(ld);

  const products = (a.products || []).map(U.getProduct).filter(Boolean);
  const pageUrl = window.location.href;
  const shareText = `${a.title} | ${cfg.brand}`;

  const miniProduct = (p) => `<div class="mini-product" style="--tint:${p.theme.tint}">
    <span class="mini-product__media">${ui.productImg(p)}</span>
    <div>
      <p class="mini-product__name"><a href="${U.productUrl(p)}">${esc(p.name)}</a></p>
      <p class="mini-product__text">${esc(p.size)} · ${esc(p.tagline)}</p>
      ${ui.priceHtml(p)}
    </div>
    <button type="button" class="btn btn--gold btn--sm" data-add="${p.id}">${icon('bag')}<span>Add to Cart</span></button>
  </div>`;

  root.innerHTML = `
    <header class="article-head">
      <div class="container article-head__inner">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="index.html">Home</a></li>
            <li><a href="journal.html">Journal</a></li>
            <li><a href="journal.html?topic=${esc(a.topic)}">${esc(topic ? topic.name : '')}</a></li>
          </ol>
        </nav>
        <h1 class="article-head__title">${esc(a.title)}</h1>
        <p class="article-head__dek">${esc(a.excerpt)}</p>
        <p class="article-head__meta"><span>${esc(topic ? topic.name : '')}</span><span aria-hidden="true">·</span><span>${U.readingTime(a.body)} min read</span><span aria-hidden="true">·</span><span>By ${esc(cfg.brand)}</span></p>
      </div>
    </header>
    <div class="container">
      <figure class="article-cover"><img src="${a.cover}" alt="${esc(a.coverAlt)}" width="720" height="480" fetchpriority="high"></figure>
    </div>
    <div class="section section--tight">
      <div class="container">
        <div class="prose">${a.body}</div>
        ${products.length ? `<aside class="product-cta" aria-label="Products in this article">
          <p class="product-cta__label">Featured in this article</p>
          ${products.map(miniProduct).join('')}
        </aside>` : ''}
        <div class="share">
          <span class="share__label">Share</span>
          <a href="https://wa.me/?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">${icon('whatsapp')}</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener" aria-label="Share on Facebook">${icon('facebook')}</a>
          <button type="button" data-copy-link aria-label="Copy link">${icon('link')}</button>
        </div>
      </div>
    </div>`;

  const copy = $('[data-copy-link]');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      ui.toast('Link copied');
    } catch (e) {
      ui.toast('Could not copy the link', { icon: 'info' });
    }
  });

  const more = E.articles.filter((x) => x.slug !== a.slug).sort((x, y) => (y.topic === a.topic) - (x.topic === a.topic)).slice(0, 3);
  const moreEl = $('[data-more]');
  if (more.length) {
    moreEl.hidden = false;
    moreEl.innerHTML = `<div class="container">
      <header class="section-head section-head--split reveal">
        <p class="eyebrow">Keep reading</p>
        <h2 class="section-title">More from the <em>Journal</em></h2>
        <a class="link-arrow section-head__action" href="journal.html">All articles ${icon('arrowRight')}</a>
      </header>
      <div class="article-grid">${more.map((x, i) => ui.articleCard(x, { delay: i * 0.08 })).join('')}</div>
    </div>`;
  }
})(window.ESHA);
