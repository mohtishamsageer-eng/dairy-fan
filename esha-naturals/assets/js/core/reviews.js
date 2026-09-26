/* Esha Naturals — customer reviews: rating summary, review list and "write a review" form.
 * Published reviews come from data/reviews.js. New reviews are emailed to the store for approval;
 * until then the customer who wrote one sees it on their own device, marked "awaiting approval". */
(function (E) {
  'use strict';

  const U = E.utils;
  const icon = E.icon;
  const cfg = E.config;
  const { $, $$, esc, store } = U;
  const MINE = 'esha_my_reviews';
  const PAGE = 6;
  let uid = 0;

  const published = (productId) =>
    (E.customerReviews || [])
      .filter((r) => r && r.rating && r.text && (!productId || r.product === productId))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  let memory = []; // used when the browser blocks storage (private mode, sandboxed previews)
  const mine = (productId) => {
    const saved = store.get(MINE, []);
    const list = Array.isArray(saved) && saved.length ? saved : memory;
    return list.filter((r) => r && (!productId || r.product === productId));
  };
  const summary = (list) => {
    const count = list.length;
    const avg = count ? list.reduce((s, r) => s + Number(r.rating), 0) / count : 0;
    const bars = [5, 4, 3, 2, 1].map((n) => ({ n, c: list.filter((r) => Number(r.rating) === n).length }));
    return { count, avg, bars };
  };

  const starsHtml = (rating, label = true) => {
    const r = Math.round(rating);
    const stars = [1, 2, 3, 4, 5].map((i) => `<span class="star${i <= r ? ' is-on' : ''}">${icon('star')}</span>`).join('');
    return `<span class="stars"${label ? ` role="img" aria-label="${rating.toFixed(1).replace('.0', '')} out of 5 stars"` : ' aria-hidden="true"'}>${stars}</span>`;
  };

  const dateText = (d) => {
    const t = new Date(d);
    return isNaN(t) ? '' : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const cardHtml = (r, { showProduct, pending }) => {
    const p = U.getProduct(r.product);
    return `<li class="review${pending ? ' review--pending' : ''}">
      <div class="review__top">${starsHtml(Number(r.rating))}${
        pending ? `<span class="review__badge">${icon('clock')}Awaiting approval · only you can see this</span>` : ''
      }</div>
      <p class="review__text">${esc(r.text)}</p>
      <p class="review__meta"><strong>${esc(r.name)}</strong>${r.city ? `<span>${esc(r.city)}</span>` : ''}${
        r.date ? `<span>${esc(dateText(r.date))}</span>` : ''
      }</p>
      ${showProduct && p ? `<a class="review__product" href="${U.productUrl(p)}">${esc(p.name)}</a>` : ''}
    </li>`;
  };

  function formHtml(id, productId) {
    const products = U.allProducts();
    return `<form class="review-form" id="${id}-form" novalidate hidden>
      <h3 class="review-form__title">Write a review</h3>
      <div class="field" data-field="product">
        <label class="field__label" for="${id}-product">Product</label>
        <select class="input" id="${id}-product" name="product">
          ${products.map((p) => `<option value="${esc(p.id)}"${p.id === productId ? ' selected' : ''}>${esc(p.name)} (${esc(p.size)})</option>`).join('')}
        </select>
      </div>
      <fieldset class="field rate" data-field="rating">
        <legend class="field__label">Your rating <span class="req" aria-hidden="true">*</span></legend>
        <div class="rate__stars">
          ${[5, 4, 3, 2, 1]
            .map(
              (n) =>
                `<input type="radio" id="${id}-r${n}" name="rating" value="${n}"><label for="${id}-r${n}" title="${n} star${n > 1 ? 's' : ''}">${icon('star')}<span class="sr-only">${n} star${n > 1 ? 's' : ''}</span></label>`
            )
            .join('')}
        </div>
        <p class="field__error">${icon('info')}<span>Please choose a star rating.</span></p>
      </fieldset>
      <div class="review-form__row">
        <div class="field" data-field="name">
          <label class="field__label" for="${id}-name">Your name <span class="req" aria-hidden="true">*</span></label>
          <input class="input" id="${id}-name" name="name" autocomplete="name" maxlength="60" required aria-describedby="${id}-e-name">
          <p class="field__error" id="${id}-e-name">${icon('info')}<span>Please enter your name.</span></p>
        </div>
        <div class="field" data-field="city">
          <label class="field__label" for="${id}-city">City <span class="opt">(optional)</span></label>
          <input class="input" id="${id}-city" name="city" autocomplete="address-level2" maxlength="40">
        </div>
      </div>
      <div class="field" data-field="text">
        <label class="field__label" for="${id}-text">Your review <span class="req" aria-hidden="true">*</span></label>
        <textarea class="input" id="${id}-text" name="text" rows="4" maxlength="600" required aria-describedby="${id}-e-text" placeholder="How did the oil work for you?"></textarea>
        <p class="field__error" id="${id}-e-text">${icon('info')}<span>Please write a few words (at least 10 characters).</span></p>
      </div>
      <div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
      <p class="form-alert" data-review-alert role="alert" hidden></p>
      <div class="review-form__actions">
        <button type="button" class="btn btn--dark" data-review-submit>${icon('check')}<span>Submit review</span></button>
        <button type="button" class="btn btn--outline" data-review-cancel>Cancel</button>
      </div>
      <p class="field__hint">Reviews are checked by our team before they appear on the website.</p>
    </form>`;
  }

  /**
   * Renders the reviews block into `root` and wires it up.
   * options: productId (only this product's reviews), heading (HTML), sub (text)
   */
  function mount(root, ctx, { productId = '', heading, sub } = {}) {
    if (!root) return;
    const id = `rv${++uid}`;
    const showProduct = !productId;
    let expanded = false;

    root.innerHTML = `<div class="container">
      <header class="section-head section-head--center reveal">
        <p class="eyebrow eyebrow--center">Customer Reviews</p>
        <h2 class="section-title" id="${id}-title">${heading || 'What our customers <em>say</em>'}</h2>
        ${sub ? `<p class="section-sub">${esc(sub)}</p>` : ''}
      </header>
      <div class="reviews reveal" style="--d:.1s">
        <aside class="reviews__summary" data-review-summary></aside>
        <div class="reviews__main">
          ${formHtml(id, productId)}
          <div data-review-list></div>
        </div>
      </div>
    </div>`;
    root.setAttribute('aria-labelledby', `${id}-title`);

    const form = $(`#${id}-form`, root);
    const summaryEl = $('[data-review-summary]', root);
    const listEl = $('[data-review-list]', root);
    const alertBox = $('[data-review-alert]', root);

    function render() {
      const pub = published(productId);
      const own = mine(productId);
      const s = summary(pub);
      summaryEl.innerHTML = `${
        s.count
          ? `<p class="reviews__avg">${s.avg.toFixed(1)}</p>${starsHtml(s.avg)}
             <p class="reviews__count">Based on ${s.count} review${s.count === 1 ? '' : 's'}</p>
             <ul class="reviews__bars">${s.bars
               .map(
                 (b) =>
                   `<li><span>${b.n} ${icon('star')}</span><span class="bar"><i style="width:${(b.c / s.count) * 100}%"></i></span><span>${b.c}</span></li>`
               )
               .join('')}</ul>`
          : `<p class="reviews__avg reviews__avg--empty">${icon('quote')}</p><p class="reviews__count">No reviews yet</p>`
      }
      <button type="button" class="btn btn--gold btn--block" data-review-open aria-expanded="${form.hidden ? 'false' : 'true'}" aria-controls="${id}-form">${icon('star')}<span>Write a review</span></button>`;

      const all = own.map((r) => ({ r, pending: true })).concat(pub.map((r) => ({ r, pending: false })));
      if (!all.length) {
        listEl.innerHTML = `<div class="reviews__empty">
          <h3>Be the first to review${productId ? ' this product' : ''}</h3>
          <p>Bought from ${esc(cfg.brand)}? Share your experience and help other customers choose.</p>
        </div>`;
        return;
      }
      const shown = expanded ? all : all.slice(0, PAGE);
      listEl.innerHTML = `<ul class="reviews__list">${shown.map((x) => cardHtml(x.r, { showProduct, pending: x.pending })).join('')}</ul>
        ${all.length > PAGE && !expanded ? `<button type="button" class="btn btn--outline" data-review-more>Show all ${all.length} reviews</button>` : ''}`;
    }

    const openForm = (open) => {
      form.hidden = !open;
      const btn = $('[data-review-open]', root);
      if (btn) btn.setAttribute('aria-expanded', String(open));
      if (open) {
        alertBox.hidden = true;
        const first = form.querySelector('input[name="rating"]');
        if (first) first.focus({ preventScroll: true });
        form.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };

    const check = (name, ok) => {
      const wrap = $(`[data-field="${name}"]`, form);
      wrap.classList.toggle('has-error', !ok);
      const input = form.elements[name];
      if (input && input.setAttribute) input.setAttribute('aria-invalid', String(!ok));
      return ok;
    };

    let busy = false;
    async function submit() {
      if (busy) return;
      const data = {
        product: form.elements.product.value,
        rating: Number((form.querySelector('input[name="rating"]:checked') || {}).value || 0),
        name: form.elements.name.value.trim(),
        city: form.elements.city.value.trim(),
        text: form.elements.text.value.trim(),
        date: new Date().toISOString().slice(0, 10)
      };
      const okRating = check('rating', data.rating >= 1 && data.rating <= 5);
      const okName = check('name', data.name.length >= 2);
      const okText = check('text', data.text.length >= 10);
      if (!okRating) return form.querySelector('input[name="rating"]').focus();
      if (!okName) return form.elements.name.focus();
      if (!okText) return form.elements.text.focus();
      if (form.elements.website.value) return; // spam bot

      const btn = $('[data-review-submit]', form);
      busy = true;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Sending…</span>';
      const res = await E.orders.sendReview(data);
      busy = false;
      btn.disabled = false;
      btn.innerHTML = `${icon('check')}<span>Submit review</span>`;
      if (!res || !res.ok) {
        alertBox.hidden = false;
        alertBox.innerHTML = `${icon('info')}<span>Sorry, we couldn't send your review just now. Please check your internet connection and try again.</span>`;
        return;
      }
      memory = [data].concat(memory).slice(0, 20);
      const list = store.get(MINE, []);
      store.set(MINE, [data].concat(Array.isArray(list) ? list : []).slice(0, 20));
      form.reset();
      if (productId) form.elements.product.value = productId;
      openForm(false);
      render();
      if (productId && data.product !== productId) {
        const p = U.getProduct(data.product);
        E.ui.toast(`Thank you! Your review of ${p ? p.name : 'our product'} was sent.`, { icon: 'check', timeout: 4200 });
      } else {
        E.ui.toast(
          res.demo
            ? 'Thank you! (Preview: on the live website your review is emailed to us for approval.)'
            : 'Thank you! Your review will appear after a quick check.',
          { icon: 'check', timeout: 4600 }
        );
      }
      const first = $('.review', listEl);
      if (first) first.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-review-open]')) return openForm(form.hidden);
      if (e.target.closest('[data-review-cancel]')) {
        openForm(false);
        const btn = $('[data-review-open]', root);
        if (btn) btn.focus();
        return;
      }
      if (e.target.closest('[data-review-submit]')) return submit();
      if (e.target.closest('[data-review-more]')) {
        expanded = true;
        render();
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submit();
    });
    form.addEventListener('change', (e) => {
      if (e.target.name === 'rating') check('rating', true);
    });
    form.addEventListener('input', (e) => {
      const f = e.target.closest('[data-field]');
      if (f && f.classList.contains('has-error')) check(f.dataset.field, true);
    });

    render();
  }

  const aggregate = (productId) => summary(published(productId));

  E.reviews = { mount, starsHtml, aggregate, published };
})(window.ESHA);
