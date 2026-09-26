# Receive website orders in a Google Sheet (optional, free)

When this is set up, every order placed on the website is saved as a new row in your
Google Sheet automatically. You can also get an email for every new order.

## Steps (about 5 minutes)

1. Go to [sheets.new](https://sheets.new) and create a sheet, e.g. **Esha Naturals Orders**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the code you see there, then copy everything from `Code.gs` (this folder) and paste it in.
4. Optional: put your email between the quotes in `NOTIFY_EMAIL = ''` to get an email for each order.
5. Click **Save** (disk icon).
6. Click **Deploy → New deployment**. Click the gear icon, choose **Web app**, then set:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
7. Click **Deploy**, allow the permissions Google asks for, and copy the **Web app URL**
   (it looks like `https://script.google.com/macros/s/AKfy.../exec`).
8. Open `assets/js/config.js` in the website and paste it:
   ```js
   orderEndpoint: 'https://script.google.com/macros/s/AKfy.../exec',
   ```
9. Upload the website again. Place a test order and check that it appears in the sheet.

The **Status** column starts as `New`. Change it to `Confirmed`, `Dispatched` or `Delivered`
as you process each order.

> If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**
> so the same URL keeps working.
