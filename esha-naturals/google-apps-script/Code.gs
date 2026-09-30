/**
 * Esha Naturals — website orders in Google Sheets + email from your own Gmail
 * ------------------------------------------------------------------
 * Every order placed on the website is added as a row in the "Orders" sheet and emailed
 * to NOTIFY_EMAIL. Advance payments, contact messages and customer reviews get their own
 * sheets ("Advance payments", "Messages", "Reviews") and are emailed too.
 *
 * Admin panel: open https://your-website/admin.html and log in with ADMIN_PASSWORD (below)
 * to see orders, change their status, and approve reviews for the website.
 *
 * Free, no monthly limit on orders. Gmail allows about 100 emails a day from a script;
 * if that is ever reached the order is still saved in the sheet.
 *
 * Setup steps are in SETUP.md (same folder).
 */

const NOTIFY_EMAIL = 'eshanaturals0@gmail.com'; // where new orders, payments, messages and reviews are emailed
const SEND_CUSTOMER_CONFIRMATION = true; // email the customer an order confirmation when they give an email
const BRAND = 'Esha Naturals';

// Password for the website's admin panel (admin.html). Type your own password between the quotes,
// e.g. 'MyStrong#Pass2026', then Deploy → Manage deployments → Edit → Version: New version → Deploy.
// Leave it empty to switch the admin panel off. Never share it; it opens all customer details.
const ADMIN_PASSWORD = '';
const ORDER_STATUSES = ['New', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled', 'Returned'];

const ORDER_SHEET = 'Orders';
const ORDER_HEADERS = [
  'Order ID', 'Date', 'Status', 'Name', 'Phone', 'Email', 'City', 'Address', 'Landmark',
  'Items', 'Subtotal (Rs)', 'Delivery (Rs)', 'Total (Rs)', 'Payment', 'Notes', 'Advance'
];
const OTHER_SHEETS = { payment: 'Advance payments', message: 'Messages', review: 'Reviews' };

function doGet(e) {
  // The website asks for the reviews you approved in the admin panel.
  if (e && e.parameter && e.parameter.reviews) return json_({ ok: true, reviews: publishedReviews_() });
  return ContentService.createTextOutput(BRAND + ' order endpoint is running.');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    // Older website versions post the bare order object.
    const type = body.type || (body.id && body.customer ? 'order' : '');
    if (type === 'admin') return handleAdmin_(body);
    if (type === 'order') return handleOrder_(body.order || body, cleanFields_(body.fields));
    if (OTHER_SHEETS[type]) return handleOther_(type, cleanFields_(body.fields));
    return json_({ ok: false, error: 'Unknown request' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- Orders ---------------- */

function handleOrder_(order, fields) {
  const problem = validate_(order);
  if (problem) return json_({ ok: false, error: problem });

  const sheet = getSheet_(ORDER_SHEET, ORDER_HEADERS);
  // The website may retry a failed send: never add the same order twice.
  if (findRow_(sheet, order.id)) return json_({ ok: true, duplicate: true });

  const c = order.customer;
  const items = order.items
    .map(function (i) { return i.name + ' (' + i.size + ') x' + i.qty + ' = Rs ' + i.total; })
    .join('\n');
  sheet.appendRow([
    safe_(order.id),
    new Date(order.createdAt || Date.now()),
    'New',
    safe_(c.name),
    "'" + String(c.phone).slice(0, 20),
    safe_(c.email),
    safe_(c.city),
    safe_(c.address),
    safe_(c.landmark),
    safe_(items),
    Number(order.subtotal) || 0,
    Number(order.delivery) || 0,
    Number(order.total) || 0,
    safe_(order.payment || 'Cash on Delivery'),
    safe_(order.notes),
    ''
  ]);

  // The order is saved; emails are a bonus and never make the order fail.
  const subject = (fields && fields._subject) || 'New order received ' + order.id + ': Rs ' + order.total + ' (' + c.name + ', ' + c.city + ')';
  const emailed = notify_(subject, fields || {
    'Order ID': order.id, 'Customer name': c.name, 'Mobile number': c.phone, City: c.city,
    'Full address': c.address, 'Items ordered': items, 'Total': 'Rs ' + order.total
  }, c.email);

  if (SEND_CUSTOMER_CONFIRMATION && c.email && isEmail_(c.email) && quota_() > 5) {
    try {
      MailApp.sendEmail({
        to: c.email,
        subject: 'Your ' + BRAND + ' order ' + order.id,
        body: (fields && fields._autoresponse) ||
          'Thank you for your order ' + order.id + ' with ' + BRAND + '! Total: Rs ' + order.total +
          ' (Cash on Delivery). Our team will call you shortly to confirm it.',
        name: BRAND,
        replyTo: NOTIFY_EMAIL
      });
    } catch (err) {
      /* customer confirmation is optional */
    }
  }
  return json_({ ok: true, emailed: emailed });
}

function validate_(o) {
  if (!o || typeof o !== 'object') return 'Invalid order';
  if (!/^EN-\d{6}-[A-Z0-9]{4}$/.test(String(o.id || ''))) return 'Invalid order id';
  const c = o.customer || {};
  if (!c.name || !c.phone || !c.city || !c.address) return 'Missing customer details';
  if (!/^03\d{2}-\d{7}$/.test(String(c.phone))) return 'Invalid phone number';
  if (!Array.isArray(o.items) || !o.items.length || o.items.length > 20) return 'Invalid items';
  if (!(Number(o.total) > 0)) return 'Invalid total';
  return '';
}

/* ---------------- Advance payments, messages, reviews ---------------- */

function handleOther_(type, fields) {
  if (!fields || !fields._subject) return json_({ ok: false, error: 'Missing details' });
  const keys = Object.keys(fields).filter(function (k) { return k.charAt(0) !== '_'; });
  if (!keys.length) return json_({ ok: false, error: 'Missing details' });

  // New reviews wait for your approval in the admin panel before they show on the website.
  const row = Object.assign({}, fields);
  if (type === 'review') {
    row['Show on website'] = 'No';
    keys.push('Show on website');
  }
  const sheet = getSheet_(OTHER_SHEETS[type], ['Received'].concat(keys));
  const headers = headersOf_(sheet);
  keys.forEach(function (k) {
    if (headers.indexOf(k) === -1) {
      headers.push(k);
      sheet.getRange(1, headers.length).setValue(k).setFontWeight('bold');
    }
  });
  sheet.appendRow(headers.map(function (h) { return h === 'Received' ? new Date() : safe_(row[h]); }));

  // Note the advance on the order in the Orders sheet when the customer reports a payment.
  if (type === 'payment' && fields['Order ID']) {
    const orders = getSheet_(ORDER_SHEET, ORDER_HEADERS);
    const cell = findRow_(orders, fields['Order ID']);
    if (cell) {
      const col = columnOf_(orders, 'Advance');
      orders.getRange(cell, col).setValue(
        'Sent via ' + (fields['Paid to'] || '') + (fields['Transaction ID / sender number'] && fields['Transaction ID / sender number'] !== '-' ? ' (ref ' + fields['Transaction ID / sender number'] + ')' : '')
      );
    }
  }

  const emailed = notify_(fields._subject, fields, fields.email);
  return json_({ ok: true, emailed: emailed });
}

/* ---------------- Admin panel ---------------- */

function handleAdmin_(body) {
  if (!ADMIN_PASSWORD) return json_({ ok: false, error: 'setup', message: 'Set ADMIN_PASSWORD in the Apps Script first.' });
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('admin_fails') || 0);
  if (fails >= 10) return json_({ ok: false, error: 'locked', message: 'Too many wrong passwords. Try again in 15 minutes.' });
  if (String(body.password || '') !== ADMIN_PASSWORD) {
    cache.put('admin_fails', String(fails + 1), 900);
    return json_({ ok: false, error: 'password', message: 'Wrong password.' });
  }

  const action = body.action;
  if (action === 'list') {
    return json_({
      ok: true,
      statuses: ORDER_STATUSES,
      orders: readSheet_(ORDER_SHEET),
      payments: readSheet_(OTHER_SHEETS.payment),
      messages: readSheet_(OTHER_SHEETS.message),
      reviews: readSheet_(OTHER_SHEETS.review)
    });
  }
  if (action === 'status') {
    if (ORDER_STATUSES.indexOf(body.status) === -1) return json_({ ok: false, error: 'Unknown status' });
    const sheet = getSheet_(ORDER_SHEET, ORDER_HEADERS);
    const row = findRow_(sheet, body.id);
    if (!row) return json_({ ok: false, error: 'Order not found' });
    sheet.getRange(row, columnOf_(sheet, 'Status')).setValue(body.status);
    return json_({ ok: true });
  }
  if (action === 'review') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(OTHER_SHEETS.review);
    const row = Number(body.row);
    if (!sheet || !(row >= 2 && row <= sheet.getLastRow())) return json_({ ok: false, error: 'Review not found' });
    sheet.getRange(row, columnOf_(sheet, 'Show on website')).setValue(body.show ? 'Yes' : 'No');
    CacheService.getScriptCache().remove('published_reviews');
    return json_({ ok: true });
  }
  return json_({ ok: false, error: 'Unknown action' });
}

// All rows of a sheet as objects (newest first, at most 1000), with their row number in _row.
function readSheet_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const last = sheet.getLastRow();
  const first = Math.max(2, last - 999);
  const cols = sheet.getLastColumn();
  const headers = headersOf_(sheet);
  const values = sheet.getRange(first, 1, last - first + 1, cols).getValues();
  const out = values.map(function (r, i) {
    const o = { _row: first + i };
    headers.forEach(function (h, c) {
      if (h) o[h] = r[c] instanceof Date ? r[c].toISOString() : r[c];
    });
    return o;
  });
  return out.reverse();
}

// Approved reviews for the website (cached for 5 minutes).
function publishedReviews_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('published_reviews');
  if (hit) return JSON.parse(hit);
  const list = readSheet_(OTHER_SHEETS.review)
    .filter(function (r) { return String(r['Show on website']).toLowerCase() === 'yes'; })
    .map(function (r) {
      return {
        product: String(r['Product ID'] || ''),
        name: String(r.Name || ''),
        city: String(r.City || '').replace(/^-$/, ''),
        rating: Math.max(1, Math.min(5, Number(r.Stars) || 5)),
        date: String(r.Date || r.Received || '').slice(0, 10),
        text: String(r.Review || '')
      };
    })
    .filter(function (r) { return r.product && r.text; })
    .slice(0, 300);
  cache.put('published_reviews', JSON.stringify(list), 300);
  return list;
}

