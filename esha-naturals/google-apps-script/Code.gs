/**
 * Esha Naturals — website orders in Google Sheets + email from your own Gmail
 * ------------------------------------------------------------------
 * Every order placed on the website is added as a row in the "Orders" sheet and emailed
 * to NOTIFY_EMAIL. Advance payments, contact messages and customer reviews get their own
 * sheets ("Advance payments", "Messages", "Reviews") and are emailed too.
 *
 * Free, no monthly limit on orders. Gmail allows about 100 emails a day from a script;
 * if that is ever reached the order is still saved in the sheet.
 *
 * Setup steps are in SETUP.md (same folder).
 */

const NOTIFY_EMAIL = 'eshanaturals0@gmail.com'; // where new orders, payments, messages and reviews are emailed
const SEND_CUSTOMER_CONFIRMATION = true; // email the customer an order confirmation when they give an email
const BRAND = 'Esha Naturals';

const ORDER_SHEET = 'Orders';
const ORDER_HEADERS = [
  'Order ID', 'Date', 'Status', 'Name', 'Phone', 'Email', 'City', 'Address', 'Landmark',
  'Items', 'Subtotal (Rs)', 'Delivery (Rs)', 'Total (Rs)', 'Payment', 'Notes'
];
const OTHER_SHEETS = { payment: 'Advance payments', message: 'Messages', review: 'Reviews' };

function doGet() {
  return ContentService.createTextOutput(BRAND + ' order endpoint is running.');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    // Older website versions post the bare order object.
    const type = body.type || (body.id && body.customer ? 'order' : '');
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
  if (sheet.getRange('A:A').createTextFinder(order.id).matchEntireCell(true).findNext()) return json_({ ok: true, duplicate: true });

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
    safe_(order.notes)
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

  const sheet = getSheet_(OTHER_SHEETS[type], ['Received'].concat(keys));
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  keys.forEach(function (k) {
    if (headers.indexOf(k) === -1) {
      headers.push(k);
      sheet.getRange(1, headers.length).setValue(k).setFontWeight('bold');
    }
  });
  sheet.appendRow(headers.map(function (h) { return h === 'Received' ? new Date() : safe_(fields[h]); }));

  // Mark the order in the Orders sheet when the customer reports an advance payment.
  if (type === 'payment' && fields['Order ID']) {
    const orders = getSheet_(ORDER_SHEET, ORDER_HEADERS);
    const cell = orders.getRange('A:A').createTextFinder(String(fields['Order ID'])).matchEntireCell(true).findNext();
    if (cell) orders.getRange(cell.getRow(), 3).setValue('Advance sent: ' + (fields['Paid to'] || '') + ' ' + (fields['Transaction ID / sender number'] || ''));
  }

  const emailed = notify_(fields._subject, fields, fields.email);
  return json_({ ok: true, emailed: emailed });
}

/* ---------------- Helpers ---------------- */

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
