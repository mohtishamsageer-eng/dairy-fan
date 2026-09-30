# Orders in your own Google Sheet + email from your own Gmail (free)

When this is set up, every order placed on the website is saved as a new row in your Google Sheet
and emailed to `eshanaturals0@gmail.com` from your own Gmail. Advance payments, contact messages and
reviews get their own tabs in the same sheet and are emailed too. Customers who type an email address
also get an order confirmation email.

- Free, no activation, no monthly limit on orders.
- Gmail allows about 100 emails a day from a script. If that is ever reached, orders are still saved
  in the sheet (you just don't get the email for them that day).
- Open the sheet in the **Google Sheets** app on your phone to see all orders anywhere.

## Steps (about 5 minutes, do this on a computer)

1. Sign in to Google as **eshanaturals0@gmail.com**.
2. Go to [sheets.new](https://sheets.new) and name the sheet **Esha Naturals Orders**.
3. In the sheet, open **Extensions → Apps Script**.
4. Delete the code you see there, then copy everything from `Code.gs` (this folder) and paste it in.
5. Click **Save** (disk icon).
6. Click **Deploy → New deployment**. Click the gear icon next to "Select type", choose **Web app**, then set:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
7. Click **Deploy**. Google asks for permission: click **Authorize access**, choose your account.
   If you see "Google hasn't verified this app", click **Advanced → Go to … (unsafe)** → **Allow**.
   (It is your own script, so this is safe.)
8. Copy the **Web app URL** (it looks like `https://script.google.com/macros/s/AKfy.../exec`).
9. Open `assets/js/config.js` in the website and paste it:
   ```js
   orderEndpoint: 'https://script.google.com/macros/s/AKfy.../exec',
   ```
10. Rebuild the single file (`node tools/build-single-file.js`), upload the website again,
    place a test order and check that it appears in the sheet and in Gmail.

The **Status** column of an order starts as `New`. It changes to `Advance sent: …` when the customer
reports an advance payment. Change it yourself to `Confirmed`, `Dispatched` or `Delivered` as you go.

To publish a review, copy the ready-made line from the review's email (or the Reviews tab) into
`assets/js/data/reviews.js`.

> If you change `Code.gs` later, use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**
> so the same URL keeps working.