/* ---------------- Helpers ---------------- */

function headersOf_(sheet) {
  return sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(String);
}

// Column number of a header, adding the column if it is missing (older sheets).
function columnOf_(sheet, header) {
  const headers = headersOf_(sheet);
  let i = headers.indexOf(header);
  if (i === -1) {
    i = headers.filter(String).length;
    sheet.getRange(1, i + 1).setValue(header).setFontWeight('bold');
  }
  return i + 1;
}

function findRow_(sheet, id) {
  const cell = sheet.getRange('A:A').createTextFinder(String(id || '')).matchEntireCell(true).findNext();
  return cell ? cell.getRow() : 0;
}

function notify_(subject, fields, replyTo) {
  if (!NOTIFY_EMAIL || quota_() < 1) return false;
  const rows = Object.keys(fields)
    .filter(function (k) { return k.charAt(0) !== '_' && k !== 'email'; })
    .map(function (k) { return [k, String(fields[k] == null ? '' : fields[k])]; });
  if (fields.email) rows.push(['Customer email', String(fields.email)]);
  const html =
    '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
    rows.map(function (r) {
      return '<tr><th style="text-align:left;vertical-align:top;padding:6px 12px;border:1px solid #ddd;background:#f6efe2">' +
        esc_(r[0]) + '</th><td style="padding:6px 12px;border:1px solid #ddd">' + esc_(r[1]).replace(/\n| \| /g, '<br>') + '</td></tr>';
    }).join('') +
    '</table>';
  const message = {
    to: NOTIFY_EMAIL,
    subject: String(subject).slice(0, 200),
    htmlBody: html,
    body: rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n'),
    name: BRAND + ' Website'
  };
  if (replyTo && isEmail_(replyTo)) message.replyTo = String(replyTo);
  try {
    MailApp.sendEmail(message);
    return true;
  } catch (err) {
    return false;
  }
}

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1a120b').setFontColor('#e5cb91');
  }
  return sheet;
}

// Only plain text values, a limited number of fields, limited length.
function cleanFields_(fields) {
  if (!fields || typeof fields !== 'object') return null;
  const out = {};
  Object.keys(fields).slice(0, 30).forEach(function (k) {
    const v = fields[k];
    if (v == null || typeof v === 'object') return;
    out[String(k).slice(0, 60)] = String(v).slice(0, 2000);
  });
  return out;
}

function quota_() {
  try {
    return MailApp.getRemainingDailyQuota();
  } catch (err) {
    return 0;
  }
}

function isEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Stops spreadsheet formulas being injected through form fields.
function safe_(value) {
  const s = String(value == null ? '' : value).slice(0, 2000);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
