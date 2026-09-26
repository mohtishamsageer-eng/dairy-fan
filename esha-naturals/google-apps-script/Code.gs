/**
 * Esha Naturals — order log for Google Sheets
 * ------------------------------------------------------------------
 * Every order placed on the website is added as a new row in the "Orders" sheet.
 * Optional: get an email for every new order by filling in NOTIFY_EMAIL.
 *
 * Setup steps are in SETUP.md (same folder).
 */

const SHEET_NAME = 'Orders';
const NOTIFY_EMAIL = ''; // e.g. 'you@gmail.com' — leave empty for no emails

const HEADERS = [
  'Order ID', 'Date', 'Status', 'Name', 'Phone', 'Email', 'City', 'Address', 'Landmark',
  'Items', 'Subtotal (Rs)', 'Delivery (Rs)', 'Total (Rs)', 'Payment', 'Notes'
];

function doGet() {
  return ContentService.createTextOutput('Esha Naturals order endpoint is running.');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const order = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const problem = validate_(order);
    if (problem) return json_({ ok: false, error: problem });

    const sheet = getSheet_();
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

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'New order ' + order.id + ' — Rs ' + order.total,
        body:
          'New order on Esha Naturals\n\n' +
          'Order ID: ' + order.id + '\n' +
          'Name: ' + c.name + '\nPhone: ' + c.phone + '\nCity: ' + c.city + '\nAddress: ' + c.address +
          (c.landmark ? '\nLandmark: ' + c.landmark : '') + '\n\nItems:\n' + items +
          '\n\nSubtotal: Rs ' + order.subtotal + '\nDelivery: Rs ' + order.delivery + '\nTotal: Rs ' + order.total +
          '\nPayment: ' + (order.payment || 'Cash on Delivery') + (order.notes ? '\nNotes: ' + order.notes : '')
      });
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1a120b').setFontColor('#e5cb91');
  }
  return sheet;
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

// Stops spreadsheet formulas being injected through form fields.
function safe_(value) {
  const s = String(value == null ? '' : value).slice(0, 1000);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
