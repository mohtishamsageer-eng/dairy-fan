#!/usr/bin/env node
/*
 * Builds dist/esha-naturals.html: the whole website in ONE file
 * (all pages, styles, scripts, fonts and images embedded).
 * Open it in any browser, send it to someone, or upload it as index.html to a host.
 *
 *   node tools/build-single-file.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist', 'esha-naturals.html');

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const dataUri = (p) => `data:${MIME[path.extname(p)]};base64,${fs.readFileSync(path.join(ROOT, p)).toString('base64')}`;
const attr = (s) => String(s).replace(/"/g, '&quot;');
const scriptSafe = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

const PAGES = [
  'index.html',
  'shop.html',
  'product.html',
  'checkout.html',
  'order-success.html',
  'journal.html',
  'article.html',
  'about.html',
  'contact.html',
  'policies.html',
  '404.html'
];

const SCRIPTS = [
  'assets/js/config.js',
  'assets/js/data/products.js',
  'assets/js/data/articles.js',
  'assets/js/data/faqs.js',
  'assets/js/core/utils.js',
  'assets/js/core/icons.js',
  'assets/js/core/cart.js',
  'assets/js/core/orders.js',
  'assets/js/core/nav.js',
  'assets/js/core/ui.js',
  'assets/js/pages/home.js',
  'assets/js/pages/shop.js',
  'assets/js/pages/product.js',
  'assets/js/pages/checkout.js',
  'assets/js/pages/order-success.js',
  'assets/js/pages/journal.js',
  'assets/js/pages/article.js',
  'assets/js/pages/contact.js'
];

// Smaller copies are enough inside the single file
const ALIASES = {
  'assets/images/posters/anti-hair-fall-oil.webp': 'assets/images/posters/anti-hair-fall-oil-sm.webp',
  'assets/images/posters/hair-care-oil.webp': 'assets/images/posters/hair-care-oil-sm.webp',
  'assets/images/posters/mustard-oil.webp': 'assets/images/posters/mustard-oil-sm.webp',
  'assets/images/posters/sesame-oil.webp': 'assets/images/posters/sesame-oil-sm.webp',
  'assets/images/brand/hero-group-sm.webp': 'assets/images/brand/hero-group.webp'
};

/* ---------- 1. One <template> per page ---------- */
const templates = PAGES.map((file) => {
  const html = read(file);
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const page = (html.match(/<body data-page="([^"]+)"/) || [])[1];
  const open = html.match(/<main id="main"([^>]*)>/);
  if (!page || !open) throw new Error(`Cannot read page structure of ${file}`);
  const mainClass = ((open[1] || '').match(/class="([^"]*)"/) || [])[1] || '';
  const start = html.indexOf(open[0]) + open[0].length;
  const inner = html.slice(start, html.lastIndexOf('</main>')).trim();
  return `<template id="page-${file}" data-page="${attr(page)}" data-title="${title}" data-desc="${desc}" data-main-class="${attr(mainClass)}">\n${inner}\n</template>`;
});

/* ---------- 2. Scripts & styles ---------- */
const scripts = SCRIPTS.map((p) => `/* ${p} */\n${read(p)}`).join('\n');
let css = read('assets/css/main.css').replace(/url\('\.\.\/fonts\/([^']+)'\)/g, (m, f) => `url('${dataUri(`assets/fonts/${f}`)}')`);

/* ---------- 3. Embedded images (each file once) ---------- */
const haystack = templates.join('\n') + scripts;
const used = new Set((haystack.match(/assets\/images\/[\w\-/.]+\.(?:webp|png|jpg|svg)/g) || []).filter(exists));
const lines = [];
const embedded = new Set();
[...used].sort().forEach((p) => {
  const target = ALIASES[p];
  if (target && exists(target)) {
    if (!embedded.has(target)) {
      lines.push(`A[${JSON.stringify(target)}]=${JSON.stringify(dataUri(target))};`);
      embedded.add(target);
    }
    return;
  }
  if (!embedded.has(p)) {
    lines.push(`A[${JSON.stringify(p)}]=${JSON.stringify(dataUri(p))};`);
    embedded.add(p);
  }
});
Object.keys(ALIASES).forEach((from) => {
  if (used.has(from) && embedded.has(ALIASES[from])) lines.push(`A[${JSON.stringify(from)}]=A[${JSON.stringify(ALIASES[from])}];`);
});
const assetsScript = `window.ESHA_ASSETS=(function(A){\n${lines.join('\n')}\nreturn A;})({});`;

/* ---------- 4. Assemble ---------- */
const index = read('index.html');
const title = (index.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
const desc = (index.match(/<meta name="description" content="([^"]*)"/) || [])[1];

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#1a120b">
<link rel="icon" href="${dataUri('assets/images/brand/favicon.svg')}" type="image/svg+xml">
<style>
${css}
</style>
<script>document.documentElement.classList.add('js');</script>
</head>
<body data-page="home">
<a class="skip-link" href="#main">Skip to content</a>
<div id="announce" class="announce"></div>
<header id="site-header" class="site-header"></header>
<main id="main" tabindex="-1"></main>
<footer id="site-footer" class="site-footer"></footer>
<noscript><p style="padding:1rem;text-align:center;background:#1a120b;color:#f3e8d6">Please enable JavaScript to view this website.</p></noscript>
${templates.join('\n')}
<script>window.ESHA_SPA = true;</script>
<script>
${scriptSafe(assetsScript)}
</script>
<script>
${scriptSafe(scripts)}
</script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out);
console.log(
  `Built ${path.relative(ROOT, OUT)}: ${(out.length / 1024 / 1024).toFixed(2)} MB, ${templates.length} pages, ${embedded.size} images embedded`
);
