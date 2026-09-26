/* Esha Naturals — journal listing with topic filter */
(function (E) {
  'use strict';

  const U = E.utils;
  const ui = E.ui;
  const { $, esc } = U;

  const topicsEl = $('[data-topics]');
  const featured = $('[data-featured]');
  const grid = $('[data-journal-grid]');
  if (!grid) return;

  const valid = (t) => (E.topics.some((x) => x.id === t) ? t : '');
  let topic = valid(U.param('topic'));

  function render() {
    const all = [{ id: '', name: 'All articles' }].concat(E.topics);
    topicsEl.innerHTML = all
      .map((t) => {
        const n = t.id ? E.articles.filter((a) => a.topic === t.id).length : E.articles.length;
        return `<a class="pill" href="journal.html${t.id ? `?topic=${t.id}` : ''}" data-topic="${t.id}"${t.id === topic ? ' aria-current="true"' : ''}>${esc(t.name)} <span class="pill__count">(${n})</span></a>`;
      })
      .join('');

    const list = E.articles.filter((a) => !topic || a.topic === topic);
    const [first, ...rest] = list;
    featured.innerHTML = first ? ui.articleCard(first, { featured: true, level: 2 }) : '';
    featured.hidden = !first;
    grid.innerHTML = rest.map((a, i) => ui.articleCard(a, { level: 2, delay: i * 0.08 })).join('');
    ui.refreshReveals();
  }

  topicsEl.addEventListener('click', (e) => {
    const a = e.target.closest('[data-topic]');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    topic = a.dataset.topic;
    history.replaceState(null, '', a.getAttribute('href'));
    render();
  });

  render();
})(window.ESHA);
