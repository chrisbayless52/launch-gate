# Reviewer Testing Instructions — LaunchGate

Thank you for reviewing LaunchGate. This document walks through the complete
test flow, GDPR webhook verification, and provides test store credentials.

---

## Prerequisites

- A Shopify development store (any plan)
- The app installed via the Partner Dashboard test link

---

## Full App Flow

### Step 1 — Install the app

Install LaunchGate on a development store via the app listing or the
Partner Dashboard "Test on development store" button.

After OAuth completes you will be redirected to the LaunchGate app page
inside Shopify Admin.

---

### Step 2 — Verify the purchase screen loads

You should see the **purchase screen** with:

- An info banner explaining what's included
- A checklist of report sections (apps, theme, payment gateways, etc.)
- A credential notes text field (optional input, 2000 char limit)
- A card showing the $29 price and a primary "Generate handoff report — $29" button

> The app is in **test mode** during review. No real charge will occur.

---

### Step 3 — Initiate the test purchase

Click **"Generate handoff report — $29"**.

You will be redirected to Shopify's native payment confirmation page
(outside the app iframe — this is the required Shopify billing flow).

The page will show a **test charge** indicator confirming no real money moves.

Click **"Approve"**.

---

### Step 4 — Return to the app after payment

Shopify redirects back to the app at `/billing/confirm`, which:

1. Verifies the charge status via the Shopify GraphQL API
2. Records the purchase in the database (shop domain + charge ID + timestamp)
3. Redirects to `/app?payment=success`

You should land back on the app with:

- A green **"Payment confirmed"** banner at the top
- The credential notes field (now with a placeholder example)
- A **"Download handoff report"** button

---

### Step 5 — Generate and download the PDF

Optionally type a note in the credential notes field (e.g. "Test note").

Click **"Download handoff report"**.

The button enters a loading state ("Generating PDF…") while the server:

1. Confirms billing is still active
2. Fetches live store data from the Shopify GraphQL Admin API
3. Generates a PDF using Puppeteer (headless Chromium)
4. Returns the PDF as a base64 string

A PDF file named `launchgate-handoff-[store-name]-[date].pdf` will
download to your machine.

**Verify the PDF contains:**
- A cover page with the store name and generation date
- Store overview section (plan, domain, currency, timezone)
- Active theme section
- Payment configuration section
- Shipping profiles section
- Custom domains section
- Credential notes section (if you entered any)

---

### Step 6 — Verify re-download works

Without refreshing, click **"Download handoff report"** again.
A second PDF should download immediately, confirming the 30-day window
allows multiple generations.

---

## GDPR Webhook Endpoints

All three mandatory GDPR webhooks are implemented with HMAC verification.
The endpoints return `200 OK` for all valid signed requests.

Replace `YOUR_APP_URL` and `YOUR_HMAC_SIGNATURE` with real values when testing.
The easiest way to verify is via the **Partner Dashboard → App setup → GDPR webhooks → Send test notification**.

### customers/data_request
```
POST YOUR_APP_URL/webhooks/customers/data_request
Content-Type: application/json
X-Shopify-Topic: customers/data_request
X-Shopify-Hmac-Sha256: YOUR_HMAC_SIGNATURE
X-Shopify-Shop-Domain: test-store.myshopify.com

{
  "shop_id": 1,
  "shop_domain": "test-store.myshopify.com",
  "customer": { "id": 1, "email": "customer@example.com", "phone": null },
  "orders_requested": []
}
```
**Expected response:** `200 OK`
**Action:** Logged only. LaunchGate does not store customer data, so no export is generated.

---

### customers/redact
```
POST YOUR_APP_URL/webhooks/customers/redact
Content-Type: application/json
X-Shopify-Topic: customers/redact
X-Shopify-Hmac-Sha256: YOUR_HMAC_SIGNATURE
X-Shopify-Shop-Domain: test-store.myshopify.com

{
  "shop_id": 1,
  "shop_domain": "test-store.myshopify.com",
  "customer": { "id": 1, "email": "customer@example.com", "phone": null },
  "orders_to_redact": []
}
```
**Expected response:** `200 OK`
**Action:** No-op. LaunchGate stores no customer data to redact.

---

### shop/redact
```
POST YOUR_APP_URL/webhooks/shop/redact
Content-Type: application/json
X-Shopify-Topic: shop/redact
X-Shopify-Hmac-Sha256: YOUR_HMAC_SIGNATURE
X-Shopify-Shop-Domain: test-store.myshopify.com

{
  "shop_id": 1,
  "shop_domain": "test-store.myshopify.com"
}
```
**Expected response:** `200 OK`
**Action:** Deletes all Prisma Session records for the shop domain from our database.

---

## Health Check

```
GET YOUR_APP_URL/health
```
**Expected response:**
```json
{ "status": "ok", "timestamp": "2025-05-16T12:00:00.000Z" }
```
No authentication required.

---

## Test Store Details

| Field | Value |
|-------|-------|
| Test store URL | *(Provide your development store URL)* |
| Shopify Admin login | *(Provide test credentials or use Partner Dashboard)* |
| App listing | *(Provide Partner Dashboard app URL)* |
| Support email | support@launchgate.app |

---

## Known Reviewer Notes

- **Test charge**: The app detects non-production environments and marks
  charges as `test: true` via the GraphQL billing mutation. No real charge
  will occur during review.
- **PDF generation time**: The first PDF generation may take 8–15 seconds
  as Puppeteer launches a headless browser. Subsequent generations on a
  warm server are faster.
- **Rate limit**: The app enforces a maximum of 5 PDF generations per store
  per hour to prevent abuse. This will not affect normal review testing.
- **Billing scope**: The app uses only `appPurchaseOneTimeCreate` — the
  only Shopify-approved billing method for App Store apps. No external
  payment processor is used.
